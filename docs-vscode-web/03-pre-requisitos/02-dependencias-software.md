# 02 - Dependências de Software

## Visão Geral

Este documento lista todas as dependências de software necessárias para build, desenvolvimento e produção do BSC Code (VS Code Web).

---

## 1. Runtime Dependencies (Produção)

### 1.1 Node.js e npm

**Versões Exatas:**
```json
{
  "node": ">=20.0.0 <23.0.0",
  "npm": ">=9.0.0 <11.0.0"
}
```

**Instalação via NVM (Recomendado):**
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar versões
node --version  # v20.x.x
npm --version   # 10.x.x
```

**Instalação via Package Manager:**

*Ubuntu/Debian:*
```bash
# NodeSource Repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

*RHEL/CentOS/Fedora:*
```bash
# NodeSource Repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Ou via DNF (Fedora/RHEL 8+)
sudo dnf install -y nodejs
```

*Alpine:*
```bash
apk add --no-cache nodejs npm
```

### 1.2 Dependências npm Principais

**package.json - dependencies:**
```json
{
  "dependencies": {
    "@vscode/web-vscode": "^3.3.0",
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "http-proxy-middleware": "^2.0.6",
    "cookie-parser": "^1.4.6",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  }
}
```

**Descrição das Dependências:**

| Pacote | Versão | Finalidade | Crítico |
|--------|--------|------------|---------|
| `@vscode/web-vscode` | ^3.3.0 | Core do VS Code Web | ✅ Sim |
| `express` | ^4.18.2 | Servidor HTTP | ✅ Sim |
| `ws` | ^8.14.2 | WebSocket server | ✅ Sim |
| `http-proxy-middleware` | ^2.0.6 | Proxy para extension host | ✅ Sim |
| `cookie-parser` | ^1.4.6 | Parse de cookies de auth | ✅ Sim |
| `compression` | ^1.7.4 | Gzip/Brotli compression | ⚠️ Recomendado |
| `helmet` | ^7.1.0 | Security headers | ✅ Sim |
| `cors` | ^2.8.5 | CORS policy | ✅ Sim |
| `dotenv` | ^16.3.1 | Variáveis de ambiente | ✅ Sim |
| `uuid` | ^9.0.1 | Geração de IDs únicos | ✅ Sim |
| `winston` | ^3.11.0 | Logging estruturado | ⚠️ Recomendado |

### 1.3 DevDependencies (Build)

**package.json - devDependencies:**
```json
{
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/ws": "^8.5.10",
    "@types/compression": "^1.7.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.2",
    "tsx": "^4.6.2",
    "esbuild": "^0.19.8",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.13.2",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "prettier": "^3.1.0"
  }
}
```

---

## 2. Build Tools

### 2.1 Compiladores e Bundlers

| Ferramenta | Versão | Finalidade | Obrigatório |
|------------|--------|------------|-------------|
| TypeScript | ^5.3.2 | Type checking + transpilation | ✅ Sim |
| esbuild | ^0.19.8 | Build rápido de assets | ⚠️ Recomendado |
| webpack | ^5.89.0 | Bundle principal | ✅ Sim |
| node-gyp | ^10.0.0 | Native modules build | ⚠️ Se necessário |

**Instalação Global (Opcional):**
```bash
npm install -g typescript tsx esbuild webpack webpack-cli
```

### 2.2 Ferramentas de Qualidade de Código

| Ferramenta | Versão | Finalidade | Comando |
|------------|--------|------------|---------|
| ESLint | ^8.55.0 | Linting | `npm run lint` |
| Prettier | ^3.1.0 | Formatação | `npm run format` |
| Jest | ^29.7.0 | Testes unitários | `npm run test` |

