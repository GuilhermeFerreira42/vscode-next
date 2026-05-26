# 📦 MÓDULO 03 — Especificação Técnica e Dados
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `03-technical-spec-and-data.md`
> **Tamanho esperado:** 800–1200 linhas (o documento mais denso do kit)
> **Dependência:** Gerar após aprovação de 01 e 02

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `03-technical-spec-and-data.md` do projeto.

Este é o **documento de maior densidade técnica** do kit. Responde:
*"Como cada componente funciona internamente — schema de dados, contratos TypeScript, algoritmos críticos, state machines e protocolos de resiliência."*

---

## ESTRUTURA OBRIGATÓRIA

### Seção 0 — Changelog e Visão do Documento
- Changelog de versão
- Mermaid `sequenceDiagram` do fluxo mais crítico do sistema (o que envolve mais componentes)

### Seção 1 — Schema de Dados

#### 1.1 Schema do Banco de Dados
Para cada entidade/tabela:
```
#### Entidade: [NomeEntidade]
**Propósito:** [o que armazena e por quê]

[Schema em formato nativo — Prisma, SQL, TypeORM, SQLAlchemy, etc.]

**Índices críticos:** [quais campos têm índice e por quê]
**Invariantes:** [regras que sempre devem ser verdadeiras]
```

#### 1.2 Contratos TypeScript / Interfaces Centrais
Para cada interface/tipo crítico:
```typescript
// [Nome da Interface] — [propósito em 1 linha]
// Usado em: [componentes que usam esta interface]
interface [Nome] {
  [campo]: [tipo]; // [comentário explicativo se não óbvio]
}
```

#### 1.3 State Machine Principal (se houver)
- Diagrama Mermaid `stateDiagram-v2` completo
- Tabela de transições com condição e ação para cada transição:

| Estado Atual | Evento | Condição | Próximo Estado | Ação |
|---|---|---|---|---|

#### 1.4 Procedimentos de Execução Atômica (se houver operações cross-system)
- Protocolo de checkpoint/WAL (se banco + filesystem)
- Algoritmo de recuperação pós-crash
- Tabela de fases com ação determinística para cada fase

### Seção 2 — Componentes Críticos

Para cada componente técnico central:

```
#### [N.N] [NomeDoComponente] — [responsabilidade em 1 frase]

**Arquivo:** `src/[caminho]/[arquivo].ts`
**Instanciação:** [singleton / por sessão / por agente / stateless]
**Dependências:** [outros componentes que usa]

**Interface pública:**
[código TypeScript das funções públicas com JSDoc]

**Algoritmo central:**
[pseudocódigo ou código real do algoritmo principal]

**Tabela de comportamento:**
| Input | Condição | Output | Efeito Colateral |
|---|---|---|---|

**Performance:** [complexidade, latência esperada, custo]
**Limitações conhecidas:** [o que este componente NÃO faz]
```

Componentes obrigatórios (adapte ao projeto):
- Componente de orquestração central
- Componente de persistência/banco
- Componente de comunicação (transporte)
- Componente de resiliência (retry, circuit breaker, reconciler)
- Componente de detecção de anomalia (loop detector, fraud, etc.)
- Componente de lifecycle (boot, shutdown, GC)

### Seção 3 — Protocolos de Resiliência

#### 3.1 Estratégia de Retry
```
N1 (Transiente): [comportamento, backoff, max tentativas]
N2 (Lógica):     [comportamento, max tentativas]
N3 (Conflito):   [comportamento, escalação]
N4 (Recurso):    [comportamento, fallback]
N5 (Config):     [falha imediata, sem retry]
```

#### 3.2 Graceful Shutdown
Tabela de estágios (do primeiro ao último a fechar):
| Estágio | Componente | Ação | Motivo | Timeout |
|---|---|---|---|---|

#### 3.3 Boot Sequence
Tabela de inicialização (ordem obrigatória):
| Ordem | Componente | Ação | Pré-condição |
|---|---|---|---|

### Seção 4 — Contratos de Eventos / Mensagens

Para cada tipo de evento/mensagem do sistema:
```
#### [NOME_DO_EVENTO]
**Direção:** [emissor → receptor]
**Canal:** [SSE / WebSocket / Queue / Pub-Sub]
**Payload:**
[schema JSON ou TypeScript interface]

**Quando emitir:** [condição de disparo]
**O que o receptor faz:** [ação obrigatória]
**Garantias:** [at-most-once / at-least-once / exactly-once]
```

### Seção 5 — Contratos de Engenharia de Estresse

#### 5.1 EventSequencer / Outbox (se aplicável)
- Como eventos são ordenados e persistidos
- Protocolo de re-sincronização (Last-Event-ID, etc.)

#### 5.2 Tabela de Componentes com Prioridade de Shutdown
| Priority | Componente | Shutdown Action |
|---|---|---|

#### 5.3 Health Check de Cada Componente
| Componente | Método de Health Check | Critério de Falha |
|---|---|---|

### Seção 6 — Mapa de Contratos Completo

Tabela consolidada de todos os contratos do sistema:
| Componente | Método | Pré-condição | Pós-condição | Exceção |
|---|---|---|---|---|

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Todo algoritmo crítico deve ter código** — pseudocódigo TypeScript mínimo, código real se disponível
2. **State machines devem ter tabela de transições** além do diagrama — diagramas são ambíguos, tabelas são definitivas
3. **Toda interface TypeScript deve ter comentários** nos campos não-óbvios
4. **Procedimentos atômicos** devem especificar o que acontece em CADA fase de falha
5. **Performance deve ser documentada** — mesmo que seja "não medido ainda — estimativa: X ms"
6. Este documento é gerado em **múltiplas sessões** se necessário — encerre com `--- CONTINUAÇÃO PENDENTE ---`

---

## EXEMPLO DE COMPONENTE BEM DOCUMENTADO

```markdown
#### 2.3 BootReconciler — Recuperação Pós-Crash Determinística

**Arquivo:** `src/core/BootReconciler.ts`
**Instanciação:** Singleton — executado UMA vez no boot, antes de qualquer handler
**Dependências:** Database, FileSystem (WAL dir), GitWorktreeManager

**Interface pública:**
```typescript
/**
 * Executa ao iniciar o processo. Lê WAL dir, aplica recovery determinístico.
 * DEVE ser a primeira chamada após abrir o banco de dados.
 * @throws BootReconcilerError se WAL dir não for acessível
 */
async function bootReconciler(db: Database): Promise<RecoveryReport>
```

**Algoritmo central:**
```
1. Ler todos os arquivos .json e .tmp no WAL_DIR
2. Para cada intent encontrado:
   INTENT_WRITTEN  → marcar ROLLED_BACK + deletar WAL
   GIT_STASH_DONE  → validar stash existe → re-executar DB update → marcar DB_COMMITTED
   DB_COMMITTED    → deletar WAL (estado terminal de sucesso)
   ROLLED_BACK     → deletar WAL (estado terminal de abort)
   .tmp residual   → deletar (crash entre fsync e rename)
3. Retornar RecoveryReport com contagem de cada ação
```
```

---

**GERE O DOCUMENTO `03-technical-spec-and-data.md` AGORA.**
