# GreenForge NEXUS v2.3 — Task List

## Camada 1 — Tipos Compartilhados
- [ ] GF-001a: Modificar `src/shared/api.ts` — adicionar `"greenforge"` ao union type + campos de config
- [ ] GF-001b: Modificar `src/shared/ExtensionMessage.ts` — adicionar tipos de ask/say para Gates HITL

## Camada 2 — Motor de Debate (Arquivos Novos)
- [ ] GF-002: Criar `src/core/api/greenforge/RolePrompts.ts`
- [ ] GF-003: Criar `src/core/api/greenforge/AgentFactory.ts`
- [ ] GF-004: Criar `src/core/api/greenforge/DebateRound.ts`
- [ ] GF-005: Criar `src/core/api/greenforge/GateManager.ts`
- [ ] GF-005b: Criar `src/core/api/greenforge/GreenForgeOrchestrator.ts` (implementa ApiHandler)

## Camada 3 — Integração no Loop Principal
- [ ] GF-006: Modificar `src/core/api/index.ts` — adicionar `case "greenforge"`
- [ ] GF-007: Modificar `src/core/task/index.ts` — método `orchestrateGreenForgeDebate()`

## Camada 4 — Provider e UI
- [ ] GF-008a: Modificar `src/shared/providers/providers.json`
- [ ] GF-008b: Criar `webview-ui/src/components/settings/providers/GreenForgeProvider.tsx`
- [ ] GF-008c: Registrar `GreenForgeProvider` no index de providers da webview-ui

## Verificação
- [ ] GF-009: Compilar TypeScript sem erros (`npx tsc --noEmit`)
- [ ] GF-010: Verificar que testes existentes não quebram
