# Especificação de Infraestrutura - BSC Code

## 4.1 Diagrama de Infraestrutura Completa

```mermaid
graph TB
    subgraph "Edge Layer"
        CDN[Cloudflare CDN<br/>Static Assets + DDoS Protection]
        WAF[Web Application Firewall<br/>OWASP Ruleset]
    end

    subgraph "Load Balancing Layer"
        LB1[Nginx Load Balancer 1<br/>Active]
        LB2[Nginx Load Balancer 2<br/>Standby]
        Keepalived[Keepalived VIP<br/>Failover Automático]
    end

    subgraph "Application Layer - Zone A"
        API1[API Gateway Pod 1<br/>FastAPI + Uvicorn]
        API2[API Gateway Pod 2]
        AUTH1[Auth Service Pod 1<br/>Python + gRPC]
        AUTH2[Auth Service Pod 2]
        WS1[WebSocket Manager Pod 1]
        WS2[WebSocket Manager Pod 2]
        IA1[IA Orchestrator Pod 1]
        IA2[IA Orchestrator Pod 2]
    end

    subgraph "Application Layer - Zone B"
        API3[API Gateway Pod 3]
        API4[API Gateway Pod 4]
        AUTH3[Auth Service Pod 3]
        AUTH4[Auth Service Pod 4]
        WS3[WebSocket Manager Pod 3]
        WS4[WebSocket Manager Pod 4]
        IA3[IA Orchestrator Pod 3]
        IA4[IA Orchestrator Pod 4]
    end

    subgraph "Workspace Worker Nodes"
        WN1[Worker Node 1<br/>Docker Engine<br/>8 vCPU, 32GB RAM<br/>Max 20 containers]
        WN2[Worker Node 2<br/>Docker Engine<br/>8 vCPU, 32GB RAM<br/>Max 20 containers]
        WN3[Worker Node 3<br/>Docker Engine<br/>8 vCPU, 32GB RAM<br/>Max 20 containers]
        WN4[Worker Node 4<br/>Docker Engine<br/>8 vCPU, 32GB RAM<br/>Max 20 containers]
        WN5[Worker Node 5<br/>Docker Engine<br/>8 vCPU, 32GB RAM<br/>Max 20 containers]
    end

    subgraph "Data Layer - Primary"
        PG1[PostgreSQL Primary<br/>AWS RDS r6g.large<br/>Multi-AZ, 100GB GP3]
        RedisCluster[(Redis Cluster<br/>3 Masters + 3 Replicas<br/>ElastiCache r6g.medium)]
    end

    subgraph "Data Layer - Backup & Storage"
        S3Main[S3 Bucket Primary<br/>Versioning Enabled<br/>Lifecycle Policies]
        S3Backup[S3 Bucket Backup<br/>Cross-Region Replication<br/>Glacier Archive]
        EFS[EFS Shared Storage<br/>Workspaces Persistent Data<br/>Multi-AZ]
    end

    subgraph "Observability Stack"
        Prometheus[Prometheus Cluster<br/>Metrics Collection<br/>Retention 30d]
        Grafana[Grafana Dashboards<br/>Visualization + Alerting]
        Loki[Loki Log Aggregation<br/>LogQL Queries]
        Tempo[Tempo Distributed Tracing<br/>Jaeger-compatible]
    end

    subgraph "Security & Secrets"
        Vault[HashiCorp Vault<br/>Secrets Management<br/>Dynamic DB Credentials]
        CertManager[Cert-Manager<br/>Auto TLS Renewal<br/>Let's Encrypt]
    end

    CDN --> WAF
    WAF --> Keepalived
    Keepalived --> LB1
    Keepalived --> LB2
    
    LB1 --> API1
    LB1 --> API2
    LB1 --> AUTH1
    LB1 --> WS1
    LB1 --> IA1
    
    LB2 --> API3
    LB2 --> API4
    LB2 --> AUTH3
    LB2 --> WS3
    LB2 --> IA3
    
    API1 --> AUTH1
    API2 --> AUTH2
    API3 --> AUTH3
    API4 --> AUTH4
    
    API1 --> PG1
    API2 --> PG1
    API3 --> PG1
    API4 --> PG1
    
    AUTH1 --> RedisCluster
    AUTH2 --> RedisCluster
    AUTH3 --> RedisCluster
    AUTH4 --> RedisCluster
    
    WS1 --> WN1
    WS1 --> WN2
    WS2 --> WN2
    WS2 --> WN3
    WS3 --> WN3
    WS3 --> WN4
    WS4 --> WN4
    WS4 --> WN5
    
    WN1 --> EFS
    WN2 --> EFS
    WN3 --> EFS
    WN4 --> EFS
    WN5 --> EFS
    
    WN1 --> S3Main
    WN2 --> S3Main
    WN3 --> S3Main
    WN4 --> S3Main
    WN5 --> S3Main
    
    API1 --> Prometheus
    API2 --> Prometheus
    WN1 --> Prometheus
    WN2 --> Prometheus
    PG1 --> Prometheus
    RedisCluster --> Prometheus
    
    Prometheus --> Grafana
    Loki --> Grafana
    Tempo --> Grafana
    
    API1 --> Vault
    AUTH1 --> Vault
    WN1 --> Vault
    
    LB1 --> CertManager
    API1 --> CertManager
```

