# 04 - Deployment no Google Estúdio IA

## Objetivo

Este documento fornece instruções **completas e detalhadas** para implantar o Visual Studio Code Web (OpenVSCode Server) no ambiente Google Estúdio IA. Inclui todos os passos necessários, desde a preparação até a configuração final.

---

## Pré-requisitos

### Conhecimentos Necessários

- Familiaridade básica com linha de comando Linux
- Conceitos fundamentais de Docker
- Noções de redes e portas
- Acesso ao Google Estúdio IA

### Recursos Necessários

- Conta no Google Estúdio IA ativa
- Permissões para criar/executar containers
- Espaço em disco: mínimo 10 GB livres
- Memória RAM: mínimo 4 GB disponíveis

---

## Visão Geral do Processo

O deployment no Google Estúdio IA seguirá estas etapas:

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: PREPARAÇÃO                       │
│  1.1 → Verificar pré-requisitos do ambiente                │
│  1.2 → Escolher método de deployment                        │
│  1.3 → Preparar configurações iniciais                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 2: INSTALAÇÃO                        │
│  2.1 → Opção A: Usar Docker Image oficial                   │
│  2.2 → Opção B: Build from source                           │
│  2.3 → Configurar volumes e persistência                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  FASE 3: CONFIGURAÇÃO                       │
│  3.1 → Configurar autenticação (tokens)                     │
│  3.2 → Configurar rede e portas                             │
│  3.3 → Configurar HTTPS (opcional mas recomendado)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FASE 4: VALIDAÇÃO                        │
│  4.1 → Iniciar servidor                                     │
│  4.2 → Testar acesso via navegador                          │
│  4.3 → Validar funcionalidades básicas                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 5: OTIMIZAÇÃO                        │
│  5.1 → Instalar extensões                                   │
│  5.2 → Personalizar configurações                           │
│  5.3 → Configurar backup e persistência                     │
└─────────────────────────────────────────────────────────────┘
```

---

## FASE 1: PREPARAÇÃO

### 1.1 Verificar Pré-requisitos do Ambiente

#### Passo 1.1.1: Verificar se Docker está instalado

```bash
# Verificar versão do Docker
docker --version

# Saída esperada (exemplo):
# Docker version 24.0.7, build afdd53b
```

**Se Docker não estiver instalado:**

```bash
# Atualizar pacotes
sudo apt-get update

# Instalar Docker
sudo apt-get install -y docker.io

# Adicionar usuário atual ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Sair e entrar novamente para aplicar mudanças
# Ou execute: newgrp docker
```

#### Passo 1.1.2: Verificar recursos disponíveis

```bash
# Verificar memória RAM disponível
free -h

# Verificar espaço em disco
df -h /

# Verificar CPUs disponíveis
nproc

# Verificar se Docker daemon está rodando
sudo systemctl status docker
```

**Requisitos mínimos confirmados:**
- ✅ RAM: 4 GB ou mais
- ✅ Disco: 10 GB ou mais livres
- ✅ CPU: 2 cores ou mais
- ✅ Docker: Instalado e rodando

#### Passo 1.1.3: Criar diretório de trabalho

```bash
# Criar diretório para o projeto VS Code
mkdir -p ~/vscode-web
cd ~/vscode-web

# Criar subdiretórios para organização
mkdir -p data/workspace      # Para seus arquivos de código
mkdir -p data/extensions     # Para extensões instaladas
mkdir -p data/config         # Para configurações
mkdir -p scripts             # Para scripts úteis

