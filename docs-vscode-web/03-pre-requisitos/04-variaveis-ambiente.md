# 04 - Variáveis de Ambiente

## Visão Geral

Este documento fornece referência completa de todas as variáveis de ambiente suportadas pelo BSC Code, com descrições detalhadas, valores padrão, exemplos e impactos de configuração.

---

## 1. Categorias de Variáveis

| Categoria | Prefixo | Quantidade | Prioridade |
|-----------|---------|------------|------------|
| Servidor | `PORT`, `HOST` | 5 | 🔴 Crítica |
| Segurança | `TOKEN`, `SSL_*` | 8 | 🔴 Crítica |
| Recursos | `MEMORY_*`, `CPU_*` | 6 | 🟠 Alta |
| Armazenamento | `WORKSPACE_*`, `LOGS_*` | 7 | 🟠 Alta |
| Logging | `LOG_*`, `METRICS_*` | 5 | 🟡 Média |
| Rede | `PROXY_*`, `CORS_*` | 6 | 🟡 Média |
| Desenvolvimento | `DEBUG_*`, `DEV_*` | 4 | 🟢 Baixa |

**Total: 41 variáveis documentadas**

---

## 2. Variáveis de Servidor

### 2.1 PORT

**Descrição:** Porta TCP que o servidor vai escutar para conexões HTTP/WebSocket.

| Atributo | Valor |
|----------|-------|
| Tipo | Integer |
| Obrigatório | Não (tem padrão) |
| Valor Padrão | `3000` |
| Intervalo Válido | 1024-65535 |
| Reinício Necessário | Sim |

**Exemplos:**
```bash
# Padrão
PORT=3000

# Customizado
PORT=8080

# Porta privilegiada (requer root ou CAP_NET_BIND_SERVICE)
PORT=443
```

**Impactos:**
- ✅ Alterar esta variável muda a porta de acesso ao VS Code Web
- ⚠️ Portas abaixo de 1024 requerem privilégios de root
- ⚠️ Verificar se a porta não está em uso antes de alterar

**Validação:**
```bash
# Verificar se porta está disponível
ss -tuln | grep :$PORT

# Testar após iniciar
curl http://localhost:$PORT/health
```

---

### 2.2 HOST

**Descrição:** Endereço IP ou hostname para bind do servidor.

| Atributo | Valor |
|----------|-------|
| Tipo | String |
| Obrigatório | Não (tem padrão) |
| Valor Padrão | `0.0.0.0` |
| Valores Válidos | IPv4, IPv6, hostname, localhost |

**Exemplos:**
```bash
# Todas as interfaces (padrão)
HOST=0.0.0.0

# Apenas localhost
HOST=127.0.0.1

# IPv6
HOST=::

# Hostname específico
HOST=bsc-code.internal
```

**Impactos:**
- ✅ `0.0.0.0` permite acesso de qualquer interface de rede
- ✅ `127.0.0.1` restringe acesso apenas localmente
- ⚠️ Em containers, usar `0.0.0.0` para acesso externo

**Segurança:**
```bash
# Produção com reverse proxy
HOST=127.0.0.1  # Apenas localhost acessa

# Produção direta (não recomendado sem firewall)
HOST=0.0.0.0   # Todas as interfaces
```

---

### 2.3 BASE_URL

**Descrição:** Path base para quando o VS Code Web roda atrás de reverse proxy com subpath.

| Atributo | Valor |
|----------|-------|
| Tipo | String |
| Obrigatório | Não |
| Valor Padrão | `/` |
| Exemplos | `/vscode`, `/ide`, `/dev` |

**Exemplos:**
```bash
# Root path (padrão)
BASE_URL=/

# Subpath
BASE_URL=/vscode

# Multi-segmento
BASE_URL=/tools/ide
```

**Configuração com Nginx:**
```nginx
location /vscode/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header X-Forwarded-Prefix /vscode;
}
```

**URLs Resultantes:**
```
BASE_URL=/           → http://domain.com/
BASE_URL=/vscode     → http://domain.com/vscode/
```

---

### 2.4 WORKSPACE_DIR

**Descrição:** Diretório raiz onde os workspaces dos usuários são armazenados.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Não |
| Valor Padrão | `/opt/openvscode-server/data/workspaces` |
| Permissões | Leitura/Escrita para usuário do serviço |

