# GreenForge — 09: Contratos Determinísticos de Engenharia

> **Status:** ✅ | **Versão:** 1.0.0 | **Data:** 2026-06-08
> **Referências:** POSIX Atomic Rename, Zod Schema Validation, Verdant AI Hardening Standards.

### 📋 Changelog v0.0 → v1.0
| Categoria | Mudança | Status |
|---|---|---|
| Hardening | Definição de Contratos de Atomicidade e Segurança | ✅ |
| Segurança | Protocolo de Resolução de Path Seguro | ✅ |

---

## 1. Princípio Fundamental
> **Propósito:** Eliminar toda ambiguidade de implementação remanescente.
> Este documento define os contratos invioláveis de "Safety-First" do GreenForge.

---

## 2. Contratos de Atomicidade de Arquivo

### 2.1 Escrita Atômica (Pattern: Temp-Sync-Rename)
O GreenForge DEVE usar este padrão para salvar planos e arquivos de estado para evitar arquivos corrompidos (0 bytes) em caso de queda de energia ou SIGKILL.

```typescript
async function atomicWrite(targetPath: string, content: string): Promise<void> {
  const tempPath = `${targetPath}.tmp.${Date.now()}`;
  
  // 1. Escrever no temporário
  await fs.writeFile(tempPath, content, 'utf8');
  
  // 2. Flush para o hardware
  const handle = await fs.open(tempPath, 'r+');
  await handle.sync();
  await handle.close();
  
  // 3. Rename atômico (Garantido pelo kernel POSIX/Windows)
  await fs.rename(tempPath, targetPath);
}
```

---

## 3. Contratos de Segurança e Isolamento

### 3.1 Resolução de Path Seguro (Anti-Path-Traversal)
O GreenForge opera em múltiplos diretórios (main e worktrees). É crítico que um agente nunca acesse arquivos fora do diretório da tarefa.

```typescript
async function safeResolve(inputPath: string, allowedRoot: string): Promise<string> {
  // 1. Resolver symlinks e normalizar
  const absolutePath = path.resolve(allowedRoot, inputPath);
  const realPath = await fs.realpath(absolutePath);
  
  // 2. Validar prefixo
  if (!realPath.startsWith(allowedRoot)) {
    throw new SecurityError(`Path Traversal Detectado: ${realPath} está fora de ${allowedRoot}`);
  }
  
  return realPath;
}
```

### 3.2 Validação de Intenção com Fallback Seguro
Se o `IntentionRouter` falhar ou atingir timeout, o contrato padrão é: **Negar Tarefa**.
- **Comportamento**: Responder como `NORMAL_CHAT`.
- **Justificativa**: É preferível que o usuário tenha que pedir novamente do que o sistema iniciar um processo pesado de orquestração por erro de parsing.

---

## 4. Contrato de Recuperação de Estado (Boot Reconciler)

Ao iniciar, o GreenForge DEVE executar a reconciliação determinística:

| Condição de Disco | Estado no DB | Ação Corretiva |
|---|---|---|
| Worktree existe | PENDING | Remover Worktree (Orfão) |
| Worktree não existe | BUILDING | Marcar Tarefa como FAILED |
| Arquivo .tmp presente | N/A | Deletar .tmp (Escrita interrompida) |

---

## 5. Anti-Padrões Proibidos no GreenForge

| Anti-Padrão | Por Que? | Alternativa |
|---|---|---|
| `git checkout` na main | Risco de conflito/sujeira | Usar apenas `git worktree` |
| `rm -rf` sem validação | Risco de deleção acidental | Validação de prefixo via `safeResolve` |
| Passar `process.env` raw | Vazamento de segredos | `sanitizeEnv(process.env)` |

---

## 6. Rastreabilidade
→ Este documento referencia: `03-technical-spec-and-data.md`
→ Este documento é referenciado por: `README.md` (Checklist de implementação)