echo "Estrutura criada com sucesso!"
ls -la
```

### 1.2 Escolher Método de Deployment

Você tem **duas opções principais**:

#### Opção A: Docker Image Oficial (RECOMENDADO)

**Vantagens:**
- ✅ Mais rápido (minutos)
- ✅ Mais simples (poucos comandos)
- ✅ Menor chance de erros
- ✅ Fácil atualização
- ✅ Ambiente consistente

**Desvantagens:**
- ❌ Menos customizável
- ❌ Tamanho maior da imagem
- ❌ Dependência de registry externo

**Quando usar:** 
- Para maioria dos casos de uso
- Quando quer começar rapidamente
- Quando não precisa de modificações especiais

#### Opção B: Build from Source

**Vantagens:**
- ✅ Customização total
- ✅ Menor tamanho final (se otimizado)
- ✅ Controle completo das dependências
- ✅ Aprendizado do processo interno

**Desvantagens:**
- ❌ Demorado (30+ minutos)
- ❌ Complexo (muitos passos)
- ❌ Requer mais recursos (RAM, CPU)
- ❌ Mais pontos de falha

**Quando usar:**
- Quando precisa modificar o código
- Para desenvolvimento/customização
- Quando há restrições de rede externa

### Nossa Recomendação para Google Estúdio IA

**Use a Opção A (Docker Image)** para:
- Primeiro deployment
- Ambientes de produção
- Quando tempo é importante

**Use a Opção B (Build from Source)** para:
- Desenvolvimento do próprio VS Code Web
- Customizações específicas
- Ambientes com restrições de rede

---

## FASE 2: INSTALAÇÃO

### OPÇÃO A: Usando Docker Image Oficial

Esta é a maneira **mais rápida e recomendada**.

#### Passo 2.A.1: Baixar Imagem Docker

```bash
# Navegar para diretório do projeto
cd ~/vscode-web

# Baixar imagem oficial mais recente
docker pull gitpod/openvscode-server:latest

# Verificar download
docker images | grep openvscode

# Saída esperada:
# gitpod/openvscode-server   latest   <IMAGE_ID>   <SIZE>
```

**Tempo estimado:** 2-5 minutos (dependendo da conexão)

**Tamanho da imagem:** ~1.5 GB

#### Passo 2.A.2: Criar Script de Inicialização

Crie um arquivo chamado `start-vscode.sh`:

```bash
cd ~/vscode-web/scripts
nano start-vscode.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

# =============================================================================
# Script de Inicialização do VS Code Web
# =============================================================================
# Este script inicia uma instância do OpenVSCode Server com configurações
# otimizadas para Google Estúdio IA
# =============================================================================

# Configurações
PROJECT_DIR="$HOME/vscode-web"
WORKSPACE_DIR="$PROJECT_DIR/data/workspace"
EXTENSIONS_DIR="$PROJECT_DIR/data/extensions"
CONFIG_DIR="$PROJECT_DIR/data/config"

PORT=3000
HOST="0.0.0.0"

# Token de segurança (gerar um único se não existir)
TOKEN_FILE="$CONFIG_DIR/connection-token"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "Gerando novo token de conexão..."
    openssl rand -hex 32 > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
fi

CONNECTION_TOKEN=$(cat "$TOKEN_FILE")

# Garantir que diretórios existem
mkdir -p "$WORKSPACE_DIR" "$EXTENSIONS_DIR" "$CONFIG_DIR"

echo "==================================================================="
echo "  VS Code Web - OpenVSCode Server"
echo "==================================================================="
echo ""
echo "Configurações:"
echo "  Porta: $PORT"
echo "  Host: $HOST"
echo "  Workspace: $WORKSPACE_DIR"
echo "  Extensões: $EXTENSIONS_DIR"
echo ""
echo "Iniciando container Docker..."
echo ""

# Executar container
docker run -d \
  --name vscode-web \
  --init \
  --restart unless-stopped \
  -p ${PORT}:${PORT} \
  -v "${WORKSPACE_DIR}:/home/workspace:cached" \
  -v "${EXTENSIONS_DIR}:/home/.openvscode-server/extensions:cached" \
  -e OPENVSCODE_SERVER_ROOT="/home/.openvscode-server" \
  gitpod/openvscode-server:latest \
  --port ${PORT} \
  --host ${HOST} \
  --connection-token-file /home/.openvscode-server/token \
  --default-folder /home/workspace

# Aguardar inicialização
sleep 3

