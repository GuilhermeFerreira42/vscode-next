# GREENFORGE — Comando de Extração Arquitetural
> Entregar este comando ao agente (Gemini CLI, Claude Code, Cursor Agent ou equivalente)
> com acesso ao código-fonte do projeto `ishaan1013/sandbox` já clonado na máquina.
> O agente deve ter acesso de leitura a TODOS os arquivos do repositório antes de começar.

---

## PERSONA E MISSÃO

Você é um **arquiteto de sistemas sênior e engenheiro reverso de elite**.

Você tem acesso total ao código-fonte do projeto `ishaan1013/sandbox` clonado nesta máquina.
Sua missão é fazer **engenharia reversa completa** deste projeto e produzir um **JSON canônico**
que servirá como especificação de construção para o projeto **GreenForge IDE** —
uma IDE web mínima orientada a agentes de IA com debate adversarial.

O JSON produzido será entregue a outro agente de código para construir o GreenForge do zero.
Por isso, ele deve ser **completo, preciso e livre de ambiguidade**.

---

## CONTEXTO DO PROJETO DESTINO (GreenForge)

O GreenForge **não é** uma cópia do sandbox. É um projeto novo que vai:
- Reutilizar a **arquitetura de baixo nível** do sandbox (Monaco + xterm.js + Express + WebSocket)
- **Remover** toda dependência de serviços cloud (Clerk, E2B, Liveblocks, Cloudflare R2/D1)
- **Substituir** autenticação por nenhuma (MVP local, sem login)
- **Substituir** Workers AI por adapter local (OpenAI/Anthropic/Ollama)
- **Substituir** storage cloud por filesystem local
- **Adicionar** motor GreenForge: debate adversarial, HITL gates, WAL Intent Log

O sandbox é apenas a **referência arquitetural**. O JSON gerado deve descrever
a arquitetura limpa e enxuta — sem o lixo cloud.

---

## REGRAS INVIOLÁVEIS DE EXTRAÇÃO

**[R01] LEIA TUDO ANTES DE ESCREVER**
Leia TODOS os arquivos do repositório antes de gerar qualquer saída.
Inclui: package.json, todos os arquivos .ts/.tsx, configs, .env.example, README.

**[R02] BASE NO CÓDIGO REAL**
Toda informação no JSON deve ser extraída do código real.
Nunca inventar estrutura, dependência ou comportamento não observado no código.
Se algo não estiver claro: registrar em `open_items` com `blocking: true`.

**[R03] FILTRO DE LIXO OBRIGATÓRIO**
Os seguintes elementos devem ser IGNORADOS na extração e MARCADOS para remoção:
- Clerk (autenticação cloud)
- Liveblocks (colaboração em tempo real)
- E2B (sandboxes cloud)
- Cloudflare R2 (storage cloud)
- Cloudflare D1 (banco cloud)
- Workers AI (LLM cloud da Cloudflare)
- Qualquer outro serviço SaaS externo identificado

**[R04] MAPEAMENTO DE SUBSTITUIÇÕES**
Para cada elemento removido, registrar no JSON o que o GreenForge usará no lugar:
- Clerk → sem auth (MVP local)
- D1 (SQLite cloud) → better-sqlite3 (local)
- R2 → filesystem local (fs/promises)
- Workers AI → LLMAdapter (OpenAI/Anthropic/Ollama)
- Liveblocks → removido (sem colaboração no MVP)
- E2B → node-pty + shell local

**[R05] PROFUNDIDADE TÉCNICA REAL**
Extrair interfaces TypeScript reais, não esquecer de incluir:
- Assinaturas de funções críticas
- Estrutura de dados usada entre frontend e backend
- Protocolo de mensagens WebSocket (tipos exatos)
- Endpoints REST (método + rota + payload + resposta)

