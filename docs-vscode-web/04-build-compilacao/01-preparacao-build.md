# 01 - Preparação do Build

## Visão Geral

Este documento descreve os passos necessários para preparar o ambiente de build do BSC Code, incluindo configuração do repositório, instalação de dependências de compilação e validação do ambiente.

---

## 1. Estrutura do Repositório

### 1.1 Clone do Repositório

```bash
# Criar diretório de trabalho
mkdir -p ~/bsc-code-build
cd ~/bsc-code-build

# Opção A: Clonar repositório oficial (OpenVSCode Server)
git clone https://github.com/gitpod-io/openvscode-server.git
cd openvscode-server

# Opção B: Fork personalizado (recomendado para customizações)
git clone https://github.com/SEU_ORG/openvscode-server.git
cd openvscode-server

# Verificar branch
git branch -a

# Checkout da versão estável mais recente
git tag --sort=-creatordate | head -10
git checkout tags/latest-release-tag
```

### 1.2 Estrutura de Diretórios

```
openvscode-server/
├── .git/
├── .github/                    # Workflows CI/CD
├── build/                      # Scripts de build
│   ├── build.sh               # Script principal
│   ├── download.sh            # Download de binários
│   └── package.json           # Configuração do bundle
├── src/                        # Código fonte (se build from source)
│   ├── main.ts                # Entry point
│   ├── server/                # Servidor
│   └── browser/               # Cliente web
├── scripts/                    # Scripts utilitários
│   ├── patch-vscode.sh        # Aplicar patches
│   └── download-bins.sh       # Download binários
├── package.json                # Dependências Node.js
├── tsconfig.json              # Config TypeScript
├── Dockerfile                 # Build Docker
├── docker-compose.yml         # Docker Compose
├── README.md                  # Documentação
└── LICENSE                    # Licença MIT
```

---

## 2. Pré-requisitos de Build

### 2.1 Verificação Automática

```bash
#!/usr/bin/env bash
# check-build-prerequisites.sh

set -euo pipefail

echo "=== Verificando Pré-requisitos de Build ==="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Git
if command -v git &> /dev/null; then
    GIT_VER=$(git --version | awk '{print $3}')
    pass "Git: $GIT_VER"
else
    fail "Git não instalado"
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VER=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d'v' -f2 | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        pass "Node.js: $NODE_VER"
    else
        fail "Node.js $NODE_VER (requerido >= 20.x)"
    fi
else
    fail "Node.js não instalado"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VER=$(npm --version)
    pass "npm: $NPM_VER"
else
    fail "npm não instalado"
fi

# yarn (opcional)
if command -v yarn &> /dev/null; then
    YARN_VER=$(yarn --version)
    pass "Yarn: $YARN_VER (opcional)"
else
    warn "Yarn não instalado (opcional)"
fi

# pnpm (opcional)
if command -v pnpm &> /dev/null; then
    PNPM_VER=$(pnpm --version)
    pass "pnpm: $PNPM_VER (opcional)"
else
    warn "pnpm não instalado (opcional)"
fi

# Python (para node-gyp)
if command -v python3 &> /dev/null; then
    PYTHON_VER=$(python3 --version)
    pass "Python 3: $PYTHON_VER"
else
    warn "Python 3 não encontrado (necessário para native modules)"
fi

# Make
if command -v make &> /dev/null; then
    MAKE_VER=$(make --version | head -1)
    pass "Make: disponível"
else
    warn "Make não instalado (necessário para native modules)"
fi

# g++ (compilador C++)
if command -v g++ &> /dev/null; then
    GCC_VER=$(g++ --version | head -1)
    pass "g++: disponível"
else
    warn "g++ não instalado (necessário para native modules)"
fi

# Espaço em disco
DISK_AVAIL=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$DISK_AVAIL" -ge 10 ]; then
    pass "Espaço em disco: ${DISK_AVAIL}GB"
else
    fail "Espaço insuficiente: ${DISK_AVAIL}GB (mínimo 10GB)"
fi

# Memória RAM
RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
RAM_GB=$((RAM_KB / 1024 / 1024))
if [ "$RAM_GB" -ge 4 ]; then
    pass "Memória RAM: ${RAM_GB}GB"
else
    warn "Memória RAM: ${RAM_GB}GB (recomendado >= 4GB para build)"
fi

echo ""
echo "=== Verificação Concluída ==="
```

