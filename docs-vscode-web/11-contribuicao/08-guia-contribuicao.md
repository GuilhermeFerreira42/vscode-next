# Guia de Contribuição - BSC Code

## Como Contribuir

Obrigado por seu interesse em contribuir para o BSC Code! Este guia vai ajudá-lo a começar.

### Código de Conduta

Este projeto adota um Código de Conduta para garantir um ambiente acolhedor e respeitoso para todos os contribuidores. Por favor, leia e siga o [Código de Conduta](CODE_OF_CONDUCT.md).

---

## Primeiros Passos

### 1. Fork do Repositório

1. Clique no botão "Fork" no GitHub
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/SEU_USERNAME/bsc-code.git
   cd bsc-code
   ```

3. Adicione o repositório original como remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/bsc-code.git
   git remote -v
   ```

### 2. Setup do Ambiente de Desenvolvimento

#### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Docker 24+
- Git

#### Instalação

```bash
# Instalar dependências Python
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements-dev.txt

# Instalar dependências frontend
cd frontend
npm install

# Configurar pre-commit hooks
pre-commit install

# Rodar ambiente local
docker-compose up -d
```

### 3. Entendendo o Workflow

```
1. Criar branch da develop
2. Fazer commits na branch
3. Atualizar com mudanças da develop
4. Subir para seu fork
5. Abrir Pull Request
6. Code review
7. Merge após aprovação
```

---

## Tipos de Contribuição

### 🐛 Reportar Bugs