**[R06] FOCO NO QUE INTERESSA**
Priorizar na extração:
1. Como Monaco Editor é inicializado e configurado
2. Como xterm.js se comunica com o backend via WebSocket
3. Como o filesystem é lido/escrito no backend
4. Como o WebSocket server é estruturado
5. Como o frontend e backend se comunicam (REST + WS)
6. Estrutura de pastas real do projeto

**[R07] JSON VÁLIDO E COMPLETO**
O output DEVE ser JSON válido, sem markdown fora do JSON, sem comentários JS.
Usar strings para comentários onde necessário (campo `"_comment"`).
Gerar até o fim — se precisar pausar, encerrar com o marcador:
`"_status": "CONTINUAÇÃO PENDENTE — próxima seção: [nome]"`

---

## ESTRUTURA OBRIGATÓRIA DO JSON DE SAÍDA

Gere um JSON com EXATAMENTE esta estrutura, preenchida com dados reais do código:

```json
{
  "meta": {
    "id": "GREENFORGE-CANONICAL-001",
    "created_at": "[ISO 8601]",
    "source_project": "ishaan1013/sandbox",
    "source_url": "https://github.com/ishaan1013/sandbox",
    "target_project": "GreenForge IDE",
    "target_description": "IDE web mínima orientada a agentes de IA com debate adversarial, HITL gates e WAL Intent Log",
    "extraction_method": "engenharia_reversa_codigo_real",
    "filter_applied": ["clerk", "liveblocks", "e2b", "cloudflare_r2", "cloudflare_d1", "workers_ai"]
  },

  "source_analysis": {
    "real_folder_structure": "[árvore de pastas REAL extraída do código]",
    "total_files_read": 0,
    "key_files_identified": [],
    "removed_dependencies": [
      {
        "name": "[nome do pacote/serviço]",
        "reason": "[por que está sendo removido]",
        "replacement": "[o que o GreenForge usará no lugar]",
        "files_affected": ["[arquivo onde aparece]"]
      }
    ],
    "kept_dependencies": [
      {
        "name": "[nome do pacote]",
        "version": "[versão real do package.json]",
        "purpose": "[para que serve no GreenForge]"
      }
    ]
  },

  "project": {
    "name": "GreenForge IDE",
    "description": "IDE web mínima orientada a agentes de IA. Carroceria para validação do motor GreenForge de debate adversarial e governança de agentes.",
    "version": "0.1.0-mvp",
    "license": "MIT",
    "monorepo": true,
    "packages": ["frontend", "backend"]
  },

  "frontend": {
    "framework": "[extraído do package.json real]",
    "language": "TypeScript",
    "bundler": "[extraído do package.json real]",
    "entry_point": "[arquivo real de entry point]",
    "port": 0,
    "folder_structure": {
      "_comment": "Estrutura de pastas do frontend limpo — sem dependências cloud removidas",
      "src": {
        "components": {},
        "hooks": {},
        "store": {},
        "services": {},
        "types": {}
      }
    },
    "state_management": "[biblioteca real usada ou recomendada]",
    "styling": "[biblioteca real usada]"
  },

  "backend": {
    "runtime": "Node.js",
    "framework": "[extraído do package.json real]",
    "language": "TypeScript",
    "entry_point": "[arquivo real de entry point]",
    "port": 0,
    "folder_structure": {
      "_comment": "Estrutura de pastas do backend limpo — sem dependências cloud removidas",
      "src": {
        "routes": {},
        "services": {},
        "websocket": {},
        "middleware": {}
      }
    }
  },

  "editor": {
    "library": "[nome exato da lib Monaco usada]",
    "version": "[versão real do package.json]",
    "initialization_pattern": {
      "_comment": "Como o Monaco é inicializado no projeto real",
      "component_file": "[caminho real do componente]",
      "key_config": {},
      "cdn_or_local": "[CDN ou local — extraído do código]",
      "loader_config": "[como o loader é configurado — código real]"
    },
    "features_used": [],
    "diff_editor": {
      "used": false,
      "component_file": "[se existir]"
    }
  },

  "terminal": {
    "frontend_library": "[nome exato da lib xterm usada]",
    "frontend_version": "[versão real]",
    "backend_library": "[node-pty ou equivalente real]",
    "backend_version": "[versão real]",
    "communication": "WebSocket",
    "component_file": "[caminho real do componente frontend]",
    "service_file": "[caminho real do serviço backend]",
    "message_protocol": {
      "_comment": "Tipos de mensagem REAIS extraídos do código",
      "client_to_server": [],
      "server_to_client": []
    },
    "initialization_pattern": "[código real ou pseudocódigo extraído do componente]"
  },

  "filesystem": {
    "read": true,
    "write": true,
    "watch": true,
    "download": true,
    "upload": true,
    "backend_service_file": "[caminho real do serviço de filesystem]",
    "watch_library": "[biblioteca real — chokidar ou equivalente]",
    "api_routes": {
      "_comment": "Rotas REST reais do backend para operações de arquivo",
      "list": "[método + rota real]",
      "read": "[método + rota real]",
      "write": "[método + rota real]",
      "create": "[método + rota real]",
      "delete": "[método + rota real]",
      "rename": "[método + rota real]"
    }
  },

  "websocket": {
    "library": "[biblioteca real — ws, socket.io, etc]",
    "version": "[versão real]",
    "server_file": "[caminho real do servidor WS]",
    "namespaces_or_rooms": [],
    "message_types_found": {
      "_comment": "TODOS os tipos de mensagem WS encontrados no código real",
      "server_to_client": [],
      "client_to_server": []
    },
    "connection_pattern": "[como o frontend conecta — código real extraído]"
  },

  "rest_api": {
    "_comment": "Todos os endpoints REST reais encontrados no código",
    "base_url": "[URL base real]",
    "endpoints": [
      {
        "method": "[GET/POST/PUT/DELETE/PATCH]",
        "route": "[rota real]",
        "purpose": "[para que serve]",
        "request_body": {},
        "response_body": {},
        "auth_required": false,
        "file": "[arquivo real onde está definido]"
      }
    ]
  },

  "ai_integration": {
    "_comment": "Como o projeto original integra IA — e o que substituiremos",
    "original_provider": "[Workers AI / OpenAI / outro — extraído do código]",
    "original_integration_file": "[arquivo real]",
    "greenforge_replacement": {
      "adapter_pattern": true,
      "providers_to_support": ["openai", "anthropic", "ollama"],
      "interface": {
        "method": "chat",
        "signature": "chat(messages: LLMMessage[], tools?: Tool[], onStream?: (delta: string) => void): Promise<LLMResponse>"
      }
    }
  },

  "authentication": {
    "original_solution": "Clerk",
    "original_files": [],
    "greenforge_replacement": "none — MVP local sem autenticação",
    "files_to_remove": [],
    "middleware_to_remove": []
  },

  "database": {
    "original_solution": "Cloudflare D1 (SQLite cloud)",
    "original_files": [],
    "greenforge_replacement": "better-sqlite3 (local)",
    "wal_mode": true,
    "schema_found": {
      "_comment": "Schema real encontrado no código — tabelas e campos",
      "tables": []
    },
    "greenforge_additional_tables": [
      {
        "name": "wal_intent_log",
        "purpose": "Write-Ahead Log para atomicidade de operações cross-system",
        "fields": ["id", "timestamp", "agent_id", "action", "target", "payload", "status", "gate"]
      },
      {
        "name": "workspace_session",
        "purpose": "Persistência de sessão — abas abertas, posição de cursores",
        "fields": ["id", "workspace_root", "open_tabs", "active_tab", "created_at", "updated_at"]
      }
    ]
  },

  "modules": [
    {
      "name": "FileExplorer",
      "purpose": "Árvore de arquivos navegável com operações CRUD",
      "source_component": "[arquivo real no sandbox]",
      "keep_as_is": false,
      "modifications_needed": ["remover dependências cloud", "adaptar para filesystem local"],
      "frontend_component": "src/components/explorer/FileTree.tsx",
      "backend_service": "src/services/FileService.ts",
      "required_for_mvp": true
    },
    {
      "name": "CodeEditor",
      "purpose": "Editor Monaco com syntax highlighting e suporte a múltiplas abas",
      "source_component": "[arquivo real no sandbox]",
      "keep_as_is": false,
      "modifications_needed": ["remover auth", "adaptar configuração"],
      "frontend_component": "src/components/editor/CodeEditor.tsx",
      "backend_service": null,
      "required_for_mvp": true
    },
    {
      "name": "EditorTabs",
      "purpose": "Sistema de abas para múltiplos arquivos abertos com persistência",
      "source_component": "[arquivo real no sandbox se existir]",
      "keep_as_is": false,
      "modifications_needed": [],
      "frontend_component": "src/components/editor/EditorTabs.tsx",
      "backend_service": null,
      "required_for_mvp": true
    },
    {
      "name": "Terminal",
      "purpose": "Terminal integrado com shell real via node-pty e WebSocket",
      "source_component": "[arquivo real no sandbox]",
      "keep_as_is": false,
      "modifications_needed": ["remover E2B", "substituir por node-pty local"],
      "frontend_component": "src/components/terminal/Terminal.tsx",
      "backend_service": "src/services/TerminalService.ts",
      "required_for_mvp": true
    },
    {
      "name": "AgentChat",
      "purpose": "Painel de chat com agentes de IA — primeiro ponto de entrada do motor GreenForge",
      "source_component": "[arquivo real no sandbox se existir]",
      "keep_as_is": false,
      "modifications_needed": ["substituir Workers AI por LLMAdapter local"],
      "frontend_component": "src/components/ai/AgentChat.tsx",
      "backend_service": "src/services/AgentService.ts",
      "required_for_mvp": true
    },
    {
      "name": "ApprovalCard",
      "purpose": "Interface de aprovação HITL — Gate 0/1/2 do motor GreenForge",
      "source_component": null,
      "keep_as_is": false,
      "modifications_needed": ["criar do zero"],
      "frontend_component": "src/components/ai/ApprovalCard.tsx",
      "backend_service": null,
      "required_for_mvp": true
    },
    {
      "name": "DiffLens",
      "purpose": "Visualização de diffs propostos pelos agentes usando Monaco DiffEditor",
      "source_component": null,
      "keep_as_is": false,
      "modifications_needed": ["criar do zero"],
      "frontend_component": "src/components/editor/DiffEditor.tsx",
      "backend_service": null,
      "required_for_mvp": true
    },
    {
      "name": "DebatePanel",
      "purpose": "Visualização do debate adversarial Propositor → Crítico → Árbitro",
      "source_component": null,
      "keep_as_is": false,
      "modifications_needed": ["criar do zero — motor GreenForge"],
      "frontend_component": "src/components/ai/DebatePanel.tsx",
      "backend_service": "src/services/DebateService.ts",
      "required_for_mvp": false
    },
    {
      "name": "StatusBar",
      "purpose": "Barra de status: workspace ativo, branch git, status do agente, conexão WS",
      "source_component": "[arquivo real se existir]",
      "keep_as_is": false,
      "modifications_needed": [],
      "frontend_component": "src/components/layout/StatusBar.tsx",
      "backend_service": null,
      "required_for_mvp": true
    }
  ],

  "greenforge_motor_modules": {
    "_comment": "Módulos do motor GreenForge — NÃO existem no sandbox, serão criados do zero",
    "phase": "pós-MVP — adicionar após IDE base funcionar",
    "modules": [
      {
        "name": "DebateService",
        "purpose": "Orquestrador do debate adversarial Propositor → Crítico → Árbitro",
        "file": "backend/src/services/DebateService.ts"
      },
      {
        "name": "WALService",
        "purpose": "Write-Ahead Log para atomicidade entre filesystem e SQLite",
        "file": "backend/src/services/WALService.ts"
      },
      {
        "name": "LoopDetector",
        "purpose": "Detecção de loops semânticos em propostas de agentes",
        "file": "backend/src/services/LoopDetector.ts"
      },
      {
        "name": "BootReconciler",
        "purpose": "Recuperação determinística de estado pós-crash via WAL",
        "file": "backend/src/services/BootReconciler.ts"
      },
      {
        "name": "WorktreeManager",
        "purpose": "Gerenciamento de git worktrees isolados por agente",
        "file": "backend/src/services/WorktreeManager.ts"
      },
      {
        "name": "LLMAdapter",
        "purpose": "Abstração multi-provedor (OpenAI, Anthropic, Ollama)",
        "file": "backend/src/services/LLMAdapter.ts"
      }
    ]
  },

  "target_folder_structure": {
    "_comment": "Estrutura de pastas ALVO do GreenForge — baseada no sandbox limpo + módulos GreenForge",
    "greenforge-ide": {
      "frontend": {
        "src": {
          "components": {
            "editor": ["CodeEditor.tsx", "EditorTabs.tsx", "DiffEditor.tsx"],
            "explorer": ["FileTree.tsx", "FileTreeNode.tsx", "FileContextMenu.tsx"],
            "terminal": ["Terminal.tsx"],
            "ai": ["AgentChat.tsx", "ApprovalCard.tsx", "DebatePanel.tsx"],
            "layout": ["Layout.tsx", "Sidebar.tsx", "StatusBar.tsx"]
          },
          "hooks": ["useEditor.ts", "useFileSystem.ts", "useTerminal.ts", "useAgentSocket.ts"],
          "store": ["editorStore.ts", "fileStore.ts", "agentStore.ts"],
          "services": ["api.ts", "wsClient.ts", "monacoSetup.ts"],
          "types": ["file.types.ts", "editor.types.ts", "agent.types.ts"]
        },
        "config_files": ["package.json", "tsconfig.json", "vite.config.ts", "index.html"]
      },
      "backend": {
        "src": {
          "routes": ["files.ts", "workspace.ts", "ai.ts"],
          "services": [
            "FileService.ts", "WatcherService.ts", "TerminalService.ts",
            "AgentService.ts", "AgentTools.ts", "LLMAdapter.ts",
            "WALService.ts", "DebateService.ts", "BootReconciler.ts"
          ],
          "websocket": {
            "handlers": ["terminalHandler.ts", "fileWatchHandler.ts", "agentHandler.ts"],
            "wsServer.ts": "setup do servidor WebSocket"
          },
          "middleware": ["cors.ts"],
          "types": ["index.ts"],
          "server.ts": "entry point",
          "config.ts": "variáveis de ambiente"
        },
        "config_files": ["package.json", "tsconfig.json", ".env.example"]
      }
    }
  },

  "interfaces": {
    "_comment": "Interfaces TypeScript reais extraídas do código + novas necessárias para o GreenForge",
    "from_source": [
      {
        "name": "[nome da interface real encontrada]",
        "file": "[arquivo real]",
        "definition": "[interface TypeScript real]"
      }
    ],
    "greenforge_additions": [
      {
        "name": "FileNode",
        "definition": "interface FileNode { id: string; name: string; path: string; type: 'file' | 'directory'; children?: FileNode[]; extension?: string; size?: number; modified?: string; }"
      },
      {
        "name": "EditorTab",
        "definition": "interface EditorTab { id: string; path: string; filename: string; content: string; isDirty: boolean; language: string; cursorPosition?: { line: number; column: number }; }"
      },
      {
        "name": "AgentMessage",
        "definition": "interface AgentMessage { id: string; role: 'user' | 'assistant' | 'tool' | 'system'; content: string; toolCalls?: ToolCall[]; toolResults?: ToolResult[]; timestamp: number; streaming?: boolean; }"
      },
      {
        "name": "WALEntry",
        "definition": "interface WALEntry { id: number; timestamp: number; agentId: string; action: string; target: string; payload: string; status: 'pending' | 'approved' | 'rejected' | 'executed'; gate: 0 | 1 | 2 | null; }"
      },
      {
        "name": "WSMessage",
        "definition": "type WSMessageType = 'terminal.input' | 'terminal.output' | 'terminal.resize' | 'terminal.ready' | 'file.change' | 'file.create' | 'file.delete' | 'agent.message' | 'agent.stream' | 'agent.tool_call' | 'approval.request' | 'approval.response' | 'debate.update'; interface WSMessage { type: WSMessageType; data: unknown; id?: string; timestamp?: number; }"
      }
    ]
  },

  "dependencies": {
    "frontend": {
      "keep_from_source": [],
      "remove_from_source": [],
      "add_for_greenforge": {
        "core": ["react@18", "react-dom@18", "typescript@5"],
        "build": ["vite@5", "@vitejs/plugin-react"],
        "editor": ["@monaco-editor/react@4", "monaco-editor"],
        "terminal": ["@xterm/xterm@5", "xterm-addon-fit", "xterm-addon-web-links"],
        "state": ["zustand@4"],
        "ui": ["tailwindcss@3", "lucide-react"],
        "http": ["axios"]
      }
    },
    "backend": {
      "keep_from_source": [],
      "remove_from_source": [],
      "add_for_greenforge": {
        "core": ["express@4", "typescript@5", "tsx"],
        "ws": ["ws@8"],
        "terminal": ["node-pty"],
        "filesystem": ["chokidar@3", "fs-extra"],
        "ai": ["openai", "@anthropic-ai/sdk"],
        "db": ["better-sqlite3"],
        "utils": ["cors", "helmet", "dotenv"]
      }
    }
  },

  "environment_variables": {
    "_comment": "Variáveis de ambiente necessárias — baseadas no .env.example real + adições GreenForge",
    "from_source": [],
    "greenforge_additions": [
      { "key": "WORKSPACE_ROOT", "example": "/path/to/your/project", "required": true },
      { "key": "PORT", "example": "3001", "required": true },
      { "key": "OPENAI_API_KEY", "example": "sk-...", "required": false },
      { "key": "ANTHROPIC_API_KEY", "example": "sk-ant-...", "required": false },
      { "key": "OLLAMA_HOST", "example": "http://localhost:11434", "required": false },
      { "key": "LLM_PROVIDER", "example": "openai", "required": true },
      { "key": "LLM_MODEL", "example": "gpt-4o", "required": true },
      { "key": "WAL_DB_PATH", "example": "./data/greenforge.db", "required": true },
      { "key": "NODE_ENV", "example": "development", "required": true }
    ]
  },

  "implementation_order": [
    {
      "phase": 1,
      "name": "Scaffold e Bootstrap",
      "priority": "CRÍTICO",
      "estimated_time": "2-4 horas",
      "deliverable": "Monorepo rodando — frontend em branco em localhost:5173, backend respondendo em localhost:3001",
      "steps": [
        "Criar monorepo com frontend/ e backend/",
        "Instalar dependências npm listadas em dependencies.add_for_greenforge",
        "Configurar tsconfig.json em ambos os pacotes",
        "Configurar vite.config.ts com proxy para /api e /ws apontando para backend",
        "Criar backend/src/server.ts com Express + CORS básico",
        "Verificar que ambos sobem sem erros"
      ]
    },
    {
      "phase": 2,
      "name": "Backend Core — Filesystem e Terminal",
      "priority": "CRÍTICO",
      "estimated_time": "4-6 horas",
      "deliverable": "curl /api/files retorna árvore; terminal WebSocket responde",
      "steps": [
        "Implementar FileService.ts (read, write, list, mkdir, delete, rename)",
        "Implementar routes/files.ts (REST CRUD)",
        "Implementar WatcherService.ts (Chokidar)",
        "Implementar wsServer.ts (WebSocket sobre Express HTTP server)",
        "Implementar fileWatchHandler.ts (broadcast file events via WS)",
        "Implementar TerminalService.ts (node-pty spawn/resize/kill)",
        "Implementar terminalHandler.ts (bridge WS ↔ node-pty)",
        "Implementar config.ts (WORKSPACE_ROOT, PORT)"
      ]
    },
    {
      "phase": 3,
      "name": "Frontend Core — Editor, Explorer, Terminal",
      "priority": "CRÍTICO",
      "estimated_time": "6-8 horas",
      "deliverable": "Clicar em arquivo abre no editor; terminal funciona; árvore atualiza em tempo real",
      "steps": [
        "Implementar types/ (FileNode, EditorTab, AgentMessage)",
        "Implementar editorStore.ts e fileStore.ts (Zustand)",
        "Implementar services/api.ts e services/wsClient.ts",
        "Implementar Layout.tsx (flex: sidebar | editor | agent-panel)",
        "Implementar FileTree.tsx + FileTreeNode.tsx",
        "Implementar EditorTabs.tsx",
        "Implementar CodeEditor.tsx (@monaco-editor/react configurado offline)",
        "Implementar Terminal.tsx (xterm.js + FitAddon + WS bridge)",
        "Wiring: FileTree click → open tab → CodeEditor render"
      ]
    },
    {
      "phase": 4,
      "name": "Integração de Agentes — Camada Básica",
      "priority": "ALTO",
      "estimated_time": "4-6 horas",
      "deliverable": "Agente consegue ler e escrever arquivos via chat; streaming visível",
      "steps": [
        "Implementar LLMAdapter.ts (OpenAI + Anthropic + Ollama)",
        "Implementar AgentTools.ts (read_file, write_file, list_directory, execute_command)",
        "Implementar AgentService.ts (loop agêntico: LLM → tool call → resultado → LLM)",
        "Implementar agentHandler.ts (WS handler)",
        "Implementar agentStore.ts (Zustand)",
        "Implementar AgentChat.tsx (painel com streaming)",
        "Wiring: AgentChat → WS → AgentService → tool call → FileService"
      ]
    },
    {
      "phase": 5,
      "name": "Approval e Diff — Gates HITL",
      "priority": "ALTO",
      "estimated_time": "3-4 horas",
      "deliverable": "Agente tenta escrever → ApprovalCard aparece → usuário aprova → arquivo salvo",
      "steps": [
        "Implementar DiffEditor.tsx (monaco DiffEditor)",
        "Implementar ApprovalCard.tsx (modal com diff + Aprovar/Rejeitar/Editar)",
        "Implementar GATE_0 em AgentTools.write_file() (interceptar antes de escrever)",
        "Wiring: write_file interceptado → WS approval.request → ApprovalCard",
        "Wiring: aprovado → FileService.write() + WAL log"
      ]
    },
    {
      "phase": 6,
      "name": "Persistência e Sessão",
      "priority": "MÉDIO",
      "estimated_time": "2-3 horas",
      "deliverable": "Reload da página restaura abas abertas e posição do cursor",
      "steps": [
        "Implementar WALService.ts (SQLite append-only intent log)",
        "Implementar WorkspaceService.ts (salvar/restaurar sessão)",
        "Persistir abas abertas em localStorage (Zustand middleware)",
        "Restaurar sessão ao iniciar (useEffect em App.tsx)"
      ]
    },
    {
      "phase": 7,
      "name": "Motor GreenForge — Módulos Avançados",
      "priority": "PÓS-MVP",
      "estimated_time": "2-4 semanas",
      "deliverable": "Debate adversarial completo com Propositor, Crítico e Árbitro",
      "steps": [
        "DebateService.ts (Propositor → Crítico → Árbitro pipeline)",
        "DebatePanel.tsx (visualização de rounds)",
        "LoopDetector.ts (análise WAL para loops semânticos)",
        "BootReconciler.ts (restauração pós-crash via WAL)",
        "WorktreeManager.ts (git worktree por agente)"
      ]
    }
  ],

  "critical_notes_for_code_agent": [
    "NUNCA usar CDN para monaco-editor — sempre configurar loader.config({ monaco }) para modo offline",
    "node-pty requer compilação nativa — pode precisar de node-gyp instalado no sistema",
    "xterm.js FitAddon deve ser chamado APÓS o terminal estar montado no DOM (useEffect com ref)",
    "WebSocket no Vite dev server requer proxy configurado para /ws com ws: true",
    "Monaco DiffEditor é componente separado do Editor — usar DiffEditor do @monaco-editor/react",
    "Chokidar deve usar { ignoreInitial: true } para não emitir eventos na inicialização",
    "node-pty.resize() deve ser chamado quando o terminal é criado E quando o componente é redimensionado",
    "Zustand persist middleware deve ser usado para editorStore para salvar abas em localStorage",
    "WAL SQLite deve usar PRAGMA journal_mode=WAL para performance em writes concorrentes",
    "Tool calls de agentes DEVEM passar por ApprovalCard antes de qualquer write_file() — nunca escrever diretamente",
    "WebSocket server deve ser criado sobre o mesmo servidor HTTP do Express — não em porta separada",
    "CORS deve permitir localhost:5173 em desenvolvimento",
    "O vite.config.ts deve ter proxy para /api (HTTP) e /ws (WebSocket) apontando para localhost:3001"
  ],

  "open_items": [],

  "current_state": {
    "where_we_stopped": "JSON canônico gerado a partir de engenharia reversa do ishaan1013/sandbox com filtro de dependências cloud e mapeamento para arquitetura GreenForge.",
    "next_actions": [
      "Entregar este JSON para agente de código (Claude Code, Cursor, Gemini CLI)",
      "Agente constrói fase 1 (scaffold) usando implementation_order[0]",
      "Validar que frontend e backend sobem sem erros",
      "Iterar pelas fases 2 a 6 em ordem",
      "Após IDE base funcionar: iniciar fase 7 (motor GreenForge)"
    ],
    "blockers": [
      "node-pty requer node-gyp — pode falhar em ambientes sem build tools instalados",
      "LLM_PROVIDER e chave de API obrigatórios para testar integração de agentes"
    ]
  }
}
```

