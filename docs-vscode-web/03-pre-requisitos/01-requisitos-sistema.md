# 01 - Requisitos de Sistema

## Visão Geral

Este documento especifica os requisitos mínimos e recomendados de sistema para execução do BSC Code (VS Code Web) no Google Estúdio IA.

---

## 1. Especificações de Hardware

### 1.1 Mínimos Absolutos

| Componente | Especificação | Justificativa |
|------------|---------------|---------------|
| CPU | 2 vCPUs (x86_64 ou ARM64) | Suficiente para editor básico sem extensões pesadas |
| RAM | 2 GB | Mínimo para processo principal + 1 extensão |
| Disco | 10 GB livres | Código-fonte + extensões básicas + cache |
| Rede | 10 Mbps | Latência aceitável para WebSocket |

**Limitações do Mínimo:**
- Máximo 1 usuário simultâneo
- Extensões limitadas a 5 ativas
- Build de projetos pequenos apenas
- Terminal pode sofrer lag com muitos processos

### 1.2 Recomendado (Single User)

| Componente | Especificação | Justificativa |
|------------|---------------|---------------|
| CPU | 4 vCPUs | Compilação em background + LSP ativo |
| RAM | 8 GB | Múltiplas extensões + Language Servers |
| Disco | 50 GB SSD | Projetos médios + histórico + cache agressivo |
| Rede | 100 Mbps | Experiência responsiva |

**Capacidades:**
- Até 3 usuários simultâneos (com partilha de recursos)
- 20+ extensões ativas
- Build de projetos médios/grandes
- Terminal responsivo com múltiplos processos

### 1.3 Produção (Multi-User)

| Componente | Especificação | Justificativa |
|------------|---------------|---------------|
| CPU | 16+ vCPUs | Múltiplos workspaces isolados |
| RAM | 32+ GB | Isolamento por usuário + caching |
| Disco | 200+ GB NVMe | I/O paralelo de múltiplos usuários |
| Rede | 1 Gbps | Tráfego agregado de WebSocket |

**Capacidades:**
- 10+ usuários simultâneos
- Escalabilidade horizontal possível
- SLA de 99.9% uptime

---

## 2. Sistema Operacional Suportado

### 2.1 Linux (Recomendado)

| Distribuição | Versão | Status | Notas |
|--------------|--------|--------|-------|
| Ubuntu | 22.04 LTS | ✅ Oficial | Testado em produção |
| Ubuntu | 20.04 LTS | ✅ Oficial | Legacy support |
| Debian | 11 (Bullseye) | ✅ Oficial | Estável |
| Debian | 12 (Bookworm) | ✅ Oficial | Recomendado novo deploy |
| Alpine | 3.18+ | ⚠️ Comunidade | Requer ajustes de glibc |
| RHEL/CentOS | 8/9 | ⚠️ Limitado | Testes pendentes |
| Amazon Linux | 2023 | ⚠️ Limitado | Compatível com Docker |

**Requisitos Comuns Linux:**
```bash
# Kernel mínimo
uname -r  # >= 5.10

# Systemd necessário para gerenciamento de serviços
systemctl --version

# Arquiteturas suportadas
uname -m  # x86_64 ou aarch64
```

### 2.2 Container (Docker/Podman)

| Engine | Versão Mínima | Status |
|--------|---------------|--------|
| Docker | 24.0+ | ✅ Oficial |
| Podman | 4.5+ | ✅ Suportado |
| containerd | 1.7+ | ⚠️ Avançado |

**Imagem Base Recomendada:**
```dockerfile
FROM ubuntu:22.04

# Ou alternativa menor
FROM debian:12-slim

# Ou mínima (requer ajustes)
FROM alpine:3.18
```

### 2.3 macOS (Desenvolvimento Local)

| Versão | Status | Notas |
|--------|--------|-------|
| macOS 13+ (Ventura) | ✅ Testado | Apple Silicon e Intel |
| macOS 12 (Monterey) | ⚠️ Limitado | Suporte legacy |

