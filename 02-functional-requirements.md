# GreenForge — 02: Requisitos Funcionais

> **Status:** ✅ | **Versão:** 1.0.0 | **Data:** 2026-06-08
> **Referências:** PRD GreenForge v2, Verdant AI Workflow.

### 📋 Changelog v0.0 → v1.0
| Categoria | Mudança | Status |
|---|---|---|
| Inicial | Definição de RFs e RNFs baseados na especificação Maestro | ✅ |

---

## 1. Requisitos Funcionais (RF)

| ID | Requisito | Critério de Aceite Verificável em Teste | Prioridade |
|---|---|---|---|
| **RF-01.1** | Interceptação de Input | `onMessage` hook é chamado para cada entrada de texto. | Must |
| **RF-01.2** | Classificação de Intenção | Input técnico retorna `intent: TASK`; prompt ambíguo com `confidence < 0.7` retorna `intent: NORMAL`. | Must |
| **RF-02.1** | Fase de Clarificação | O sistema gera entre 5 e 7 perguntas de clarificação (`questions.length >= 5 && questions.length <= 7`). | Must |
| **RF-02.2** | Geração de Plano | O arquivo `GREENFORGE_PLAN.md` é gerado na raiz do worktree com seções 'Architecture' e 'Tests'. | Must |
| **RF-02.3** | Aprovação de Plano | Transição para `BUILDING` bloqueada até recebimento do sinal `forge_approve`. | Must |
| **RF-03.1** | Criação de Worktree | `git worktree list` retorna um novo path físico isolado vinculado à tarefa. | Must |
| **RF-03.4** | Auto-cleanup | Diretório do worktree é removido e branch deletada após `deprovision()`. | Should |
| **RF-04.2** | Auto-Verification | Comandos `npm run lint` e `npm test` são executados e seus exit codes (0) verificados. | Must |
| **RF-04.3** | Auto-healing (MVP) | Falha na verificação notifica usuário e permite retry (max 3 tentativas). | Should |
| **RF-06** | Geração de DiffReport | O sistema gera um relatório em linguagem natural (DiffLens) com nível de risco. | Must |
| **RF-07** | Injeção de Regras | O sistema injeta as regras do `AGENTS.md` no prompt de cada subagente. | Must |

---

## 2. Requisitos Não Funcionais (RNF)

- **RNF-01 (Performance)**: O Intention Router deve responder em menos de 1200ms (P95) para não degradar a experiência de chat.
- **RNF-02 (Persistência)**: Todo estado de tarefa deve ser persistido em SQLite com suporte a modo WAL para evitar corrupção em caso de crash da CLI.
- **RNF-03 (Segurança)**: O sistema não deve executar comandos de shell arbitrários sem que o comando esteja mapeado em uma lista de ferramentas seguras da extensão.
- **RNF-04 (Isolamento de Contexto)**: O contexto enviado para cada subagente deve ser limitado a "Context Capsules" (arquivos relevantes + esqueletos) para evitar estouro de tokens e perda de atenção.

---

## 3. Tabela de Priorização (MoSCoW)

| Requisito | Categoria | Prioridade | Justificativa |
|---|---|---|---|
| Roteamento Inteligente | RF | Must | Diferencial central do projeto. |
| Worktree Manager | RF | Must | Garantia de segurança e paralelismo. |
| Plan Mode (5 fases) | RF | Must | Padrão Verdant AI para qualidade. |
| Auto-cleanup | RF | Should | Manutenção de higiene do disco. |
| Descoberta Dinâmica de MCP | RF | Should | Extensibilidade do sistema. |
| Dashboard Visual de Tarefas | RF | Could | UX aprimorada, mas não essencial. |

---

## 4. Rastreabilidade
→ Este documento referencia: `01-vision-and-architecture.md`
→ Este documento é referenciado por: `03-technical-spec-and-data.md`
