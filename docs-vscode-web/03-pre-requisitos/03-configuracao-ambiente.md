# 03 - Configuração de Ambiente

## Visão Geral

Este documento descreve como configurar o ambiente de desenvolvimento e produção do BSC Code, incluindo variáveis de ambiente, arquivos de configuração e estruturas de diretórios.

---

## 1. Estrutura de Diretórios

### 1.1 Layout Padrão

```
/opt/openvscode-server/
├── bin/
│   └── openvscode-server          # Executável principal
├── lib/
│   └── node/                      # Bibliotecas Node.js
├── extensions/                    # Extensões instaladas
│   ├── published/                 # Extensões publicadas
│   └── .obsolete                  # Extensões obsoletas
├── config/
│   ├── settings.json              # Configurações globais
│   ├── keybindings.json           # Atalhos customizados
│   └── extensions.json            # Extensões recomendadas
├── data/
│   ├── workspaces/                # Workspaces dos usuários
│   ├── logs/                      # Logs da aplicação
│   └── cache/                     # Cache de dados
└── .env                           # Variáveis de ambiente (produção)
```

### 1.2 Permissões

```bash
# Proprietário recomendado
sudo chown -R vscode:vscode /opt/openvscode-server

# Permissões de diretórios
chmod 750 /opt/openvscode-server
chmod 700 /opt/openvscode-server/data
chmod 640 /opt/openvscode-server/.env
```

---

## 2. Variáveis de Ambiente

### 2.1 Arquivo .env.example

```bash
# ============================================
# BSC Code - Variáveis de Ambiente
# ============================================

# --------------------------------------------
# Configurações de Servidor
# --------------------------------------------

# Porta que o servidor vai escutar
PORT=3000

# Host/IP para bind (0.0.0.0 = todas as interfaces)
HOST=0.0.0.0

# Base URL para reverse proxy
BASE_URL=/

# --------------------------------------------
# Autenticação e Segurança
# --------------------------------------------

# Token de autenticação (gerar com: openssl rand -hex 32)
TOKEN=

# Habilitar HTTPS (true/false)
HTTPS_ENABLED=false

# Caminho para certificado SSL (se HTTPS_ENABLED=true)
SSL_CERT_PATH=/etc/ssl/certs/bsc-code.crt

# Caminho para chave privada SSL
SSL_KEY_PATH=/etc/ssl/private/bsc-code.key

# --------------------------------------------
# Controle de Acesso
# --------------------------------------------

# Permitir múltiplas sessões por usuário
ALLOW_MULTIPLE_SESSIONS=false

# Timeout de sessão em minutos (0 = sem timeout)
SESSION_TIMEOUT=0

# IP whitelist (vazio = todos permitidos)
IP_WHITELIST=

# --------------------------------------------
# Recursos e Limites
# --------------------------------------------

# Limite de memória por workspace (ex: 2G, 4G)
MEMORY_LIMIT=4G

# Limite de CPU por workspace (ex: 2.0 = 200%)
CPU_LIMIT=2.0

# Número máximo de workspaces simultâneos
MAX_WORKSPACES=10

# Timeout para operações de file watcher (ms)
FILE_WATCHER_TIMEOUT=5000

# --------------------------------------------
# Armazenamento
# --------------------------------------------

# Diretório raiz para workspaces
WORKSPACE_ROOT=/opt/openvscode-server/data/workspaces

# Diretório para extensões
EXTENSIONS_DIR=/opt/openvscode-server/extensions

# Diretório para logs
LOGS_DIR=/opt/openvscode-server/data/logs

# Diretório para cache
CACHE_DIR=/opt/openvscode-server/data/cache

# --------------------------------------------
# Logging e Monitoramento
# --------------------------------------------

# Nível de log (error, warn, info, debug, trace)
LOG_LEVEL=info

# Formato de log (json, text)
LOG_FORMAT=json

# Habilitar métricas Prometheus
METRICS_ENABLED=false

# Porta para métricas
METRICS_PORT=9090

# --------------------------------------------
# Integrações Externas
# --------------------------------------------

# Registry de extensões (padrão: Open VSX)
EXTENSIONS_REGISTRY=https://open-vsx.org/

# Proxy para requisições externas
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1

# --------------------------------------------
# Desenvolvimento e Debug
# --------------------------------------------

# Modo de desenvolvimento (habilita verbose logging)
NODE_ENV=production

# Habilitar source maps
SOURCE_MAPS=false

# Portas de debug
DEBUG_PORT=9229
```