**Não recomendado para produção.**

### 2.4 Windows

| Versão | Status | Notas |
|--------|--------|-------|
| WSL2 (Ubuntu 22.04) | ✅ Suportado | Via subsistema Linux |
| Windows Nativo | ❌ Não Suportado | Usar Docker Desktop |

---

## 3. Dependências de Sistema

### 3.1 Bibliotecas Essenciais

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libnss3 \
    libxss1 \
    libxkbfile0 \
    libxrandr2 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libc6 \
    libstdc++6 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    ca-certificates \
    fonts-liberation \
    xdg-utils \
    lsb-release \
    wget \
    curl \
    gnupg
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install -y \
    gtk3 \
    alsa-lib \
    nss \
    libXcomposite \
    libXdamage \
    libXfixes \
    libXrandr \
    libXi \
    libXtst \
    cups-libs \
    dbus-libs \
    libdrm \
    pango \
    cairo \
    GConf2 \
    libnotify \
    xorg-x11-server-Xvfb
```

**Alpine:**
```bash
apk add --no-cache \
    gtk+3.0 \
    nss \
    ttf-dejavu \
    xdg-utils \
    wget \
    curl \
    gnupg \
    libc6-compat \
    libstdc++
```

### 3.2 Utilitários Necessários

```bash
# Verificação de presença
which node npm git bash tar gzip
```

| Utilitário | Versão Mínima | Finalidade |
|------------|---------------|------------|
| `bash` | 5.0+ | Scripts de inicialização |
| `node` | 20.x+ | Runtime do servidor |
| `npm` | 9.x+ | Gerenciamento de pacotes |
| `git` | 2.30+ | Versionamento e clones |
| `tar` | 1.30+ | Extração de pacotes |
| `gzip` | 1.10+ | Compressão |
| `curl` | 7.70+ | Downloads e health checks |
| `wget` | 1.21+ | Fallback de download |
| `ca-certificates` | Atualizado | HTTPS seguro |

---

## 4. Configurações de Kernel e Sistema

### 4.1 Limites de Recursos (ulimit)

**Configuração Mínima:**
```bash
# /etc/security/limits.d/90-vscode.conf

# Número máximo de arquivos abertos
* soft nofile 65536
* hard nofile 65536

# Número máximo de processos
* soft nproc 4096
* hard nproc 4096

# Tamanho máximo de memória mapeada
* soft memlock unlimited
* hard memlock unlimited
```

**Aplicação:**
```bash
# Recarregar limites
sudo sysctl -p

# Verificar limites atuais
ulimit -n  # Deve retornar >= 65536
ulimit -u  # Deve retornar >= 4096
```

### 4.2 Parâmetros de Kernel (sysctl)

**Otimizações de Rede:**
```bash
# /etc/sysctl.d/90-vscode-network.conf

# Aumentar buffer de rede para WebSocket
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Permitir reuso de portas TIME_WAIT
net.ipv4.tcp_tw_reuse = 1

# Aumentar conexões pendentes
net.core.somaxconn = 4096
net.ipv4.ip_local_port_range = 1024 65535

# Aplicar
sudo sysctl -p /etc/sysctl.d/90-vscode-network.conf
```

**Otimizações de Inotify (Watchers de Arquivo):**
```bash
# /etc/sysctl.d/90-vscode-inotify.conf

# Aumentar watchers para grandes codebases
fs.inotify.max_user_watches = 524288
fs.inotify.max_user_instances = 512
fs.inotify.max_queued_events = 16384

# Aplicar
sudo sysctl -p /etc/sysctl.d/90-vscode-inotify.conf
```

### 4.3 Configurações de Segurança

**AppArmor (Ubuntu/Debian):**
```bash
# Criar perfil customizado
sudo vim /etc/apparmor.d/local/openvscode-server

