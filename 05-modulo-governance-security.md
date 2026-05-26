# 📦 MÓDULO 05 — Governança e Segurança
> **Cole após o MAESTRO (00-MAESTRO.md) na mesma sessão.**
> **Output esperado:** `05-governance-and-security.md`
> **Tamanho esperado:** 600–900 linhas
> **Dependência:** Gerar após 01, 02 e 03

---

## OBJETIVO DESTE DOCUMENTO

Gerar o documento `05-governance-and-security.md` do projeto.

Este documento responde: *"Quais são os vetores de ataque, como cada um é mitigado, quais operações requerem aprovação explícita e como o sistema garante integridade mesmo sob adversário ativo."*

---

## ESTRUTURA OBRIGATÓRIA

### Seção 0 — Modelo de Ameaças

Tabela ameaça → mitigação verificável:
| # | Ameaça | Vetor | Mitigação | Verificação |
|---|---|---|---|---|
| T-01 | [ameaça] | [como o atacante chega] | [mecanismo de defesa] | [como provar que funciona] |

Mínimo de 8 ameaças cobrindo:
- Injeção de comandos (shell, SQL, prompt)
- Path traversal / directory escape
- Elevação de privilégio
- Vazamento de segredos em logs/UI
- Execução sem aprovação (bypass de gate)
- Exaustão de quota / DoS econômico
- Manipulação de estado entre emissão e aprovação
- Envenenamento de configuração (environment vars, config files)

### Seção 1 — Premissa de Segurança e Modelo de Confiança

- Limite do perímetro de segurança (o que o sistema protege e o que não protege)
- O que o MVP NÃO implementa (com justificativa)
- O que o MVP tem (lista de proteções ativas)
- Roadmap de segurança para versões futuras

### Seção 2 — Modos de Aprovação / Operação

#### 2.1 Definição dos Modos
| Modo | Comportamento | Caso de Uso | Risco |
|---|---|---|---|

#### 2.2 Operações que Sempre Requerem Aprovação Manual
Independente do modo de operação:
| Categoria | Operação | Severidade | Comportamento |
|---|---|---|---|
| Destruição | [ex: deleção de arquivos] | 🔴 CRÍTICO | [ação] |
| Segredos | [ex: modificação de .env] | 🔴 CRÍTICO | [ação] |
| Dependências | [ex: alteração de package.json] | 🔴 CRÍTICO | [ação] |

#### 2.3 Protocolo de Gate / Aprovação com Guards de Consistência

Fluxo WebSocket/HTTP de aprovação (diagrama Mermaid `sequenceDiagram`)

Interface do payload de gate com campos de segurança:
```typescript
interface GatePayload {
  gateId: string;
  payload: ApprovalData;
  // Campos de segurança:
  stateHash: string;    // Hash do estado em T
  resourceHash: string; // Hash dos recursos em T
  epochId: number;      // Fencing token
  hmac: string;         // HMAC detecta tampering
}
```

Validação no momento da resolução:
```typescript
function validateGateConsistency(gate: GatePayload, serverState: ServerState): ValidationResult {
  // 1. Epoch mismatch → gate de ciclo anterior
  // 2. HMAC inválido → tampering detectado
  // 3. stateHash diverge → estado mutou entre T e T+Δ
  // 4. resourceHash diverge → recursos alterados externamente
}
```

### Seção 3 — Política de Redação de Segredos

Padrões de detecção de segredos:
```typescript
const SECRET_PATTERNS = [
  // API keys, tokens, passwords — adapte ao projeto
  /[A-Z_]+_KEY=\S+/gi,
  /Authorization:\s*Bearer\s+\S+/gi,
  /password['":s]+\S+/gi,
  // ... adicionar padrões específicos do projeto
];
```

Pontos de aplicação obrigatórios:
- [ponto 1]: antes de persistir no banco
- [ponto 2]: antes de emitir via SSE/WS
- [ponto 3]: antes de logar no stdout/arquivo

### Seção 4 — Sandbox e Isolamento de Execução

#### 4.1 Modo Local (desenvolvimento)
- Proteções ativas no modo local
- Limitações do modo local

#### 4.2 Modo Containerizado (staging/produção)
```yaml
# docker-compose.security.yml
# Configurações mínimas de segurança
services:
  [servico]:
    read_only: true
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    mem_limit: [valor]
    network_mode: [none/bridge]
```

