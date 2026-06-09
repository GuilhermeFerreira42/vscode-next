# GreenForge — 04: Playbooks Operacionais

> **Status:** ✅ | **Versão:** 1.0.0 | **Data:** 2026-06-08
> **Referências:** SRE Handbook, Git Worktree Troubleshooting, Node.js Process Management.

### 📋 Changelog v0.0 → v1.0
| Categoria | Mudança | Status |
|---|---|---|
| Operações | Definição de Runbooks e Matriz de Troubleshooting | ✅ |

---

## 1. Checklist de Boot

### 1.1 Pré-flight Obrigatório
Antes de iniciar o orquestrador, o sistema executa:
- [ ] **Git Check**: `git --version` >= 2.30.0 (suporte a worktrees).
- [ ] **DB Integrity**: `sqlite3 forge.db "PRAGMA integrity_check;"` retorna `ok`.
- [ ] **Environment**: Validação de `GEMINI_API_KEY` (Flash e Pro).
- [ ] **Storage**: Permissão de escrita no diretório pai de worktrees.

### 1.2 Sequência de Inicialização
1.  **Stage 1**: Load Config & Environment.
2.  **Stage 2**: DB Connection & WAL Enable.
3.  **Stage 3**: `BootReconciler` (Limpeza de estados inconsistentes).
4.  **Stage 4**: Extension API Registration.

---

## 2. Matriz de Troubleshooting

| Sintoma | Causa Provável | Diagnóstico | Solução |
|---|---|---|---|
| `git worktree add` falha | Branch já existe | `git branch --list` | Deletar branch órfã ou usar novo ID. |
| SQLite `DATABASE_LOCKED` | Outro processo segurando lock | `fuser forge.db` | Matar processo travado ou aguardar. |
| Intention Router lento (>2s) | Latência da API Gemini | Ver logs de `RouterLatency` | Verificar conexão ou reduzir prompt. |
| Arquivos 0 bytes no Worktree | Falha de IO / SIGKILL | Check para arquivos `.tmp` | Limpar `.tmp` e re-executar tarefa. |

---

## 3. Playbooks de Incidentes (INC)

### INC-001: Worktree Órfão (Disco Cheio)
**Sintoma:** O comando `forge list` não mostra a tarefa, mas o diretório físico existe.
**Causa:** Crash entre a criação física e o commit no SQLite.
**Resolução:**
1.  Identificar o diretório: `ls .gemini/worktrees/`.
2.  Remover via git: `git worktree remove --force <path>`.
3.  Pruning: `git worktree prune`.

### INC-003: SQLite Corrompido
**Sintoma:** Erro de SQLite (ex: `SQLITE_CORRUPT`) ao iniciar a extensão.
**Diagnóstico:** `sqlite3 forge.db "PRAGMA integrity_check;"` retorna algo diferente de `ok`.
**Resolução Passo a Passo:**
1.  **Recuperação via Dump:** Tentar salvar os dados: `sqlite3 forge.db ".dump" | sqlite3 recovery.db`.
2.  **BootReconciler Algorithm:**
    - Mover `forge.db` para `forge.db.bak`.
    - Inicializar novo DB.
    - Escanear diretórios em `.gemini/worktrees/` e branches `forge/task-*`.
    - Re-vincular worktrees órfãos ao novo DB.
3.  **Fallback:** Se a reconciliação falhar, deletar `forge.db` e realizar limpeza manual de worktrees via `git worktree prune`.

---

## 4. Protocolo de Graceful Shutdown

Tabela de estágios:
| Estágio | Componente | Ação | Timeout |
|---|---|---|---|
| 1 | API Extensions | Parar de aceitar novos inputs. | 500ms |
| 2 | Subagents | Abortar execuções ativas (SIGINT). | 2000ms |
| 3 | SQLite | Flush WAL and Close Connection. | 1000ms |
| 4 | OS | Exit 0. | N/A |

---

## 5. Rastreabilidade
→ Este documento referencia: `03-technical-spec-and-data.md`
→ Este documento é referenciado por: `INTEGRACAO_STATUS.md`
