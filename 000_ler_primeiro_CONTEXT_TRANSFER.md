# CONTEXT_TRANSFER.md — GreenForge Onboarding para Agentes de IA

> **Leia este arquivo primeiro, antes de qualquer outro.**
> **Versão:** 1.0.0 | **Data:** 2026-06-08

---

## O QUE É ESTE PROJETO

O **GreenForge** é uma extensão para o **Gemini CLI** que transforma o agente de IA em um engenheiro autônomo. Ele automatiza o ciclo **Plan → Code → Verify** usando Git Worktrees para isolamento físico de tarefas e múltiplos subagentes especializados rodando em paralelo.

É inspirado no **Verdant AI** e segue os mesmos princípios: planejamento obrigatório antes de qualquer escrita, isolamento por worktree, verificação automática de código, e revisão humana antes do merge.

O projeto está em **fase de design documental**. Nenhum código foi escrito ainda. Sua missão começa aqui.

---

## ESTADO ATUAL

- ✅ Documentação de arquitetura completa e auditada (15/15 critérios aprovados)
- ✅ Schema de banco de dados definido
- ✅ Interfaces TypeScript especificadas
- ✅ Máquina de estados completa com regras de transição
- ✅ Cenários Gherkin prontos para implementação
- ✅ Rastreabilidade RF/RNF com arquivos de teste nomeados
- ⬜ Código de produção: não iniciado
- ⬜ Testes: não iniciados

---

## REGRA MAIS IMPORTANTE

> **`GREENFORGE_DESIGN.md` é a Fonte Única da Verdade.**
> Em caso de contradição entre qualquer documento e o DESIGN, o DESIGN prevalece sempre.
> Nunca implemente nada que divirja do DESIGN sem registrar um novo ADR.

---

## STACK TECNOLÓGICA

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js v20+ |
| Banco de dados | SQLite (WAL Mode) via `better-sqlite3` |
| Execução de processos | `execa` com `shell: false` (obrigatório) |
| Testes | Vitest |
| Integração CLI | Gemini CLI Extension API |
| Roteamento de intenção | Gemini 1.5 Flash |
| Planejamento | Gemini 1.5 Pro |

> ⚠️ Bun foi avaliado e rejeitado (ADR-05). Não use Bun em nenhuma circunstância.

---

## ORDEM DE LEITURA DOS DOCUMENTOS

Leia nesta sequência exata antes de escrever qualquer código ou teste:

1. **`GREENFORGE_DESIGN.md`** — Fonte única da verdade. Arquitetura completa, subagentes, máquina de estados, segurança, rastreabilidade. Leia integralmente.
2. **`03-technical-spec-and-data.md`** — Schema SQL completo, interfaces TypeScript, algoritmos centrais.
3. **`02-functional-requirements.md`** — RFs e RNFs com critérios de aceite.
4. **`05-governance-and-security.md`** — Modelo de ameaças T-01 a T-07, contratos de segurança.
5. **`09-hardening-deterministic-contracts.md`** — SafeResolve, atomic write, anti-padrões proibidos.
6. **`04-operational-playbooks.md`** — Playbooks de incidente INC-001 e INC-003.
7. **`06-api-and-extensibility.md`** — Contrato de subagentes e protocolo de handoff de artefatos.
8. **`01-vision-and-architecture.md`** — Visão geral e justificativa estratégica.
9. Demais arquivos (`NEXUS_*.md`, `MAESTRO`, `README`) — Contexto adicional e histórico de decisões.

---

## POR ONDE COMEÇAR (TDD)

A implementação segue TDD estrito: escreva o teste falhando (RED) antes de qualquer código de produção.

**Ordem recomendada dos arquivos de teste:**

