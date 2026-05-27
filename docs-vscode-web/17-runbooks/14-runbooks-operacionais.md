# Runbooks Operacionais - BSC Code

## 14.1 Visão Geral

Este documento contém procedimentos operacionais padrão (SOPs) para situações comuns e de emergência.

---

## 14.2 Runbooks Diários

### 14.2.1 Health Check Matinal

**Frequência:** Diário, 9:00 AM

**Responsável:** On-call Engineer

**Duração:** 10-15 minutos

#### Checklist

```bash
# 1. Verificar status dos serviços principais
kubectl get pods -n bsc-code -o wide

# 2. Checar métricas críticas no Grafana
# Dashboard: https://grafana.bsc.code/d/overview

# 3. Verificar alertas das últimas 24h
curl -H "Authorization: Bearer $GRAFANA_TOKEN" \
  "https://grafana.bsc.code/api/alerts?from=now-24h"

# 4. Checar uso de recursos
kubectl top nodes
kubectl top pods -n bsc-code

# 5. Verificar filas de mensagens
redis-cli -h $REDIS_HOST info stats | grep -E "blocked_clients|rejected_connections"

# 6. Checar saúde do database
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT count(*) FROM sessions WHERE expires_at > NOW();"
```

#### Critérios de Saúde

| Métrica | Target | Alert Threshold |
|---|---|---|
| API Latency p95 | < 100ms | > 200ms |
| Error Rate | < 0.1% | > 1% |
| Pod CPU Usage | < 70% | > 85% |
| Pod Memory Usage | < 80% | > 90% |
| Database Connections | < 80% capacity | > 95% |
| Queue Depth | < 1000 | > 5000 |

---

### 14.2.2 Rotação de Logs

**Frequência:** Automático, diário às 3:00 AM

**Responsável:** Automated System

#### Procedimento Manual (se necessário)

```bash
# 1. Forçar rotação de logs
logrotate -f /etc/logrotate.d/bsc-code

# 2. Verificar espaço em disco após rotação
df -h /var/log

# 3. Confirmar logs antigos foram compactados
ls -lh /var/log/bsc-code/*.gz

# 4. Se espaço ainda crítico, remover logs antigos
find /var/log/bsc-code -name "*.gz" -mtime +30 -delete
```

---

## 14.3 Runbooks de Incidentes

### 14.3.1 Alta Latência da API

**Severidade:** Sev-2

**Sintomas:**
- Usuários reportam lentidão
- Monitoring mostra latency p95 > 500ms
- Timeouts aumentando

#### Diagnóstico

```bash
# 1. Identificar endpoints lentos
curl "https://prometheus.bsc.code/api/v1/query?query=histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"

# 2. Checar database queries lentas
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 3. Verificar conexões ativas
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# 4. Checar locks no database
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT * FROM pg_locks WHERE NOT granted;"
```

#### Resolução

```bash
# Cenário A: Database sobrecarregado
# Kill queries longas
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';"

# Cenário B: Pods sobrecarregados
# Scale horizontal
kubectl scale deployment api-gateway --replicas=10 -n bsc-code

# Cenário C: Cache miss elevado
# Warm up cache
for endpoint in /api/v1/workspaces /api/v1/users/me; do
  curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://api.bsc.code$endpoint" > /dev/null
done
```

#### Post-Incident

1. Documentar causa raiz
2. Atualizar dashboards se necessário
3. Agendar revisão de capacidade

---

### 14.3.2 Container Escape Suspeito

**Severidade:** Sev-1 (Crítico)

**Sintomas:**
- Alerta de segurança do Falco/Sysdig
- Processos inesperados no host
- Network traffic anômalo

#### Resposta Imediata (Primeiros 5 minutos)