---

## 4.2 Requisitos de Hardware/Ambiente

### Perfil 1: Desenvolvimento Local (Single Developer)

| Especificação | Valor Mínimo | Valor Recomendado | Notas |
|---|---|---|---|
| **CPU** | 4 cores | 8 cores | Docker containers dividem CPU do host |
| **RAM** | 8 GB | 16 GB | 2GB por workspace ativo + overhead do sistema |
| **Storage** | 50 GB SSD | 100 GB NVMe SSD | IOPS crítico para performance do editor |
| **Network** | 100 Mbps | 1 Gbps | Upload importante para WebSocket |
| **SO** | Linux Ubuntu 22.04 | Linux Ubuntu 24.04 LTS | Windows via WSL2 possível mas não recomendado |
| **Docker** | 24.0.0 | 27.0+ | Docker Desktop com limitações de performance |

**Cenário de Uso:** Desenvolvedor individual rodando 1-3 workspaces simultâneos localmente.

**Limitações:**
- Máximo 5 workspaces ativos simultaneamente
- Sem alta disponibilidade
- Backup manual necessário
- IA provider externo obrigatório (sem modelo local)

---

### Perfil 2: Equipe Pequena (5-20 Desenvolvedores)

| Especificação | Valor Mínimo | Valor Recomendado | Notas |
|---|---|---|---|
| **Servidores** | 2 VMs | 3 VMs | Load balancing + failover |
| **CPU Total** | 16 cores | 24 cores | Distribuídos entre servidores |
| **RAM Total** | 64 GB | 96 GB | 32-48GB por servidor |
| **Storage** | 500 GB SSD RAID 10 | 1 TB NVMe RAID 10 | IOPS mínimo 5000 |
| **Network** | 1 Gbps | 10 Gbps | Interconexão de baixa latência |
| **Database** | PostgreSQL self-hosted | AWS RDS ou equivalente | Managed service reduz ops overhead |
| **Redis** | Self-hosted single node | Redis Cluster 3 nodes | Cluster para HA |

**Topologia Recomendada:**

```
                    [Cloudflare CDN]
                          |
                    [Nginx LB]
                     /      \
            [Server 1]    [Server 2]
            API + Auth    API + Auth
            WebSocket     WebSocket
            10 containers 10 containers
                 |              |
            [PostgreSQL Primary] <--> [PostgreSQL Replica]
                 |
            [Redis Master] <--> [Redis Replica 1]
                                  [Redis Replica 2]
```

**Custo Mensal Estimado (AWS):**
- 3x EC2 c6i.2xlarge: $540/mês
- RDS db.r6g.large: $180/mês
- ElastiCache cache.r6g.medium: $100/mês
- S3 + EBS + Transfer: ~$100/mês
- **Total: ~$920/mês** para 20 desenvolvedores = **$46/dev/mês**

---

### Perfil 3: Enterprise (50-500 Desenvolvedores)

| Especificação | Valor | Notas |
|---|---|---|
| **Kubernetes Cluster** | 3 control plane + 10-50 worker nodes | EKS/GKE/AKS |
| **CPU Total** | 200-1000 cores | Auto-scaling baseado em demanda |
| **RAM Total** | 500 GB - 2 TB | Horizontal Pod Autoscaler |
| **Storage** | 10 TB+ distribuído | EFS/Ceph para workspaces persistentes |
| **Database** | PostgreSQL cluster 3 nodes | Patroni para HA automático |
| **Redis** | Cluster 6 nodes (3M+3R) | Sharding por workspace_id |
| **Load Balancer** | Application Load Balancer | SSL termination, WAF integrado |
| **CDN** | CloudFront/Cloudflare | Cache de static assets global |
| **Monitoring** | Prometheus federated clusters | Retenção longa em Thanos/Cortex |

**Arquitetura Multi-Zone:**

