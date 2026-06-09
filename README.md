# GreenForge v1.0 — Guia de Arquitetura e Implementação

Seja bem-vindo ao repositório de design do **GreenForge**, a próxima geração de orquestração para o Gemini CLI.

## 🗂️ Mapa de Documentação

| Arquivo | Título | Descrição |
|---|---|---|
| [00-MAESTRO.md](./GREENFORGE_MAESTRO.md) | Maestro | Contexto global e regras do projeto. |
| [01-vision.md](./01-vision-and-architecture.md) | Visão e Arquitetura | O "Porquê" e o "Como" de alto nível. |
| [02-requirements.md](./02-functional-requirements.md) | Requisitos | O que o sistema deve fazer (RF/RNF). |
| [03-technical.md](./03-technical-spec-and-data.md) | Especificação Técnica | Schemas SQLite, Interfaces e Algoritmos. |
| [04-ops.md](./04-operational-playbooks.md) | Playbooks Operacionais | Runbooks, Incidentes e Troubleshooting. |
| [05-governance.md](./05-governance-and-security.md) | Governança e Segurança | Modelo de Ameaças, Gates e Sandbox. |
| [06-extensibility.md](./06-api-and-extensibility.md) | Extensibilidade | Contratos de Subagentes e MCP. |
| [09-hardening.md](./09-hardening-deterministic-contracts.md) | Contratos de Hardening | Segurança, Atomicidade e Resiliência. |
| [CHANGELOG_HARDENING.md](./CHANGELOG_HARDENING.md) | Hardening Log | Histórico de vulnerabilidades mitigadas. |
| [INTEGRACAO_STATUS.md](./INTEGRACAO_STATUS.md) | Status de Integração | Mapa de completude da documentação. |

## 🎨 UI/UX (N/A)
Como o GreenForge é uma extensão CLI pura, os módulos de Identidade Visual (07) e Gramática de Movimento (08) não são aplicáveis a este projeto.

## 🚀 Próximos Passos
1. **MVP**: Implementar o `WorktreeManager` conforme o documento 03.
2. **Integração**: Configurar o `IntentionRouter` usando a API do Gemini Flash.
3. **Validação**: Aplicar os testes de TDD descritos no documento 01.

---
*Documentação gerada seguindo o padrão Verdant AI & Kit Maestro v1.0.*