**Exemplos:**
```bash
# Padrão
WORKSPACE_DIR=/opt/openvscode-server/data/workspaces

# Customizado
WORKSPACE_DIR=/home/vscode/workspaces

# Volume Docker
WORKSPACE_DIR=/workspace
```

**Setup:**
```bash
# Criar diretório
sudo mkdir -p $WORKSPACE_DIR

# Definir permissões
sudo chown -R vscode:vscode $WORKSPACE_DIR
sudo chmod 750 $WORKSPACE_DIR
```

---

### 2.5 NODE_ENV

**Descrição:** Define o ambiente de execução (produção, desenvolvimento, teste).

| Atributo | Valor |
|----------|-------|
| Tipo | String (enum) |
| Obrigatório | Não |
| Valor Padrão | `production` |
| Valores Válidos | `production`, `development`, `test` |

**Exemplos:**
```bash
# Produção (otimizações ativadas)
NODE_ENV=production

# Desenvolvimento (logs verbose, source maps)
NODE_ENV=development

# Testes
NODE_ENV=test
```

**Impactos por Ambiente:**

| Ambiente | Logging | Source Maps | Cache | Debug |
|----------|---------|-------------|-------|-------|
| `production` | info+ | ❌ Desativado | ✅ Ativado | ❌ Desativado |
| `development` | debug+ | ✅ Ativado | ❌ Desativado | ✅ Ativado |
| `test` | error+ | ❌ Desativado | ❌ Desativado | ✅ Parcial |

---

## 3. Variáveis de Segurança

### 3.1 TOKEN

**Descrição:** Token de autenticação para acesso ao VS Code Web.

| Atributo | Valor |
|----------|-------|
| Tipo | String (hex) |
| Obrigatório | 🔴 Sim (produção) |
| Tamanho Mínimo | 32 caracteres (128 bits) |
| Tamanho Recomendado | 64 caracteres (256 bits) |

**Gerar Token:**
```bash
# OpenSSL (recomendado)
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# /dev/urandom
head -c 32 /dev/urandom | xxd -p
```

**Exemplo de Token:**
```bash
TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**URL de Acesso com Token:**
```
http://localhost:3000/?tkn=TOKEN_AQUI
```

**⚠️ Boas Práticas:**
- Nunca commitar token no versionamento
- Usar segredos gerenciados (AWS Secrets Manager, HashiCorp Vault)
- Rotacionar tokens periodicamente
- Usar tokens diferentes por ambiente

---

### 3.2 HTTPS_ENABLED

**Descrição:** Habilita/desabilita HTTPS nativo no servidor.

| Atributo | Valor |
|----------|-------|
| Tipo | Boolean |
| Obrigatório | Não |
| Valor Padrão | `false` |
| Valores Válidos | `true`, `false` |

**Exemplos:**
```bash
# HTTPS desativado (usar reverse proxy)
HTTPS_ENABLED=false

# HTTPS ativado (requer SSL_CERT_PATH e SSL_KEY_PATH)
HTTPS_ENABLED=true
```

**Quando Usar:**
- ✅ `false`: Quando há reverse proxy (Nginx, Apache, Traefik)
- ⚠️ `true`: Apenas para testes ou deploy direto sem proxy

---

### 3.3 SSL_CERT_PATH

**Descrição:** Caminho completo para o arquivo de certificado SSL/TLS.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Sim (se HTTPS_ENABLED=true) |
| Formato | PEM, CRT |

**Exemplos:**
```bash
# Let's Encrypt
SSL_CERT_PATH=/etc/letsencrypt/live/bsc-code.seudominio.com/fullchain.pem

# Certificado auto-assinado
SSL_CERT_PATH=/opt/openvscode-server/ssl/self-signed.crt

# Certificado corporativo
SSL_CERT_PATH=/etc/ssl/certs/bsc-code.crt
```

**Validação:**
```bash
# Verificar se arquivo existe
test -f $SSL_CERT_PATH && echo "Certificado encontrado"

# Verificar validade do certificado
openssl x509 -in $SSL_CERT_PATH -text -noout | grep "Not After"
```

---

### 3.4 SSL_KEY_PATH

**Descrição:** Caminho completo para o arquivo de chave privada SSL/TLS.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Sim (se HTTPS_ENABLED=true) |
| Permissões | 600 (apenas dono lê) |

**Exemplos:**
```bash
# Let's Encrypt
SSL_KEY_PATH=/etc/letsencrypt/live/bsc-code.seudominio.com/privkey.pem

