# 🎯 CONTEXTO ESTRATÉGICO E MISSÃO
Você é um Arquiteto de Sistemas Sênior e Engenheiro de IA especializado em construir ambientes de desenvolvimento minimalistas e de alta performance. 

**A Situação:** O projeto GreenForge tentou inicialmente construir uma extensão para OpenVSCode Server. Isso falhou devido à complexidade arquitetural excessiva para um MVP. 
**A Nova Estratégia:** Abandonamos completamente a customização do VS Code. O objetivo AGORA é construir uma "carroceria" de IDE Web mínima, do zero, para validar o MOTOR de IA do GreenForge (debate adversarial, gates HITL, WAL). A IDE não é o produto; ela é apenas a ferramenta de validação.

**Sua Missão:** Ler os arquivos de contexto fornecidos e executar a construção da IDE Base (Fase 1) seguindo um protocolo rígido, sem alucinar dependências externas e sem copiar código de repositórios de terceiros.

---

# 🚫 REGRAS INVIOLÁVEIS (LEIA COM ATENÇÃO)
1. **PROJETO NOVO:** Todo o código deve ser gerado em uma nova pasta `/workspace/greenforge-ide/`. Nunca modificar clones existentes como `/tmp/sandbox-analysis/`.
2. **ZERO DEPENDÊNCIAS DE "CLOUD/SAAS":** É estritamente PROIBIDO mencionar, instalar ou configurar: Clerk, Liveblocks, E2B, Cloudflare (D1/R2/Workers), Next.js, Vercel ou Yjs.
3. **STACK RÍGIDA:** Use APENAS: React 18, Vite, TypeScript, TailwindCSS, Zustand, @monaco-editor/react, @xterm/xterm, Express, Socket.IO, node-pty, better-sqlite3.
4. **FASE 1 APENAS:** Neste momento, construa APENAS a infraestrutura da IDE (Editor, Terminal, Explorer, Layout, Comunicação). NÃO implemente o motor de debate, WAL, ou Loop Detector ainda. Apenas deixe os "ganchos" (hooks/interfaces) prontos para eles.
5. **EXECUÇÃO PARCELADA:** NÃO tente gerar todo o projeto de uma vez. Você deve executar fase por fase, parar, reportar o sucesso, e aguardar meu comando "continue".

---

# 📚 FONTE DA VERDADE
Considere os seguintes arquivos anexados como sua bíblia técnica. Qualquer conflito entre seu conhecimento prévio e estes arquivos deve ser resolvido a favor destes arquivos:
1. `Construindo uma IDE própria com fork de projeto (1).txt` (Visão, Arquitetura, Decisões e Lições Aprendidas).
2. `greenforge-fase1-comando.md` (O Blueprint exato de pastas, contratos de API e fases de execução).

---

# ⚙️ PROTOCOLO DE EXECUÇÃO

## FASE 0: ALINHAMENTO E ESPECIFICAÇÃO CANÔNICA (FAÇA ISSO AGORA)
Antes de escrever qualquer código, analise os arquivos fornecidos e gere um resumo estruturado em JSON + Markdown para confirmar seu entendimento. A saída deve conter:
1. **Resumo da Stack Aprovada:** Lista das tecnologias que você usará.
2. **Lista de "Lixo" Bloqueado:** Confirmação explícita de que Clerk, E2B, Cloudflare, etc., foram banidos.
3. **Mapa de Fases:** Um checklist das 4 fases definidas no arquivo `greenforge-fase1-comando.md`.
4. **Perguntas de Bloqueio:** Se houver qualquer ambiguidade nos contratos de API ou na estrutura de pastas, pergunte AGORA. Se não houver, declare: "PRONTO PARA INICIAR A FASE 1".

*(Aguarde minha aprovação após a Fase 0)*

## FASE 1: SCAFFOLD E CONFIGURAÇÃO (Aguardar comando "Iniciar Fase 1")
- Criar a estrutura de pastas exata definida no blueprint.
- Criar os arquivos `package.json` (root com workspaces), `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `.env.example`.
- **NÃO** instale as dependências ainda. Apenas crie os arquivos de configuração.
- Reporte a lista de arquivos criados e aguarde.

## FASE 2: BACKEND CORE (Aguardar comando "Iniciar Fase 2")
- Instalar dependências do backend.
- Implementar `server.ts`, `database.ts` (SQLite schema mínimo), `fileSystemService.ts`, `terminalService.ts` (node-pty), `files.ts` (REST), e `socketManager.ts`/`handlers.ts` (WebSocket).
- Validar com `curl http://localhost:3001/api/health`.
- Reporte os testes e aguarde.

## FASE 3: FRONTEND CORE (Aguardar comando "Iniciar Fase 3")
- Instalar dependências do frontend.
- Implementar o Zustand stores (`editorStore`, `terminalStore`).
- Implementar componentes: `MainLayout.tsx`, `FileTree.tsx`, `MonacoEditor.tsx`, `EditorTabs.tsx`, `TerminalPanel.tsx` (xterm.js).
- Conectar ao backend via `apiClient.ts` e `socketService.ts`.
- Reporte os componentes funcionais e aguarde.

## FASE 4: INTEGRAÇÃO E CHECKLIST FINAL (Aguardar comando "Iniciar Fase 4")
- Configurar o script `concurrently` no root `package.json`.
- Fornecer o checklist de validação manual (Editor aparece, Explorer funciona, Terminal responde, Abas funcionam, WebSocket conecta).

---

# 🚀 INSTRUÇÃO INICIAL
Comece **IMEDIATAMENTE** pela **FASE 0**. Analise os arquivos anexados e gere o resumo de alinhamento. Não escreva código de aplicação até que eu aprove sua saída da Fase 0.