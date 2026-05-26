# 📦 MÓDULO INTEGRACAO_STATUS — Status de Integração da Documentação
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `INTEGRACAO_STATUS.md`
> **Tamanho esperado:** 150–250 linhas
> **Aplicabilidade:** Gerar quando a documentação passa por uma integração grande (ex: múltiplas vulns, migração de versão)
> **Dependência:** Gerar após todos os outros documentos

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `INTEGRACAO_STATUS.md` do projeto.

Este documento é o **mapa de completude** da documentação. Responde:
*"Todos os contratos técnicos, decisões arquiteturais e mitigações de segurança foram documentados em todos os lugares corretos?"*

---

## ESTRUTURA OBRIGATÓRIA

### Cabeçalho

```markdown
# 📋 Status de Integração [NOME DO PROJETO] v[X.Y] — Completude Total

**Data:** YYYY-MM-DD
**Sessão:** [contexto — ex: "Integração das N Vulnerabilidades Auditadas"]
**Status:** ✅ COMPLETO / 🔄 EM PROGRESSO / ❌ BLOQUEADO
```

### Seção 1 — Sumário de Integrações

Para cada mudança major integrada:

```markdown
### [Mudança/Feature/Vulnerabilidade N]: [Título]

| Aspecto | Componente | Localização | Status |
|---|---|---|---|
| Contexto Arquitetural | [ADR ou Seção] | [arquivo#âncora] | ✅ |
| Especificação Técnica | [Seção] | [arquivo#âncora] | ✅ |
| Documentação Detalhada | [Seção] | [arquivo#âncora] | ✅ |

**Mecanismo em 2 linhas:** [descrição técnica do que foi integrado]

**Validação:** [como confirmar que a integração está correta]
```

### Seção 2 — Cobertura por Documento

Para cada documento do kit:

```markdown
### Documento [NN]: [Título]

```
✅ Versão: X.X → Y.Y (data atualizada)
✅ [Mudança 1 integrada — linha ~NNN]
✅ [Mudança 2 integrada — linha ~NNN]
❌ [Mudança 3 — NÃO integrada — motivo]
```
```

### Seção 3 — Mapa de Referências Cruzadas

Tabela consolidada:
```markdown
| Mudança | Doc 01 | Doc 03 | Doc 05 | Doc 09 | CHANGELOG |
|---|---|---|---|---|---|
| [mudança 1] | ADR-NN | §N.N | §N.N | §N | ✅ linha ~N |
```

### Seção 4 — Checklist de Completude

```markdown
### Documentação Base
- [x] 01-vision-and-architecture.md — versão atualizada, ADRs completos
- [x] 02-functional-requirements.md — RFs atualizados
- [x] 03-technical-spec-and-data.md — specs técnicas integradas
- [x] 04-operational-playbooks.md — runbooks atualizados
- [x] 05-governance-and-security.md — modelo de ameaças atualizado
- [ ] 06-api-and-extensibility.md — [pendente / não aplicável]
- [ ] 07-visual-identity-and-layout-specs.md — [pendente / não aplicável]
- [ ] 08-motion-grammar.md — [pendente / não aplicável]
- [x] 09-hardening-deterministic-contracts.md — contratos atualizados

### Integrações de Mudanças
- [x] Mudança #1: [título] — [todos os artefatos]
- [x] Mudança #2: [título] — [todos os artefatos]

### Elementos Técnicos
- [x] Interfaces TypeScript para cada novo mecanismo
- [x] Algoritmos/pseudocódigo para detecção/validação
- [x] State machines e tabelas de decisão
- [x] Exemplos de input/output bloqueados e permitidos
- [x] Análise de performance impact

### Validação e Testes
- [x] Estratégia de validação para cada mudança
- [x] Casos de teste específicos mapeados
- [x] Dependências novas listadas
```

### Seção 5 — Próximas Etapas Recomendadas

```markdown
## 5. Próximas Etapas

### Implementação (não-documentação)
1. **[Componente A]** — [ação específica de implementação]
2. **[Componente B]** — [ação específica]

### Testes de Integração
- [ ] [tipo de teste]: [o que testar]
- [ ] [tipo de teste]: [o que testar]

### Documentação Complementar
- [ ] README atualizado com v[X.Y] highlights
- [ ] DEPLOYMENT.md com instruções de ativação de novas features
- [ ] SECURITY_POLICY.md atualizado (se aplicável)
```

### Seção 6 — Referências e Links

```markdown
## 6. Referências

**Documentos Fonte:**
- [fonte 1] — [o que gerou as mudanças]
- [fonte 2]

**Documentos Modificados:**
- [arquivo 1](./arquivo1.md)
- [arquivo 2](./arquivo2.md)

---
**Status Final:** ✅ INTEGRAÇÃO COMPLETA E VALIDADA
[ou]
**Status Final:** 🔄 EM PROGRESSO — [N de M itens concluídos]
```

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Referências de linha devem ser aproximadas** — use `~NNN` quando não puder ser exato
2. **Links relativos sempre** — `[arquivo](./arquivo.md)` nunca URL absoluta
3. **Status explícito para cada item** — ✅ concluído, ❌ pendente, ⚠️ parcial
4. **Próximas etapas devem ser acionáveis** — não "melhorar segurança", mas "implementar `bootReconciler()` em `src/core/`"
5. **Este documento é vivo** — deve ser atualizado sempre que um novo documento do kit for gerado ou revisado

---

**GERE O DOCUMENTO `INTEGRACAO_STATUS.md` AGORA.**
