# 📦 MÓDULO 09 — Contratos Determinísticos de Engenharia
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `09-hardening-deterministic-contracts.md`
> **Tamanho esperado:** 500–700 linhas
> **Dependência:** Gerar após 03, 04 e 05 — é a consolidação dos contratos mais críticos

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `09-hardening-deterministic-contracts.md` do projeto.

Este documento responde: *"O que acontece EXATAMENTE quando X falha neste ponto — sem ambiguidade, sem 'depende', sem interpretação."*

Um engenheiro deve conseguir implementar qualquer componente listado aqui sem fazer perguntas.

---

## PRINCÍPIO FUNDAMENTAL (INCLUIR VERBATIM NO DOCUMENTO)

> **Propósito:** Eliminar toda ambiguidade de implementação remanescente.
> Cada seção responde: **"O que acontece exatamente se X falhar neste ponto?"**
> Um engenheiro deve conseguir implementar qualquer componente abaixo sem perguntas.

---

## ESTRUTURA OBRIGATÓRIA

### Seção 1 — Contratos de Detecção de Anomalia

Se o sistema detecta loops, fraudes, anomalias de comportamento ou repetições:

#### 1.1 Taxonomia de Nós/Padrões Analisados

Para análise AST (se aplicável):
```
Nós/Padrões INCLUÍDOS na análise (estrutura semântica):
| Tipo | Motivo de Inclusão |
|---|---|
| [tipo] | [por que este padrão é relevante para detecção] |

Nós/Padrões IGNORADOS (identidade variável):
| Tipo | Motivo do Ignore |
|---|---|
| [tipo] | [por que ignorar não compromete a detecção] |
```

#### 1.2 Algoritmo de Detecção
```typescript
// [NomeDetector] — contrato completo
// Threshold: [valor default] — documentar por que este valor
// Custo: [latência esperada por chamada]

interface DetectionVector {
  [metrica1]: [tipo]; // [o que mede]
  [metrica2]: [tipo];
}

function computeSimilarity(a: DetectionVector, b: DetectionVector): number {
  // Algoritmo passo a passo com pesos e fórmula
  // Retorna: 0.0 (completamente diferente) → 1.0 (idêntico)
}

interface DetectionResult {
  isAnomaly: boolean;
  type?: string;        // tipo de anomalia detectada
  confidence: number;   // 0.0 → 1.0
  recommendation: string;
}
```

#### 1.3 Tabela de Comportamento por Threshold
| Similaridade | Ação | Escalação |
|---|---|---|
| < [limiar1] | Nenhuma | Nenhuma |
| [limiar1] – [limiar2] | [ação] | [escalação] |
| > [limiar2] | [ação] | Gate HITL |

### Seção 2 — Contratos de Sincronização de Eventos

#### 2.1 EventSequencer / Outbox

```typescript
// Todo evento DEVE ser persistido no DB ANTES de ser emitido
// Garante: reconexão com Last-Event-ID recupera todos os eventos perdidos

async function persistAndEmit<T>(
  sessionId: string,
  type: string,
  payload: T
): Promise<PersistedEvent> {
  return await db.transaction(async (tx) => {
    // 1. Persistir com seq_id monotônico e epoch_id
    const event = await tx.outboxEvent.create({ ... });
    // 2. Somente APÓS persistir: emitir via SSE/WS
    transport.emit(event);
    return event;
  });
}
```

#### 2.2 ReorderBuffer no Cliente

```typescript
// Garante processamento em ordem mesmo com eventos out-of-order
// Timeout: [Xms] — se seq esperado não chega em X ms, processa o próximo

class ReorderBuffer {
  private buffer = new Map<number, Event>();
  private nextExpected = 0;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  add(event: Event): void { /* implementação */ }
  
  private tryFlush(): void {
    while (this.buffer.has(this.nextExpected)) {
      const event = this.buffer.get(this.nextExpected)!;
      this.process(event);
      this.buffer.delete(this.nextExpected);
      this.nextExpected++;
    }
  }
}
```

#### 2.3 Protocolo de Reconexão com Last-Event-ID

