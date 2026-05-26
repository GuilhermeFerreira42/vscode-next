# 📦 MÓDULO README — Visão Geral Navegável
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `README.md`
> **Tamanho esperado:** 150–250 linhas
> **Dependência:** Gerar ÚLTIMO — após todos os outros documentos estarem prontos
> **Audiência:** Todo mundo — é o primeiro arquivo que qualquer pessoa abre

---

## OBJETIVO DESTE DOCUMENTO

Gerar o `README.md` do projeto.

Este documento é a **porta de entrada** para toda a documentação. Ele não repete conteúdo dos outros arquivos — ele **navega** por eles com contexto suficiente para o leitor saber onde ir.

---

## ESTRUTURA OBRIGATÓRIA

### Cabeçalho

```markdown
# [NOME DO PROJETO] — Documentação v[X.Y]

> **Status:** ✅ | **Versão:** X.Y | **Data:** YYYY-MM-DD
> **Arquitetura:** [descrição em 1 linha da arquitetura]

> **vX.Y:** [lista das mudanças mais relevantes desta versão em bullets curtos]
```

### Seção 1 — Introdução (máx 3 parágrafos)
- O que é o sistema (sem repetir o 01 inteiro)
- Por que existe (problema que resolve)
- Para quem é (audiência principal)

### Seção 2 — Mapa Cognitivo / Protocolo Central

Se o sistema tem um protocolo ou conceito central que governa tudo:
```markdown
## 🟦 Mapa Cognitivo — [Nome do Protocolo/Conceito]

[Descrição do protocolo em 1 parágrafo]

### Pilares:
1. **[Pilar 1]:** [descrição em 1 linha]
2. **[Pilar 2]:** [descrição em 1 linha]
3. **[Pilar 3]:** [descrição em 1 linha]
```

### Seção 3 — Estrutura dos Documentos

Tabela navegável:
```markdown
| Arquivo | Conteúdo | Audiência |
|---|---|---|
| [`01-vision-and-architecture.md`](./01-vision-and-architecture.md) | [1 linha do que cobre] | [audiência] |
| [`02-functional-requirements.md`](./02-functional-requirements.md) | [1 linha] | [audiência] |
| ... | ... | ... |
```

### Seção 4 — Decisões Arquiteturais Centrais

Tabela comparativa do antes e depois (ou manual vs sistema):
```markdown
| Dimensão | Antes / Manual | [NOME] vX |
|---|---|---|
| [dimensão 1] | [como era] | [como é agora] |
```

### Seção 5 — Stack Tecnológica

Blocos de código organizados por camada:
```
FRONTEND (se houver)
  [tecnologias e versões]

BACKEND
  [tecnologias e versões]

INFRAESTRUTURA
  [tecnologias e versões]
```

### Seção 6 — Quick Start

```bash
# Pré-requisitos
[tecnologia] >= [versão]
[tecnologia] >= [versão]

# Instalação
git clone [url-placeholder]
cd [nome-do-projeto]
cp .env.example .env
# Editar .env com suas credenciais

# Instalar dependências
[comando]

# Iniciar
[comando]

# Acessar
# [URL ou instrução de acesso]
```

### Seção 7 — Glossário Central

Tabela com todos os termos-chave do projeto:
```markdown
| Termo | Definição |
|---|---|
| [Termo A] | [Definição técnica precisa em 1–2 linhas] |
```

Incluir todos os termos que aparecem nos outros documentos e que um novo leitor não conheceria.

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Não repetir conteúdo** — o README navega, não duplica
2. **Links relativos** — todos os links para outros docs devem ser relativos (`./01-...`)
3. **Quick Start deve funcionar de verdade** — testar mentalmente o passo a passo
4. **Glossário deve ser exaustivo** — qualquer jargão técnico ou termo de domínio do projeto
5. **Máximo de 250 linhas** — se ficar maior, está duplicando conteúdo de outros docs

---

**GERE O DOCUMENTO `README.md` AGORA.**
