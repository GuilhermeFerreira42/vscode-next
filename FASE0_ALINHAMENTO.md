# 🎯 FASE 0: ALINHAMENTO E ESPECIFICAÇÃO CANÔNICA

## 1. ✅ RESUMO DA STACK APROVADA

Tecnologias que **SERÃO** utilizadas na construção da GreenForge IDE:

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite |
| **Linguagem** | TypeScript |
| **Estilização** | TailwindCSS |
| **Gerenciamento de Estado** | Zustand |
| **Editor de Código** | @monaco-editor/react |
| **Terminal** | @xterm/xterm |
| **Backend Server** | Express |
| **WebSocket** | Socket.IO |
| **Pseudo-Terminal** | node-pty |
| **Banco de Dados** | better-sqlite3 |

---

## 2. 🚫 LISTA DE "LIXO" BLOQUEADO

Confirmo explicitamente que as seguintes tecnologias/serviços foram **BANIDOS** deste projeto:

- ❌ **Clerk** (Autenticação SaaS)
- ❌ **Liveblocks** (Colaboração em tempo real SaaS)
- ❌ **E2B** (Ambientes sandbox SaaS)
- ❌ **Cloudflare D1/R2/Workers** (Infraestrutura cloud)
- ❌ **Next.js** (Framework fullstack)
- ❌ **Vercel** (Plataforma de deploy)
- ❌ **Yjs** (CRDT para colaboração)

**Justificativa:** O objetivo é construir uma IDE Web mínima e auto-contida, sem dependências de serviços externos ou complexidade desnecessária para um MVP de validação do motor de IA.

---

## 3. 📋 MAPA DE FASES

Checklist das 4 fases definidas para execução:

### ✅ FASE 0: ALINHAMENTO E ESPECIFICAÇÃO CANÔNICA
- [x] Analisar arquivos de contexto
- [x] Gerar resumo estruturado de alinhamento
- [ ] Aguardar aprovação do usuário

### ⏳ FASE 1: SCAFFOLD E CONFIGURAÇÃO
- [ ] Criar estrutura de pastas `/workspace/greenforge-ide/`
- [ ] Criar `package.json` (root com workspaces)
- [ ] Criar `vite.config.ts`
- [ ] Criar `tsconfig.json`
- [ ] Criar `tailwind.config.ts`
- [ ] Criar `.env.example`
- [ ] **NÃO** instalar dependências ainda
- [ ] Reportar lista de arquivos criados

### ⏳ FASE 2: BACKEND CORE
- [ ] Instalar dependências do backend
- [ ] Implementar `server.ts`
- [ ] Implementar `database.ts` (SQLite schema mínimo)
- [ ] Implementar `fileSystemService.ts`
- [ ] Implementar `terminalService.ts` (node-pty)
- [ ] Implementar `files.ts` (REST API)
- [ ] Implementar `socketManager.ts` / `handlers.ts` (WebSocket)
- [ ] Validar com `curl http://localhost:3001/api/health`
- [ ] Reportar testes

### ⏳ FASE 3: FRONTEND CORE
- [ ] Instalar dependências do frontend
- [ ] Implementar Zustand stores (`editorStore`, `terminalStore`)
- [ ] Implementar componentes: `MainLayout.tsx`, `FileTree.tsx`, `MonacoEditor.tsx`, `EditorTabs.tsx`, `TerminalPanel.tsx`
- [ ] Conectar ao backend via `apiClient.ts` e `socketService.ts`
- [ ] Reportar componentes funcionais

### ⏳ FASE 4: INTEGRAÇÃO E CHECKLIST FINAL
- [ ] Configurar script `concurrently` no root `package.json`
- [ ] Fornecer checklist de validação manual
- [ ] Validação: Editor aparece, Explorer funciona, Terminal responde, Abas funcionam, WebSocket conecta

---

## 4. ❓ PERGUNTAS DE BLOQUEIO

Após análise detalhada do arquivo `greenforge-fase1-comando.md`:

- ✅ **Contratos de API:** Claros e bem definidos no blueprint
- ✅ **Estrutura de Pastas:** Especificada de forma explícita
- ✅ **Stack Tecnológica:** Totalmente definida sem ambiguidades
- ✅ **Escopo da Fase 1:** Limitado à infraestrutura (Editor, Terminal, Explorer, Layout, Comunicação)

### 🟢 DECLARAÇÃO FINAL

**"PRONTO PARA INICIAR A FASE 1"**

---

## 📝 OBSERVAÇÕES ADICIONAIS

1. **Diretório do Projeto:** Todo código será gerado em `/workspace/greenforge-ide/`
2. **Arquitetura:** Monorepo com workspaces (frontend + backend)
3. **Portas:** Backend rodará na porta `3001` (padrão definido)
4. **Hooks para Futuras Funcionalidades:** Deixar interfaces/ganchos prontos para:
   - Motor de debate adversarial
   - Gates HITL (Human-in-the-Loop)
   - WAL (Write-Ahead Logging)
   - Loop Detector

---

*Aguardando aprovação para iniciar a FASE 1: SCAFFOLD E CONFIGURAÇÃO*