```
                        [Global DNS + Geo Routing]
                                |
            +-------------------+-------------------+
            |                   |                   |
      [Zone us-east-1]   [Zone eu-west-1]   [Zone ap-southeast-1]
            |                   |                   |
      [ALB Regional]     [ALB Regional]     [ALB Regional]
            |                   |                   |
      [K8s Cluster]      [K8s Cluster]      [K8s Cluster]
            |                   |                   |
      [RDS Primary] <----> [RDS Read Replica] [RDS Read Replica]
            |
      [Redis Global Cluster跨 region replication]
```

**SLA Garantido:**
- Disponibilidade: 99.95% (excluindo maintenance windows agendadas)
- RTO (Recovery Time Objective): < 15 minutos para falha de zona única
- RPO (Recovery Point Objective): < 5 minutos (backup contínuo)

**Custo Mensal Estimado (AWS, 200 devs):**
- EKS + EC2 spot/on-demand mix: $8,000/mês
- RDS Multi-AZ + Read Replicas: $2,500/mês
- ElastiCache Global Datastore: $1,800/mês
- S3 + CloudFront + Transfer: $1,200/mês
- Monitoring + Logging: $500/mês
- **Total: ~$14,000/mês** para 200 devs = **$70/dev/mês**

---

## 4.3 Integrações Externas

### 4.3.1 Provedores de IA

#### OpenAI API

**Por que foi escolhida:**
- Modelos GPT-4 Turbo e GPT-4o com excelente qualidade para código
- SDK Python maduro e bem documentado
- Streaming nativo para respostas em tempo real
- Rate limits generosos para enterprise

**Alternativa rejeitada:** Azure OpenAI Service
- Motivo: Vendor lock-in adicional, latency maior devido a proxy Azure

**Variáveis de Ambiente:**

```bash
# .env.example - OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
OPENAI_TIMEOUT_SECONDS=30
OPENAI_RETRY_ATTEMPTS=3
OPENAI_RETRY_BACKOFF_MS=1000
```

**Configuração no Sistema:**

```yaml
# config/ia_providers.yaml
providers:
  openai:
    enabled: true
    priority: 2  # Secondary fallback
    models:
      - name: gpt-4o
        context_window: 128000
        cost_per_1k_input: 0.005
        cost_per_1k_output: 0.015
        use_cases: ["chat", "debugging", "explanations"]
      - name: gpt-4-turbo
        context_window: 128000
        cost_per_1k_input: 0.01
        cost_per_1k_output: 0.03
        use_cases: ["complex_reasoning"]
    
    rate_limits:
      requests_per_minute: 1000
      tokens_per_minute: 100000
      
    fallback:
      enabled: true
      on_error_codes: [429, 500, 503]
      fallback_to: anthropic
```

**Como Configurar:**

1. Obter API key em https://platform.openai.com/api-keys
2. Adicionar variáveis no `.env` ou HashiCorp Vault
3. Habilitar billing na conta OpenAI
4. Testar conectividade: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`

**Como Estender (Novo Provider):**

```python
# providers/custom_provider.py
from .base import IAProviderBase

class CustomProvider(IAProviderBase):
    def __init__(self, config: dict):
        self.api_key = config["api_key"]
        self.base_url = config["base_url"]
        self.session = aiohttp.ClientSession()
    
    async def chat_completion(self, messages: list, **kwargs) -> AsyncIterator[str]:
        async with self.session.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"messages": messages, **kwargs},
        ) as response:
            async for line in response.content.iter_lines():
                if line.startswith(b"data: "):
                    yield json.loads(line[6:])["choices"][0]["delta"]["content"]
    
    async def health_check(self) -> bool:
        try:
            async with self.session.get(f"{self.base_url}/health") as resp:
                return resp.status == 200
        except:
            return False
```

**Fallback se Indisponível:**
- Automaticamente rota para Anthropic Claude (configurado como primary)
- Se ambos indisponíveis, usa modelo local Ollama (qualidade inferior mas funcional)
- Notifica usuário via toast: "IA provider temporariamente indisponível, usando fallback"

---

#### Anthropic API

**Por que foi escolhida:**
- Claude 3 Sonnet e Opus superiores em geração de código complexo
- Context window de 200K tokens ideal para projetos grandes
- Menor taxa de alucinações comparado a GPT-4
- Preços competitivos

**Variáveis de Ambiente:**

```bash
# .env.example - Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_BETA_VERSIONS=prompt-caching-2024-07-31
```

**Configuração:**

```yaml
providers:
  anthropic:
    enabled: true
    priority: 1  # Primary provider
    models:
      - name: claude-3-sonnet-20240229
        context_window: 200000
        cost_per_1k_input: 0.003
        cost_per_1k_output: 0.015
        use_cases: ["code_generation", "refactoring", "chat"]
      - name: claude-3-opus-20240229
        context_window: 200000
        cost_per_1k_input: 0.015
        cost_per_1k_output: 0.075
        use_cases: ["complex_architecture", "security_review"]
    
    prompt_caching:
      enabled: true
      cache_system_prompt: true
      cache_long_contexts: true
