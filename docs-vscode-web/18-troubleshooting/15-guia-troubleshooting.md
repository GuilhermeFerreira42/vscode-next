# Guia de Troubleshooting - BSC Code

## 15.1 Problemas Comuns e Soluções

### 15.1.1 Workspace não inicia

**Sintoma:** Workspace fica em status "provisioning" por mais de 5 minutos.

**Causas Possíveis:**
1. Recursos insuficientes no cluster
2. Imagem Docker não encontrada
3. Problema de rede no pull da imagem
4. Volume mount falhou

**Diagnóstico:**
```bash
# Verificar eventos do pod
kubectl describe pod workspace-xyz -n workspaces

# Checar logs do container
kubectl logs workspace-xyz -n workspaces

# Verificar se há nodes disponíveis
kubectl get nodes -o wide
kubectl top nodes
```

**Soluções:**
```bash
# Se recurso insuficiente - adicionar nodes
kubectl scale nodepool default --num-nodes +2

# Se imagem com problema - forçar re-pull
kubectl delete pod workspace-xyz -n workspaces
# Pod será recriado automaticamente

# Se volume issue - verificar PVC
kubectl get pvc -n workspaces | grep workspace-xyz
kubectl describe pvc workspace-xyz-data -n workspaces
```

---

### 15.1.2 Terminal não responde

**Sintoma:** Comandos digitados não aparecem ou output não é exibido.

**Causas Possíveis:**
1. Conexão WebSocket interrompida
2. PTY do container travada
3. Browser perdeu conexão

**Soluções:**
```javascript
// No browser console (F12):
// Verificar estado da conexão WebSocket
console.log(ws.readyState); // 0=connecting, 1=open, 2=closing, 3=closed

// Se closed (3), recarregar página
location.reload();
```

```bash
# No servidor - verificar logs do WebSocket Manager
kubectl logs -l app=websocket-manager -n bsc-code --tail=100

# Reiniciar conexão do terminal
kubectl exec workspace-xyz -n workspaces -- pkill -HUP -f 'vscode-server'
```

---

### 15.1.3 IA não gera código

**Sintoma:** Solicitações de IA retornam erro ou timeout.

**Causas Possíveis:**
1. Provider de IA indisponível
2. Rate limit excedido
3. API key inválida/expirada
4. Contexto muito grande

**Diagnóstico:**
```bash
# Verificar status dos providers
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.bsc.code/api/v1/ia/providers

# Checar usage do usuário
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT count(*) as requests_today, SUM(total_tokens) as tokens_used \
   FROM ia_requests WHERE user_id = '$user_id' \
   AND created_at >= NOW() - INTERVAL '1 day';"

# Testar conectividade com provider
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Authorization: Bearer $ANTHROPIC_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-sonnet","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

**Soluções:**
```bash
# Se rate limit - aguardar ou aumentar quota
# Admin pode resetar:
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "UPDATE users SET ia_daily_reset_at = NOW() WHERE id = '$user_id';"

# Se provider down - verificar fallback
# Sistema deve automaticamente tentar próximo provider na chain
kubectl logs -l app=ia-orchestrator -n bsc-code --tail=50 | grep -i fallback
```

---

### 15.1.4 Git operations falham

**Sintoma:** Clone, push ou pull retornam erro de autenticação ou network.

**Causas Possíveis:**
1. OAuth token expirado
2. SSH keys não configuradas
3. Firewall bloqueando conexão
4. Repositório não existe ou privado sem permissão

**Soluções:**
```bash
# Dentro do workspace:
# Re-autenticar com GitHub
gh auth refresh

# Verificar status da auth
gh auth status

# Para SSH - adicionar chave
ssh-add ~/.ssh/id_ed25519
ssh-add -l  # Verificar chaves carregadas

# Testar conexão
ssh -T git@github.com

# Se firewall - verificar regras
kubectl get networkpolicy -n workspaces
```

---

### 15.1.5 Performance lenta do editor

**Sintoma:** Digitação com lag, autocomplete demorado.

**Causas Possíveis:**
1. Latência de rede alta
2. Language server consumindo muitos recursos
3. Muitas extensions instaladas
4. Arquivo muito grande (> 10MB)

**Soluções:**
```bash
# Verificar latência de rede
ping api.bsc.code