```bash
# 1. Isolar nó afetado
kubectl cordon <node-name>
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 2. Terminar todos os workspaces no nó
kubectl get pods -n workspaces --field-selector spec.nodeName=<node-name> -o jsonpath='{.items[*].metadata.name}' | xargs kubectl delete pod -n workspaces

# 3. Bloquear network egress do nó
iptables -A OUTPUT -o eth0 -j DROP  # No próprio nó

# 4. Notificar security team
send-slack-alert "#security-incidents" "CRITICAL: Potential container escape on node <node-name>"
```

#### Investigação

```bash
# 1. Coletar evidências
kubectl debug node/<node-name> -it --image=ubuntu -- chroot /host bash

# Dentro do node:
# Listar processos suspeitos
ps auxf | grep -v "^\s*root\s"

# Verificar network connections
netstat -tulpn

# Checar cron jobs
crontab -l
ls -la /etc/cron.*

# Verificar usuários
cat /etc/passwd | grep -v nologin

# Checar histórico de comandos
cat ~/.bash_history
```

#### Recuperação

1. Criar snapshot do node para forense
2. Recriar node do zero
3. Rotacionar todas as credentials
4. Revisar políticas de segurança

---

### 14.3.3 Data Corruption

**Severidade:** Sev-1

**Sintomas:**
- Dados inconsistentes relatados por usuários
- Erros de integridade no database
- Checksum mismatches

#### Procedimento

```bash
# 1. Parar writes imediatamente
kubectl scale deployment api-gateway --replicas=0 -n bsc-code

# 2. Avaliar extensão do dano
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';"

# Para cada tabela crítica:
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "BEGIN; LOCK TABLE users IN ACCESS SHARE MODE; SELECT count(*) FROM users; COMMIT;"

# 3. Verificar backups disponíveis
aws s3 ls s3://bsc-code-backups/database/ --recursive | sort -r | head -20

# 4. Se backup recente disponível, preparar restore
# Download do backup
aws s3 cp s3://bsc-code-backups/database/latest.dump /tmp/db-restore.dump

# 5. Restore para database temporário
pg_restore -h $DB_HOST -U bsc_user -d bsc_code_temp /tmp/db-restore.dump

# 6. Comparar dados
python scripts/compare_databases.py --source bsc_code --target bsc_code_temp
```

#### Decisão: Restore vs Repair

| Critério | Restore | Repair |
|---|---|---|
| Data loss aceitável | < 15 min | Zero |
| Extensão corrupção | > 10% tabelas | < 10% tabelas |
| Backup disponível | Sim, recente | Não confiável |
| Tempo estimado | 30-60 min | 2-4 horas |

---

## 14.4 Runbooks de Manutenção

### 14.4.1 Deploy de Nova Versão

**Janela:** Terças e Quintas, 10:00-12:00 BRT

**Pré-requisitos:**
- [ ] Changelog revisado
- [ ] Migration scripts testados em staging
- [ ] Rollback plan documentado
- [ ] Team notificada

#### Procedimento

```bash
# 1. Criar snapshot do database atual
pg_dump -h $DB_HOST -U bsc_user -d bsc_code | gzip > /tmp/pre-deploy-$(date +%Y%m%d-%H%M%S).sql.gz

# 2. Aplicar migrations
kubectl apply -f k8s/migrations/ -n bsc-code
kubectl wait --for=condition=complete job/migration-job -n bsc-code --timeout=300s

# 3. Deploy gradual (canary)
kubectl set image deployment/api-gateway api-gateway=bsc-code/api:v1.2.0 -n bsc-code
kubectl rollout status deployment/api-gateway -n bsc-code --timeout=300s

# 4. Monitorar métricas por 10 minutos
watch -n 5 'curl -s https://grafana.bsc.code/api/dashboards/uid/health | jq ".currentStatus"'

# 5. Se tudo OK, completar deploy
kubectl set image deployment/auth-service auth-service=bsc-code/auth:v1.2.0 -n bsc-code
kubectl set image deployment/workspace-manager workspace-manager=bsc-code/ws:v1.2.0 -n bsc-code

# 6. Atualizar frontend
kubectl set image deployment/frontend frontend=bsc-code/frontend:v1.2.0 -n bsc-code

# 7. Verificar health checks
for pod in $(kubectl get pods -n bsc-code -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get pod $pod -n bsc-code -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
done
```

