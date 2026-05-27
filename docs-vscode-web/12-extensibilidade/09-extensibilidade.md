# Extensibilidade - BSC Code

## 12.1 Arquitetura de Plugins e Extensions

### Visão Geral

O BSC Code suporta três tipos de extensibilidade:

1. **VS Code Extensions** - Extensions padrão do ecossistema VS Code
2. **Custom Plugins** - Plugins específicos do BSC Code
3. **IA Providers** - Novos provedores de IA plugáveis

---

## 12.2 VS Code Extensions

### Compatibilidade

O BSC Code é compatível com ~95% das extensions do VS Code Marketplace.

**Extensions Suportadas:**
- ✅ Language servers (Python, JavaScript, Go, Rust, etc.)
- ✅ Themes e icon packs
- ✅ Snippets
- ✅ Debuggers
- ✅ Formatters (Prettier, Black, etc.)
- ✅ Linters (ESLint, Pylint, etc.)

**Limitações Conhecidas:**
- ❌ Extensions que requerem acesso direto ao sistema de arquivos local
- ❌ Extensions que dependem de processos nativos específicos do SO
- ❌ Extensions que requerem portas locais específicas

### Instalação de Extensions

```python
# Via API
POST /api/v1/workspaces/{id}/extensions
{
  "extension_id": "ms-python.python",
  "version": "2024.0.0"
}

# Via UI no editor
# User clica em "Install" no Extensions Marketplace
```

### Custom Extension Registry

Para empresas que querem um registry privado:

```yaml
# config.yaml
extensions:
  marketplace:
    # Public VS Code Marketplace
    - url: https://marketplace.visualstudio.com
      enabled: true
    
    # Private registry (optional)
    - url: https://registry.empresa.com/vscode
      enabled: true
      auth:
        type: bearer
        token_env: PRIVATE_REGISTRY_TOKEN
    
    # Blocked extensions (security policy)
    blocked:
      - "malicious-extension-id"
      - "another-blocked-extension"
```

---

## 12.3 Custom Plugins System

### Criando um Plugin BSC Code

Plugins customizados permitem adicionar funcionalidades específicas ao BSC Code.

**Estrutura de um Plugin:**

```
my-plugin/
├── plugin.json          # Metadata do plugin
├── main.py              # Entry point
├── requirements.txt     # Dependências Python
├── static/              # Assets (CSS, JS, images)
│   └── icon.svg
└── README.md
```

**plugin.json:**

```json
{
  "name": "workspace-analytics",
  "displayName": "Workspace Analytics",
  "version": "1.0.0",
  "description": "Analytics e métricas de uso do workspace",
  "author": "Seu Nome",
  "license": "MIT",
  
  "entryPoint": "main.py",
  "pythonVersion": ">=3.11",
  
  "permissions": [
    "workspace:read",
    "metrics:write"
  ],
  
  "ui": {
    "sidebar": {
      "title": "Analytics",
      "icon": "chart-bar",
      "route": "/analytics"
    }
  },
  
  "configSchema": {
    "type": "object",
    "properties": {
      "refreshInterval": {
        "type": "integer",
        "default": 60,
        "minimum": 10,
        "maximum": 3600
      },
      "enableRealTime": {
        "type": "boolean",
        "default": true
      }
    }
  }
}
```

**main.py:**

