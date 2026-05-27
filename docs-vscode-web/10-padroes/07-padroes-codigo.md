# Padrões de Código e Convenções - BSC Code

## 10.1 Python Style Guide

### Formatação Básica

```python
# ✅ CORRETO
def calculate_workspace_cost(
    user_id: str,
    workspace_type: WorkspaceType,
    duration_hours: int,
    include_ia: bool = False,
) -> Decimal:
    """Calculate total cost for workspace usage.
    
    Args:
        user_id: UUID do usuário como string
        workspace_type: Tipo do workspace (basic, pro, enterprise)
        duration_hours: Duração de uso em horas
        include_ia: Se inclui uso de IA no cálculo
        
    Returns:
        Custo total em Decimal
        
    Raises:
        InvalidWorkspaceType: Se tipo desconhecido
        ValueError: Se duração negativa
    """
    if duration_hours < 0:
        raise ValueError("Duration cannot be negative")
    
    base_rate = WORKSPACE_RATES.get(workspace_type)
    if not base_rate:
        raise InvalidWorkspaceType(f"Unknown type: {workspace_type}")
    
    total = base_rate * duration_hours
    if include_ia:
        total += IA_RATE * duration_hours
    
    return total


# ❌ ERRADO - Múltiplos problemas
def calc(u,t,d,i=False):r=WR.get(t);return r*d if r else None
```

### Imports e Organização

```python
# ✅ CORRETO - Ordem correta de imports
# Standard library
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict

# Third-party packages
import aiohttp
import jwt
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

# First-party application modules
from auth.service import AuthService
from config import settings
from models.user import User

# Local module imports
from .utils import hash_password, verify_token


# ❌ ERRADO - Imports misturados sem ordem
from fastapi import FastAPI
import os
from models.user import User
import json
from .utils import helper
from typing import List
```

### Type Hints Obrigatórios

```python
# ✅ CORRETO - Todos tipos anotados
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from decimal import Decimal

class WorkspaceCreateRequest(BaseModel):
    name: str
    template: str
    resources: Optional[ResourceLimits] = None
    extensions: List[str] = []
    metadata: Dict[str, Any] = {}

async def get_user_workspaces(
    user_id: UUID,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Workspace]:
    ...

def parse_config_value(value: str) -> Union[int, float, bool, str]:
    ...


# ❌ ERRADO - Sem type hints
def get_user_workspaces(user_id, status=None, limit=20):
    ...
```

---

## 10.2 TypeScript Style Guide

### Configuração ESLint

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Componentes React

```typescript
// ✅ CORRETO
import React, { FC, useState, useEffect, useCallback } from 'react';
import { Workspace } from '../types/workspace';
import { formatDuration } from '../utils/time';

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete: (id: string) => void;
  onShare?: (id: string) => void;
}

export const WorkspaceCard: FC<WorkspaceCardProps> = ({
  workspace,
  onDelete,
  onShare,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(workspace.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }, [workspace.id, onDelete]);

  useEffect(() => {
    console.log('Workspace mounted:', workspace.name);
  }, [workspace.name]);

  return (
    <div className="workspace-card">
      <h3>{workspace.name}</h3>
      <p>Status: {workspace.status}</p>
      <p>Uptime: {formatDuration(workspace.uptime)}</p>
      
      {onShare && (
        <button onClick={() => onShare(workspace.id)}>
          Compartilhar
        </button>
      )}
      
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        {isDeleting ? 'Removendo...' : 'Remover'}
      </button>
      
      {showConfirm && (
        <ConfirmDialog
          message="Tem certeza?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};


// ❌ ERRADO - Múltiplos problemas
export function WorkspaceCard({ workspace, onDelete, onShare }) {
  let [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(workspace.id);
    setIsDeleting(false);
  }
  
  return (
    <div>
      <h3>{workspace.name}</h3>
      <button onClick={handleDelete}>Remove</button>
    </div>
  );
}
```

---

## 10.3 Estrutura de Diretórios

```
bsc-code/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline principal
│   │   ├── cd-staging.yml      # Deploy staging
│   │   └── cd-production.yml   # Deploy production
│   └── CODEOWNERS              # Donos de código por área
│
├── src/
│   ├── api/                    # API Gateway (FastAPI)
│   │   ├── __init__.py
│   │   ├── main.py             # Application entry point
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── workspaces.py
│   │   │   └── ia.py
│   │   ├── middleware/
│   │   │   ├── auth.py
│   │   │   └── rate_limit.py
│   │   └── dependencies.py
│   │
│   ├── auth/                   # Auth Service
│   │   ├── __init__.py
│   │   ├── service.py
│   │   ├── oauth.py
│   │   ├── mfa.py
│   │   └── jwt_handler.py
│   │
│   ├── workspace/              # Workspace Manager
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── scheduler.py
│   │   └── lifecycle.py
│   │
│   ├── websocket/              # WebSocket Manager
│   │   ├── __init__.py
│   │   ├── server.py
│   │   ├── handlers/
│   │   │   ├── terminal.py
│   │   │   ├── files.py
│   │   │   └── collaboration.py
│   │   └── protocol.py
│   │
│   ├── ia/                     # IA Orchestrator
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   ├── providers/
│   │   │   ├── anthropic.py
│   │   │   ├── openai.py
│   │   │   └── google.py
│   │   └── context.py
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── workspace.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── workspace.py
│   │   └── ia.py
│   │
│   └── utils/                  # Utilitários compartilhados
│       ├── __init__.py
│       ├── logging.py
│       ├── encryption.py
│       └── validators.py
│
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── editor/
│   │   │   └── workspace/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── performance/
│   └── fixtures/
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── k8s/                        # Kubernetes manifests
│   ├── base/
│   ├── overlays/
│   │   ├── staging/
│   │   └── production/
│   └── helm/
│
├── docs/                       # Documentação técnica
│   ├── architecture/
│   ├── api/
│   └── runbooks/
│
├── scripts/                    # Scripts utilitários
│   ├── setup-dev.sh
│   ├── migrate-db.sh
│   └── backup.sh
│
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── Makefile
└── README.md
```

