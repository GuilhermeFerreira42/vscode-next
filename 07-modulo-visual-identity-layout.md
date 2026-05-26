# 📦 MÓDULO 07 — Identidade Visual e Especificações de Layout
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `07-visual-identity-and-layout-specs.md`
> **Tamanho esperado:** 500–800 linhas
> **Aplicabilidade:** Gerar somente se o projeto tiver interface visual (web, desktop, mobile)
> **Dependência:** Gerar após 01 e 02

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `07-visual-identity-and-layout-specs.md` do projeto.

Este documento responde: *"Como a interface deve parecer, como deve se comportar e quais são os contratos técnicos que garantem que a UI não quebre durante uso intenso."*

---

## ESTRUTURA OBRIGATÓRIA

### Seção 1 — Princípios de Design

- Filosofia de design em 3–5 princípios nomeados
- O que a interface prioriza acima de tudo (ex: "clareza sobre beleza", "estado do sistema sempre visível")
- O que a interface NUNCA faz (anti-padrões proibidos)

### Seção 2 — Design System — Tokens e Variáveis

#### 2.1 Paleta de Cores
```css
:root {
  /* Cores principais */
  --color-primary:      [hex]; /* uso: botões, links, foco */
  --color-secondary:    [hex]; /* uso: elementos secundários */
  --color-background:   [hex]; /* uso: fundo principal */
  --color-surface:      [hex]; /* uso: cards, painéis */
  --color-border:       [hex]; /* uso: bordas e divisores */

  /* Cores semânticas */
  --color-success:      [hex]; /* uso: confirmação, aprovação */
  --color-warning:      [hex]; /* uso: atenção, gate pendente */
  --color-error:        [hex]; /* uso: falha, rejeição */
  --color-info:         [hex]; /* uso: informação neutra */

  /* Cores de texto */
  --color-text-primary:   [hex];
  --color-text-secondary: [hex];
  --color-text-disabled:  [hex];
}
```

#### 2.2 Tipografia
```css
:root {
  /* Escala tipográfica */
  --font-family-mono: [ex: 'JetBrains Mono', monospace];
  --font-family-sans: [ex: 'Inter', system-ui, sans-serif];

  --font-size-xs:   [valor]; /* uso: labels, badges */
  --font-size-sm:   [valor]; /* uso: texto de suporte */
  --font-size-base: [valor]; /* uso: corpo de texto */
  --font-size-lg:   [valor]; /* uso: subtítulos */
  --font-size-xl:   [valor]; /* uso: títulos de seção */
  --font-size-2xl:  [valor]; /* uso: títulos de página */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;
}
```

#### 2.3 Espaçamento e Layout
```css
:root {
  /* Grid de espaçamento (base 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border radius */
  --radius-sm: [valor];
  --radius-md: [valor];
  --radius-lg: [valor];
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: [valor];
  --shadow-md: [valor];
  --shadow-lg: [valor];
}
```

#### 2.4 Tokens de Animação (ver Módulo 08 para detalhes)
```css
:root {
  --duration-instant:  50ms;
  --duration-fast:    150ms;
  --duration-normal:  300ms;
  --duration-slow:    500ms;

  --easing-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --easing-spring:     cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Seção 3 — Layout Principal

#### 3.1 Estrutura de Colunas / Painéis
```
[Diagrama ASCII ou Mermaid do layout principal]

┌─────────────────────────────────────────────┐
│  [Coluna 1 — N%]  │ [Coluna 2 — N%] │ [N%] │
│  [descrição]      │ [descrição]      │      │
│                   │                  │      │
└─────────────────────────────────────────────┘
```

Para cada coluna/painel:
```
#### [Nome do Painel]
**Dimensões:** [largura × comportamento responsivo]
**Conteúdo:** [o que renderiza]
**Scroll:** [sim / não / virtual]
**Overflow:** [comportamento]
**Estado vazio:** [o que mostrar quando não há conteúdo]
```

#### 3.2 Breakpoints Responsivos (se aplicável)
| Breakpoint | Largura | Comportamento |
|---|---|---|

### Seção 4 — Componentes Críticos

Para cada componente UI de alta complexidade:

```
#### [N.N] Componente: [NomeDoComponente]

**Responsabilidade:** [o que renderiza e por que é complexo]
**Framework:** [React/Vue/Svelte + biblioteca de UI]
**Estado interno:** [o que o componente gerencia localmente]

