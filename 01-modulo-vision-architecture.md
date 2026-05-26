# 📦 MÓDULO 01 — Visão e Arquitetura
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `01-vision-and-architecture.md`
> **Tamanho esperado:** 400–600 linhas

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `01-vision-and-architecture.md` do projeto.

Este é o **documento fundacional** — o primeiro que qualquer pessoa lê.
Ele deve responder: *"O que é este sistema, por que existe, como funciona em alto nível e quais decisões arquiteturais são inegociáveis?"*

---

## ESTRUTURA OBRIGATÓRIA

### Seção 1 — Visão do Produto
- Nome oficial, versão, slogan
- Missão em 1 frase: **o que resolve e pra quem**
- Comparativo com versão anterior (se houver) ou com alternativas manuais — formato de tabela
- Personas com nome, cargo e dor principal (mínimo 2)
- Princípio central do sistema em negrito (a regra filosófica que governa tudo)

### Seção 2 — Arquitetura Geral
- Diagrama Mermaid `graph TD` completo: usuário → camadas → persistência
- Descrição de cada componente no diagrama (1–2 linhas por componente)
- Ciclo de vida principal em ASCII ou Mermaid `sequenceDiagram`

### Seção 3 — Protocolo de Comunicação (se aplicável)
- Transporte(s) utilizado(s) e por quê (ex: SSE para streaming, WebSocket para HITL)
- Diagrama de sequência do fluxo mais crítico
- Garantias do protocolo (ordering, idempotência, reconexão)

### Seção 4 — Fluxo Central do Sistema
- Fluxo principal passo a passo em ASCII art ou diagrama
- Cada gate/ponto de decisão identificado
- Estados possíveis e transições

### Seção 5 — Estratégia de Contexto / Estado (se aplicável)
- Como o sistema gerencia estado entre componentes
- Estratégia de compressão ou janela de contexto (se LLM)
- Fundamentos teóricos citados (papers, livros, RFCs)

### Seção 6 — ADRs (Architectural Decision Records)
Para cada decisão arquitetural relevante:
```
#### ADR-NN: [Título da Decisão]
**Contexto:** [situação que motivou a decisão]
**Decisão:** [o que foi escolhido]
**Alternativas Rejeitadas:** [o que foi descartado e por quê]
**Consequências:** [trade-offs aceitos]
**Status:** Accepted / Superseded / Deprecated
```
Mínimo de 5 ADRs. Incluir obrigatoriamente:
- Decisão de banco de dados
- Decisão de framework principal
- Decisão de comunicação/transporte
- Decisão de estratégia de resiliência
- Decisão de autenticação/segurança

### Seção 7 — Modelo de Deployment
- Stack de produção vs desenvolvimento local
- Diagrama de infraestrutura (mesmo que simples)
- Ports, variáveis de ambiente obrigatórias
- Pré-requisitos com versões exatas

### Seção 8 — Roadmap
Tabela com versões futuras inferidas das limitações atuais:
| Versão | Foco | Features Principais | Estimativa |
|---|---|---|---|

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **ADRs são inegociáveis** — sem ADRs, o documento está incompleto
2. **Todo diagrama Mermaid deve ser válido** — teste mentalmente a sintaxe antes de escrever
3. **Princípio central** deve ser destacado em negrito e repetido onde relevante
4. **Versão anterior** deve aparecer na tabela comparativa mesmo que seja "não havia versão anterior" → coluna "v0 / manual"
5. O documento deve terminar com o Roadmap — é sempre a última seção

---

## EXEMPLO DE ABERTURA ESPERADA

```markdown
# [NOME DO PROJETO] — 01: Visão e Arquitetura

> **Status:** ✅ | **Versão:** X.Y | **Data:** YYYY-MM-DD
> **Referências:** [referências técnicas relevantes]

### 📋 Changelog vX.X → vY.Y
| Categoria | Mudança | Status |
|---|---|---|

---

## 1. Visão do Produto

O [NOME] v[X] é um(a) [tipo de sistema] que [resolve qual problema] para [quem].

**Princípio central:** [a regra filosófica em 1 frase que governa TUDO no sistema]

### 1.1 Comparativo com Alternativas
| Dimensão | Alternativa Manual / v0 | [NOME] vX |
|---|---|---|
...
```

---

**GERE O DOCUMENTO `01-vision-and-architecture.md` AGORA.**