# Conteúdo mínimo
/usr/bin/node {
  network inet stream,
  network inet6 stream,
  capability net_bind_service,
  file,
  pipe,
}
```

**SELinux (RHEL/CentOS):**
```bash
# Contexto para diretório de trabalho
sudo semanage fcontext -a -t httpd_sys_content_t "/opt/openvscode-server(/.*)?"
sudo restorecon -Rv /opt/openvscode-server
```

---

## 5. Configuração de Usuário e Permissões

### 5.1 Usuário Dedicado (Recomendado)

```bash
# Criar usuário de serviço
sudo useradd --system \
    --shell /bin/bash \
    --home /opt/openvscode-server \
    --create-home \
    vscode

# Definir permissões
sudo chown -R vscode:vscode /opt/openvscode-server
sudo chmod 750 /opt/openvscode-server
```

### 5.2 Execução como Serviço (systemd)

```ini
# /etc/systemd/system/openvscode-server.service

[Unit]
Description=BSC Code - VS Code Web Server
After=network.target

[Service]
Type=simple
User=vscode
Group=vscode
WorkingDirectory=/opt/openvscode-server
Environment="PORT=3000"
Environment="HOST=0.0.0.0"
ExecStart=/opt/openvscode-server/bin/openvscode-server
Restart=on-failure
RestartSec=5

# Limites de recursos
LimitNOFILE=65536
LimitNPROC=4096

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=openvscode-server

[Install]
WantedBy=multi-user.target
```

**Habilitar serviço:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable openvscode-server
sudo systemctl start openvscode-server
sudo systemctl status openvscode-server
```

---

## 6. Script de Verificação de Pré-requisitos

```bash
#!/usr/bin/env bash
# check-prerequisites.sh

set -euo pipefail

echo "=== BSC Code - Verificação de Pré-requisitos ==="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# 1. Verificar SO
echo "1. Verificando Sistema Operacional..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    pass "SO: $NAME $VERSION_ID"
else
    fail "SO não identificado"
fi

# 2. Verificar arquitetura
echo "2. Verificando Arquitetura..."
ARCH=$(uname -m)
case "$ARCH" in
    x86_64|aarch64) pass "Arquitetura: $ARCH" ;;
    *) fail "Arquitetura não suportada: $ARCH" ;;
esac

# 3. Verificar kernel
echo "3. Verificando Kernel..."
KERNEL=$(uname -r)
MAJOR=$(echo "$KERNEL" | cut -d. -f1)
MINOR=$(echo "$KERNEL" | cut -d. -f2)
if [ "$MAJOR" -gt 5 ] || ([ "$MAJOR" -eq 5 ] && [ "$MINOR" -ge 10 ]); then
    pass "Kernel: $KERNEL (>= 5.10)"
else
    warn "Kernel: $KERNEL (< 5.10 - pode ter problemas)"
fi

# 4. Verificar RAM
echo "4. Verificando Memória RAM..."
RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
RAM_GB=$((RAM_KB / 1024 / 1024))
if [ "$RAM_GB" -ge 2 ]; then
    pass "RAM: ${RAM_GB}GB (mínimo: 2GB)"
else
    fail "RAM: ${RAM_GB}GB (mínimo: 2GB)"
fi

# 5. Verificar espaço em disco
echo "5. Verificando Espaço em Disco..."
DISK_AVAIL=$(df -BG / | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$DISK_AVAIL" -ge 10 ]; then
    pass "Disco Livre: ${DISK_AVAIL}GB (mínimo: 10GB)"
else
    fail "Disco Livre: ${DISK_AVAIL}GB (mínimo: 10GB)"
fi

# 6. Verificar Node.js
echo "6. Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VER=$(node --version | cut -d'v' -f2 | cut -d. -f1)
    if [ "$NODE_VER" -ge 20 ]; then
        pass "Node.js: $(node --version)"
    else
        fail "Node.js: $(node --version) (requerido: >= 20.x)"
    fi
else
    warn "Node.js não instalado (necessário para build from source)"
fi

# 7. Verificar Git
echo "7. Verificando Git..."
if command -v git &> /dev/null; then
    pass "Git: $(git --version)"
else
    warn "Git não instalado (necessário para funcionalidades VCS)"
fi

# 8. Verificar portas disponíveis
echo "8. Verificando Portas de Rede..."
PORT=${PORT:-3000}
if ! ss -tuln | grep -q ":$PORT "; then
    pass "Porta $PORT disponível"
else
    fail "Porta $PORT já está em uso"
fi

# 9. Verificar ulimit
echo "9. Verificando Limites (ulimit)..."
NOFILE=$(ulimit -n)
if [ "$NOFILE" -ge 65536 ]; then
    pass "nofile: $NOFILE (>= 65536)"
else
    warn "nofile: $NOFILE (< 65536 - ajustar limits.conf)"
fi

# 10. Verificar inotify
echo "10. Verificando Inotify Watchers..."
WATCHES=$(cat /proc/sys/fs/inotify/max_user_watches)
if [ "$WATCHES" -ge 524288 ]; then
    pass "max_user_watches: $WATCHES"
else
    warn "max_user_watches: $WATCHES (< 524288 - ajustar sysctl)"
fi

echo ""
echo "=== Verificação Concluída ==="
echo ""
echo "Próximos passos:"
echo "  - Se todos os checks passaram: prosseguir com instalação"
echo "  - Se houve warnings: ajustar configurações antes de produção"
echo "  - Se houve failures: corrigir antes de continuar"
```