```python
from bsc_plugin_sdk import BSCPlugin, route, event_handler
from fastapi import APIRouter
from datetime import datetime

class WorkspaceAnalyticsPlugin(BSCPlugin):
    """Plugin de analytics para workspaces."""
    
    def __init__(self, config: dict):
        self.config = config
        self.router = APIRouter()
        self.setup_routes()
    
    def setup_routes(self):
        @self.router.get("/api/analytics/summary")
        async def get_analytics_summary(workspace_id: str):
            """Retorna resumo de analytics do workspace."""
            return {
                "workspace_id": workspace_id,
                "active_users": await self.get_active_users(workspace_id),
                "cpu_usage_avg": await self.get_cpu_avg(workspace_id),
                "memory_usage_peak": await self.get_memory_peak(workspace_id),
                "last_updated": datetime.utcnow().isoformat()
            }
        
        @self.router.get("/api/analytics/activity")
        async def get_activity_timeline(workspace_id: str, hours: int = 24):
            """Timeline de atividades nas últimas X horas."""
            return await self.query_activity(workspace_id, hours)
    
    @event_handler("workspace.file_saved")
    async def on_file_saved(self, event: dict):
        """Handle file save events for analytics."""
        await self.record_event(
            workspace_id=event["workspace_id"],
            event_type="file_save",
            metadata={"path": event["path"]}
        )
    
    async def get_active_users(self, workspace_id: str) -> int:
        # Implementation
        pass
    
    async def get_cpu_avg(self, workspace_id: str) -> float:
        # Implementation
        pass
    
    async def get_memory_peak(self, workspace_id: str) -> float:
        # Implementation
        pass
    
    async def query_activity(self, workspace_id: str, hours: int) -> list:
        # Implementation
        pass

# Register plugin
plugin = WorkspaceAnalyticsPlugin
```

### SDK do Plugin

```bash
pip install bsc-plugin-sdk
```

**Classes Base Disponíveis:**

```python
from bsc_plugin_sdk import (
    BSCPlugin,           # Base class para plugins
    route,               # Decorator para rotas API
    event_handler,       # Decorator para eventos
    WebSocketHandler,    # Base para handlers WebSocket
    UIBase,              # Base para componentes UI
)
```

### Publicando seu Plugin

1. **Testar localmente:**
   ```bash
   bsc plugin dev my-plugin/
   ```

2. **Empacotar:**
   ```bash
   bsc plugin package my-plugin/
   # Cria my-plugin-1.0.0.bscp
   ```

3. **Publicar no registry:**
   ```bash
   bsc plugin publish my-plugin-1.0.0.bscp \
     --registry https://plugins.bsc.code \
     --token $PUBLISH_TOKEN
   ```

---

## 12.4 IA Providers Customizados

### Interface de Provider

```python
from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Dict, Any

class IAProviderBase(ABC):
    """Base class para providers de IA."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session = None
    
    @abstractmethod
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncIterator[str]:
        """Generate chat completion with streaming."""
        pass
    
    @abstractmethod
    async def code_completion(
        self,
        prefix: str,
        suffix: str,
        language: str,
        **kwargs
    ) -> AsyncIterator[str]:
        """Generate code completion (infilling)."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if provider is available."""
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""
        pass
    
    @property
    @abstractmethod
    def models(self) -> List[Dict[str, Any]]:
        """List of available models with metadata."""
        pass
```

### Implementando um Provider Customizado

```python
# providers/custom_llm.py
import aiohttp
from typing import AsyncIterator, List, Dict, Any

from .base import IAProviderBase

class CustomLLMProvider(IAProviderBase):
    """Provider para LLM customizado (ex: Llama via API própria)."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_url = config["api_url"]
        self.api_key = config.get("api_key")
        self.default_model = config.get("model", "llama-3-70b")
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncIterator[str]:
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": self.default_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream,
                **kwargs
            }
            
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            async with session.post(
                f"{self.api_url}/v1/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                
                if stream:
                    async for line in response.content:
                        if line.startswith(b"data: "):
                            data = line[6:]
                            if data.strip() == b"[DONE]":
                                break
                            yield from self._parse_chunk(data)
                else:
                    result = await response.json()
                    yield result["choices"][0]["message"]["content"]
    
    async def code_completion(
        self,
        prefix: str,
        suffix: str,
        language: str,
        **kwargs
    ) -> AsyncIterator[str]:
        # Implement infilling se suportado
        async for chunk in self.chat_completion([
            {"role": "user", "content": f"Complete o código:\n{prefix}[FILL]{suffix}"}
        ], **kwargs):
            yield chunk
    
    async def health_check(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/health") as resp:
                    return resp.status == 200
        except Exception:
            return False
    
    @property
    def name(self) -> str:
        return "custom_llm"
    
    @property
    def models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "llama-3-70b",
                "name": "Llama 3 70B",
                "context_window": 8192,
                "supports_code": True,
                "cost_per_1k_tokens": 0.0001
            }
        ]
    
    def _parse_chunk(self, data: bytes) -> str:
        import json
        parsed = json.loads(data)
        return parsed["choices"][0]["delta"].get("content", "")


# Registrar provider
def register_provider():
    return CustomLLMProvider
```