**Props interface:**
```typescript
interface [NomeDoComponente]Props {
  [prop]: [tipo]; // [descrição]
}
```

**Ciclo de vida crítico:**
- `onMount`: [o que acontece ao montar]
- `onUnmount`: [cleanup obrigatório]
- `onUpdate`: [quando e como o componente reage a mudanças]

**Armadilhas conhecidas:**
- [gotcha 1]: [como evitar]
- [gotcha 2]: [como evitar]

**Performance:**
- [consideração de performance 1]
- Memoização: [sim/não — por quê]
```

Componentes obrigatórios (adapte ao projeto):
- Componente de editor / área de conteúdo principal
- Componente de painel lateral / timeline
- Componente de card de aprovação / modal
- Componente de input principal
- Componente de terminal / output (se houver)

### Seção 5 — Editor ou Componente Central (se houver editor de código/texto)

Se o projeto usa CodeMirror, Monaco, ProseMirror, TipTap ou similar:

#### 5.1 Configuração Base
```typescript
// src/components/Editor/[EditorComponent].[tsx/vue]
// Configuração mínima funcional
const editorConfig = {
  // extensões obrigatórias
  // configurações de tema
  // event listeners
};
```

#### 5.2 Widgets e Decorações Customizadas (se aplicável)
```typescript
// [NomeWidget] — [propósito]
// CONTRATO: eq() determina se o DOM é reutilizado ou recriado
// eq() === true  → reutiliza DOM (zero re-render)
// eq() === false → chama updateDOM() ou toDOM()
class [NomeWidget] extends WidgetType {
  eq(other: [NomeWidget]): boolean {
    // INCLUIR no eq(): campos que afetam visual
    // EXCLUIR do eq(): posição (gerida pelo editor)
    return this.campo1 === other.campo1 && this.campo2 === other.campo2;
  }

  toDOM(): HTMLElement { /* criação inicial */ }
  updateDOM(dom: HTMLElement): boolean { /* atualização incremental */ }
  destroy(dom: HTMLElement): void { /* cleanup obrigatório */ }
}
```

#### 5.3 Cross-Origin Isolation (se usar SharedArrayBuffer)
Headers obrigatórios no servidor:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Fallback quando indisponível:
- [o que o editor faz sem SharedArrayBuffer]
- [mensagem de degradação para o usuário]

### Seção 6 — Streaming de Conteúdo / Atualizações em Alta Frequência

Se o sistema recebe muitos eventos em sequência rápida:

```typescript
// RAFBufferedConsumer — previne setState fora do ciclo de animação
// NUNCA chamar setState diretamente no handler de evento/mensagem
class RAFBufferedConsumer {
  private buffer: Event[] = [];
  private rafPending = false;

  onEvent(event: Event): void {
    this.buffer.push(event);
    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush(): void {
    // Processar em lotes de 100 para não bloquear o frame
    const chunk = this.buffer.splice(0, 100);
    this.store.applyBatch(chunk);
    if (this.buffer.length > 0) {
      requestAnimationFrame(() => this.flush());
    } else {
      this.rafPending = false;
    }
  }
}
```

### Seção 7 — Checklist de Implementação Frontend

- [ ] Design tokens implementados como variáveis CSS/JS
- [ ] Componentes críticos com cleanup em `onUnmount`
- [ ] Streaming via RAFBuffer (não setState direto)
- [ ] `eq()` correto em todos os widgets do editor
- [ ] Headers COOP/COEP configurados (se SharedArrayBuffer)
- [ ] Fallback gracioso para recursos indisponíveis
- [ ] Estado vazio definido para todos os componentes
- [ ] Breakpoints responsivos testados

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **CSS variables são obrigatórias** — nenhum valor hardcoded em componentes
2. **`eq()` de widgets do editor é crítico** — sem ele, loops de re-render travam o cursor
3. **Cleanup em onUnmount é inegociável** — todo listener, timer, subscription deve ser removido
4. **RAFBuffer é obrigatório** para qualquer UI que receba >10 eventos/segundo
5. **Estado vazio deve ser especificado** — "componente sem dados" não é undefined, é UI definida

---

**GERE O DOCUMENTO `07-visual-identity-and-layout-specs.md` AGORA.**