**Uso:**
```bash
chmod +x check-build-prerequisites.sh
./check-build-prerequisites.sh
```

### 2.2 Instalação de Dependências

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    ca-certificates \
    build-essential \
    python3 \
    python3-dev \
    libssl-dev \
    pkg-config \
    jq \
    unzip \
    zip
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install -y \
    git \
    curl \
    wget \
    gnupg2 \
    ca-certificates \
    gcc \
    gcc-c++ \
    make \
    python3 \
    python3-devel \
    openssl-devel \
    pkgconfig \
    jq \
    unzip \
    zip
```

**Alpine:**
```bash
apk add --no-cache \
    git \
    curl \
    wget \
    gnupg \
    ca-certificates \
    build-base \
    python3 \
    openssl-dev \
    pkgconf \
    jq \
    unzip \
    zip
```

---

## 3. Configuração do Ambiente Node.js

### 3.1 Usando NVM (Recomendado)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carregar NVM no shell atual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
npm --version
```

### 3.2 Configurar Registry npm

```bash
# Usar registry oficial
npm config set registry https://registry.npmjs.org/

# Ou usar mirror corporativo
npm config set registry https://npm.corporation.com/

# Configurar cache directory (opcional)
npm config set cache ~/.npm-cache

# Verificar configuração
npm config list
```

### 3.3 Instalar Dependências Globais

```bash
# TypeScript
npm install -g typescript ts-node

# Bundlers
npm install -g webpack webpack-cli esbuild

# Ferramentas de qualidade
npm install -g eslint prettier

# Utilitários
npm install -g concurrently nodemon

# Verificar instalações
npm list -g --depth=0
```

---

## 4. Download de Binários Pré-compilados

### 4.1 Método Recomendado (Download)

Para a maioria dos casos, usar binários pré-compilados é mais rápido:

```bash
#!/usr/bin/env bash
# download-binaries.sh

set -euo pipefail

VERSION="${1:-latest}"
DOWNLOAD_DIR="${2:-./download}"

echo "=== Download OpenVSCode Server ==="
echo "Versão: $VERSION"
echo "Diretório: $DOWNLOAD_DIR"

# Criar diretório
mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR"

# Determinar URL
if [ "$VERSION" = "latest" ]; then
    # Buscar última release via API GitHub
    VERSION=$(curl -s https://api.github.com/repos/gitpod-io/openvscode-server/releases/latest | jq -r .tag_name)
    echo "Última versão: $VERSION"
fi

# URL do release
BASE_URL="https://github.com/gitpod-io/openvscode-server/releases/download"
TARBALL="openvscode-server-${VERSION}.tar.gz"
URL="${BASE_URL}/${VERSION}/${TARBALL}"

echo "URL: $URL"
echo ""

# Download
echo "Baixando..."
wget --progress=bar:force "$URL" -O "$TARBALL"

# Verificar checksum se disponível
if wget --spider "${URL}.sha256" 2>/dev/null; then
    echo "Verificando checksum..."
    wget "${URL}.sha256" -O "${TARBALL}.sha256"
    sha256sum -c "${TARBALL}.sha256"
fi

# Extrair
echo "Extraindo..."
tar -xzf "$TARBALL"

# Listar conteúdo
echo ""
echo "=== Conteúdo ==="
ls -la

echo ""
echo "=== Download Concluído ==="
echo "Binário: $(pwd)/openvscode-server-${VERSION}/bin/openvscode-server"
```

**Uso:**
```bash
chmod +x download-binaries.sh
./download-binaries.sh latest ./openvscode
```

### 4.2 URLs de Release

| Versão | URL | Tamanho |
|--------|-----|---------|
| latest | `https://github.com/gitpod-io/openvscode-server/releases/latest/download/openvscode-server-latest.tar.gz` | ~300MB |
| specific | `https://github.com/gitpod-io/openvscode-server/releases/download/{TAG}/openvscode-server-{TAG}.tar.gz` | ~300MB |

---

## 5. Build From Source (Opcional)

### 5.1 Quando Fazer Build From Source

✅ **Casos apropriados:**
- Customizações profundas do VS Code
- Adição de features específicas
- Correção de bugs upstream
- Requisitos de segurança específicos

❌ **Não necessário quando:**
- Uso padrão do OpenVSCode Server
- Apenas configuração de deployment
- Extensões podem ser instaladas separadamente

