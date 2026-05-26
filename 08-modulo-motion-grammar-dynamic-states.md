# 📦 MÓDULO 08 — Gramática de Movimento e Estados Dinâmicos
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `08-motion-grammar-and-dynamic-states.md`
> **Tamanho esperado:** 300–500 linhas
> **Aplicabilidade:** Gerar somente se o projeto tiver UI com estados visuais e animações significativas
> **Dependência:** Gerar após 07

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `08-motion-grammar-and-dynamic-states.md` do projeto.

Este documento responde: *"Qual animação acontece quando qual evento ocorre — com valores exatos de duração, easing e sequência — de forma que movimento seja sinalização, não decoração."*

---

## PRINCÍPIO FUNDAMENTAL (INCLUIR VERBATIM NO DOCUMENTO)

> **Postura de Design:** Movimento é sinalização, não decoração.
> Se uma animação não ajuda o usuário a entender o estado do sistema, ela é descartada.
> Toda reação visual especificada aqui é consequência direta de um evento de sistema — não ambientação.

---

## ESTRUTURA OBRIGATÓRIA

### Seção 1 — Hierarquia de Urgência Visual

Tabela de níveis de sinalização:
| Nível | Nome | Uso | Duração Máxima | Interrompe o usuário? |
|---|---|---|---|---|
| **L1** | Sinalização Passiva | Estado normal, processando | ∞ (loop suave) | Nunca |
| **L2** | Sinalização Ativa | Requer atenção | Até o usuário agir | Parcialmente |
| **L3** | Sinalização de Pânico | Falha crítica, segurança | 3s + estado persistente | Sempre |

> **Regra inviolável:** Um estado L3 nunca pode ser confundido com L1 ou L2.

### Seção 2 — Matriz de Transições

Tabela mestre de todas as transições visuais:
| ID | Gatilho (Evento de Sistema) | Componente Afetado | Nível | Animação | Duração | Easing |
|---|---|---|---|---|---|---|
| T-01 | [evento SSE/WS] | [componente] | L[1/2/3] | [descrição] | [Xms] | [função] |
| T-02 | ... | ... | ... | ... | ... | ... |

Mínimo de 15 transições cobrindo:
- Início de processamento / loading
- Conclusão de processamento
- Abertura de gate/modal de aprovação
- Fechamento de gate (aprovado)
- Fechamento de gate (rejeitado)
- Erro / falha de componente
- Reconexão após queda de rede
- Scroll para novo conteúdo
- Entrada de novo item na lista/timeline
- Remoção de item
- Destaque de item relevante
- Estado de hover
- Estado de foco (acessibilidade)
- Timeout / expiração
- Sucesso de operação crítica

### Seção 3 — Especificações por Estado do Sistema

Para cada estado macroscópico do sistema:

```
#### [Estado: ex: GATE_OPEN — Aprovação Pendente]

**Gatilho:** Evento `[NOME_DO_EVENTO]` recebido

**Sequência de entrada (ordem temporal):**
```
1. [componente A] → [transformação] — Duração: [X]ms, Easing: [Y]
2. [componente B] → [transformação] — Duração: [X]ms, Delay: [Z]ms
3. [componente C] → [loop/pulsação] — Loop de [N]s por [M] ciclos
```

**CSS/código:**
```css
/* ou keyframes, ou Framer Motion, adapte ao framework */
@keyframes [nome-animacao] {
  from { [propriedade]: [valor]; }
  to   { [propriedade]: [valor]; }
}

.[classe] {
  animation: [nome] [duração] [easing] [iterações];
}
```

**Sequência de saída (ao resolver o estado):**
```
1. [reverter componente C] — Duração: [X]ms
2. [reverter componente B] — Delay: [Z]ms
3. [reverter componente A] — Duração: [X]ms
```

**Acessibilidade:**
- `aria-live`: [polite / assertive / off]
- `role`: [alert / status / region]
- Texto de anúncio para screen reader: `"[texto]"`
```

### Seção 4 — Animações de Componentes Individuais

Para cada componente com animação própria:

```
#### [NomeDoComponente]

**Entrada:**
- transform: [valor inicial] → [valor final]
- opacity: [valor inicial] → [valor final]
- Duração: [X]ms
- Easing: [função CSS]

**Saída:**
- [inverso ou diferente]

**Estado de loading/skeleton:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-border) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Regras de performance:**
- Usar apenas `transform` e `opacity` para animações (GPU composited)
- Nunca animar `width`, `height`, `top`, `left` (causa layout thrashing)
- `will-change: transform` apenas quando animação é iminente (não permanente)
```

### Seção 5 — Estados de Erro e Degradação Visual

Para cada tipo de erro, especificar a reação visual:

| Tipo de Erro | Nível | Componente Afetado | Animação | Texto de Feedback | Auto-dismiss? |
|---|---|---|---|---|---|
| [erro de rede] | L2 | [componente] | [animação] | [texto] | [Xs / nunca] |
| [erro crítico] | L3 | [componente] | [animação] | [texto] | Nunca |

### Seção 6 — Micro-interações

Para cada micro-interação relevante:
```
#### [Nome — ex: Clique em Botão de Aprovação]

**Estado default:** [visual]
**Estado hover:** [transform: scale(1.02), duration: 150ms]
**Estado active (pressionado):** [transform: scale(0.98), duration: 80ms]
**Estado disabled:** [opacity: 0.4, cursor: not-allowed]
**Estado loading:** [spinner ou substituição do label]
**Transição entre estados:** [duration: Xms, easing: Y]
```

### Seção 7 — Checklist de Acessibilidade de Movimento

- [ ] `prefers-reduced-motion` respeita preferência do OS
- [ ] Animações L3 têm anúncio `aria-live="assertive"`
- [ ] Elementos focáveis têm outline visível em foco
- [ ] Contraste de cor atende WCAG AA (4.5:1 para texto normal)
- [ ] Animações não causam risco de crise fotossensível (<3 flashes/segundo)
- [ ] Screen readers recebem texto equivalente para mudanças visuais

```css
/* Respeitar preferência do sistema — OBRIGATÓRIO */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Toda animação tem valores exatos** — nunca "animação suave", sempre "300ms cubic-bezier(0.4, 0, 0.2, 1)"
2. **Nível de urgência é obrigatório** para cada transição — L1, L2 ou L3
3. **`prefers-reduced-motion` é inegociável** — bloco CSS obrigatório no documento
4. **Apenas `transform` e `opacity`** para animações de alta frequência — regra de performance
5. **Estados de erro** devem ser especificados — a UI de falha é tão importante quanto a de sucesso
6. **Micro-interações** devem ter todos os estados: default, hover, active, disabled, loading

---

**GERE O DOCUMENTO `08-motion-grammar-and-dynamic-states.md` AGORA.**