### 2.2 Gerar Token Seguro

```bash
# Método 1: OpenSSL
openssl rand -hex 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Método 3: /dev/urandom
head -c 32 /dev/urandom | xxd -p
```

**Exemplo de token gerado:**
```
TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 3. Arquivos de Configuração

### 3.1 settings.json (Configurações Globais)

```json
{
  "comment": "Configurações globais do BSC Code",
  
  "workbench.colorTheme": "Default Dark Modern",
  "workbench.iconTheme": "vs-minimal",
  "workbench.editor.enablePreview": false,
  "workbench.editor.revealIfOpen": true,
  
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "editor.fontLigatures": true,
  "editor.minimap.enabled": true,
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.renderWhitespace": "selection",
  
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.exclude": {
    "**/.git": false,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/__pycache__": true,
    "**/*.pyc": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.fontFamily": "'JetBrains Mono', monospace",
  "terminal.integrated.shell.linux": "/bin/bash",
  "terminal.integrated.cursorBlinking": true,
  
  "security.workspace.trust.enabled": true,
  "security.workspace.trust.startupPrompt": "always",
  
  "update.mode": "manual",
  "telemetry.telemetryLevel": "off",
  
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": true,
  
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

### 3.2 keybindings.json (Atalhos Customizados)

```json
[
  {
    "key": "ctrl+shift+p",
    "command": "workbench.action.showCommands"
  },
  {
    "key": "ctrl+`",
    "command": "workbench.action.terminal.toggleTerminal"
  },
  {
    "key": "ctrl+shift+n",
    "command": "workbench.action.files.newUntitledFile"
  },
  {
    "key": "ctrl+shift+w",
    "command": "workbench.action.closeAllEditors"
  },
  {
    "key": "ctrl+k ctrl+s",
    "command": "workbench.action.openGlobalKeybindings"
  },
  {
    "key": "f5",
    "command": "workbench.action.debug.start",
    "when": "debuggersAvailable"
  },
  {
    "key": "shift+f5",
    "command": "workbench.action.debug.stop",
    "when": "debugging"
  },
  {
    "key": "ctrl+shift+f5",
    "command": "workbench.action.debug.restart",
    "when": "debugging"
  }
]
```

### 3.3 extensions.json (Extensões Recomendadas)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-python.python",
    "ms-vscode.cpptools",
    "rust-lang.rust-analyzer",
    "golang.go",
    "ms-dotnettools.csharp",
    "vscjava.vscode-java-pack",
    "ms-toolsai.jupyter",
    "gitlab.gitlab-workflow",
    "github.vscode-pull-request-github",
    "ms-azuretools.vscode-docker",
    "ms-kubernetes-tools.vscode-kubernetes-tools"
  ],
  "unwantedRecommendations": [
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-wsl",
    "ms-vscode-remote.remote-containers"
  ]
}
```

---

## 4. Configuração de Reverse Proxy

### 4.1 Nginx

```nginx
# /etc/nginx/sites-available/bsc-code

upstream bsc_code {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name bsc-code.seudominio.com;
    
    # Redirect HTTP -> HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bsc-code.seudominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/bsc-code.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bsc-code.seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/bsc-code.access.log;
    error_log /var/log/nginx/bsc-code.error.log;
    
    # Client Upload Size
    client_max_body_size 1G;
    
    # WebSocket Support
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    location / {
        proxy_pass http://bsc_code;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_cache off;
        
        # WebSocket specific
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health Check Endpoint
    location /health {
        proxy_pass http://bsc_code/health;
        access_log off;
    }
}
```

### 4.2 Apache

```apache
# /etc/apache2/sites-available/bsc-code.conf

<VirtualHost *:80>
    ServerName bsc-code.seudominio.com
    
    # Redirect HTTP -> HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName bsc-code.seudominio.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bsc-code.seudominio.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bsc-code.seudominio.com/privkey.pem
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=63072000"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/bsc-code.error.log
    CustomLog ${APACHE_LOG_DIR}/bsc-code.access.log combined
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/ retry=0 timeout=60
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket Support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?$ "ws://127.0.0.1:3000/" [P,L]
    
    <Location />
        Require all granted
    </Location>
</VirtualHost>
```