Diagrama de sequência Mermaid da reconexão completa, incluindo:
- Cliente desconecta
- Servidor detecta desconexão
- Cliente reconecta com `Last-Event-ID`
- Servidor faz replay dos eventos perdidos
- Sincronização restaurada

### Seção 3 — Contratos de Atomicidade Cross-System

Para operações que envolvem mais de um sistema (ex: banco + filesystem, banco + API externa):

#### 3.1 Write-Ahead Log (WAL) Intent Pattern

```typescript
// CONTRATO: Qualquer operação cross-system DEVE usar este padrão
// Garante: zero estado inconsistente mesmo sob SIGKILL em qualquer fase

type OperationPhase =
  | 'INTENT_WRITTEN'    // Fase 0: intenção registrada, nada executado
  | 'SYSTEM_A_DONE'     // Fase 1: sistema A concluído, sistema B pendente
  | 'COMPLETED'         // Fase 2: ambos concluídos (estado terminal OK)
  | 'ROLLED_BACK';      // Estado terminal de abort

interface OperationIntent {
  txId: string;
  phase: OperationPhase;
  systemARef: string | null;  // referência para idempotência
  createdAt: string;
  metadata: Record<string, unknown>;
}

// Algoritmo de recuperação no boot (determinístico):
// INTENT_WRITTEN → System A nunca executou → rollback limpo
// SYSTEM_A_DONE  → System A executou, B não → validar A ainda existe → re-executar B (idempotente)
// COMPLETED      → Estado terminal OK → apenas limpar arquivo WAL
// ROLLED_BACK    → Estado terminal abort → apenas limpar arquivo WAL
```

#### 3.2 Atomicidade de Escrita em Disco

```typescript
// Escrita atômica via temp + fsync + rename POSIX
// Garante: sobrevive a SIGKILL entre write e rename

async function atomicWrite(targetPath: string, content: string): Promise<void> {
  const tempPath = `${targetPath}.tmp.${Date.now()}`;
  
  // 1. Escrever no arquivo temporário
  fs.writeFileSync(tempPath, content, 'utf8');
  
  // 2. fsync — garante dados no disco ANTES do rename
  const fd = fs.openSync(tempPath, 'r');
  fs.fsyncSync(fd);
  fs.closeSync(fd);
  
  // 3. rename POSIX — operação atômica e indivisível
  fs.renameSync(tempPath, targetPath);
  
  // Se SIGKILL ocorrer entre 1 e 3: arquivo .tmp detectável no boot
  // Se SIGKILL ocorrer após 3: targetPath está íntegro
}
```

### Seção 4 — Contratos de Segurança e Isolamento

#### 4.1 Validação de Input com Schema (Zod ou equivalente)

```typescript
// Todo input externo DEVE passar por schema antes de qualquer processamento
// Nunca: processar string raw → validar depois
// Sempre: validar schema → extrair dados tipados → processar

const InputSchema = z.object({
  [campo]: z.[tipo]()
    .min([valor])
    .max([valor])
    .refine(v => !v.includes('\0'), 'Null byte proibido')
    .refine(v => !/[\n\r]/.test(v), 'Newlines proibidas'),
});

// Falha no schema → SecurityError imediata, nenhum processamento
const parsed = InputSchema.safeParse(rawInput);
if (!parsed.success) throw new SecurityError(`[SCHEMA] ${parsed.error.message}`);
```

#### 4.2 Resolução de Path com Symlink Dereference

```typescript
// NUNCA: path.resolve(input) — ignora symlinks
// SEMPRE: await realpath(input) — segue symlinks até o destino real

async function safeResolve(input: string, authorizedRoot: string): Promise<string> {
  // realpath lança se o path não existir — capturar como SecurityError
  const resolved = await realpath(path.resolve(authorizedRoot, input)).catch(() => {
    throw new SecurityError(`[PATH] Não foi possível resolver: '${input}'`);
  });
  
  const prefix = authorizedRoot.endsWith(path.sep)
    ? authorizedRoot
    : authorizedRoot + path.sep;
  
  if (resolved !== authorizedRoot && !resolved.startsWith(prefix)) {
    throw new SecurityError(`[PATH_TRAVERSAL] '${resolved}' fora de '${authorizedRoot}'`);
  }
  
  return resolved;
}
```