### 5.2 Passos para Build From Source

```bash
#!/usr/bin/env bash
# build-from-source.sh

set -euo pipefail

echo "=== Build From Source do OpenVSCode Server ==="

# 1. Clonar repositório
echo "[1/6] Clonando repositório..."
git clone https://github.com/gitpod-io/openvscode-server.git
cd openvscode-server

# 2. Instalar dependências
echo "[2/6] Instalando dependências npm..."
npm ci

# 3. Download do código fonte do VS Code
echo "[3/6] Baixando código fonte do VS Code..."
npm run download-vscode

# 4. Aplicar patches (se necessário)
echo "[4/6] Aplicando patches..."
# Patches são aplicados automaticamente pelo script de build

# 5. Build
echo "[5/6] Compilando..."
# Build completo pode levar 30-60 minutos
npm run build

# 6. Package
echo "[6/6] Criando pacote..."
npm run package

echo ""
echo "=== Build Concluído ==="
echo "Output: $(pwd)/dist/"
```

**Tempo Estimado:**
- Primeira compilação: 30-60 minutos
- Compilações subsequentes (incremental): 5-10 minutos

**Requisitos de Recursos:**
- RAM: Mínimo 8GB (recomendado 16GB)
- CPU: 4+ cores (recomendado 8+)
- Disco: 20GB livres

### 5.3 Build Otimizado

```bash
# Usar mais threads de compilação
export JOBS=8

# Build apenas do necessário (mais rápido)
npm run build:fast

# Build com verificações desabilitadas (não recomendado para produção)
npm run build -- --skip-type-check --skip-lint

# Build incremental (apenas mudanças)
npm run watch
```

---

## 6. Aplicação de Patches Customizados

### 6.1 Estrutura de Patches

```
patches/
├── vscode/
│   ├── 001-custom-theme.patch
│   ├── 002-disable-telemetry.patch
│   └── 003-add-logo.patch
└── server/
    ├── 001-auth-improvements.patch
    └── 002-performance-fixes.patch
```

### 6.2 Script de Aplicação

```bash
#!/usr/bin/env bash
# apply-patches.sh

set -euo pipefail

PATCHES_DIR="${1:-./patches}"
TARGET_DIR="${2:-./src}"

echo "=== Aplicando Patches ==="
echo "Patches: $PATCHES_DIR"
echo "Target: $TARGET_DIR"

if [ ! -d "$PATCHES_DIR" ]; then
    echo "❌ Diretório de patches não encontrado"
    exit 1
fi

cd "$TARGET_DIR"

# Aplicar patches em ordem
for patch in $(find "$PATCHES_DIR" -name "*.patch" | sort); do
    echo "Aplicando: $(basename $patch)"
    
    if patch -p1 --dry-run < "$patch" > /dev/null 2>&1; then
        patch -p1 < "$patch"
        echo "  ✅ Aplicado com sucesso"
    else
        echo "  ⚠️  Patch já aplicado ou falhou"
    fi
done

echo "=== Patches Aplicados ==="
```

### 6.3 Criar Novo Patch

```bash
# 1. Fazer modificações no código
# ... editar arquivos ...

# 2. Gerar diff
cd src/vs/workbench
git diff > ../../../patches/vscode/004-minha-customizacao.patch

# 3. Validar patch
cd ../../..
./apply-patches.sh patches/vscode src/vs/workbench
```

---

## 7. Validação do Build

### 7.1 Testes Unitários

```bash
# Rodar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes específicos
npm run test -- --grep "authentication"
```

### 7.2 Validação de Binário

```bash
#!/usr/bin/env bash
# validate-build.sh

set -euo pipefail

BUILD_DIR="${1:-./dist}"

echo "=== Validando Build ==="

# Verificar estrutura
if [ ! -f "$BUILD_DIR/bin/openvscode-server" ]; then
    echo "❌ Binário principal não encontrado"
    exit 1
fi
echo "✅ Binário principal encontrado"

# Verificar permissões
if [ ! -x "$BUILD_DIR/bin/openvscode-server" ]; then
    echo "❌ Binário não tem permissão de execução"
    exit 1
fi
echo "✅ Permissões corretas"

# Testar help
if "$BUILD_DIR/bin/openvscode-server" --help | grep -q "Usage"; then
    echo "✅ Comando --help funciona"
else
    echo "❌ Comando --help falhou"
    exit 1
fi

# Testar versão
VERSION=$("$BUILD_DIR/bin/openvscode-server" --version)
if [ -n "$VERSION" ]; then
    echo "✅ Versão: $VERSION"
else
    echo "❌ Não foi possível obter versão"
    exit 1
fi

# Verificar dependências
echo ""
echo "Verificando dependências compartilhadas..."
ldd "$BUILD_DIR/bin/openvscode-server" | grep "not found" && {
    echo "❌ Dependências faltando"
    exit 1
}
echo "✅ Todas as dependências encontradas"

echo ""
echo "=== Validação Concluída ==="
```