---

## INSTRUÇÃO FINAL PARA O AGENTE

Após ler todo o código do repositório:

1. Preencha TODOS os campos marcados com `"[extraído do código real]"` com os valores reais
2. Preencha `source_analysis.real_folder_structure` com a árvore de pastas real
3. Preencha `source_analysis.removed_dependencies` com todos os pacotes cloud identificados
4. Preencha `source_analysis.kept_dependencies` com os pacotes que serão reaproveitados
5. Preencha `editor.initialization_pattern` com o código real de inicialização do Monaco
6. Preencha `terminal.message_protocol` com os tipos de mensagem WS reais do código
7. Preencha `rest_api.endpoints` com todos os endpoints REST reais
8. Preencha `interfaces.from_source` com as interfaces TypeScript reais encontradas
9. Preencha `dependencies.frontend.keep_from_source` e `remove_from_source` com os pacotes reais
10. Preencha `environment_variables.from_source` com as variáveis do .env.example real

**O JSON resultante deve ser autocontido e suficiente para um segundo agente construir o GreenForge IDE do zero, sem nunca ter visto o sandbox.**

Se qualquer informação não puder ser extraída com certeza, registrar em `open_items`:
```json
{
  "id": "O-001",
  "field": "[campo que não pôde ser preenchido]",
  "reason": "[por que não foi possível extrair]",
  "blocking": true,
  "suggested_action": "[o que verificar manualmente]"
}
```

**EXECUTE A EXTRAÇÃO AGORA.**
