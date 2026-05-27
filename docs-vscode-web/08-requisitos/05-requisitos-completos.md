# Requisitos Funcionais e Não-Funcionais - BSC Code

## 6.1 Requisitos Funcionais

| ID | Requisito | Critério de Aceite (Verificável) | Prioridade | Complexidade | Componente Responsável |
|---|---|---|---|---|---|
| **RF-001** | Usuário deve poder autenticar com email e senha | Login realizado em < 10s, redirecionamento para dashboard ocorre após autenticação bem-sucedida | MoSCoW: Must | Baixa | Auth Service |
| **RF-002** | Usuário deve poder autenticar via OAuth (GitHub/Google) | Flow OAuth completo em < 30s, conta criada/atualizada automaticamente | MoSCoW: Must | Média | Auth Service |
| **RF-003** | Sistema deve suportar MFA com TOTP | Código de 6 dígitos válido permite login, código inválido bloqueia acesso | MoSCoW: Must | Média | Auth Service |
| **RF-004** | Usuário deve poder criar novo workspace | Workspace criado e acessível em < 30s, container Docker iniciado e saudável | MoSCoW: Must | Alta | Workspace Manager |
| **RF-005** | Usuário deve poder listar seus workspaces | Lista retorna em < 500ms, mostra status (running/stopped), URL de acesso | MoSCoW: Must | Baixa | API Gateway |
| **RF-006** | Usuário deve poder deletar workspace | Workspace removido em < 10s, container parado, volumes preservados por 24h | MoSCoW: Must | Baixa | Workspace Manager |
| **RF-007** | Editor deve suportar syntax highlighting para 20+ linguagens | Arquivos .py, .js, .ts, .go, .java, .cpp, .rs, .rb, .php, .html, .css exibem cores corretas | MoSCoW: Must | Baixa | OpenVSCode Server |
| **RF-008** | Editor deve ter autocomplete inteligente | Intellisense funciona para Python e JavaScript, sugestões aparecem em < 500ms | MoSCoW: Must | Alta | OpenVSCode Server + IA |
| **RF-009** | Terminal integrado deve executar comandos bash | Comandos `ls`, `cd`, `git`, `python`, `npm` executam e output aparece em < 200ms | MoSCoW: Must | Média | WebSocket Manager |
| **RF-010** | Usuário deve poder instalar extensions do Marketplace | Extension instalada em < 60s, funcional após instalação, persiste entre sessões | MoSCoW: Must | Alta | OpenVSCode Server |
| **RF-011** | Git integration deve permitir clone, commit, push | Clone de repositório GitHub em < 30s, commit registrado, push sincronizado | MoSCoW: Must | Alta | Workspace Container |
| **RF-012** | Debugging deve funcionar para Python e JavaScript | Breakpoint hit pausa execução, variables inspecionadas, step-through funciona | MoSCoW: Must | Alta | OpenVSCode Server |
| **RF-013** | IA Assistant deve gerar código sob demanda | Código gerado em < 3s, inserido no arquivo ao aceitar, contexto do projeto usado | MoSCoW: Must | Alta | IA Orchestrator |
| **RF-014** | IA Assistant deve explicar código selecionado | Explicação gerada em < 3s, precisa e relevante para o código selecionado | MoSCoW: Should | Média | IA Orchestrator |
| **RF-015** | Usuário deve poder compartilhar workspace | Convite enviado por email/link, usuário convidado acessa em < 5min, permissões aplicadas | MoSCoW: Should | Alta | API Gateway + WebSocket |
| **RF-016** | Múltiplos usuários devem ver edições em tempo real | Cursor de cada usuário visível com cor única, edições aparecem em < 500ms | MoSCoW: Should | Alta | WebSocket Manager |
| **RF-017** | Workspace deve persistir após fechamento do browser | Ao retornar em < 24h, arquivos editados estão salvos, terminal disponível | MoSCoW: Must | Média | Workspace Manager + EFS |
| **RF-018** | Auto-save deve salvar arquivos periodicamente | Arquivo salvo automaticamente a cada 5min ou após 1s de inatividade de digitação | MoSCoW: Must | Baixa | OpenVSCode Server |
| **RF-019** | Usuário deve poder fazer upload de arquivos locais | Upload de arquivo < 50MB completa em < 30s, arquivo disponível no workspace | MoSCoW: Should | Baixa | API Gateway |
| **RF-020** | Usuário deve poder baixar arquivos do workspace | Download inicia em < 2s, arquivo íntegro, checksum validado | MoSCoW: Should | Baixa | API Gateway |
| **RF-021** | Sistema deve detectar linguagem do projeto automaticamente | Ao abrir workspace, extensions recomendadas sugeridas baseadas em package.json, requirements.txt, etc. | MoSCoW: Should | Média | Workspace Manager |
| **RF-022** | Usuário deve poder configurar variáveis de ambiente | Env vars definidas via UI ou .env file, disponíveis no terminal e runtime | MoSCoW: Should | Baixa | Workspace Container |
| **RF-023** | IA deve suportar inline completion (Copilot-like) | Completação aparece enquanto digita, aceita com Tab, rejeita com Esc | MoSCoW: Should | Alta | IA Orchestrator |
| **RF-024** | Usuário deve poder rodar tarefas pré-configuradas | Tasks definidas em tasks.json executam no terminal, output capturado | MoSCoW: Could | Baixa | OpenVSCode Server |
| **RF-025** | Sistema deve notificar usuário sobre workspace expirando | Notificação email/push 1h antes de expiração, opção de estender sessão | MoSCoW: Could | Baixa | Notification Service |
| **RF-026** | Admin deve poder revogar acesso de usuário | User access revogado imediatamente, sessions ativas terminadas em < 1min | MoSCoW: Must | Baixa | Auth Service |
| **RF-027** | Sistema deve registrar audit logs de ações críticas | Logs de login, delete workspace, share registrados com timestamp, user_id, IP | MoSCoW: Must | Baixa | Audit Service |
| **RF-028** | Usuário deve poder resetar senha via email | Email de reset enviado em < 30s, link válido por 1h, nova senha aplicada | MoSCoW: Must | Baixa | Auth Service |
| **RF-029** | Workspace deve suportar port forwarding | Porta 8080+ acessível via URL pública, tunnel seguro estabelecido | MoSCoW: Should | Média | Workspace Manager |
| **RF-030** | Sistema deve suportar temas customizáveis | Tema escuro/claro alternável, preferências salvas no perfil do usuário | MoSCoW: Could | Baixa | Frontend |