# Auto-assinado
SSL_KEY_PATH=/opt/openvscode-server/ssl/self-signed.key
```

**Proteção da Chave:**
```bash
# Definir permissões restritivas
chmod 600 $SSL_KEY_PATH
chown root:root $SSL_KEY_PATH

# Verificar permissões
ls -la $SSL_KEY_PATH  # Deve ser: -rw-------
```

---

### 3.5 SESSION_TIMEOUT

**Descrição:** Tempo máximo de inatividade antes de desconectar sessão (em minutos).

| Atributo | Valor |
|----------|-------|
| Tipo | Integer |
| Obrigatório | Não |
| Valor Padrão | `0` (sem timeout) |
| Intervalo | 0-1440 (0 = desativado) |

**Exemplos:**
```bash
# Sem timeout (padrão)
SESSION_TIMEOUT=0

# 30 minutos
SESSION_TIMEOUT=30

# 8 horas
SESSION_TIMEOUT=480
```

**Impactos:**
- ✅ Timeout baixo aumenta segurança
- ⚠️ Timeout muito baixo pode frustrar usuários
- ⚠️ Sessões ativas (digitando) não são afetadas

---

### 3.6 ALLOW_MULTIPLE_SESSIONS

**Descrição:** Permite que um mesmo usuário tenha múltiplas sessões simultâneas.

| Atributo | Valor |
|----------|-------|
| Tipo | Boolean |
| Obrigatório | Não |
| Valor Padrão | `false` |

**Exemplos:**
```bash
# Única sessão por usuário
ALLOW_MULTIPLE_SESSIONS=false

# Múltiplas sessões permitidas
ALLOW_MULTIPLE_SESSIONS=true
```

**Casos de Uso:**
- ✅ `true`: Equipes compartilhando conta, testes paralelos
- ✅ `false`: Ambientes corporativos com auditoria rigorosa

---

### 3.7 IP_WHITELIST

**Descrição:** Lista de IPs/CIDRs permitidos para acessar o servidor.

| Atributo | Valor |
|----------|-------|
| Tipo | String (lista separada por vírgula) |
| Obrigatório | Não |
| Valor Vazio | Todos os IPs permitidos |

**Exemplos:**
```bash
# Todos permitidos (padrão)
IP_WHITELIST=

# Apenas localhost
IP_WHITELIST=127.0.0.1

# Rede interna
IP_WHITELIST=192.168.1.0/24,10.0.0.0/8

# IPs específicos
IP_WHITELIST=203.0.113.10,203.0.113.20
```

**Formato CIDR Suportado:**
```
IPv4: 192.168.1.0/24
IPv6: 2001:db8::/32
Single IP: 203.0.113.10
```

---

## 4. Variáveis de Recursos

### 4.1 MEMORY_LIMIT

**Descrição:** Limite máximo de memória RAM por workspace.

| Atributo | Valor |
|----------|-------|
| Tipo | String (suffix: K, M, G) |
| Obrigatório | Não |
| Valor Padrão | `4G` |
| Mínimo Recomendado | `2G` |

**Exemplos:**
```bash
# 2 GB
MEMORY_LIMIT=2G

# 4 GB (padrão)
MEMORY_LIMIT=4G

# 8 GB para workloads pesados
MEMORY_LIMIT=8G

# Em megabytes
MEMORY_LIMIT=4096M
```

**Impactos:**
- ✅ Limite baixo previne OOM mas pode limitar extensões
- ⚠️ Limite alto pode causar OOM do sistema se múltiplos workspaces

**Monitorar Uso:**
```bash
# Verificar uso de memória
ps aux --sort=-%mem | grep openvscode

# Ou via cgroups (Docker)
docker stats bsc-code
```

---

### 4.2 CPU_LIMIT

**Descrição:** Limite de CPU por workspace (em núcleos).

| Atributo | Valor |
|----------|-------|
| Tipo | Float |
| Obrigatório | Não |
| Valor Padrão | `2.0` |
| Significado | 1.0 = 100% de 1 core |

**Exemplos:**
```bash
# 50% de 1 core
CPU_LIMIT=0.5