---

## 10.4 Git Workflow

### Branch Strategy

```
main (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/auth-mfa
  │     ├── feature/workspace-sharing
  │     └── feature/ia-inline-completion
  │
  ├── release/v1.0.0
  └── hotfix/security-patch
```

### Commit Message Convention

```bash
# Formato: <type>(<scope>): <subject>

# Tipos:
# - feat: Nova funcionalidade
# - fix: Correção de bug
# - docs: Documentação
# - style: Formatação, sem mudança de lógica
# - refactor: Refatoração, sem mudança de comportamento
# - perf: Melhoria de performance
# - test: Adicionar/modificar testes
# - chore: Manutenção, build, config

# Exemplos:
git commit -m "feat(auth): add TOTP MFA support"
git commit -m "fix(workspace): prevent container leak on deletion"
git commit -m "docs(api): update OpenAPI spec for /workspaces endpoint"
git commit -m "perf(ia): cache prompt context to reduce latency"
git commit -m "test(e2e): add login flow test cases"
```

### Pull Request Template

```markdown
## Descrição
<!-- Descreva o que este PR faz -->

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Refatoração

## Checklist
- [ ] Tests adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Type hints adicionados
- [ ] Linting passando
- [ ] Testes locais passando

## Screenshots (se aplicável)

## Issues Relacionadas
Fixes #123
```

---

## 10.5 Testing Guidelines

### Estrutura de Testes

```python
# tests/unit/test_auth_service.py
import pytest
from unittest.mock import Mock, patch, AsyncMock
from auth.service import AuthService
from models.user import User
from exceptions import AuthenticationError, RateLimitExceeded


class TestAuthServiceLogin:
    """Testes para método de login."""
    
    @pytest.fixture
    def auth_service(self, redis_client):
        return AuthService(redis_client=redis_client)
    
    @pytest.fixture
    def mock_user(self):
        return User(
            id="usr_test123",
            email="test@example.com",
            password_hash="$2b$12$...",  # bcrypt hash de "TestPass123!"
            is_active=True,
        )
    
    async def test_login_success(
        self,
        auth_service: AuthService,
        mock_user: User,
        mock_db_session,
    ):
        """Login com credenciais válidas retorna tokens."""
        # Arrange
        mock_db_session.get.return_value = mock_user
        
        # Act
        result = await auth_service.login(
            email="test@example.com",
            password="TestPass123!",
        )
        
        # Assert
        assert result["success"] is True
        assert "access_token" in result
        assert result["access_token"].startswith("eyJ")
        assert "refresh_token" in result
    
    async def test_login_invalid_password(
        self,
        auth_service: AuthService,
        mock_user: User,
        mock_db_session,
    ):
        """Senha inválida levanta AuthenticationError."""
        # Arrange
        mock_db_session.get.return_value = mock_user
        
        # Act & Assert
        with pytest.raises(AuthenticationError) as exc_info:
            await auth_service.login(
                email="test@example.com",
                password="WrongPassword!",
            )
        assert exc_info.value.code == "INVALID_CREDENTIALS"
    
    async def test_login_rate_limited(
        self,
        auth_service: AuthService,
        mock_user: User,
        mock_db_session,
        redis_client,
    ):
        """Múltiplas tentativas falhas bloqueiam usuário."""
        # Arrange: Simular 5 tentativas falhas
        for _ in range(5):
            try:
                await auth_service.login(
                    email="test@example.com",
                    password="WrongPassword!",
                )
            except AuthenticationError:
                pass
        
        # Act & Assert
        with pytest.raises(RateLimitExceeded):
            await auth_service.login(
                email="test@example.com",
                password="TestPass123!",
            )
```

### Cobertura Mínima Exigida

| Tipo de Teste | Cobertura Mínima | Ferramenta |
|---|---|---|
| Unit Tests | > 80% | pytest-cov |
| Integration Tests | Fluxos críticos cobertos | pytest + httpx |
| E2E Tests | Happy paths principais | Playwright |
| Performance Tests | Latência dentro do target | Locust |

---

*Documento de Padrões de Código completo. Próximo: Guia de Contribuição.*