#### Rollback (se necessário)

```bash
# 1. Reverter deployments
kubectl rollout undo deployment/api-gateway -n bsc-code
kubectl rollout undo deployment/auth-service -n bsc-code
kubectl rollout undo deployment/workspace-manager -n bsc-code
kubectl rollout undo deployment/frontend -n bsc-code

# 2. Reverter migrations (se aplicável)
kubectl apply -f k8s/migrations/rollback/ -n bsc-code

# 3. Restaurar database se necessário
gunzip < /tmp/pre-deploy-YYYYMMDD-HHMMSS.sql.gz | psql -h $DB_HOST -U bsc_user -d bsc_code
```

---

### 14.4.2 Upgrade do Kubernetes

**Frequência:** Trimestral

**Janela:** Sábado, 22:00 - Domingo 06:00

#### Pré-requisitos

- [ ] Backup completo de todos os dados
- [ ] Cluster secundário disponível para failover
- [ ] Todos os nodes drenáveis
- [ ] Equipe completa disponível

#### Procedimento (Blue-Green)

```bash
# 1. Verificar versão atual
kubectl version --short

# 2. Preparar novo cluster (green)
terraform apply -var="k8s_version=1.29" -target=kubernetes_cluster.green

# 3. Deploy aplicação no novo cluster
kubectl --context=green apply -f k8s/base/
kubectl --context=green apply -f k8s/overlays/production/

# 4. Testar smoke tests no green
./scripts/smoke-tests.sh --context green

# 5. Switch DNS para green cluster
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://dns-switch-to-green.json

# 6. Monitorar por 1 hora
watch -n 10 './scripts/health-check.sh --context green'

# 7. Se estável, descomissionar blue cluster
terraform destroy -target=kubernetes_cluster.blue
```

---

## 14.5 Runbooks de Segurança

### 14.5.1 Credential Compromise

**Severidade:** Sev-1

#### Procedimento

```bash
# 1. Identificar credential comprometida
# Qual tipo?
# - API Key de usuário
# - Service account token
# - Database password
# - Cloud provider credentials

# 2. Revogar imediatamente
# Para JWT tokens:
redis-cli SET "token_blacklist:$jti" "revoked" EX 3600

# Para API keys:
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "UPDATE api_keys SET revoked = TRUE, revoked_at = NOW() WHERE key_hash = '$compromised_hash';"

# Para service accounts:
kubectl delete serviceaccount compromised-sa -n bsc-code

# 3. Rotacionar secrets afetados
# Database password
kubectl create secret generic db-credentials \
  --from-literal=password=$(openssl rand -base64 32) \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Forçar logout de sessões suspeitas
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "UPDATE sessions SET revoked = TRUE, revoke_reason = 'security_incident' WHERE user_id = '$affected_user';"

# 5. Audit trail
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "INSERT INTO audit_logs (event_type, actor_id, action, outcome, metadata) \
   VALUES ('security.credential_revoke', '$actor_id', 'revoke_credentials', 'success', '{\"reason\": \"compromise_detected\"}');"
```

---

## 14.6 Contact List

| Role | Name | Phone | Slack |
|---|---|---|---|
| On-call Primary | João Silva | +55 11 99999-9999 | @joao |
| On-call Secondary | Maria Santos | +55 11 88888-8888 | @maria |
| Security Lead | Pedro Costa | +55 11 77777-7777 | @pedro |
| Database Admin | Ana Oliveira | +55 11 66666-6666 | @ana |
| Cloud Infra | Carlos Mendes | +55 11 55555-5555 | @carlos |

---

*Runbooks atualizados: Janeiro 2025*
*Revisão próxima: Fevereiro 2025*
