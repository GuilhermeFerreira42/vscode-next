# 🚀 GreenForge NEXUS - Guia de Instalação e Validação

Este documento contém os passos exatos para forçar a instalação do bundle customizado do GreenForge no OpenVSCode Server e validar que o motor adversarial está funcionando corretamente.

---

## 📋 Pré-requisitos

- WSL Ubuntu 22.04 com Node.js 20+
- OpenVSCode Server instalado e rodando
- Acesso ao terminal do WSL no diretório do projeto

---

## 🔧 Tarefa 1: Forçar Instalação do Bundle Customizado

### Passo 1.1: Navegue até o diretório da extensão

```bash
cd /workspace/cline-/cline/apps/vscode
```

### Passo 1.2: Instale as dependências (se necessário)

```bash
npm install --legacy-peer-deps
```

### Passo 1.3: Compile a extensão

```bash
npm run package
```

Isso gerará o arquivo `dist/greenforge.vsix` (aproximadamente 9.87 MB).

### Passo 1.4: Force a instalação no OpenVSCode Server

**Opção A - Usando o comando global do servidor:**

```bash
openvscode-server --install-extension /workspace/cline-/cline/apps/vscode/dist/greenforge.vsix --force
```

**Opção B - Usando o caminho absoluto do binário:**

```bash
/path/to/ide-vscode/bin/openvscode-server --install-extension /workspace/cline-/cline/apps/vscode/dist/greenforge.vsix --force
```

**Opção C - Via interface web do OpenVSCode:**

1. Abra o OpenVSCode Server no navegador
2. Clique no ícone de Extensões na barra lateral (Ctrl+Shift+X)
3. Clique nos "..." (mais opções) no topo do painel
4. Selecione "Install from VSIX..."
5. Navegue até `/workspace/cline-/cline/apps/vscode/dist/greenforge.vsix`
6. Confirme a instalação

### Passo 1.5: Reinicie o OpenVSCode Server

```bash
# Pare o servidor atual
pkill -f openvscode-server

# Inicie novamente
openvscode-server --host 0.0.0.0 --port 8080
```

---

## 🧪 Tarefa 2: Script de Teste Automatizado (Smoke Test)

O script de teste já foi criado em: `scripts/test-greenforge-pipeline.ts`

### Passo 2.1: Execute os testes unitários

```bash
cd /workspace/cline-/cline/apps/vscode

# Rodar testes específicos do GreenForge
npx tsx scripts/test-greenforge-pipeline.ts
```

### Passo 2.2: Ou execute via suite de testes existente

```bash
npm test -- --grep "GreenForge"
```

### O que o teste valida:

✅ **AgentFactory**: Cria instâncias paralelas de Flash e Pro  
✅ **DebateRound**: Executa lógica de Round 1 com `Promise.all`  
✅ **GateManager**: Instancia corretamente os portões de validação  
✅ **Interceptação Camada 3**: Identifica modelo `greenforge` e chama `orchestrateGreenForgeDebate`

---

## 📝 Tarefa 3: Logs de Depuração no Terminal

Os logs de depuração já foram injetados no arquivo `src/core/task/index.ts` na linha 2802.

### Saída esperada quando o motor GreenForge é acionado:

```
[GREENFORGE NEXUS] INTERCEPTAÇÃO ATIVA - Iniciando Loop Adversarial...
```

Este log aparecerá no terminal do Windows/WSL sempre que:
1. O usuário enviar um prompt
2. O model ID estiver definido como `"greenforge"`
3. A interceptação da Camada 3 for ativada

### Como verificar visualmente:

1. Abra o terminal integrado do VS Code (Ctrl+`)
2. Envie um prompt qualquer no painel do Cline
3. Observe a saída colorida em verde confirmando a interceptação

---

## ✅ Checklist de Validação

Após seguir os passos acima, verifique:

- [ ] O seletor de modelos no Cline mostra a opção **"GreenForge (Debate Adversarial)"**
- [ ] Ao selecionar GreenForge, o terminal exibe o log de interceptação
- [ ] Os testes automatizados passam sem erros críticos
- [ ] O fluxo de debate com roles (Flash, Pro, Arbiter) é iniciado

---

## 🐛 Solução de Problemas

### Problema: Extensão não aparece no seletor de modelos

**Solução:**
```bash
# Remova extensões conflitantes
openvscode-server --uninstall-extension cline.cline

# Reinstale apenas o VSIX customizado
openvscode-server --install-extension /workspace/cline-/cline/apps/vscode/dist/greenforge.vsix --force
```

### Problema: Logs não aparecem no terminal

**Solução:**
1. Verifique se o model ID está configurado como `"greenforge"` nas configurações
2. Recarregue a janela do VS Code (Ctrl+Shift+P → "Developer: Reload Window")
3. Verifique se há erros de compilação TypeScript

### Problema: Erro de espaço em disco

**Solução:**
```bash
# Limpe cache do npm
npm cache clean --force

# Remova node_modules e reinstale
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 📊 Resultados Esperados dos Testes

Ao executar `npx tsx scripts/test-greenforge-pipeline.ts`, você deve ver:

```
=== INICIANDO GREENFORGE NEXUS SMOKE TEST ===

[GREENFORGE TEST] ✓ AgentFactory criou todos os agentes com sucesso
[GREENFORGE TEST] ✓ DebateRound executou com Promise.all
  - Flash chamado: true
  - Pro chamado: true
[GREENFORGE TEST] ✓ GateManager instanciado corretamente
[GREENFORGE TEST] ✓ Interceptação da Camada 3 identificou modelo greenforge
[GREENFORGE NEXUS] INTERCEPTAÇÃO ATIVA - Iniciando Loop Adversarial...

=== TESTES CONCLUÍDOS ===
```

---

## 📞 Suporte

Se persistirem dúvidas após seguir este guia, capture:
1. Screenshot do seletor de modelos do Cline
2. Log completo do terminal durante execução de um prompt
3. Saída dos testes automatizados

Com essas informações, podemos diagnosticar falhas específicas de ambiente.