#### 4.3 Shell e Environment Hardening

**Camada 1: Sanitização de Ambiente**
```typescript
// Allowlist de variáveis permitidas
const ENV_ALLOWLIST = ['PATH', 'HOME', 'USER', 'NODE_ENV'];
// Blocklist de variáveis perigosas
const ENV_BLOCKLIST = ['BASH_ENV', 'LD_PRELOAD', 'IFS', ...];
```

**Camada 2: Validação de Path Traversal**
```typescript
function validatePathWithinRoot(path: string, authorizedRoot: string): string {
  const resolved = path.resolve(path);
  if (!resolved.startsWith(authorizedRoot)) {
    throw new SecurityError(`Path traversal: '${resolved}'`);
  }
  return resolved;
}
```

**Camada 3: Allowlist Hierárquica de Comandos**
Tabela de comandos permitidos por binário:
| Binário | Subcomandos/Operações Permitidas | Bloqueados |
|---|---|---|

**Wrapper de Execução Segura (se aplicável):**
```typescript
// secure-[command]-wrapper.[ts/py] — [NOME DO PROJETO]
// Defesa em profundidade contra CVEs conhecidos:
// [listar CVEs relevantes ao projeto]

interface SecureCommandInput {
  operation: string;  // deve estar na allowlist
  args: string[];     // validados contra schema Zod
  workingDir: string; // deve estar dentro do root autorizado
}

async function secureExecute(input: SecureCommandInput): Promise<CommandOutput> {
  // Camada 0: Schema Zod
  // Camada 1: Resolve real path (dereference symlinks)
  // Camada 2: Valida args contra allowlist
  // Camada 3: Sanitiza environment
  // Camada 4: Executa sem shell intermediário (shell: false)
}
```

**Tabela de Vetores de Ataque Cobertos:**
| Vetor | Versão Anterior | Versão Atual | Mecanismo de Bloqueio |
|---|---|---|---|

### Seção 5 — Integridade de Configuração

Como o sistema detecta alterações maliciosas em arquivos de configuração:
- Hash SHA-256 de arquivos críticos no boot
- Hot-reload seguro com re-validação
- Audit trail de mudanças

```typescript
async function auditConfigIntegrity(configId: string, content: string, previousHash?: string): Promise<void> {
  const newHash = crypto.createHash('sha256').update(content).digest('hex');
  // Persistir no AuditLog
  // Se core config mudou: emitir alerta de segurança
}
```

### Seção 6 — Gestão de Credenciais e API Keys

- Como credenciais são armazenadas (nunca em texto plano no código)
- Rotação de credenciais
- LocalKeyVault (se implementado)
- Estratégia para ambientes locais vs produção

### Seção 7 — Controles de Custo (se aplicável)

```typescript
interface CostGuardrailConfig {
  dailyBudgetUsd: number;
  perTaskBudget: number;
  extendedBudgetRequiresApproval: boolean;
  roleBudgetRatio?: Record<string, number>; // por papel/componente
}
```

### Seção 8 — Checklist de Imunidade Arquitetural por Perfil

#### Dev Júnior — Verificações de Corretude de Configuração
- [ ] [verificação 1]
- [ ] [verificação 2]

#### Dev Sênior / Tech Lead — Contratos de Engenharia
- [ ] [verificação técnica 1]
- [ ] [verificação técnica 2]

#### DevOps / SRE — Contratos de Resiliência Operacional
- [ ] [verificação operacional 1]
- [ ] [verificação operacional 2]

---

## REGRAS ESPECÍFICAS DESTE DOCUMENTO

1. **Toda ameaça deve ter verificação** — sem "confie em nós", sempre uma forma de provar que funciona
2. **CVEs relevantes devem ser citados** — pesquise CVEs relacionados à stack do projeto
3. **Código de segurança deve ser real** — não pseudocódigo, exceto onde o projeto ainda não implementou
4. **Allowlists são mais seguras que blocklists** — sempre preferir allowlist; blocklist é complementar
5. **O wrapper de execução segura** deve cobrir TODOS os pontos de saída para o OS — nenhum `exec()` nu
6. **Checklist por perfil** deve ser acionável — cada item deve poder ser verificado por alguém sem contexto

---

**GERE O DOCUMENTO `05-governance-and-security.md` AGORA.**
