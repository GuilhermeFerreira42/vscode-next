# 🎼 COMANDO MAESTRO — GreenForge v1.0
> **Status:** ✅ | **Versão:** 1.0.0-alpha | **Data:** 2026-06-08
> **Projeto:** GreenForge
> **Descrição:** Extensão de orquestração avançada para Gemini CLI baseada nos princípios do Verdant AI.

---

## BLOCO DE CONTEXTO DO PROJETO

```
PROJETO: GreenForge
VERSÃO ATUAL: 1.0.0-alpha
DATA: 2026-06-08

DESCRIÇÃO EM 1 FRASE: Camada de orquestração inteligente para Gemini CLI que automatiza o ciclo Plan-Code-Verify via Git Worktrees isolados.

STACK TECNOLÓGICA:
  Frontend: N/A (CLI Extension)
  Backend: Node.js (v20+) + Gemini CLI Extension API
  Banco de Dados: SQLite (WAL Mode) para persistência de estado de tarefas
  Comunicação: Extension API Hooks + MCP (Model Context Protocol)
  Infraestrutura: Git (Worktrees obrigatórios)
  Testes: Node.js Test Runner / Jest (TDD Approach)
  Outros: Gemini 1.5 Flash (Router), Gemini 1.5 Pro (Planner)

PRD DE REFERÊNCIA: Sim (extraído da tarefa inicial e pesquisa Verdant AI)
ARQUIVOS DO PRD DISPONÍVEIS: Sim - Dossiê de pesquisa e requisitos de tarefa.

ESTADO DA IMPLEMENTAÇÃO:
  [X] Projeto novo — nenhum código ainda (apenas design documental)
  [ ] Código parcial — descreva o que existe: ___
  [ ] Código completo — disponível para leitura

RESTRIÇÕES CONHECIDAS: 
  - Deve rodar como extensão do Gemini CLI.
  - Uso obrigatório de Git Worktrees para isolamento.
  - Proibido reutilizar código legado (exceto conceitos de SQLite/Segurança).
```

---

## DEPENDÊNCIAS DE DOCUMENTAÇÃO
→ Este documento referencia: `doc/00-MAESTRO.md`
→ Este documento é referenciado por: `01-vision-and-architecture.md`, `02-functional-requirements.md`, `03-technical-spec-and-data.md`