```

---

#### Google Gemini API

**Por que foi escolhida:**
- Melhor custo-benefício para contextos grandes (Gemini Ultra 1M tokens)
- Latência menor que concorrentes em regiões específicas
- Integração nativa com Google Cloud existente

**Variáveis de Ambiente:**

```bash
# .env.example - Google
GOOGLE_API_KEY=AIza...
GOOGLE_PROJECT_ID=my-gcp-project
GOOGLE_LOCATION=us-central1
GOOGLE_DEFAULT_MODEL=gemini-1.5-pro
```

---

### 4.3.2 GitHub Integration

**O que é:** OAuth2 integration para clone/push/pull de repositórios GitHub.

**Por que foi escolhida:**
- Plataforma de versionamento mais popular (90%+ market share)
- OAuth flow bem documentado
- Webhooks para eventos em tempo real

**Alternativa rejeitada:** GitLab self-hosted como primary
- Motivo: GitHub tem ecossistema maior, mas GitLab é suportado como secondary

**Variáveis de Ambiente:**

```bash
# .env.example - GitHub
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678stu
GITHUB_WEBHOOK_SECRET=whsec_abcdefghijklmnop
GITHUB_APP_ID=123456  # Se usar GitHub App
GITHUB_PRIVATE_KEY_PATH=/secrets/github_app.pem
```

**Setup Passo a Passo:**

1. Criar OAuth App em https://github.com/settings/developers
2. Callback URL: `https://bsc.code.example.com/auth/github/callback`
3. Copiar Client ID e Secret para `.env`
4. Gerar webhook secret aleatório: `openssl rand -hex 32`
5. Configurar webhook no repositório/organização

**Escopos OAuth Necessários:**

| Escopo | Por que é Necessário |
|---|---|
| `repo` | Clone, push, pull de repositórios privados |
| `workflow` | Executar GitHub Actions dos workspaces |
| `read:user` | Preencher perfil do usuário automaticamente |
| `user:email` | Obter email verificado para notificações |

---

### 4.3.3 SMTP Server (Email)

**Configuração:**

```yaml
smtp:
  provider: sendgrid  # ou aws_ses, mailgun, smtp_relay
  host: smtp.sendgrid.net
  port: 587
  username: apikey
  password: ${SENDGRID_API_KEY}
  from_email: noreply@bsc.code.example.com
  from_name: BSC Code
  
  templates:
    welcome_email: templates/email/welcome.html
    password_reset: templates/email/password_reset.html
    workspace_invite: templates/email/workspace_invite.html
  
  rate_limits:
    emails_per_minute: 100
    emails_per_user_per_hour: 10
```

---

## 4.4 Configuração Completa

### Arquivo de Configuração Principal