### Seção 5 — Contratos de Observabilidade

#### 5.1 Structured Logging

```typescript
// Todo log deve ser structured (JSON) para parsing por ferramentas
// Campos obrigatórios em todo log entry:
interface LogEntry {
  timestamp: string;    // ISO 8601
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  component: string;    // qual componente emitiu
  traceId?: string;     // correlação entre logs da mesma operação
  message: string;
  data?: Record<string, unknown>; // dados contextuais — nunca incluir secrets
}
```

#### 5.2 AuditLog para Operações de Segurança

```typescript
// Toda operação de segurança DEVE ser auditada antes de qualquer exceção
// Mesmo se a operação falhar, o AuditLog deve ser escrito

interface AuditLogEntry {
  entityType: string;   // 'SecurityViolation' | 'GateApproval' | 'ConfigChange' | ...
  entityId: string;
  action: string;
  actor: string;        // 'system' | 'user:[id]' | 'agent:[nome]'
  previousState?: string; // JSON.stringify do estado anterior
  newState: string;       // JSON.stringify do estado novo
  createdAt: Date;
}
```

### Seção 6 — Contratos de Performance

Tabela de SLOs (Service Level Objectives) internos:
| Operação | P50 | P95 | P99 | Ação se Ultrapassar |
|---|---|---|---|---|
| [operação crítica] | [Xms] | [Xms] | [Xms] | [ação automática] |

### Seção 7 — Checklist de Implementação Correta

```
PARA TODO NOVO COMPONENTE, verificar:

[ ] Input validado com schema (Zod ou equivalente) antes de qualquer processamento
[ ] Paths resolvidos com realpath() (não path.resolve() puro)
[ ] Environment vars sanitizadas antes de exec() ou spawn()
[ ] Cleanup implementado em onUnmount / destructor / defer
[ ] AuditLog escrito para toda operação de segurança
[ ] Structured logging com traceId para correlação
[ ] Timeout definido para toda operação I/O (nunca Promise sem timeout)
[ ] Retry implementado com backoff exponencial para N1 (transiente)
[ ] Circuit breaker para dependências externas (se aplicável)
[ ] Health check implementado (retorna booleano, nunca lança exceção)
```

### Seção 8 — Anti-Padrões Proibidos

Lista de padrões que NUNCA devem aparecer na codebase:

| Anti-Padrão | Por Que é Proibido | Alternativa Correta |
|---|---|---|
| `exec(userInput)` | Injeção de comando | `execa('cmd', [arg1, arg2], { shell: false })` |
| `path.resolve(userInput)` sem realpath | Ignora symlinks | `await realpath(path.resolve(root, input))` |
| `setState` dentro de `onmessage` | Layout thrashing | `RAFBuffer.add(event)` |
| `process.env` passado diretamente ao exec | Environment poisoning | `buildSanitizedEnv()` |
| Promise sem timeout | Hang indefinido | `Promise.race([op(), timeout(30_000)])` |
| Catch vazio `catch {}` | Engole erros silenciosamente | `catch (err) { logger.error(...); throw err; }` |
| `JSON.stringify` de objeto com secrets em log | Vazamento de credencial | `redactSecrets(JSON.stringify(obj))` |

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Todo contrato deve ser código real**, não pseudocódigo — exceção apenas onde implementação não existe ainda
2. **Anti-padrões devem ter alternativa** — nunca proibir sem mostrar o caminho correto
3. **Checklist deve ser executável** — cada item verificável sem contexto adicional
4. **SLOs devem ter ação** — "o que o sistema faz automaticamente se ultrapassar o threshold"
5. **Algoritmos de detecção** devem ter threshold documentado com justificativa — não apenas o valor

---

**GERE O DOCUMENTO `09-hardening-deterministic-contracts.md` AGORA.**