# Mostrar informações de acesso
echo ""
echo "==================================================================="
echo "  VS Code Web INICIADO COM SUCESSO!"
echo "==================================================================="
echo ""
echo "Acesse em: http://localhost:${PORT}"
echo ""
echo "Token de conexão: ${CONNECTION_TOKEN}"
echo ""
echo "URL completa com token:"
echo "http://localhost:${PORT}/?tkn=${CONNECTION_TOKEN}"
echo ""
echo "==================================================================="
echo ""
echo "Comandos úteis:"
echo "  Parar:   docker stop vscode-web"
echo "  Iniciar: docker start vscode-web"
echo "  Logs:    docker logs -f vscode-web"
echo "  Remover: docker rm -f vscode-web"
echo ""
```

Salvar e sair (Ctrl+X, Y, Enter).

#### Passo 2.A.3: Tornar Script Executável e Executar

```bash
# Tornar executável
chmod +x ~/vscode-web/scripts/start-vscode.sh

# Executar script
~/vscode-web/scripts/start-vscode.sh
```

**Saída esperada:**

```
===================================================================
  VS Code Web - OpenVSCode Server
===================================================================

Configurações:
  Porta: 3000
  Host: 0.0.0.0
  Workspace: /home/user/vscode-web/data/workspace
  Extensões: /home/user/vscode-web/data/extensions

Iniciando container Docker...

Unable to find image 'gitpod/openvscode-server:latest' locally
latest: Pulling from gitpod/openvscode-server
...
Digest: sha256:...
Status: Downloaded newer image for gitpod/openvscode-server:latest

===================================================================
  VS Code Web INICIADO COM SUCESSO!
===================================================================

Acesse em: http://localhost:3000

Token de conexão: <seu_token_gerado>

URL completa com token:
http://localhost:3000/?tkn=<seu_token_gerado>
```

#### Passo 2.A.4: Verificar Status do Container

```bash
# Verificar se container está rodando
docker ps | grep vscode-web

# Ver logs do container
docker logs vscode-web

# Verificar portas em uso
sudo netstat -tlnp | grep 3000
```

---

### OPÇÃO B: Build from Source

Use esta opção se precisar de customizações especiais.

#### Passo 2.B.1: Clonar Repositório

```bash
cd ~/vscode-web

# Clonar repositório OpenVSCode Server
git clone https://github.com/gitpod-io/openvscode-server.git src

# Entrar no diretório
cd src

# Verificar branches disponíveis
git branch -a

# (Opcional) Usar uma versão específica
# git checkout release/1.96
```

#### Passo 2.B.2: Instalar Dependências

```bash
# Verificar versão do Node.js necessária
cat .nvmrc

# Se necessário, instalar nvm e Node.js correto
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install

# Instalar dependências npm
npm ci

# Tempo estimado: 5-10 minutos
```

#### Passo 2.B.3: Compilar Projeto

```bash
# Compilar código
npm run compile

# Tempo estimado: 10-20 minutos (dependendo do hardware)
```

#### Passo 2.B.4: Iniciar Servidor

```bash
# Iniciar servidor de desenvolvimento
./scripts/code-server.sh --port 3000 --host 0.0.0.0
```

---

## FASE 3: CONFIGURAÇÃO

### 3.1 Configurar Autenticação

#### Entendendo Tokens de Conexão

Desde a versão 1.64, o OpenVSCode Server requer autenticação:

**Tipos de Autenticação:**

1. **Sem token** (`--without-connection-token`)
   - ⚠️ NÃO recomendado para produção
   - Qualquer pessoa com acesso à porta pode entrar
   - Use apenas em ambientes isolados/testes

2. **Token simples** (`--connection-token SEU_TOKEN`)
   - ✅ Bom para testes/desenvolvimento
   - Token passado na linha de comando
   - Pode aparecer em logs

3. **Token por arquivo** (`--connection-token-file /caminho/arquivo`)
   - ✅✅ RECOMENDADO para produção
   - Token armazenado em arquivo seguro
   - Não aparece em logs ou processos

#### Gerar Token Seguro

```bash
# Método 1: Usando openssl
openssl rand -hex 32

# Método 2: Usando /dev/urandom
head -c 32 /dev/urandom | base64

# Método 3: Usando Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

#### Configurar Token Permanente