# 1 core completo
CPU_LIMIT=1.0

# 2 cores (padrão)
CPU_LIMIT=2.0

# 4 cores
CPU_LIMIT=4.0
```

**Uso com Docker:**
```yaml
deploy:
  resources:
    limits:
      cpus: '${CPU_LIMIT:-2.0}'
```

---

### 4.3 MAX_WORKSPACES

**Descrição:** Número máximo de workspaces simultâneos permitidos.

| Atributo | Valor |
|----------|-------|
| Tipo | Integer |
| Obrigatório | Não |
| Valor Padrão | `10` |
| Mínimo | 1 |

**Exemplos:**
```bash
# Single user
MAX_WORKSPACES=1

# Pequena equipe
MAX_WORKSPACES=5

# Produção (padrão)
MAX_WORKSPACES=10

# Grande escala
MAX_WORKSPACES=50
```

**Cálculo de Recursos:**
```
Recursos Totais = MAX_WORKSPACES × (MEMORY_LIMIT + CPU_LIMIT)

Exemplo:
10 workspaces × (4G RAM + 2.0 CPU) = 40G RAM + 20 CPUs necessárias
```

---

## 5. Variáveis de Armazenamento

### 5.1 EXTENSIONS_DIR

**Descrição:** Diretório onde extensões são instaladas e armazenadas.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Não |
| Valor Padrão | `/opt/openvscode-server/extensions` |

**Exemplos:**
```bash
# Padrão
EXTENSIONS_DIR=/opt/openvscode-server/extensions

# Volume persistente
EXTENSIONS_DIR=/data/vscode/extensions

# Docker volume
EXTENSIONS_DIR=/extensions
```

**Backup:**
```bash
# Backup de extensões
tar -czf extensions-backup.tar.gz $EXTENSIONS_DIR

# Restaurar
tar -xzf extensions-backup.tar.gz -C /
```

---

### 5.2 LOGS_DIR

**Descrição:** Diretório para armazenamento de logs da aplicação.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Não |
| Valor Padrão | `/opt/openvscode-server/data/logs` |

**Exemplos:**
```bash
# Padrão
LOGS_DIR=/opt/openvscode-server/data/logs

# Journal do sistema
LOGS_DIR=/var/log/openvscode-server

# Docker
LOGS_DIR=/var/log
```

**Estrutura de Logs:**
```
$LOGS_DIR/
├── server.log          # Logs do servidor principal
├── extension-host.log  # Logs do processo de extensões
├── terminal.log        # Logs de sessões de terminal
└── access.log          # Logs de acesso HTTP
```

---

### 5.3 CACHE_DIR

**Descrição:** Diretório para cache de dados temporários.

| Atributo | Valor |
|----------|-------|
| Tipo | String (path absoluto) |
| Obrigatório | Não |
| Valor Padrão | `/opt/openvscode-server/data/cache` |

**Exemplos:**
```bash
# Padrão
CACHE_DIR=/opt/openvscode-server/data/cache

# tmpfs (RAM disk para performance)
CACHE_DIR=/tmp/vscode-cache

# Docker volume
CACHE_DIR=/cache
```

**Limpeza de Cache:**
```bash
# Limpar cache antigo (> 7 dias)
find $CACHE_DIR -type f -mtime +7 -delete