Bugs são trackeados como [GitHub Issues](https://github.com/.../issues).

**Antes de reportar:**
- [ ] Verifique se o bug já foi reportado
- [ ] Teste na última versão da develop
- [ ] Reúna informações suficientes para reproduzir

**Template de Bug Report:**

```markdown
**Descrição**
Uma descrição clara do bug.

**Para Reproduzir**
Passos para reproduzir:
1. Ir para '...'
2. Clicar em '....'
3. Scroll down to '....'
4. Ver erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Version: [e.g. v1.0.0]

**Contexto Adicional**
Adicione qualquer outro contexto sobre o problema.
```

### ✨ Sugerir Features

Feature requests também são feitos via GitHub Issues.

**Template de Feature Request:**

```markdown
**Problema Relacionado**
Sua feature request é relacionada a um problema? 
Descreva qual: ex. "Sempre fico frustrado quando..."

**Solução Desejada**
Uma descrição clara do que você quer que aconteça.

**Alternativas Consideradas**
Uma descrição de alternativas ou soluções que você considerou.

**Contexto Adicional**
Adicione qualquer outro contexto, screenshots, mockups, etc.
```

### 🔧 Contribuir com Código

#### Escolhendo uma Issue

- Procure por issues com labels `good first issue` ou `help wanted`
- Comente na issue dizendo que vai trabalhar nela
- Aguarde confirmação de um mantenedor

#### Criando sua Branch

```bash
# Sempre branch da develop
git checkout develop
git pull upstream develop

# Criar branch com nome descritivo
git checkout -b feat/issue-123-add-mfa-support
# ou
git checkout -b fix/issue-456-prevent-container-leak
```

**Convenção de nomes:**
- `feat/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `refactor/` - Refatoração
- `test/` - Tests
- `chore/` - Manutenção

#### Fazendo Commits

```bash
# Fazer mudanças
git add .

# Commit seguindo convenção
git commit -m "feat(auth): add TOTP MFA support

- Implement TOTP generation and verification
- Add QR code display for authenticator apps
- Add backup codes generation
- Update login flow to support MFA

Fixes #123"

# Push para seu fork
git push origin feat/issue-123-add-mfa-support
```

### 📝 Contribuir com Documentação

Contribuições de documentação são sempre bem-vindas!

**Tipos de contribuição:**
- Corrigir erros de português/inglês
- Melhorar clareza de explicações
- Adicionar exemplos
- Traduzir documentação
- Criar tutoriais

**Branch para docs:**
```bash
git checkout -b docs/improve-auth-guide
```

### 🧪 Contribuir com Testes

Tests são críticos para qualidade do projeto.

**Áreas que precisam de tests:**
- Novas features sem cobertura
- Edge cases não testados
- Performance regression tests
- Accessibility tests

**Rodar tests:**
```bash
# Unit tests
pytest tests/unit -v --cov=src

# Integration tests
pytest tests/integration -v

# E2E tests
cd frontend && npm run test:e2e

# Performance tests
locust -f tests/performance/locustfile.py
```

---

## Processo de Pull Request

### 1. Antes de Abrir o PR

- [ ] Code está seguindo style guide
- [ ] Tests adicionados/atualizados
- [ ] Linting passando (`make lint`)
- [ ] Documentação atualizada
- [ ] Changelog entry adicionado (se aplicável)

### 2. Abrindo o PR

1. Vá para seu fork no GitHub
2. Clique em "New Pull Request"
3. Base: `develop` (do repo original)
4. Compare: sua branch
5. Preencher template do PR

### 3. Template de PR

```markdown
## Descrição
<!-- Descreva suas mudanças -->

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige uma issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação
- [ ] Refatoração

## Checklist
- [ ] Meu código segue o style guide do projeto
- [ ] Adicionei testes que provam que meu código funciona
- [ ] Tests existentes estão passando localmente
- [ ] Linting está passando
- [ ] Documentação atualizada conforme necessário

## Screenshots (se aplicável)
<!-- Adicione screenshots se houver mudança de UI -->

## Issues Relacionadas
<!-- Link para issues relacionadas -->
Fixes #123
Related to #456

## Notas Adicionais
<!-- Qualquer informação adicional que os reviewers devem saber -->
```

### 4. Code Review

- Mantenedores vão revisar seu código
- Seja receptivo a feedback
- Faça mudanças solicitadas
- Mantenha discussão profissional

### 5. Merge

Após aprovação:
- PR será mergeado na develop
- Seu código estará na próxima release
- Parabéns! 🎉

---

## Padrões de Código

### Python

Seguimos [PEP 8](https://pep8.org/) com algumas adaptações:

```python
# Type hints obrigatórios
def calculate_total(items: List[Item], tax_rate: float) -> Decimal:
    ...

# Docstrings no formato Google
def process_payment(amount: Decimal, currency: str) -> PaymentResult:
    """Process payment transaction.
    
    Args:
        amount: Payment amount in decimal
        currency: ISO 4217 currency code
        
    Returns:
        PaymentResult with transaction details
        
    Raises:
        InvalidAmountError: If amount is negative
        CurrencyNotSupportedError: If currency invalid
    """
    ...
```

### TypeScript/React

```typescript
// Interfaces para props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Functional components com FC
export const Button: FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  // Implementation
};
```

---

## FAQ

### Quanto tempo leva para revisar um PR?

Geralmente 2-5 dias úteis. PRs maiores podem levar mais tempo.

### Posso trabalhar em múltiplas issues ao mesmo tempo?

Sim, mas recomendamos focar em uma por vez para facilitar review.

### Como sou reconhecido por minhas contribuições?

- Seu nome aparece no changelog da release
- Contributors list no README
- Badge de contributor no perfil (após 3 PRs mergeados)

### Preciso assinar algum CLA?

Sim, primeiro PR triggera assinatura do Contributor License Agreement.

### Como recebo ajuda?

- Discord: [link do servidor]
- GitHub Discussions
- Email: contributors@bsc.code

---

## Agradecimentos

Obrigado a todos os contribuidores que tornam este projeto possível! 🙏

<a href="https://github.com/.../graphs/contributors">
  <img src="https://contrib.rocks/image?repo=..." />
</a>

---

*Última atualização: Janeiro 2025*