**Configuração ESLint (.eslintrc.json):**
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "env": {
    "node": true,
    "es2022": true
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": "warn"
  },
  "ignorePatterns": ["dist/", "node_modules/", "*.js"]
}
```

**Configuração Prettier (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

---

## 3. Docker Dependencies

### 3.1 Dockerfile Multi-stage

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências de build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Labels
LABEL maintainer="BSC Code Team"
LABEL version="1.0.0"
LABEL description="BSC Code - VS Code Web no Google Estúdio IA"

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /opt/openvscode-server

# Copiar binários do OpenVSCode Server
COPY --from=openvscode-server:latest /home/linuxbrew/.linuxbrew/opt/openvscode-server /opt/openvscode-server

# Copiar aplicação customizada
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Configurar variáveis de ambiente
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Usuário não-root
USER nodejs

# Comando de entrada
ENTRYPOINT ["/opt/openvscode-server/bin/openvscode-server"]
CMD ["--host", "0.0.0.0", "--port", "3000"]
```

### 3.2 docker-compose.yml

```yaml
version: '3.8'

services:
  bsc-code:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: bsc-code
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - TOKEN=${TOKEN:-}
    volumes:
      - bsc-workspace:/home/workspace
      - bsc-extensions:/home/extensions
      - ./config:/opt/openvscode-server/config:ro
    networks:
      - bsc-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G

volumes:
  bsc-workspace:
    driver: local
  bsc-extensions:
    driver: local

networks:
  bsc-network:
    driver: bridge
```

---

## 4. System Libraries (Linux)

### 4.1 Bibliotecas Gráficas (Headless)

Mesmo em modo headless, algumas bibliotecas gráficas são necessárias:

**Ubuntu/Debian:**
```bash
sudo apt-get install -y \
    libgtk-3-0 \
    libgbm1 \
    libxkbfile0 \
    libxrandr2 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libdrm2 \
    libexpat1 \
    libxcomposite1 \
    libxfixes3
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install -y \
    gtk3 \
    libgbm \
    nss \
    cups-libs \
    libdrm \
    expat \
    libXcomposite \
    libXfixes
```

### 4.2 Fontes

```bash
# Ubuntu/Debian
sudo apt-get install -y \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto-cjk

# RHEL/CentOS
sudo dnf install -y \
    liberation-sans-fonts \
    dejavu-sans-fonts \
    google-noto-sans-cjk-fonts
```

### 4.3 Certificados SSL

```bash
# Atualizar certificados
sudo update-ca-certificates  # Debian/Ubuntu
sudo trust extract-compat    # RHEL/Fedora

# Ou instalar pacote
sudo apt-get install -y ca-certificates
sudo dnf install -y ca-certificates
```

---

## 5. Optional Dependencies

### 5.1 Para Funcionalidades Específicas

| Funcionalidade | Dependência | Instalação |
|----------------|-------------|------------|
| Git integration | git >= 2.30 | `apt install git` |
| Terminal shell | bash >= 5.0 | Já incluso |
| Remote SSH | openssh-client | `apt install openssh-client` |
| Docker integration | docker CLI | `apt install docker.io` |
| Python support | python3 >= 3.8 | `apt install python3` |
| C/C++ support | build-essential | `apt install build-essential` |

### 5.2 Para Desenvolvimento

```bash
# Ferramentas de debug
npm install -g nodemon node-inspect

# Ferramentas de profiling
npm install -g clinic flame

# Ferramentas de rede
npm install -g httpie

# Gerenciamento de versões
nvm  # Node Version Manager
fnm  # Fast Node Manager (alternativa)
```

---

## 6. Extensões Recomendadas (Pré-instaladas)

### 6.1 Lista de Extensões Essenciais

**extensions.json:**
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
  ]
}
```

### 6.2 Script de Pré-instalação

```bash
#!/usr/bin/env bash
# install-extensions.sh

set -euo pipefail

EXTENSIONS=(
    "ms-vscode.vscode-typescript-next"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-json"
    "redhat.vscode-yaml"
    "ms-python.python"
    "ms-vscode.cpptools"
    "rust-lang.rust-analyzer"
    "golang.go"
    "ms-dotnettools.csharp"
    "vscjava.vscode-java-pack"
    "ms-toolsai.jupyter"
    "gitlab.gitlab-workflow"
    "github.vscode-pull-request-github"
    "ms-azuretools.vscode-docker"
    "ms-kubernetes-tools.vscode-kubernetes-tools"
)

echo "=== Instalando extensões recomendadas ==="