**Uso:**
```bash
chmod +x check-prerequisites.sh
./check-prerequisites.sh
```

---

## 7. Checklist de Validação

### Antes da Instalação

- [ ] SO compatível verificado
- [ ] Arquitetura suportada (x86_64 ou ARM64)
- [ ] Kernel >= 5.10
- [ ] RAM mínima (2GB) disponível
- [ ] Disco mínimo (10GB) livre
- [ ] Portas necessárias disponíveis
- [ ] Usuário dedicado criado (produção)
- [ ] Limites ulimit configurados
- [ ] Parâmetros sysctl aplicados

### Pós-Instalação

- [ ] Serviço rodando como usuário correto
- [ ] Health check respondendo
- [ ] Logs sendo gerados corretamente
- [ ] WebSocket funcionando (teste de conexão)
- [ ] Extensões instaláveis
- [ ] Terminal funcional
- [ ] File watchers operacionais

---

## 8. Troubleshooting de Pré-requisitos

### Problema: "Cannot allocate memory"

**Sintoma:** Servidor falha ao iniciar com erro OOM.

**Solução:**
```bash
# Verificar memória disponível
free -h

# Aumentar swap se necessário
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Problema: "Too many open files"

**Sintoma:** Erros ao abrir arquivos ou conexões.

**Solução:**
```bash
# Verificar limite atual
ulimit -n

# Ajustar temporariamente
ulimit -n 65536

# Ajustar permanentemente (ver seção 4.1)
```

### Problema: "EMFILE: too many open files" no browser

**Sintoma:** File watchers não funcionam em projetos grandes.

**Solução:**
```bash
# Aumentar inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verificar valor
cat /proc/sys/fs/inotify/max_user_watches
```

### Problema: Porta já em uso

**Sintoma:** `EADDRINUSE: address already in use`

**Solução:**
```bash
# Identificar processo usando a porta
sudo lsof -i :3000
sudo ss -tuln | grep :3000

# Matar processo ou usar outra porta
export PORT=3001
```

---

## 9. Referências

- [OpenVSCode Server Requirements](https://github.com/gitpod-io/openvscode-server#requirements)
- [VS Code System Requirements](https://code.visualstudio.com/docs/setup/linux#_system-requirements)
- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/)
- [systemd.service(5)](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

**Próximo Documento:** [02-dependencias-software.md](./02-dependencias-software.md)

**Documento Anterior:** [README.md](../README.md)