# Limpar tudo (servidor deve estar parado)
rm -rf $CACHE_DIR/*
```

---

## 6. Variáveis de Logging

### 6.1 LOG_LEVEL

**Descrição:** Nível mínimo de severidade para logs.

| Atributo | Valor |
|----------|-------|
| Tipo | String (enum) |
| Obrigatório | Não |
| Valor Padrão | `info` |

**Níveis Disponíveis:**

| Nível | Descrição | Quando Usar |
|-------|-----------|-------------|
| `error` | Apenas erros críticos | Produção com pouco logging |
| `warn` | Erros + warnings | Produção padrão |
| `info` | Informações gerais | Produção (padrão) |
| `debug` | Detalhes de depuração | Desenvolvimento |
| `trace` | Logs verbosos completos | Debug avançado |

**Exemplos:**
```bash
# Produção (padrão)
LOG_LEVEL=info

# Desenvolvimento
LOG_LEVEL=debug

# Troubleshooting
LOG_LEVEL=trace
```

---

### 6.2 LOG_FORMAT

**Descrição:** Formato de saída dos logs.

| Atributo | Valor |
|----------|-------|
| Tipo | String (enum) |
| Obrigatório | Não |
| Valor Padrão | `json` |
| Valores Válidos | `json`, `text` |

**Exemplos:**
```bash
# JSON (padrão, melhor para agregadores)
LOG_FORMAT=json

# Texto legível (melhor para debugging manual)
LOG_FORMAT=text
```

**Exemplo de Saída:**

*JSON:*
```json
{"level":"info","timestamp":"2024-01-15T10:30:00Z","message":"Server started","port":3000}
```

*Text:*
```
[INFO] 2024-01-15 10:30:00 - Server started on port 3000
```

---

### 6.3 METRICS_ENABLED

**Descrição:** Habilita endpoint de métricas Prometheus.

| Atributo | Valor |
|----------|-------|
| Tipo | Boolean |
| Obrigatório | Não |
| Valor Padrão | `false` |

**Exemplos:**
```bash
# Métricas desativadas (padrão)
METRICS_ENABLED=false

# Métricas ativadas
METRICS_ENABLED=true
```

**Endpoint:**
```
http://localhost:9090/metrics
```

**Métricas Expostas:**
- `vscode_sessions_active`: Sessões ativas
- `vscode_memory_usage_bytes`: Uso de memória
- `vscode_cpu_usage_percent`: Uso de CPU
- `vscode_requests_total`: Requisições HTTP totais
- `vscode_websocket_connections`: Conexões WebSocket

---

## 7. Variáveis de Rede

### 7.1 HTTP_PROXY

**Descrição:** Proxy HTTP para requisições externas (extensões, updates).

| Atributo | Valor |
|----------|-------|
| Tipo | String (URL) |
| Obrigatório | Não |
| Formato | `http://host:port` |

**Exemplos:**
```bash
# Sem proxy (padrão)
HTTP_PROXY=

# Proxy corporativo
HTTP_PROXY=http://proxy.company.com:8080

# Com autenticação
HTTP_PROXY=http://user:pass@proxy.company.com:8080
```

---

### 7.2 HTTPS_PROXY

**Descrição:** Proxy HTTPS para requisições externas.

| Atributo | Valor |
|----------|-------|
| Tipo | String (URL) |
| Obrigatório | Não |
| Formato | `http://host:port` ou `https://host:port` |

**Exemplos:**
```bash
# Mesmo proxy para HTTP e HTTPS
HTTPS_PROXY=http://proxy.company.com:8080

# Proxy diferente para HTTPS
HTTPS_PROXY=https://secure-proxy.company.com:8443
```

---

### 7.3 NO_PROXY

**Descrição:** Lista de hosts/domínios que não usam proxy.

| Atributo | Valor |
|----------|-------|
| Tipo | String (lista separada por vírgula) |
| Obrigatório | Não |

**Exemplos:**
```bash
# Nenhum bypass
NO_PROXY=

# Localhost e rede local
NO_PROXY=localhost,127.0.0.1,192.168.0.0/16

# Domínios internos
NO_PROXY=.internal,.corp,localhost
```

---

## 8. Variáveis de Desenvolvimento

### 8.1 DEBUG_PORT

**Descrição:** Porta para debugger Node.js.

| Atributo | Valor |
|----------|-------|
| Tipo | Integer |
| Obrigatório | Não |
| Valor Padrão | `9229` |

**Exemplos:**
```bash
# Padrão
DEBUG_PORT=9229

# Customizado
DEBUG_PORT=9330
```

**Habilitar Debug:**
```bash
NODE_OPTIONS="--inspect=0.0.0.0:$DEBUG_PORT"
```

**Conectar Debugger:**
```
chrome-devtools://devtools/bundled/inspector.html?ws=localhost:9229
```

---

### 8.2 SOURCE_MAPS

**Descrição:** Habilita source maps para debugging.

| Atributo | Valor |
|----------|-------|
| Tipo | Boolean |
| Obrigatório | Não |
| Valor Padrão | `false` |

**Exemplos:**
```bash
# Produção (desativado)
SOURCE_MAPS=false

# Desenvolvimento (ativado)
SOURCE_MAPS=true
```

**Impactos:**
- ✅ Facilita debugging de erros
- ⚠️ Aumenta tamanho de build
- ⚠️ Pode expor código fonte

---

## 9. Arquivo .env Completo (Template)

```bash
# ============================================
# BSC Code - Template Completo .env
# ============================================

# SERVER
PORT=3000
HOST=0.0.0.0
BASE_URL=/

# SECURITY
TOKEN=GERAR_COM_OPENSSSL_RAND_HEX_32
HTTPS_ENABLED=false
SSL_CERT_PATH=
SSL_KEY_PATH=
SESSION_TIMEOUT=0
ALLOW_MULTIPLE_SESSIONS=false
IP_WHITELIST=

# RESOURCES
MEMORY_LIMIT=4G
CPU_LIMIT=2.0
MAX_WORKSPACES=10
FILE_WATCHER_TIMEOUT=5000

# STORAGE
WORKSPACE_ROOT=/opt/openvscode-server/data/workspaces
EXTENSIONS_DIR=/opt/openvscode-server/extensions
LOGS_DIR=/opt/openvscode-server/data/logs
CACHE_DIR=/opt/openvscode-server/data/cache

# LOGGING
LOG_LEVEL=info
LOG_FORMAT=json
METRICS_ENABLED=false
METRICS_PORT=9090

# NETWORK
EXTENSIONS_REGISTRY=https://open-vsx.org/
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1

# DEVELOPMENT
NODE_ENV=production
SOURCE_MAPS=false
DEBUG_PORT=9229
```

---

## 10. Validação de Variáveis

### Script de Validação

```bash
#!/usr/bin/env bash
# validate-env.sh

set -euo pipefail

echo "=== Validando Variáveis de Ambiente ==="
echo ""

errors=0

# Função de validação
check_var() {
    local var_name=$1
    local var_value=${!var_name:-}
    local required=$2
    local pattern=$3
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "required" ]; then
            echo "❌ ERRO: $var_name é obrigatória e não está definida"
            ((errors++))
        else
            echo "⚪ INFO: $var_name não definida (usando padrão)"
        fi
        return
    fi
    
    if [ -n "$pattern" ] && ! [[ $var_value =~ $pattern ]]; then
        echo "❌ ERRO: $var_name não corresponde ao padrão esperado"
        ((errors++))
        return
    fi
    
    echo "✅ OK: $var_name=$var_value"
}

# Carregar .env se existir
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "✅ Arquivo .env carregado"
else
    echo "⚠️  AVISO: Arquivo .env não encontrado"
fi

echo ""
echo "--- Servidor ---"
check_var "PORT" "" "^[0-9]+$"
check_var "HOST" "" ""
check_var "NODE_ENV" "" "^(production|development|test)$"

echo ""
echo "--- Segurança ---"
check_var "TOKEN" "required" "^[a-fA-F0-9]{32,}$"
check_var "HTTPS_ENABLED" "" "^(true|false)$"

if [ "${HTTPS_ENABLED:-false}" = "true" ]; then
    check_var "SSL_CERT_PATH" "required" ""
    check_var "SSL_KEY_PATH" "required" ""
fi

echo ""
echo "--- Recursos ---"
check_var "MEMORY_LIMIT" "" "^[0-9]+[KMG]?$"
check_var "CPU_LIMIT" "" "^[0-9]+\.?[0-9]*$"
check_var "MAX_WORKSPACES" "" "^[0-9]+$"

echo ""
echo "=== Validação Concluída ==="

if [ $errors -gt 0 ]; then
    echo ""
    echo "❌ $errors erro(s) encontrado(s)"
    exit 1
else
    echo ""
    echo "✅ Todas as variáveis válidas!"
    exit 0
fi
```

**Uso:**
```bash
chmod +x validate-env.sh
./validate-env.sh
```

---

## 11. Referências

- [OpenVSCode Server Environment Variables](https://github.com/gitpod-io/openvscode-server)
- [Node.js Environment Variables](https://nodejs.org/api/cli.html)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [12 Factor App - Config](https://12factor.net/config)

---

**Próximo Documento:** [01-preparacao-build.md](../04-build-compilacao/01-preparacao-build.md)

**Documento Anterior:** [03-configuracao-ambiente.md](./03-configuracao-ambiente.md)