---

## 6.2 Requisitos Não-Funcionais

### Performance

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-P-001** | Latência de Digitação | Tempo entre tecla pressionada e caractere exibido | p95 latency | < 50ms | Client-side telemetry |
| **RNF-P-002** | Carregamento Inicial | Tempo do login ao editor totalmente funcional | End-to-end time | < 30s | Logging de timestamps |
| **RNF-P-003** | Resposta da IA | Tempo do request à primeira token da resposta | Time to first token | < 3s | IA Orchestrator logs |
| **RNF-P-004** | Sincronização Colaborativa | Tempo da edição de um usuário aparecer para outros | End-to-end sync | < 500ms | WebSocket event timing |
| **RNF-P-005** | Query de Banco de Dados | Tempo de resposta de queries comuns | Query execution time | < 100ms p95 | PostgreSQL slow query log |
| **RNF-P-006** | Cache Hit Rate | Porcentagem de requests servidos pelo Redis | Cache hit ratio | > 80% | Redis stats |
| **RNF-P-007** | Throughput de API | Requests processados por segundo | RPS sustentado | > 1000 RPS | Load testing |
| **RNF-P-008** | WebSocket Connections | Conexões simultâneas suportadas | Concurrent connections | > 10,000 | Load testing |

### Segurança

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-S-001** | Criptografia em Trânsito | Todo tráfego externo usa TLS 1.3 | % HTTPS/TLS 1.3 | 100% | SSL Labs test |
| **RNF-S-002** | Criptografia em Repouso | Dados sensíveis criptografados com AES-256 | % dados críticos encryptados | 100% | Security audit |
| **RNF-S-003** | Autenticação Forte | MFA disponível e incentivado | % usuários com MFA ativo | > 60% em 90 dias | Auth analytics |
| **RNF-S-004** | Isolamento de Containers | Nenhum container escapa para host | Container escapes detectados | 0 | Security monitoring |
| **RNF-S-005** | Vulnerabilidades Conhecidas | Dependências sem CVEs críticos | CVEs críticos abertos | 0 | Snyk/Dependabot |
| **RNF-S-006** | Penetration Testing | Tests externos regulares | Pentests por ano | ≥ 4 | Security reports |
| **RNF-S-007** | Compliance LGPD | Dados pessoais tratados conforme lei | Violações reportadas | 0 | Legal audit |