### 4.3 Habilitar Site

```bash
# Nginx
sudo ln -s /etc/nginx/sites-available/bsc-code /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Apache
sudo a2ensite bsc-code
sudo a2enmod proxy proxy_wstunnel rewrite ssl headers
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 5. Script de Inicialização

```bash
#!/usr/bin/env bash
# start-bsc-code.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Carregar variáveis de ambiente
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Valores padrão
export PORT="${PORT:-3000}"
export HOST="${HOST:-0.0.0.0}"
export NODE_ENV="${NODE_ENV:-production}"
export LOG_LEVEL="${LOG_LEVEL:-info}"

# Criar diretórios necessários
mkdir -p "${WORKSPACE_ROOT:-./data/workspaces}"
mkdir -p "${LOGS_DIR:-./data/logs}"
mkdir -p "${CACHE_DIR:-./data/cache}"
mkdir -p "${EXTENSIONS_DIR:-./extensions}"

# Verificar token
if [ -z "${TOKEN:-}" ]; then
    echo "⚠️  AVISO: TOKEN não definido. Gerando token temporário..."
    export TOKEN=$(openssl rand -hex 32)
    echo "Token temporário: $TOKEN"
    echo ""
    echo "⚠️  Para produção, defina TOKEN no arquivo .env"
fi

echo "=== BSC Code - Iniciando ==="
echo "Porta: $PORT"
echo "Host: $HOST"
echo "Ambiente: $NODE_ENV"
echo "Nível de Log: $LOG_LEVEL"
echo ""

# Iniciar servidor
exec /opt/openvscode-server/bin/openvscode-server \
    --host "$HOST" \
    --port "$PORT" \
    --without-connection-token \
    --enable-remote-auto-shutdown \
    --remote-auto-shutdown-without-delay \
    "$@"
```

---

## 6. Checklist de Configuração

### Produção

- [ ] Token de autenticação gerado e armazenado com segurança
- [ ] HTTPS configurado com certificado válido
- [ ] Reverse proxy configurado (Nginx/Apache)
- [ ] Firewall configurado (apenas portas 80/443 expostas)
- [ ] Limites de recursos definidos (memory, CPU)
- [ ] Logging estruturado habilitado
- [ ] Backup de configurações agendado
- [ ] Monitoramento configurado

### Desenvolvimento

- [ ] .env.local criado com configurações específicas
- [ ] Source maps habilitados
- [ ] Log level definido como debug
- [ ] Hot reload configurado (se aplicável)
- [ ] Extensões de desenvolvimento instaladas

---

## 7. Troubleshooting

### Problema: "EACCES: permission denied"

**Solução:**
```bash
# Verificar permissões
ls -la /opt/openvscode-server

# Corrigir proprietário
sudo chown -R vscode:vscode /opt/openvscode-server

# Corrigir permissões
sudo chmod 750 /opt/openvscode-server
```

### Problema: "Token inválido"

**Solução:**
```bash
# Gerar novo token
export TOKEN=$(openssl rand -hex 32)

# Atualizar .env
echo "TOKEN=$TOKEN" >> .env

# Reiniciar serviço
sudo systemctl restart openvscode-server
```

### Problema: "WebSocket connection failed"

**Solução:**
```bash
# Verificar configuração do proxy
sudo nginx -t

# Verificar se WebSocket está habilitado
curl -i -H "Upgrade: websocket" -H "Connection: Upgrade" http://localhost:3000

# Verificar firewall
sudo ufw status
```

---

## 8. Referências

- [OpenVSCode Server Configuration](https://github.com/gitpod-io/openvscode-server#usage)
- [VS Code Settings Reference](https://code.visualstudio.com/docs/getstarted/settings)
- [Nginx WebSocket Proxy](https://www.nginx.com/blog/websocket-nginx/)
- [Let's Encrypt Setup](https://letsencrypt.org/getting-started/)

---

**Próximo Documento:** [04-variaveis-ambiente.md](./04-variaveis-ambiente.md)

**Documento Anterior:** [02-dependencias-software.md](./02-dependencias-software.md)
