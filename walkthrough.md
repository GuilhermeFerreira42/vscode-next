# GreenForge NEXUS v2.3 — Implementação Concluída

A transformação do fork do Cline no **GreenForge NEXUS v2.3** foi concluída com sucesso. A injeção cirúrgica foi realizada mantendo 100% da infraestrutura nativa do Cline, injetando o novo orquestrador de debate adversarial no loop de execução.

## O que foi implementado

### 1. Motor de Debate Adversarial
Foi criado o novo diretório `src/core/api/greenforge` contendo o núcleo da inteligência:
- **`RolePrompts.ts`**: Define os system prompts para os papéis (Propositor, Crítico, Árbitro e Manager/Gate 0).
- **`AgentFactory.ts`**: Orquestra a instanciação do Gemini com as roles específicas, gerenciando as versões Flash (para debate paralelo) e Pro (para síntese).
- **`DebateRound.ts`**: Implementa a lógica paralela (`Promise.all`) do Round 1 para evitar herd-behavior, e a lógica sequencial para os rounds subsequentes.
- **`GateManager.ts`**: Conecta os resultados do debate ao mecanismo HITL (Human-in-the-Loop) existente no Cline (`this.ask()`), implementando o Gate 0 (Clarificação Socrática), Gate 1 (Approval Card) e Gate 2 (DiffLens).

### 2. Integração Limpa no Loop (Camada 3)
A injeção em `src/core/task/index.ts` foi feita com máxima cautela:
```typescript
// --- INJECT GREENFORGE HERE ---
if (this.api.getModel().id === "greenforge") {
    const didEndLoop = await this.orchestrateGreenForgeDebate(userContent)
    return didEndLoop
}
// ------------------------------
```
Esta abordagem não quebra nenhum teste existente e mantém a retrocompatibilidade completa com os outros provedores.

### 3. Suporte na Webview UI (Camada 4)
- Registramos o provedor no `providers.json`.
- Criamos o `GreenForgeProvider.tsx` para configuração nativa das chaves e modelos no painel de settings do Cline.

## Como testar

1. No terminal do seu projeto, inicie o OpenVSCode Server ou o ambiente de desenvolvimento do Cline (`npm run dev`).
2. Abra a extensão no VSCode.
3. No seletor de modelos/provedores (ícone da engrenagem), selecione **"GreenForge (Debate Adversarial)"**.
4. Configure sua chave do Gemini.
5. Inicie uma tarefa complexa no chat.
6. Você verá o processo interativo: 
   - Perguntas de clarificação (se houver ambiguidade).
   - Debate entre os agentes.
   - O Card de Aprovação (Gate 1) onde você decidirá se concorda com a síntese arquitetural do Árbitro.

> [!NOTE]
> A persistência SQLite (Prisma) e a resiliência BootReconciler (Fase 2) foram postergadas conforme o MVP acordado. O estado de debate atual é mantido em memória durante a tarefa, cumprindo todos os requisitos de validação sem sobrecarregar a arquitetura neste primeiro momento.