### Escalabilidade

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-E-001** | Scaling Horizontal | Adicionar nodes aumenta capacidade linearmente | Throughput increase per node | > 90% eficiência | Load testing |
| **RNF-E-002** | Auto-scaling | Sistema escala automaticamente sob carga | Time to scale up | < 5min | Monitoring alerts |
| **RNF-E-003** | Multi-tenancy | Suporte a múltiplos clientes isolados | Tenants suportados | > 100 | Architecture design |
| **RNF-E-004** | Crescimento de Dados | Banco de dados performa com crescimento | Query latency com 10x dados | < 2x degradação | Load testing |

### Confiabilidade

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-R-001** | Disponibilidade | Uptime do sistema | % uptime mensal | > 99.9% | Uptime monitoring |
| **RNF-R-002** | Recovery Time | Tempo para recuperar de falha crítica | MTTR (Mean Time To Recovery) | < 15min | Incident reports |
| **RNF-R-003** | Data Loss | Perda máxima de dados aceitável | RPO (Recovery Point Objective) | < 5min | Backup logs |
| **RNF-R-004** | Error Rate | Porcentagem de requests com erro | % HTTP 5xx | < 0.1% | Application metrics |
| **RNF-R-005** | Health Checks | Detecção automática de falhas | Time to detect failure | < 30s | Monitoring system |

### Usabilidade

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-U-001** | Curva de Aprendizado | Tempo para usuário ser produtivo | Time to first commit | < 5min | Analytics |
| **RNF-U-002** | Acessibilidade | Conformidade com WCAG | WCAG level | AA | Accessibility audit |
| **RNF-U-003** | Browser Support | Navegadores suportados | Chrome, Firefox, Safari, Edge (últimas 2 versões) | 100% funcional | Cross-browser testing |
| **RNF-U-004** | Network Conditions | Funciona em conexões limitadas | Minimum bandwidth | 3G (1 Mbps) | Throttling tests |
| **RNF-U-005** | Internationalization | Suporte a múltiplos idiomas | Idiomas suportados | pt-BR, en, es | i18n coverage |

### Observabilidade

| ID | Categoria | Requisito | Métrica | Target | Como Medir |
|---|---|---|---|---|---|
| **RNF-O-001** | Logging Centralizado | Todos logs disponíveis em único lugar | % serviços logando no Loki | 100% | Log volume analysis |
| **RNF-O-002** | Distributed Tracing | Requests rastreáveis entre serviços | % requests com trace ID | > 95% | Tracing sampling |
| **RNF-O-003** | Alerting | Alertas automáticos para anomalias | Critical alerts notified | < 1min | Alertmanager logs |
| **RNF-O-004** | Dashboards | Visibilidade de métricas chave | Dashboards atualizados | Real-time (< 30s lag) | Grafana refresh rate |

---

## 6.3 Matriz de Rastreabilidade

| RF/RNF | Componente | Arquivo | Método/Função | Teste que Valida | Critério Binário de Aceite |
|---|---|---|---|---|---|
| RF-001 | Auth Service | `auth/routes.py` | `login()` | `test_login_success` | HTTP 200 + JWT token retornado |
| RF-001 | Auth Service | `auth/routes.py` | `login()` | `test_login_invalid_password` | HTTP 401 + mensagem de erro |
| RF-002 | Auth Service | `auth/oauth.py` | `github_callback()` | `test_oauth_github_flow` | Conta criada/logada via GitHub |
| RF-003 | Auth Service | `auth/mfa.py` | `verify_totp()` | `test_mfa_valid_code` | Código válido permite login |
| RF-004 | Workspace Manager | `workspace/manager.py` | `create_workspace()` | `test_workspace_creation_time` | < 30s do request ao running |
| RF-007 | OpenVSCode Server | N/A (upstream) | N/A | `test_syntax_highlighting` | Cores corretas em 20 linguagens |
| RF-008 | IA Orchestrator | `ia/completion.py` | `get_intellisense()` | `test_autocomplete_latency` | Sugestões em < 500ms |
| RF-009 | WebSocket Manager | `websocket/handler.py` | `handle_terminal_input()` | `test_terminal_command_execution` | Output aparece em < 200ms |
| RF-013 | IA Orchestrator | `ia/chat.py` | `generate_code()` | `test_code_generation_latency` | Código em < 3s |
| RF-016 | WebSocket Manager | `websocket/collab.py` | `broadcast_cursor_update()` | `test_collaborative_sync` | Edição visível em < 500ms |
| RNF-P-001 | Frontend | `editor/telemetry.ts` | `measureKeystrokeLatency()` | `test_typing_latency_p95` | p95 < 50ms |
| RNF-P-002 | System | `api/gateway.py` | Full flow | `test_e2e_startup_time` | < 30s total |
| RNF-S-001 | Nginx | `nginx/nginx.conf` | TLS config | `test_ssl_labs_grade` | Grade A+ no SSL Labs |
| RNF-S-002 | Database | `models/user.py` | EncryptedString | `test_email_encryption` | Email criptografado no DB |
| RNF-R-001 | Infrastructure | Kubernetes | HPA config | `test_uptime_monitoring` | > 99.9% em 30 dias |
| RNF-O-001 | Logging | `utils/logging.py` | RedactingFormatter | `test_logs_in_loki` | Logs queryable no Loki |

