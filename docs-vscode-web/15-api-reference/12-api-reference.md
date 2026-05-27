# API Reference - BSC Code

## 12.1 Visão Geral

**Base URL:** `https://api.bsc.code/v1`

**Autenticação:** Bearer Token (JWT) no header `Authorization`

**Formato:** JSON (Content-Type: application/json)

---

## 12.2 Autenticação

### POST /auth/login

Autenticar usuário com email e senha.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "SenhaForte123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "roles": ["developer"],
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

### POST /auth/refresh

Renovar token de acesso usando refresh token.

**Request:**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### POST /auth/logout

Invalidar tokens e encerrar sessão.

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 12.3 Workspaces

### GET /workspaces

Listar workspaces do usuário autenticado.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| status | string | all | Filter by status (running, stopped, pending) |
| limit | integer | 20 | Max results |
| offset | integer | 0 | Pagination offset |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "workspaces": [
      {
        "id": "ws_xyz789abc123",
        "name": "projeto-fintech",
        "template": "python",
        "status": "running",
        "url": "https://bsc.code/workspace/ws_xyz789abc123",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T14:30:00Z",
        "resources": {
          "cpu_limit": "2.0",
          "memory_limit": "4Gi",
          "storage_used": "5.2Gi"
        }
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /workspaces

Criar novo workspace.

**Request:**
```json
{
  "name": "novo-projeto",
  "template": "nodejs",
  "resources": {
    "cpu_limit": "2.0",
    "memory_limit": "4Gi"
  },
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "ws_new123xyz789",
    "name": "novo-projeto",
    "status": "provisioning",
    "url": "https://bsc.code/workspace/ws_new123xyz789",
    "estimated_ready_time": "2025-01-15T15:05:00Z"
  }
}
```

### GET /workspaces/{id}

Obter detalhes de um workspace específico.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "ws_xyz789abc123",
    "name": "projeto-fintech",
    "template": "python",
    "status": "running",
    "url": "https://bsc.code/workspace/ws_xyz789abc123",
    "owner": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "usuario@exemplo.com"
    },
    "collaborators": [
      {
        "user_id": "usr_g7h8i9j0k1l2",
        "email": "ana@exemplo.com",
        "permission": "editor",
        "joined_at": "2025-01-15T11:00:00Z"
      }
    ],
    "resources": {
      "cpu_limit": "2.0",
      "memory_limit": "4Gi",
      "storage_limit": "20Gi",
      "storage_used": "5.2Gi"
    },
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z",
    "expires_at": "2025-01-16T10:00:00Z"
  }
}
```

### DELETE /workspaces/{id}

Remover workspace.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| save_state | boolean | true | Salvar estado antes de remover |

**Response 200:**
```json
{
  "success": true,
  "message": "Workspace deleted successfully",
  "data": {
    "snapshot_id": "snap_abc123",
    "retention_until": "2025-02-15T00:00:00Z"
  }
}
```

### POST /workspaces/{id}/share

Compartilhar workspace com outro usuário.

**Request:**
```json
{
  "email": "colaborador@exemplo.com",
  "permission": "editor",
  "expiration_days": 30
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "invite_id": "inv_xyz123",
    "invite_url": "https://bsc.code/join/inv_xyz123",
    "expires_at": "2025-02-15T00:00:00Z"
  }
}
```

---

## 12.4 IA Assistant

### POST /ia/chat

Enviar mensagem para assistente de IA.

**Request:**
```json
{
  "message": "Como otimizar esta função Python?",
  "conversation_id": "conv_abc123",
  "context": {
    "workspace_id": "ws_xyz789",
    "open_files": [
      {
        "path": "/app/main.py",
        "content": "def process_data(items):\n    result = []\n    for item in items:\n        result.append(item * 2)\n    return result"
      }
    ],
    "language": "python"
  },
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response 200 (streaming via SSE):**
```
data: {"token": "Aqui"}
data: {"token": " está"}
data: {"token": " uma"}
data: {"token": " versão"}
data: {"token": " otimizada:"}
data: {"token": "\n\n```python"}
data: {"token": "\ndef"}
data: {"token": " process"}
data: {"token": "_data(items):\n    return"}
data: {"token": " [item"}
data: {"token": " * "}
data: {"token": "2"}
data: {"token": " for"}
data: {"token": " item"}
data: {"token": " in"}
data: {"token": " items]"}
data: {"token": "\n```"}
data: {"finish_reason": "stop", "usage": {"prompt_tokens": 45, "completion_tokens": 32}}
```

### POST /ia/completion

Solicitar code completion inline.

**Request:**
```json
{
  "file_content": "def calculate_total(items, tax_rate):\n    ",
  "cursor_position": {"line": 1, "column": 32},
  "language": "python",
  "recent_edits": [
    {"type": "insert", "text": "tax_rate", "timestamp": "2025-01-15T14:30:00Z"}
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "completion": "total = sum(items)\n    tax = total * tax_rate\n    return total + tax",
    "confidence": 0.92,
    "provider": "anthropic",
    "model": "claude-3-sonnet"
  }
}
```

### GET /ia/providers

Listar providers de IA disponíveis.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "anthropic",
        "name": "Anthropic Claude",
        "models": [
          {"id": "claude-3-sonnet", "name": "Claude 3 Sonnet", "context_window": 200000},
          {"id": "claude-3-opus", "name": "Claude 3 Opus", "context_window": 200000}
        ],
        "status": "operational"
      },
      {
        "id": "openai",
        "name": "OpenAI GPT",
        "models": [
          {"id": "gpt-4o", "name": "GPT-4o", "context_window": 128000},
          {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "context_window": 128000}
        ],
        "status": "operational"
      }
    ]
  }
}
```

---

## 12.5 Users

### GET /users/me

Obter perfil do usuário autenticado.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "avatar_url": "https://avatars.bsc.code/usr_a1b2c3d4e5f6.png",
    "roles": ["developer"],
    "permissions": ["workspace:create", "workspace:delete:own", "ia:use"],
    "mfa_enabled": true,
    "created_at": "2025-01-01T00:00:00Z",
    "last_login": "2025-01-15T14:00:00Z",
    "usage": {
      "workspaces_created": 15,
      "ia_requests_today": 23,
      "storage_used_gb": 45.2
    }
  }
}
```

### PUT /users/me

Atualizar perfil do usuário.

**Request:**
```json
{
  "name": "Novo Nome",
  "avatar_url": "https://novo-avatar.com/image.png"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "email": "usuario@exemplo.com",
    "name": "Novo Nome",
    "updated_at": "2025-01-15T15:00:00Z"
  }
}
```

---

## 12.6 Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| INVALID_CREDENTIALS | 401 | Email ou senha inválidos |
| TOKEN_EXPIRED | 401 | Token JWT expirado |
| TOKEN_INVALID | 401 | Token JWT inválido |
| RATE_LIMIT_EXCEEDED | 429 | Limite de requests excedido |
| WORKSPACE_NOT_FOUND | 404 | Workspace não existe |
| WORKSPACE_LIMIT_EXCEEDED | 403 | Usuário atingiu limite de workspaces |
| PERMISSION_DENIED | 403 | Usuário não tem permissão |
| IA_PROVIDER_UNAVAILABLE | 503 | Provider de IA indisponível |
| INTERNAL_ERROR | 500 | Erro interno do servidor |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": {
      "attempts_remaining": 3
    }
  },
  "meta": {
    "request_id": "req_abc123def456",
    "timestamp": "2025-01-15T15:00:00Z"
  }
}
```

---

*API Reference completa. Versão 1.0.0*