| Ordem | Arquivo | Componente | Tipo |
|---|---|---|---|
| 1 | `router.test.ts` | IntentionRouter | Unitário (mock API) |
| 2 | `worktree.test.ts` | WorktreeManager | Integração (Git real) |
| 3 | `security.test.ts` | SafeResolve + No-Shell | Segurança |
| 4 | `planner.test.ts` | Plan Mode Engine | Unitário |
| 5 | `verifier.test.ts` | @Verifier | Unitário |
| 6 | `difflens.test.ts` | DiffLens | Unitário |
| 7 | `rules.test.ts` | AGENTS.md + @Code-Reviewer | Unitário |
| 8 | `parallel.test.ts` | Orquestrador paralelo + join gate | Integração |
| 9 | `handoff.test.ts` | AgentArtifact + SQLite | Integração |
| 10 | `resilience.test.ts` | Auto-healing + retry | Integração |
| 11 | `performance.test.ts` | Latência P95 < 1200ms | Performance |
| 12 | `stress.test.ts` | 5 subtarefas paralelas sem OOM | Stress |
| 13 | `context.test.ts` | Context Capsules -80% tokens | Unitário |

**Comece pelo `router.test.ts`.** É o componente mais simples, tem interface bem definida, e não depende de nenhum outro componente. Use mock da API Gemini.

---

## CONTRATOS DE SEGURANÇA INVIOLÁVEIS

Estes contratos nunca podem ser violados em nenhum código que você escrever:

1. **SafeResolve**: Nunca use `path.resolve` puro. Sempre use `fs.realpath` + validação de prefixo contra o worktree root.
2. **No-Shell Policy**: Nunca use `child_process.exec` ou `shell: true`. Use exclusivamente `execa` com arrays de argumentos.
3. **Atomic Write**: Nunca escreva diretamente no arquivo destino. Use sempre o padrão `.tmp` → `fsync` → `rename`.
4. **Worktree Boundary**: Subagentes têm leitura global, mas escrita restrita ao próprio worktree. Violações lançam `WorktreeAccessViolationError`.

---

## COMPONENTES CENTRAIS E SEUS ARQUIVOS

| Componente | ID | Arquivo de implementação | Arquivo de teste |
|---|---|---|---|
| Intention Router | GF-ROUTER | `src/infrastructure/llm/GeminiRouter.ts` | `router.test.ts` |
| Worktree Manager | GF-ISOLATOR | `src/infrastructure/git/WorktreeManager.ts` | `worktree.test.ts` |
| Orchestrator | — | `src/application/CreateTask.ts` | `parallel.test.ts` |
| Plan Mode Engine | — | `src/infrastructure/llm/GeminiPlanner.ts` | `planner.test.ts` |
| @Explorer | GF-EXPLORER | `src/infrastructure/llm/ExplorerAgent.ts` | `explorer.test.ts` |
| @Code-Reviewer | GF-REVIEWER | `src/infrastructure/llm/ReviewerAgent.ts` | `rules.test.ts` |
| @Verifier | GF-VERIFIER | `src/infrastructure/llm/VerifierAgent.ts` | `verifier.test.ts` |
| DiffLens | GF-DIFFLENS | `src/application/DiffLens.ts` | `difflens.test.ts` |
| SafeResolve | — | `src/shared/SafeResolve.ts` | `security.test.ts` |
| SQLite Repository | — | `src/infrastructure/db/SQLiteRepository.ts` | `handoff.test.ts` |

---

## ESTRUTURA DE PASTAS ESPERADA

```
greenforge/
├── bin/
│   └── forge.ts
├── src/
│   ├── application/
│   │   ├── CreateTask.ts
│   │   ├── DiffLens.ts
│   │   └── VerifyImplementation.ts
│   ├── domain/
│   │   ├── entities/
│   │   └── services/
│   ├── infrastructure/
│   │   ├── git/
│   │   ├── db/
│   │   └── llm/
│   └── shared/
│       ├── SafeResolve.ts
│       └── Logger.ts
├── __tests__/
├── .gemini/
├── AGENTS.md
├── CONTEXT_TRANSFER.md
└── package.json
```

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```env
GEMINI_API_KEY=        # Obrigatório. Chave da API Google Gemini.
GF_WORKTREE_ROOT=      # Opcional. Default: .gemini/worktrees
GF_MAX_PARALLEL=       # Opcional. Default: 5
GF_DB_PATH=            # Opcional. Default: .gemini/forge.db
```

---

*Este arquivo foi gerado ao final do processo de design documental do GreenForge.
Qualquer agente que ler este arquivo primeiro terá contexto suficiente para iniciar a implementação sem consultas adicionais.*