---

## 6.4 Testes Obrigatórios por Requisito

### Testes de Unitário (Unit Tests)

```python
# tests/unit/test_auth.py
import pytest
from auth.service import AuthService
from auth.mfa import verify_totp

class TestLogin:
    def test_login_success(self, mock_user):
        auth = AuthService()
        result = auth.login("user@example.com", "correct_password")
        assert result["success"] is True
        assert "access_token" in result
        assert result["access_token"].startswith("eyJ")
    
    def test_login_invalid_password(self, mock_user):
        auth = AuthService()
        result = auth.login("user@example.com", "wrong_password")
        assert result["success"] is False
        assert result["error"]["code"] == "INVALID_CREDENTIALS"
    
    def test_login_rate_limited(self, redis_client):
        auth = AuthService()
        # Simula 5 tentativas falhas
        for _ in range(5):
            auth.login("user@example.com", "wrong")
        
        # 6ª tentativa deve ser bloqueada
        result = auth.login("user@example.com", "correct")
        assert result["success"] is False
        assert result["error"]["code"] == "RATE_LIMIT_EXCEEDED"

class TestMFA:
    def test_totp_valid_code(self, mock_user_with_mfa):
        totp_code = generate_totp(mock_user_with_mfa.mfa_secret)
        result = verify_totp(mock_user_with_mfa.mfa_secret, totp_code)
        assert result is True
    
    def test_totp_invalid_code(self, mock_user_with_mfa):
        result = verify_totp(mock_user_with_mfa.mfa_secret, "000000")
        assert result is False
```

### Testes de Integração

```python
# tests/integration/test_workspace.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_workspace_end_to_end():
    async with AsyncClient() as client:
        # Login
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "TestPass123!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create workspace
        start_time = time.time()
        create_resp = await client.post("/api/v1/workspaces", json={
            "template": "python",
            "name": "test-workspace"
        }, headers=headers)
        elapsed = time.time() - start_time
        
        assert create_resp.status_code == 201
        assert elapsed < 30, f"Workspace creation took {elapsed}s (> 30s)"
        
        workspace_id = create_resp.json()["data"]["workspace_id"]
        
        # Verify workspace is running
        status_resp = await client.get(f"/api/v1/workspaces/{workspace_id}", headers=headers)
        assert status_resp.json()["data"]["status"] == "running"
```

### Testes de Performance

```python
# tests/performance/test_typing_latency.py
from locust import HttpUser, task, between
import statistics

class TypingLatencyTest(HttpUser):
    wait_time = between(1, 2)
    
    @task
    def measure_keystroke_latency(self):
        # Simula digitação via WebSocket
        ws = websocket.create_connection(f"wss://bsc.code/ws?token={self.token}")
        
        latencies = []
        for _ in range(100):
            start = time.time()
            ws.send(json.dumps({"type": "file_operation", "op": "write", ...}))
            response = ws.recv()
            end = time.time()
            latencies.append((end - start) * 1000)  # ms
        
        p95 = statistics.quantiles(latencies, n=20)[18]
        assert p95 < 50, f"p95 latency {p95}ms exceeds 50ms target"
```

---

*Documento de Requisitos completo. Próximo: Plano de Implementação.*