```yaml
# config/bsc_code.yaml
# Configuração completa do BSC Code
# Todos os campos documentados com comentários explicativos

# =============================================================================
# SEÇÃO 1: IDENTIDADE DO SISTEMA
# =============================================================================

system:
  # Nome exibido na UI e documentos
  "comment*": "Este nome aparece no título da página, emails e logs"
  name: "BSC Code"
  
  # Versão semântica atual (atualizar a cada deploy)
  "comment*": "Seguir semver: MAJOR.MINOR.PATCH"
  version: "1.0.0"
  
  # Ambiente de execução (development, staging, production)
  "comment*": "Controla nível de log, features experimentais, etc."
  environment: "production"
  
  # URL base pública do sistema
  "comment*": "Usado para gerar links em emails e callbacks OAuth"
  base_url: "https://bsc.code.example.com"
  
  # Região primária para data residency
  "comment*": "Impacta onde dados são armazenados (LGPD, GDPR)"
  primary_region: "sa-east-1"

# =============================================================================
# SEÇÃO 2: CONFIGURAÇÃO DE SERVIDOR WEB
# =============================================================================

server:
  # Porta que o Nginx/Traefik escuta
  "comment*": "Porta 80 para HTTP (redirect para HTTPS), 443 para HTTPS"
  http_port: 80
  https_port: 443
  
  # Hostname para certificados TLS
  "comment*": "Deve corresponder ao domínio público"
  hostname: "bsc.code.example.com"
  
  # Configuração de TLS
  tls:
    "comment*": "true em production, false apenas em dev local"
    enabled: true
    
    "comment*": "auto: Let's Encrypt, manual: fornecer certs próprios"
    certificate_source: "auto"
    
    "comment*": "Forçar HTTPS com redirect 301"
    force_https: true
    
    "comment*": "Versões mínimas do TLS (1.2 é o mínimo seguro)"
    min_tls_version: "TLSv1.2"
    
    "comment*": "Cipher suites preferidos (ordem importa)"
    cipher_suites:
      - "ECDHE-ECDSA-AES128-GCM-SHA256"
      - "ECDHE-RSA-AES128-GCM-SHA256"
      - "ECDHE-ECDSA-AES256-GCM-SHA384"
      - "ECDHE-RSA-AES256-GCM-SHA384"
  
  # Headers de segurança HTTP
  security_headers:
    "comment*": "Prevenir clickjacking"
    x_frame_options: "DENY"
    
    "comment*": "Prevenir MIME sniffing"
    x_content_type_options: "nosniff"
    
    "comment*": "Política de Content Security"
    content_security_policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https:; img-src 'self' data: https:; font-src 'self' data:;"
    
    "comment*": "Referrer policy para privacidade"
    referrer_policy: "strict-origin-when-cross-origin"
    
    "comment*": "Permissions policy (antigo Feature-Policy)"
    permissions_policy: "camera=(), microphone=(), geolocation=()"

# =============================================================================
# SEÇÃO 3: BANCO DE DADOS
# =============================================================================

database:
  # Tipo de database (apenas PostgreSQL suportado oficialmente)
  "comment*": "Não mudar sem migração complexa"
  type: "postgresql"
  
  # Connection string completa
  "comment*": "Formato: postgresql://user:pass@host:port/dbname"
  "comment*": "Em production, usar secrets manager em vez de hardcoded"
  connection_string: "postgresql://bsc_user:${DB_PASSWORD}@bsc-db.rds.amazonaws.com:5432/bsc_code"
  
  # Pool de conexões
  pool:
    "comment*": "Número mínimo de conexões mantidas abertas"
    min_connections: 5
    
    "comment*": "Número máximo de conexões simultâneas"
    max_connections: 50
    
    "comment*": "Timeout para adquirir conexão do pool"
    acquisition_timeout_seconds: 10
    
    "comment*": "Tempo máximo de vida de uma conexão"
    max_lifetime_seconds: 3600
    
    "comment*": "Intervalo entre health checks de conexões ociosas"
    idle_check_interval_seconds: 60
  
  # Configurações de replicação
  replication:
    "comment*": "Habilitar read replicas para queries de leitura"
    enabled: true
    
    "comment*": "URLs das réplicas de leitura (pode ser lista)"
    read_replicas:
      - "postgresql://bsc_reader:${DB_PASSWORD}@bsc-db-replica.rds.amazonaws.com:5432/bsc_code"
    
    "comment*": "Delay máximo aceitável de replicação antes de alertar"
    max_replication_lag_seconds: 5

# =============================================================================
# SEÇÃO 4: CACHE (REDIS)
# =============================================================================

cache:
  # Tipo de backend de cache
  "comment*": "redis: produção, memory: development apenas"
  backend: "redis"
  
  # Configuração Redis
  redis:
    "comment*": "URL de conexão (suporta sentinel/cluster)"
    "comment*": "Single node: redis://host:port"
    "comment*": "Sentinel: redis://sentinel1:26379,sentinel2:26379?master=mymaster"
    "comment*": "Cluster: redis://node1:6379,node2:6379,node3:6379"
    url: "redis://bsc-redis.xyx123.clustercfg.usw2.cache.amazonaws.com:6379"
    
    "comment*": "Senha do Redis (opcional se auth disabled)"
    password: "${REDIS_PASSWORD}"
    
    "comment*": "Database index (0-15 para Redis standalone)"
    database: 0
    
    "comment*": "Prefixo para todas as chaves (isolamento lógico)"
    key_prefix: "bsc:"
    
    # TTLs padrão
    ttls:
      "comment*": "Sessões de usuário expiram após 1 hora de inatividade"
      session_ttl_seconds: 3600
      
      "comment*": "Tokens JWT na blacklist (até expiração natural)"
      token_blacklist_ttl_seconds: 3600
      
      "comment*": "Cache de contexto de IA (curta duração)"
      ia_context_ttl_seconds: 300
      
      "comment*": "Cache de file listings (média duração)"
      file_list_ttl_seconds: 60
      
      "comment*": "Rate limit counters (curta duração)"
      rate_limit_ttl_seconds: 60

# =============================================================================
# SEÇÃO 5: ARMAZENAMENTO DE ARQUIVOS
# =============================================================================

storage:
  # Backend de armazenamento
  "comment*": "s3: production, local: development"
  backend: "s3"
  
  # Configuração S3
  s3:
    "comment*": "Região da AWS"
    region: "sa-east-1"
    
    "comment*": "Nome do bucket principal"
    bucket: "bsc-code-workspaces-prod"
    
    "comment*": "Bucket de backup (cross-region)"
    backup_bucket: "bsc-code-backups-us-east-1"
    
    "comment*": "Prefixo dentro do bucket para isolamento"
    prefix: "workspaces/"
    
    "comment*": "Classe de storage padrão"
    storage_class: "STANDARD"
    
    "comment*": "Cripturação server-side"
    encryption:
      enabled: true
      algorithm: "AES256"  # ou "aws:kms"
      kms_key_id: "${S3_KMS_KEY_ID}"  # requerido se aws:kms
    
    # Políticas de lifecycle
    lifecycle:
      "comment*": "Mover para IA após 30 dias sem acesso"
      transition_to_ia_days: 30
      
      "comment*": "Mover para Glacier após 90 dias"
      transition_to_glacier_days: 90
      
      "comment*": "Excluir backups antigos após 365 dias"
      expiration_days: 365
  
  # Configuração EFS (para volumes persistentes)
  efs:
    "comment*": "Habilitar EFS para persistência de workspaces"
    enabled: true
    
    "comment*": "ID do filesystem EFS"
    filesystem_id: "fs-0abc123def456789"
    
    "comment*": "Ponto de mount no host"
    mount_point: "/mnt/efs/workspaces"
    
    "comment*": "Modo de performance"
    performance_mode: "generalPurpose"  # ou "maxIO"
    
    "comment*": "Throughput mode"
    throughput_mode: "elastic"  # ou "provisioned"

# =============================================================================
# SEÇÃO 6: INTEGRAÇÃO COM IA
# =============================================================================

ia:
  # Provider primário
  "comment*": "anthropic, openai, google, ou custom"
  default_provider: "anthropic"
  
  # Fallback chain (ordem importa)
  "comment*": "Se primary falhar, tenta nesta ordem"
  fallback_chain:
    - "openai"
    - "google"
    - "ollama_local"
  
  # Configurações globais
  settings:
    "comment*": "Timeout máximo para resposta de IA"
    timeout_seconds: 30
    
    "comment*": "Número de tentativas de retry"
    max_retries: 3
    
    "comment*": "Backoff exponencial base em ms"
    retry_backoff_ms: 1000
    
    "comment*": "Habilitar streaming de tokens"
    streaming_enabled: true
    
    "comment*": "Logging de prompts/responses para debugging"
    logging_enabled: false  # Cuidado com dados sensíveis!
    
    "comment*": "Limite de tokens por request (controle de custos)"
    max_tokens_per_request: 8192
    
    "comment*": "Budget diário por usuário em USD"
    daily_budget_per_user: 5.00

# =============================================================================
# SEÇÃO 7: WORKSPACES
# =============================================================================

workspaces:
  # Imagem Docker base para workspaces
  "comment*": "Imagem oficial do OpenVSCode Server"
  base_image: "gitpod/openvscode-server:1.95.3"
  
  # Recursos padrão por workspace
  resources:
    "comment*": "CPU limit (em cores)"
    cpu_limit: "2.0"
    
    "comment*": "Memory limit (em GB)"
    memory_limit_gb: 4
    
    "comment*": "Storage limit por workspace (em GB)"
    storage_limit_gb: 20
    
    "comment*": "Network bandwidth limit (em Mbps)"
    network_bandwidth_mbps: 100
  
  # Políticas de lifecycle
  lifecycle:
    "comment*": "Tempo máximo de inatividade antes de suspender"
    idle_timeout_minutes: 120
    
    "comment*": "Tempo máximo absoluto de vida do workspace"
    max_lifetime_hours: 24
    
    "comment*": "Intervalo entre auto-saves"
    auto_save_interval_seconds: 300
    
    "comment*": "Manter workspace suspenso por quanto tempo antes de remover"
    suspended_retention_hours: 24
  
  # Limites por usuário
  limits:
    "comment*": "Workspaces ativos simultâneos (free tier)"
    max_active_free: 2
    
    "comment*": "Workspaces ativos simultâneos (paid tier)"
    max_active_paid: 10
    
    "comment*": "Workspaces suspensos mantidos"
    max_suspended: 20

# =============================================================================
# SEÇÃO 8: SEGURANÇA
# =============================================================================

security:
  # Configuração de autenticação
  auth:
    "comment*": "Métodos de autenticação habilitados"
    methods:
      - "password"  # Email + senha
      - "github_oauth"  # OAuth via GitHub
      - "google_oauth"  # OAuth via Google
      - "saml"  # SSO empresarial
    
    # Política de senhas
    password_policy:
      "comment*": "Comprimento mínimo"
      min_length: 12
      
      "comment*": "Exigir maiúsculas"
      require_uppercase: true
      
      "comment*": "Exigir minúsculas"
      require_lowercase: true
      
      "comment*": "Exigir números"
      require_numbers: true
      
      "comment*": "Exigir caracteres especiais"
      require_special_chars: true
      
      "comment*": "Senha expira após X dias (0 = nunca)"
      max_age_days: 90
      
      "comment*": "Impedir reuso das últimas N senhas"
      prevent_reuse_count: 5
    
    # MFA (Multi-Factor Authentication)
    mfa:
      "comment*": "Habilitar MFA"
      enabled: true
      
      "comment*": "MFA obrigatório para todos os usuários?"
      required: false  # true para enterprise
      
      "comment*": "Métodos disponíveis"
      methods:
        - "totp"  # Google Authenticator, Authy
        - "sms"  # SMS (menos seguro)
        - "email"  # Código por email
      
      "comment*": "Códigos de backup gerados"
      backup_codes_count: 10
  
  # Rate limiting
  rate_limiting:
    "comment*": "Habilitar rate limiting global"
    enabled: true
    
    "comment*": "Backend para counters (redis recomendado)"
    backend: "redis"
    
    # Limites por endpoint
    limits:
      login:
        "comment*": "Tentativas de login por minuto por IP"
        requests: 5
        window_seconds: 60
      
      password_reset:
        "comment*": "Requests de reset de senha por hora por email"
        requests: 3
        window_seconds: 3600
      
      api_general:
        "comment*": "Requests gerais à API por minuto por usuário"
        requests: 100
        window_seconds: 60
      
      ia_chat:
        "comment*": "Mensagens para IA por minuto por usuário"
        requests: 30
        window_seconds: 60
  
  # CORS (Cross-Origin Resource Sharing)
  cors:
    "comment*": "Habilitar CORS"
    enabled: true
    
    "comment*": "Origens permitidas (wildcard * apenas em dev)"
    allowed_origins:
      - "https://bsc.code.example.com"
      - "https://admin.bsc.code.example.com"
    
    "comment*": "Métodos HTTP permitidos"
    allowed_methods:
      - "GET"
      - "POST"
      - "PUT"
      - "DELETE"
      - "OPTIONS"
    
    "comment*": "Headers permitidos"
    allowed_headers:
      - "Authorization"
      - "Content-Type"
      - "X-Requested-With"
    
    "comment*": "Expor headers na resposta"
    expose_headers:
      - "X-Request-ID"
      - "X-RateLimit-Remaining"
    
    "comment*": "Permitir credentials (cookies, auth headers)"
    allow_credentials: true
    
    "comment*": "Max age do preflight cache em segundos"
    max_age_seconds: 86400

# =============================================================================
# SEÇÃO 9: LOGGING E OBSERVABILIDADE
# =============================================================================

observability:
  # Logging
  logging:
    "comment*": "Nível mínimo de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    level: "INFO"  # DEBUG em development
    
    "comment*": "Formato de log (json para produção, text para dev)"
    format: "json"
    
    "comment*": "Destinos de log"
    destinations:
      - "stdout"  # Sempre logar em stdout para Docker
      - "file:/var/log/bsc_code/app.log"  # Arquivo local
      - "loki:http://loki:3100/loki/api/v1/push"  # Loki agregador
    
    "comment*": "Campos adicionais incluídos em todo log"
    include_fields:
      - "request_id"
      - "user_id"
      - "workspace_id"
      - "timestamp"
      - "level"
      - "logger"
      - "message"
    
    "comment*": "Dados sensíveis a serem mascarados"
    redact_fields:
      - "password"
      - "token"
      - "secret"
      - "api_key"
      - "credit_card"
  
  # Métricas
  metrics:
    "comment*": "Habilitar export de métricas"
    enabled: true
    
    "comment*": "Endpoint para scraping do Prometheus"
    scrape_endpoint: "/metrics"
    
    "comment*": "Porta do metrics server (separada da app)"
    port: 9090
    
    "comment*": "Métricas customizadas a coletar"
    custom_metrics:
      - "workspace_create_duration_seconds"
      - "ia_request_latency_seconds"
      - "websocket_connections_active"
      - "database_query_duration_seconds"
  
  # Tracing distribuído
  tracing:
    "comment*": "Habilitar distributed tracing"
    enabled: true
    
    "comment*": "Backend de tracing (jaeger, tempo, zipkin)"
    backend: "tempo"
    
    "comment*": "Endpoint de export"
    export_endpoint: "http://tempo:4317"
    
    "comment*": "Sample rate (1.0 = 100%, 0.1 = 10%)"
    sample_rate: 0.1  # 10% para production
    
    "comment*": "Sempre traçar requests com erro"
    trace_always_on_error: true

# =============================================================================
# SEÇÃO 10: FEATURE FLAGS
# =============================================================================

feature_flags:
  "comment*": "Sistema de feature flags para rollout gradual"
  
  # Features estáveis (sempre habilitadas)
  stable:
    - "core_editor"
    - "terminal_integration"
    - "git_basic_ops"
    - "file_explorer"
  
  # Features em beta (habilitadas por usuário específico)
  beta:
    - "collaborative_editing"  # Apenas usuários internos
    - "ai_refactoring"  # Beta testers
  
  # Features experimentais (desabilitadas por padrão)
  experimental:
    - "voice_coding"  # Não usar em production
    - "ar_code_review"  # Pesquisa interna
  
  # Rollout percentage para A/B testing
  rollouts:
    "comment*": "Nova UI habilitada para 50% dos usuários"
    new_ui_rollout_percent: 50

# =============================================================================
# FIM DA CONFIGURAÇÃO
# =============================================================================
```

