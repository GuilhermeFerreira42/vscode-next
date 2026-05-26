# 📦 MÓDULO 02 — Requisitos Funcionais
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `02-functional-requirements.md`
> **Tamanho esperado:** 400–600 linhas

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `02-functional-requirements.md` do projeto.

Este documento responde: *"O que o sistema FAZ — em cada ação, fluxo, gate e regra de negócio — com precisão suficiente para implementar sem perguntas."*

---

## ESTRUTURA OBRIGATÓRIA

### Seção 1 — Fluxo Central de Trabalho
- ASCII art completo do fluxo principal do usuário, do início ao fim
- Cada gate/decisão identificado com nome e condição de ativação
- Estados alternativos (caminho de erro, timeout, rejeição)

### Seção 2 — Módulos Funcionais
Para cada módulo/feature do sistema:

```
#### [N.N] [Nome do Módulo]

**Responsabilidade:** [o que este módulo faz em 1 frase]
**Ativado por:** [evento, ação do usuário, sinal do sistema]
**Produz:** [output ou efeito colateral]

**Fluxo interno:**
1. [passo 1]
2. [passo 2]
...

**Regras de negócio invioláveis:**
- [regra 1]
- [regra 2]

**Edge cases documentados:**
| Situação | Comportamento Esperado |
|---|---|
| [caso] | [ação do sistema] |
```

Módulos obrigatórios (adapte os nomes ao projeto):
- Módulo de entrada/inicialização
- Módulo de processamento central
- Módulo(s) de gate/aprovação (se HITL ou review)
- Módulo de persistência/histórico
- Módulo de rollback/desfazer (se aplicável)
- Módulo de integração externa (se aplicável)

### Seção 3 — Catálogo Formal de Requisitos Funcionais

Formato obrigatório para cada RF:
```
#### RF-NNN: [Nome da Funcionalidade]
→ **Ator:** [usuário / sistema / agente / cron]
→ **Ação:** [o que o ator faz ou dispara]
→ **Fluxo de Código:** [caminho técnico resumido]
→ **Módulo Crítico:** [arquivo ou componente central]
→ **Pré-condição:** [o que deve ser verdadeiro antes]
→ **Pós-condição:** [estado garantido após execução]
→ **Regra de Falha:** [o que acontece se falhar]
→ **Status:** [Implementado / Parcial / Planejado]
```

Cobertura mínima:
- RF-001 a RF-005: fluxo principal (happy path)
- RF-006 a RF-010: gates e aprovações
- RF-011 a RF-015: resiliência (retry, rollback, timeout)
- RF-016+: features secundárias e configurações

### Seção 4 — Requisitos Não Funcionais

| Categoria | Requisito | Métrica | Target | Como Verificar | Status |
|---|---|---|---|---|---|
| Performance | [ex: latência p95] | [métrica] | [valor] | [como medir] | [status] |
| Resiliência | [ex: recovery pós-crash] | [métrica] | [valor] | [como medir] | [status] |
| Segurança | [ex: validação de input] | [métrica] | [valor] | [como medir] | [status] |
| Escalabilidade | [ex: sessions simultâneas] | [métrica] | [valor] | [como medir] | [status] |
| Observabilidade | [ex: audit trail] | [métrica] | [valor] | [como medir] | [status] |

### Seção 5 — Modos de Operação (se aplicável)
Se o sistema tiver modos configuráveis (ex: auto/manual/strict):

| Modo | Comportamento | Caso de Uso | Risco |
|---|---|---|---|

### Seção 6 — Red Flags e Operações de Alto Risco
Tabela de operações que sempre requerem confirmação explícita:

| Categoria | Operação | Severidade | Comportamento |
|---|---|---|---|
| [categoria] | [operação] | 🔴 CRÍTICO / 🟠 ALTO / 🟡 MÉDIO | [ação do sistema] |

### Seção 7 — Glossário do Domínio
Tabela de termos específicos do projeto:

| Termo | Definição |
|---|---|
| [termo] | [definição técnica precisa] |

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Todo RF deve ter Status explícito** — nunca deixar em branco
2. **Edge cases são obrigatórios** em cada módulo — mínimo 2 por módulo
3. **Regras de negócio invioláveis** devem estar destacadas — são as coisas que nunca mudam
4. **O fluxo ASCII da Seção 1** deve cobrir 100% do happy path + os 2 desvios mais importantes
5. **O Glossário** deve cobrir todos os termos não-óbvios usados nos documentos técnicos

---

## EXEMPLO DE RF BEM ESCRITO

```markdown
#### RF-007: Validação de Gate HITL com PreExecutionGuard

→ **Ator:** Sistema (servidor)
→ **Ação:** Valida consistência do estado no momento da aprovação
→ **Fluxo de Código:** `resolveHITL()` → `validateGateConsistency()` → `continueExecution()` ou rejeição
→ **Módulo Crítico:** `src/gates/PreExecutionGuard.ts`
→ **Pré-condição:** Gate emitido com `stateHash` e `epoch_id` válidos
→ **Pós-condição:** Execução continua apenas se estado atual = estado no momento da emissão
→ **Regra de Falha:** SSE emite `GATE_VALIDATION_FAILED` com reason; execução bloqueada; UI solicita re-avaliação
→ **Status:** Implementado
```

---

**GERE O DOCUMENTO `02-functional-requirements.md` AGORA.**