### Configurando Provider Customizado

```yaml
# config/ia_providers.yaml
providers:
  custom_llm:
    enabled: true
    priority: 3  # After Anthropic and OpenAI
    
    factory: "providers.custom_llm:register_provider"
    
    config:
      api_url: "https://llm-api.empresa.com"
      api_key: "${CUSTOM_LLM_API_KEY}"
      model: "llama-3-70b"
    
    use_cases:
      - "internal_code_generation"
      - "docs_qa"
    
    rate_limits:
      requests_per_minute: 100
      tokens_per_minute: 50000
```

---

## 12.5 Webhooks e Integrações

### Sistema de Webhooks

Permite notificar sistemas externos sobre eventos do BSC Code.

**Eventos Disponíveis:**

| Evento | Payload | Quando é Disparado |
|---|---|---|
| `workspace.created` | `{workspace_id, user_id, template}` | Novo workspace criado |
| `workspace.deleted` | `{workspace_id, user_id}` | Workspace removido |
| `user.login` | `{user_id, email, ip_address}` | Usuário faz login |
| `user.logout` | `{user_id, session_id}` | Usuário faz logout |
| `file.saved` | `{workspace_id, path, size}` | Arquivo salvo |
| `git.push` | `{workspace_id, repo, branch, commit}` | Push realizado |
| `ia.request` | `{workspace_id, provider, tokens}` | Request para IA |

### Configurando Webhooks

```yaml
# config/webhooks.yaml
webhooks:
  - name: "Slack Notifications"
    url: "https://hooks.slack.com/services/T00/B00/XXX"
    events:
      - "workspace.created"
      - "workspace.deleted"
    headers:
      Content-Type: application/json
    secret: "${WEBHOOK_SECRET}"
    active: true
  
  - name: "SIEM Integration"
    url: "https://siem.empresa.com/api/events"
    events:
      - "user.login"
      - "user.logout"
      - "file.saved"
    headers:
      Authorization: "Bearer ${SIEM_TOKEN}"
      X-Source: "bsc-code"
    active: true
  
  - name: "Billing System"
    url: "https://billing.empresa.com/api/usage"
    events:
      - "workspace.created"
      - "workspace.deleted"
      - "ia.request"
    batch:
      enabled: true
      max_size: 100
      interval_seconds: 60
    active: true
```

### Testando Webhooks

```bash
# List webhooks configurados
bsc webhook list

# Testar webhook específico
bsc webhook test workspace.created \
  --payload '{"workspace_id": "ws_test", "user_id": "usr_test"}' \
  --target https://webhook.site/unique-url

# Ver logs de delivery
bsc webhook logs --webhook-id wh_123 --limit 50
```

---

## 12.6 API Extensions

### Adicionando Endpoints Customizados

Plugins podem estender a API principal:

```python
# plugins/my-plugin/api_extension.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List

from src.api.dependencies import get_current_user
from src.models.user import User

router = APIRouter(prefix="/api/v1/plugins/my-plugin", tags=["my-plugin"])

@router.get("/reports/workspace/{workspace_id}")
async def get_workspace_report(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
):
    """Generate custom workspace report."""
    # Verify permission
    if not await has_access(current_user.id, workspace_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate report
    report = await generate_custom_report(workspace_id)
    
    return {
        "workspace_id": workspace_id,
        "report_data": report,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.post("/actions/deploy")
async def deploy_to_production(
    workspace_id: str,
    target: str,
    current_user: User = Depends(get_current_user),
):
    """Deploy workspace to production environment."""
    # Implementation
    pass

# Register extension
def register_extension(app):
    app.include_router(router)
```

---

*Documento de Extensibilidade completo. Próximo: Limitações Conhecidas.*