### 7.3 Smoke Tests

```bash
#!/usr/bin/env bash
# smoke-test.sh

set -euo pipefail

PORT=3099
TOKEN="test-token-$(openssl rand -hex 16)"

echo "=== Smoke Test ==="

# Iniciar servidor em background
./dist/bin/openvscode-server \
    --port $PORT \
    --host 127.0.0.1 \
    --without-connection-token \
    &
SERVER_PID=$!

# Aguardar startup
echo "Aguardando servidor iniciar..."
sleep 10

# Test 1: Health check
echo "Test 1: Health check..."
if curl -s http://localhost:$PORT/health | grep -q "ok"; then
    echo "  ✅ Health check passou"
else
    echo "  ❌ Health check falhou"
    kill $SERVER_PID
    exit 1
fi

# Test 2: Login page
echo "Test 2: Login page..."
if curl -s http://localhost:$PORT/login | grep -q "token"; then
    echo "  ✅ Login page carregou"
else
    echo "  ❌ Login page falhou"
    kill $SERVER_PID
    exit 1
fi

# Test 3: Authenticated access
echo "Test 3: Authenticated access..."
if curl -s "http://localhost:$PORT/?tkn=$TOKEN" | grep -q "Visual Studio Code"; then
    echo "  ✅ Acesso autenticado funcionou"
else
    echo "  ❌ Acesso autenticado falhou"
    kill $SERVER_PID
    exit 1
fi

# Parar servidor
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "=== Todos os Tests Passaram ==="
```

---

## 8. Troubleshooting de Build

### Problema: "Cannot find module"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm ci
```

### Problema: "Memory allocation failed"

**Solução:**
```bash
# Aumentar limite de memória do Node
export NODE_OPTIONS="--max-old-space-size=8192"

# Ou usar swap
sudo fallocate -l 8G /swapfile
sudo swapon /swapfile
```

### Problema: "Patch failed to apply"

**Solução:**
```bash
# Verificar versão correta do código fonte
git log --oneline -1

# Reverter patch e tentar novamente
patch -R -p1 < patch-file.patch
patch -p1 < patch-file.patch

# Ou usar --force
patch -p1 --force < patch-file.patch
```

### Problema: "Build too slow"

**Solução:**
```bash
# Usar mais threads
export JOBS=$(nproc)

# Build incremental
npm run watch

# Usar esbuild (mais rápido que webpack)
npm run build:fast
```

---

## 9. Checklist de Preparação

### Antes do Build

- [ ] Git instalado e configurado
- [ ] Node.js 20.x instalado
- [ ] npm 9.x+ instalado
- [ ] Dependências de sistema instaladas
- [ ] Espaço em disco suficiente (10GB+)
- [ ] Memória RAM suficiente (4GB+)
- [ ] Conexão de internet estável

### Após Build

- [ ] Binário principal existe e é executável
- [ ] Comando --help funciona
- [ ] Versão é reportada corretamente
- [ ] Health check responde
- [ ] Login page carrega
- [ ] Autenticação funciona
- [ ] Extensões podem ser instaladas

---

## 10. Referências

- [OpenVSCode Server Build Instructions](https://github.com/gitpod-io/openvscode-server#build-from-source)
- [VS Code Contributing Guide](https://github.com/microsoft/vscode/wiki/How-to-Contribute)
- [Node.js Building](https://github.com/nodejs/node/blob/main/BUILDING.md)
- [npm Documentation](https://docs.npmjs.com/)

---

**Próximo Documento:** [02-compilacao-basica.md](./02-compilacao-basica.md)

**Documento Anterior:** [04-variaveis-ambiente.md](../03-pre-requisitos/04-variaveis-ambiente.md)