---

### Arquivo `.env.example`

```bash
# =============================================================================
# BSC CODE - Environment Variables Example
# =============================================================================
# Copie este arquivo para .env e preencha os valores
# NUNCA commit o arquivo .env preenchido no git!
# =============================================================================

# -----------------------------------------------------------------------------
# SYSTEM
# -----------------------------------------------------------------------------
SYSTEM_ENVIRONMENT=production
SYSTEM_SECRET_KEY=gerar_com_openssl_rand_hex_32
SYSTEM_ENCRYPTION_KEY=chave_de_32_bytes_para_crypto

# -----------------------------------------------------------------------------
# DATABASE (PostgreSQL)
# -----------------------------------------------------------------------------
DB_HOST=bsc-db.rds.amazonaws.com
DB_PORT=5432
DB_NAME=bsc_code
DB_USER=bsc_user
DB_PASSWORD=senha_forte_gerada_pelo_vault
DB_SSL_MODE=require

# -----------------------------------------------------------------------------
# CACHE (Redis)
# -----------------------------------------------------------------------------
REDIS_HOST=bsc-redis.xyx123.clustercfg.usw2.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=senha_redis_complexa
REDIS_SSL=true

# -----------------------------------------------------------------------------
# STORAGE (S3)
# -----------------------------------------------------------------------------
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=sa-east-1
S3_BUCKET=bsc-code-workspaces-prod
S3_KMS_KEY_ID=arn:aws:kms:sa-east-1:123456789012:key/12345678-1234-1234-1234-123456789012

# -----------------------------------------------------------------------------
# IA PROVIDERS
# -----------------------------------------------------------------------------
# OpenAI
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890
OPENAI_ORG_ID=org-abcdefghijklmnopqrstuvwxyz

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890

# Google
GOOGLE_API_KEY=AIzaSyabcdefghijklmnopqrstuvwxyz1234567890
GOOGLE_PROJECT_ID=my-gcp-project-id

# -----------------------------------------------------------------------------
# OAUTH
# -----------------------------------------------------------------------------
# GitHub
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx
GITHUB_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890

# Google
GOOGLE_OAUTH_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# -----------------------------------------------------------------------------
# EMAIL (SMTP)
# -----------------------------------------------------------------------------
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.abcdefghijklmnopqrstuvwxyz1234567890
SMTP_FROM_EMAIL=noreply@bsc.code.example.com
SMTP_FROM_NAME=BSC Code

# -----------------------------------------------------------------------------
# SECURITY
# -----------------------------------------------------------------------------
JWT_PRIVATE_KEY_PATH=/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/secrets/jwt_public.pem
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=lax

# -----------------------------------------------------------------------------
# MONITORING
# -----------------------------------------------------------------------------
SENTRY_DSN=https://abc123def456@sentry.io/1234567
PROMETHEUS_PUSHGATEWAY_URL=http://prometheus:9091
GRAFANA_ADMIN_PASSWORD=senha_grafana_forte

# -----------------------------------------------------------------------------
# VIRTUALIZATION
# -----------------------------------------------------------------------------
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_TLS_VERIFY=
DOCKER_CERT_PATH=

# -----------------------------------------------------------------------------
# END OF FILE
# -----------------------------------------------------------------------------
```

---

*Documento de Infraestrutura completo. Próximo: Segurança.*