```bash
# Criar arquivo de token
TOKEN_FILE="$HOME/vscode-web/data/config/connection-token"
openssl rand -hex 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"

# Verificar token criado
cat "$TOKEN_FILE"

# Anote este token - você precisará para acessar o VS Code!
```

### 3.2 Configurar Rede e Portas

#### Portas Disponíveis

| Porta | Uso | Configurável |
|-------|-----|--------------|
| 3000  | Padrão HTTP | Sim |
| 9888  | Desenvolvimento | Sim |
| 8080  | Alternativa comum | Sim |

#### Escolher Porta Disponível

```bash
# Verificar portas em uso
sudo netstat -tlnp

# Ou usar ss (mais moderno)
ss -tlnp

# Verificar se porta 3000 está livre
sudo lsof -i :3000
```

#### Configurar Firewall (se necessário)

```bash
# Se usando UFW (Ubuntu)
sudo ufw allow 3000/tcp
sudo ufw status

# Se usando firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### Acessar Remotamente

Para acessar de outra máquina:

```bash
# Descobrir IP do servidor
hostname -I

# Ou
ip addr show | grep inet
```

URL de acesso remoto:
```
http://<SEU_IP>:3000/?tkn=<SEU_TOKEN>
```

### 3.3 Configurar HTTPS (Recomendado para Produção)

#### Por Que Usar HTTPS?

- 🔒 Criptografa todo tráfego
- 🔒 Protege token de autenticação
- 🔒 Previne ataques man-in-the-middle
- 🔒 Necessário para algumas features (PWA, etc.)

#### Opção 1: Usando Caddy (Mais Simples)

Caddy obtém certificados SSL automaticamente.

```bash
# Instalar Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Criar configuração Caddy
sudo nano /etc/caddy/Caddyfile
```

Conteúdo do Caddyfile:

```
vscode.seudominio.com {
    reverse_proxy localhost:3000
}
```

```bash
# Reiniciar Caddy
sudo systemctl restart caddy

# Verificar status
sudo systemctl status caddy
```

#### Opção 2: Usando Nginx com Let's Encrypt

```bash
# Instalar Nginx e Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Criar configuração Nginx
sudo nano /etc/nginx/sites-available/vscode
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name vscode.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/vscode /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d vscode.seudominio.com

# Seguir instruções do Certbot
```

---

## FASE 4: VALIDAÇÃO

### 4.1 Iniciar Servidor

Se ainda não iniciou:

```bash
# Usando o script criado
~/vscode-web/scripts/start-vscode.sh

# Ou manualmente
docker start vscode-web
```

### 4.2 Testar Acesso Via Navegador

#### Teste Local

1. Abra seu navegador
2. Acesse: `http://localhost:3000`
3. Insira o token quando solicitado
4. VS Code deve carregar

#### Teste Remoto

1. De outra máquina na mesma rede
2. Acesse: `http://<IP_DO_SERVIDOR>:3000`
3. Insira o token
4. VS Code deve carregar

### 4.3 Validar Funcionalidades Básicas

#### Checklist de Validação

Marque cada item conforme testa:

- [ ] **Tela de login aparece**
  - Campo para token visível
  - Mensagens de erro claras

- [ ] **Autenticação funciona**
  - Token correto → acesso concedido
  - Token incorreto → acesso negado

- [ ] **Workbench carrega**
  - Activity bar visível (ícones à esquerda)
  - Explorer aberto
  - Terminal disponível

- [ ] **Editor funciona**
  - Criar novo arquivo
  - Digitar texto
  - Syntax highlighting ativo