# Dentro do workspace - checar processos
top -bn1 | head -20

# Desabilitar extensions pesadas
# Settings > Extensions > Disable

# Para arquivos grandes - usar modo simplified
# Settings > Editor > Large File Optimization > Enable

# Clear cache do language server
rm -rf ~/.cache/language-servers/*
```

---

## 15.2 Debugging Tools

### 15.2.1 Coletar Logs Completos

```bash
#!/bin/bash
# collect-logs.sh

WORKSPACE_ID=$1
OUTPUT_DIR="./logs-$WORKSPACE_ID-$(date +%Y%m%d-%H%M%S)"

mkdir -p $OUTPUT_DIR

echo "Collecting pod info..."
kubectl get pod -l workspace=$WORKSPACE_ID -o yaml > $OUTPUT_DIR/pod-info.yaml

echo "Collecting container logs..."
kubectl logs -l workspace=$WORKSPACE_ID > $OUTPUT_DIR/container.log 2>&1

echo "Collecting events..."
kubectl get events --field-selector involvedObject.name=$WORKSPACE_ID > $OUTPUT_DIR/events.txt

echo "Collecting database info..."
psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT * FROM workspaces WHERE id = '$WORKSPACE_ID';" > $OUTPUT_DIR/db-workspace.txt

psql -h $DB_HOST -U bsc_user -d bsc_code -c \
  "SELECT * FROM audit_logs WHERE resource_id = '$WORKSPACE_ID' ORDER BY created_at DESC LIMIT 100;" \
  > $OUTPUT_DIR/db-audit.txt

echo "Logs collected in $OUTPUT_DIR"
tar -czf $OUTPUT_DIR.tar.gz $OUTPUT_DIR
rm -rf $OUTPUT_DIR
```

---

### 15.2.2 Profiling de Performance

```python
# profile_workspace.py
import requests
import time
import statistics

def measure_latency(endpoint, iterations=100):
    """Measure latency distribution for an endpoint."""
    latencies = []
    
    for _ in range(iterations):
        start = time.time()
        response = requests.get(f"https://api.bsc.code{endpoint}")
        end = time.time()
        
        latencies.append((end - start) * 1000)  # ms
    
    return {
        "min": min(latencies),
        "max": max(latencies),
        "mean": statistics.mean(latencies),
        "median": statistics.median(latencies),
        "p95": sorted(latencies)[int(len(latencies) * 0.95)],
        "p99": sorted(latencies)[int(len(latencies) * 0.99)]
    }

# Usage
endpoints = [
    "/api/v1/workspaces",
    "/api/v1/users/me",
    "/api/v1/ia/providers"
]

for endpoint in endpoints:
    print(f"\n{endpoint}:")
    metrics = measure_latency(endpoint)
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.2f}ms")
```

---

## 15.3 Escalando Problemas

### Quando Escalar

| Sintoma | Severidade | Escalar Para | Tempo Máximo |
|---|---|---|---|
| Workspace down individual | Sev-3 | Suporte N1 | 4 horas |
| Múltiplos workspaces down | Sev-2 | Engineering | 1 hora |
| Todos workspaces down | Sev-1 | On-call + Leadership | 15 minutos |
| Data loss/corruption | Sev-1 | Emergency Response | Imediato |
| Security breach | Sev-1 | Security Team | Imediato |

### Template de Reporte

```markdown
## Incident Report

**Title:** [Breve descrição]

**Severity:** [Sev-1/Sev-2/Sev-3]

**Impact:**
- Users affected: X
- Workspaces affected: Y
- Duration: Z minutes

**Timeline:**
- HH:MM - Issue detected via [monitoring/user report]
- HH:MM - Initial diagnosis: [cause]
- HH:MM - Mitigation started: [action]
- HH:MM - Issue resolved

**Root Cause:**
[Descrição técnica da causa raiz]

**Resolution:**
[Ações tomadas para resolver]

**Prevention:**
[Como prevenir recorrência]

**Action Items:**
- [ ] Item 1 - Owner - Due date
- [ ] Item 2 - Owner - Due date
```

---

*Guia de Troubleshooting completo*
*Última atualização: Janeiro 2025*
