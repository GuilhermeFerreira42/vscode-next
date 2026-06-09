# GreenForge — 03: Especificação Técnica e Dados

> **Status:** ✅ | **Versão:** 1.0.0 | **Data:** 2026-06-08
> **Referências:** SQLite WAL, TypeScript 5.x, Node.js fs/promises.

### 📋 Changelog v0.0 → v1.0
| Categoria | Mudança | Status |
|---|---|---|
| Dados | Definição do Schema SQLite e Interfaces de Estado | ✅ |
| Orquestração | Protocolo de Transição de Estado da Tarefa | ✅ |
| Contexto | Especificação técnica de Context Capsules | ✅ |

---

## 1. Schema de Dados

### 1.1 Banco de Dados (SQLite)
O banco de dados é o "Single Source of Truth" para o orquestrador.

#### Entidade: `tasks`
**Propósito:** Gerenciar o ciclo de vida e metadados de cada tarefa de desenvolvimento.

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,                 -- UUID v4
    title TEXT NOT NULL,                 -- Resumo da tarefa
    original_prompt TEXT NOT NULL,       -- Input raw do usuário
    branch_name TEXT NOT NULL UNIQUE,    -- Nome da branch git (forge/task-...)
    worktree_path TEXT NOT NULL UNIQUE,  -- Caminho físico no disco
    status TEXT CHECK(status IN (
        'PENDING', 'CLARIFYING', 'PLANNING', 
        'BUILDING', 'BUILDING_PARALLEL', 'JOINING',
        'REVIEWING', 'VERIFYING', 'COMPLETED', 'FAILED'
    )) DEFAULT 'PENDING',
    plan_markdown TEXT,                  -- Conteúdo do GREENFORGE_PLAN.md
    subtasks_graph TEXT,                 -- JSON: Array de SubtaskNode
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Interface `SubtaskNode`
```typescript
interface SubtaskNode {
  id: string;
  title: string;
  assignedAgent: 'CODER' | 'TESTER' | 'DOCS' | null;
  dependsOn: string[];
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  worktreePath: string | null;
  artifactOutput: string | null;
}
```

#### Entidade: `checkpoints`
**Propósito:** Persistir o estado atômico de operações cross-system (DB + Filesystem).

```sql
CREATE TABLE IF NOT EXISTS checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(id),
    phase TEXT NOT NULL,                 -- INTENT_WRITTEN, FS_DONE, DB_DONE
    metadata TEXT,                       -- JSON string com detalhes da operação
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Interfaces TypeScript Centrais

### 2.1 Task Context & State
```typescript
/**
 * Representa o estado em memória de uma tarefa ativa.
 */
interface ForgeTask {
  id: string;
  status: TaskStatus;
  worktree: {
    path: string;
    branch: string;
  };
  plan: PlanMetadata;
}

/**
 * Cápsula de contexto enviada aos subagentes.
 */
interface ContextCapsule {
  mainFiles: Array<{
    path: string;
    content: string;
  }>;
  dependencies: Array<{
    symbol: string;
    signature: string; // Esqueleto extraído via tree-sitter
    sourceFile: string;
  }>;
  gitDiff: string; // Diff da branch main vs branch da tarefa
}
```

---

## 3. Componentes Críticos

### 3.1 IntentionRouter — Classificação de Entrada
**Arquivo:** `src/core/IntentionRouter.ts`
**Instanciação:** Singleton
**Algoritmo:**
```typescript
async function route(input: string): Promise<RoutingResult> {
  const prompt = `
    Classifique a intenção do usuário no contexto de engenharia de software:
    Input: "${input}"
    
    Responda apenas em JSON: 
    { "intention": "NORMAL_CHAT" | "DEVELOPMENT_TASK", "confidence": 0.0-1.0 }
  `;
  
  const response = await modelFlash.generate(prompt);
  const result = JSON.parse(response);
  
  if (result.confidence < 0.7) return { type: 'NORMAL_CHAT', reason: 'low_confidence' };
  return { type: result.intention };
}
```

### 3.2 WorktreeManager — Isolamento Físico
**Arquivo:** `src/git/WorktreeManager.ts`
**Lógica de Criação:**
1. Gerar nome de branch único.
2. `git worktree add <path> <branch>`.
3. Validar se o diretório foi criado e é um repositório git válido.

---

## 4. Protocolo de Resiliência

### 4.1 Write-Ahead Log (WAL) para Worktrees
Para garantir que não fiquem "worktrees zumbis" no disco após um crash:

| Estágio | Ação | Recuperação no Boot |
|---|---|---|
| 0 | Escrever INTENT no SQLite | Nada a limpar. |
| 1 | `git worktree add` | Se falhar, remover diretório parcial se existir. |
| 2 | Marcar SUCCESS no SQLite | Estado íntegro. |

---

## 5. Rastreabilidade
→ Este documento referencia: `01-vision-and-architecture.md`, `02-functional-requirements.md`
→ Este documento é referenciado por: `09-hardening-deterministic-contracts.md`