- [ ] **Terminal integrado**
  - Abrir terminal (Ctrl+`)
  - Executar comandos básicos
  - Saída aparece corretamente

- [ ] **Sistema de arquivos**
  - Navegar entre pastas
  - Criar arquivos/pastas
  - Arquivos persistem após refresh

- [ ] **Extensões**
  - Abrir view de extensões
  - Buscar extensão
  - Instalar extensão simples

#### Comandos de Teste

```bash
# Verificar se container está saudável
docker inspect vscode-web --format='{{.State.Health.Status}}'

# Ver logs em tempo real
docker logs -f vscode-web

# Verificar uso de recursos
docker stats vscode-web

# Testar conectividade
curl -I http://localhost:3000
```

---

## FASE 5: OTIMIZAÇÃO

### 5.1 Instalar Extensões Recomendadas

#### Extensões Essenciais para Desenvolvimento Web

```bash
# Criar script de instalação de extensões
nano ~/vscode-web/scripts/install-extensions.sh
```

Conteúdo:

```bash
#!/bin/bash

# Lista de extensões recomendadas
EXTENSIONS=(
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-typescript-next"
    "bradlc.vscode-tailwindcss"
    "ms-python.python"
    "ms-python.vscode-pylance"
    "golang.go"
    "rust-lang.rust-analyzer"
    "ms-vscode.cpptools"
    "formulahendry.auto-close-tag"
    "formulahendry.auto-rename-tag"
    "shd101wyy.markdown-preview-enhanced"
    "yzhang.markdown-all-in-one"
    "gruntfuggly.todo-tree"
    "streetsidesoftware.code-spell-checker"
)

echo "Instalando extensões recomendadas..."

for ext in "${EXTENSIONS[@]}"; do
    echo "Instalando: $ext"
    docker exec vscode-web \
        /home/.openvscode-server/bin/openvscode-server \
        --install-extension "$ext"
done

echo "Todas as extensões foram instaladas!"
```

```bash
# Tornar executável e rodar
chmod +x ~/vscode-web/scripts/install-extensions.sh
~/vscode-web/scripts/install-extensions.sh
```

### 5.2 Personalizar Configurações

#### Configurações do Workbench

Crie um arquivo de configuração:

```bash
nano ~/vscode-web/data/config/settings.json
```

Conteúdo recomendado:

```json
{
    "workbench.colorTheme": "Default Dark Modern",
    "workbench.iconTheme": "vscode-icons",
    "editor.fontSize": 14,
    "editor.minimap.enabled": true,
    "editor.formatOnSave": true,
    "editor.tabSize": 2,
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    "terminal.integrated.fontSize": 13,
    "explorer.confirmDragAndDrop": false,
    "security.workspace.trust.untrustedFiles": "open",
    "telemetry.telemetryLevel": "off"
}
```

### 5.3 Configurar Backup e Persistência

#### Backup do Workspace

```bash
# Criar script de backup
nano ~/vscode-web/scripts/backup.sh
```

Conteúdo:

```bash
#!/bin/bash

BACKUP_DIR="$HOME/vscode-web/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="vscode-backup-${DATE}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Criando backup do workspace..."

tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" \
    -C "$HOME/vscode-web/data" \
    workspace extensions config

echo "Backup criado: ${BACKUP_DIR}/${BACKUP_NAME}"

# Manter apenas últimos 7 backups
ls -t "${BACKUP_DIR}"/vscode-backup-*.tar.gz | tail -n +8 | xargs -r rm

echo "Backups antigos removidos"
```

```bash
chmod +x ~/vscode-web/scripts/backup.sh
```

#### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 2 AM
0 2 * * * /home/$USER/vscode-web/scripts/backup.sh
```

---

## Scripts Úteis

### Script de Gerenciamento Completo

Crie um script mestre:

```bash
nano ~/vscode-web/scripts/manage.sh
```

Conteúdo:

```bash
#!/bin/bash

# =============================================================================
# Script de Gerenciamento do VS Code Web
# =============================================================================

ACTION=$1

case $ACTION in
    start)
        echo "Iniciando VS Code Web..."
        docker start vscode-web
        docker logs -f vscode-web
        ;;
    
    stop)
        echo "Parando VS Code Web..."
        docker stop vscode-web
        echo "Parado."
        ;;
    
    restart)
        echo "Reiniciando VS Code Web..."
        docker restart vscode-web
        docker logs -f vscode-web
        ;;
    
    status)
        docker ps -f name=vscode-web
        echo ""
        docker stats vscode-web --no-stream
        ;;
    
    logs)
        docker logs -f vscode-web
        ;;
    
    info)
        echo "=== Informações do VS Code Web ==="
        echo ""
        echo "Container: vscode-web"
        echo "Porta: 3000"
        echo ""
        echo "URL de acesso: http://localhost:3000"
        echo ""
        if [ -f "$HOME/vscode-web/data/config/connection-token" ]; then
            echo "Token: $(cat $HOME/vscode-web/data/config/connection-token)"
        fi
        ;;
    
    backup)
        ~/vscode-web/scripts/backup.sh
        ;;
    
    clean)
        echo "Limpando recursos não utilizados..."
        docker system prune -f
        echo "Limpeza concluída."
        ;;
    
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|info|backup|clean}"
        exit 1
        ;;
esac
```

```bash
chmod +x ~/vscode-web/scripts/manage.sh
```

### Uso do Script de Gerenciamento

```bash
# Ver status
./manage.sh status

# Ver informações de acesso
./manage.sh info

# Iniciar
./manage.sh start

# Parar
./manage.sh stop

# Reiniciar
./manage.sh restart

# Ver logs
./manage.sh logs

# Criar backup
./manage.sh backup

# Limpar recursos
./manage.sh clean
```

---

## Solução de Problemas

### Problema: Container não inicia

**Sintoma:** Comando `docker start` falha

**Solução:**

```bash
# Verificar logs de erro
docker logs vscode-web

# Verificar se porta já está em uso
sudo lsof -i :3000

# Se porta ocupada, mate o processo ou use outra porta
sudo kill <PID>

# Ou edite o script para usar porta diferente
```

### Problema: Não consigo acessar via navegador

**Sintoma:** Página não carrega

**Solução:**

```bash
# Verificar se container está rodando
docker ps | grep vscode-web

# Verificar firewall
sudo ufw status

# Liberar porta se necessário
sudo ufw allow 3000/tcp

# Verificar se host está correto (deve ser 0.0.0.0)
docker inspect vscode-web | grep Args
```

### Problema: Token não funciona

**Sintoma:** Erro de autenticação

**Solução:**

```bash
# Verificar arquivo de token
cat ~/vscode-web/data/config/connection-token

# Copiar token exatamente como está (sem espaços extras)
# Reiniciar container
docker restart vscode-web

# Tentar acessar novamente
```

### Problema: Performance lenta

**Sintoma:** Editor responde lentamente

**Solução:**

```bash
# Verificar uso de recursos
docker stats vscode-web

# Se RAM alta, considerar:
# 1. Fechar extensões não usadas
# 2. Reduzir número de arquivos abertos
# 3. Aumentar RAM do servidor

# Verificar I/O de disco
iotop

# Usar volumes com cache
# -v "$(pwd):/home/workspace:cached"
```

---

## Próximos Passos

Após completar o deployment:

1. **Personalize seu ambiente**
   - Instale suas extensões favoritas
   - Configure temas e atalhos
   - Ajuste configurações do editor

2. **Comece a desenvolver**
   - Crie ou clone seu projeto no workspace
   - Configure debugging
   - Integre com Git

3. **Compartilhe com equipe** (se aplicável)
   - Configure autenticação centralizada
   - Documente acesso para equipe
   - Monitore uso e performance

---

## Resumo

Você agora tem um VS Code Web completo rodando no Google Estúdio IA!

**O que foi configurado:**
- ✅ Container Docker com OpenVSCode Server
- ✅ Autenticação segura com token
- ✅ Volumes persistentes para dados
- ✅ Scripts de gerenciamento
- ✅ Sistema de backup
- ✅ Configurações otimizadas

**Comandos principais:**

```bash
# Iniciar
~/vscode-web/scripts/manage.sh start

# Parar
~/vscode-web/scripts/manage.sh stop

# Ver informações
~/vscode-web/scripts/manage.sh info

# Acessar
http://localhost:3000/?tkn=<SEU_TOKEN>
```

**Próxima documentação recomendada:**
- `06-configuracao/01-configuracao-servidor.md` - Configurações avançadas
- `08-extensoes/01-gerenciamento-extensoes.md` - Gerenciar extensões
- `07-seguranca/01-autenticacao-token.md` - Segurança avançada

---

*Documento criado para Google Estúdio IA - Parte da série de documentação VS Code Web*