for ext in "${EXTENSIONS[@]}"; do
    echo "Instalando: $ext"
    openvscode-server --install-extension "$ext" || echo "Falha ao instalar: $ext"
done

echo "=== Instalação concluída ==="
```

---

## 7. Matriz de Compatibilidade

### 7.1 Versões Testadas

| Componente | Versão Mínima | Versão Testada | Versão Máxima | Status |
|------------|---------------|----------------|---------------|--------|
| Node.js | 20.0.0 | 20.10.0 | 22.x | ✅ Suportado |
| npm | 9.0.0 | 10.2.3 | 11.x | ✅ Suportado |
| TypeScript | 5.0.0 | 5.3.2 | 5.x | ✅ Suportado |
| Docker | 24.0.0 | 24.0.7 | 25.x | ✅ Suportado |
| Ubuntu | 20.04 | 22.04 | 24.04 | ✅ Suportado |
| Debian | 11 | 12 | 13 | ✅ Suportado |

### 7.2 Combinações Conhecidas por Falhar

| Combinação | Problema | Workaround |
|------------|----------|------------|
| Node 18 + TypeScript 5.3 | Erros de tipo | Usar Node 20+ |
| Alpine 3.17 + glibc | Incompatibilidade | Usar Alpine 3.18+ |
| Docker 23 + ARM64 | Bugs de rede | Atualizar para 24+ |

---

## 8. Script de Instalação Automatizada

```bash
#!/usr/bin/env bash
# install-dependencies.sh

set -euo pipefail

echo "=== BSC Code - Instalação de Dependências ==="

# Detectar SO
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "SO não identificado"
    exit 1
fi

case "$OS" in
    ubuntu|debian)
        echo "Detectado: $NAME $VERSION_ID"
        apt-get update
        apt-get install -y \
            nodejs \
            npm \
            git \
            curl \
            wget \
            ca-certificates \
            gnupg \
            libgtk-3-0 \
            libgbm1 \
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
            fonts-liberation \
            xdg-utils
        ;;
    
    fedora|rhel|centos)
        echo "Detectado: $NAME $VERSION_ID"
        dnf install -y \
            nodejs \
            npm \
            git \
            curl \
            wget \
            ca-certificates \
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
            libnotify \
            xorg-x11-server-Xvfb
        ;;
    
    alpine)
        echo "Detectado: $NAME $VERSION_ID"
        apk add --no-cache \
            nodejs \
            npm \
            git \
            curl \
            wget \
            ca-certificates \
            gnupg \
            gtk+3.0 \
            nss \
            ttf-dejavu \
            xdg-utils \
            libc6-compat \
            libstdc++
        ;;
    
    *)
        echo "SO não suportado: $OS"
        exit 1
        ;;
esac

# Verificar Node.js
NODE_VER=$(node --version | cut -d'v' -f2 | cut -d. -f1)
if [ "$NODE_VER" -lt 20 ]; then
    echo "Node.js $NODE_VER é muito antigo. Instalando versão 20.x..."
    
    if command -v nvm &> /dev/null; then
        nvm install 20
        nvm use 20
    else
        echo "Por favor, instale Node.js 20.x manualmente"
        exit 1
    fi
fi

echo ""
echo "=== Instalação concluída ==="
echo ""
echo "Versões instaladas:"
node --version
npm --version
git --version
```

---

## 9. Troubleshooting

### Problema: "npm ERR! code ENOENT"

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Error: Cannot find module"

**Solução:**
```bash
# Reinstalar dependências
npm ci

# Ou forçar rebuild
npm rebuild
```

### Problema: "GLIBCXX not found"

**Solução:**
```bash
# Instalar libstdc++ atualizada
sudo apt-get install -y libstdc++6

# Ou usar LD_PRELOAD
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
```

---

## 10. Referências

- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [npm Documentation](https://docs.npmjs.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [OpenVSCode Server GitHub](https://github.com/gitpod-io/openvscode-server)

---

**Próximo Documento:** [03-configuracao-ambiente.md](./03-configuracao-ambiente.md)

**Documento Anterior:** [01-requisitos-sistema.md](./01-requisitos-sistema.md)
