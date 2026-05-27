# Decisões Arquiteturais (ADRs) - BSC Code

## Visão Geral

Este documento registra todas as decisões arquiteturais significativas tomadas durante o planejamento e implementação do BSC Code. Cada ADR segue o formato padrão com contexto, decisão, alternativas rejeitadas e consequências.

---

## ADR-001: Uso do OpenVSCode Server como Base

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-15 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Estratégico |

### Contexto

Precisávamos de uma solução para fornecer um ambiente VS Code acessível via navegador no Google Estúdio IA. As opções eram:
- Build from scratch usando Monaco Editor
- Fork do VS Code OSS
- Usar OpenVSCode Server pronto
- Usar code-server (Coder)

### Decisão

**Usar OpenVSCode Server como base para o BSC Code.**

O OpenVSCode Server é mantido pela Gitpod e fornece binários pré-compilados do VS Code rodando em servidor, com suporte oficial e atualizações frequentes.

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Monaco Editor puro** | Apenas o editor, sem extensões, terminal ou funcionalidades completas do VS Code |
| **VS Code OSS build manual** | Complexidade extrema de build, manutenção onerosa, updates difíceis |
| **code-server (Coder)** | Fork não-oficial, divergências com upstream, license concerns |

### Consequências

**Positivas:**
- ✅ Updates fáceis (apenas trocar versão do binário)
- ✅ Compatibilidade total com extensões do marketplace
- ✅ Suporte oficial da comunidade Gitpod
- ✅ Menor esforço de manutenção

**Negativas:**
- ⚠️ Dependência de projeto externo
- ⚠️ Customizações profundas requerem build from source
- ⚠️ Tamanho do pacote (~300MB)

### Mitigação

- Manter scripts de atualização automatizados
- Documentar processo de upgrade
- Ter plano de fallback se projeto for descontinuado

---

## ADR-002: Deploy via Docker como Método Primário

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-15 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Tático |

### Contexto

Necessidade de definir estratégia de deployment que funcione no Google Estúdio IA e seja portátil para outros ambientes.

### Decisão

**Docker como método primário de deployment, com opção native Linux como secundária.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Kubernetes nativo** | Overkill para caso de uso único, complexidade desnecessária |
| **Systemd apenas** | Não portável, específico demais para Linux |
| **Binary direto** | Falta isolamento, dependências manuais |

### Consequências

**Positivas:**
- ✅ Portabilidade total (roda em qualquer lugar com Docker)
- ✅ Isolamento de dependências
- ✅ Versionamento claro de imagens
- ✅ Fácil rollback

**Negativas:**
- ⚠️ Overhead de ~50MB vs native
- ⚠️ Requer conhecimento de Docker da equipe
- ⚠️ Debug mais complexo

### Mitigação

- Fornecer Dockerfile bem documentado
- Criar scripts de build automatizados
- Manter opção native para casos específicos

---

## ADR-003: Autenticação via Token Simples

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-16 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Segurança |

### Contexto

Definir mecanismo de autenticação para acesso ao VS Code Web. Requisitos: simplicidade, segurança adequada para ambiente controlado, sem overhead de infraestrutura.

### Decisão

**Usar token simples via query parameter (`?tkn=TOKEN`), gerado criptograficamente.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **OAuth2/OIDC** | Complexidade excessiva, requer IdP externo |
| **LDAP/Active Directory** | Overkill para caso de uso, infraestrutura adicional |
| **Basic Auth** | Menos seguro, credentials na URL |
| **Session-based** | Requer storage de sessões, mais complexo |

### Consequências

**Positivas:**
- ✅ Implementação trivial
- ✅ Sem dependências externas
- ✅ Fácil rotação de tokens
- ✅ Adequado para ambiente controlado

**Negativas:**
- ⚠️ Token na URL pode vazar em logs
- ⚠️ Sem MFA nativo
- ⚠️ Gestão manual de tokens em escala

### Mitigação

- Usar HTTPS obrigatório em produção
- Tokens com validade limitada
- Logs sanitizados para não expor tokens
- Planejar upgrade para OAuth2 se necessário

---

## ADR-004: Node.js 20.x como Runtime

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-16 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Técnico |

### Contexto

Selecionar versão do Node.js para runtime da aplicação. VS Code e extensões têm requisitos específicos de versão.

### Decisão

**Node.js 20.x LTS como versão padrão suportada.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Node.js 18.x** | End of life em Abril 2025, preferir versão mais recente |
| **Node.js 21.x+** | Versão current, não LTS, menor estabilidade |
| **Node.js 16.x** | Já end-of-life, incompatibilidades conhecidas |

### Consequências

**Positivas:**
- ✅ LTS até Abril 2026
- ✅ Performance melhor que 18.x
- ✅ Compatibilidade total com VS Code
- ✅ npm 10.x incluso

**Negativas:**
- ⚠️ Algumas extensões legadas podem ter issues
- ⚠️ Necessidade de testar todas as extensões

### Mitigação

- Matriz de compatibilidade de extensões
- Ambiente de staging para testes
- Plano de rollback para Node 18 se crítico

---

## ADR-005: Armazenamento Persistente em Volumes Docker

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-17 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Dados |

### Contexto

Definir estratégia de persistência para workspaces, extensões e configurações dos usuários.

### Decisão

**Volumes Docker nomeados para persistência, com estrutura de diretórios clara.**

```yaml
volumes:
  bsc-workspace:/home/workspace
  bsc-extensions:/home/extensions
  bsc-config:/home/config
```

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Bind mounts** | Acoplamento ao host, menos portável |
| **Storage em banco de dados** | Complexidade desnecessária para arquivos |
| **S3/Object Storage** | Latência, custo, overengineering |
| **Efêmero** | Perda de dados inaceitável |

### Consequências

**Positivas:**
- ✅ Dados sobrevivem a restarts/recreates
- ✅ Backup simplificado (snapshot de volumes)
- ✅ Portável entre hosts Docker
- ✅ Performance nativa

**Negativas:**
- ⚠️ Volumes são específicos do host Docker
- ⚠️ Migração entre hosts requer copy manual
- ⚠️ Crescimento não monitorado automaticamente

### Mitigação

- Scripts de backup automatizados
- Monitoramento de uso de disco
- Quotas por volume
- Documentação de migração

---

## ADR-006: Reverse Proxy Obrigatório em Produção

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-17 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Segurança/Rede |

### Contexto

Definir arquitetura de rede para exposição do serviço. VS Code Web não deve ser exposto diretamente à internet.

### Decisão

**Nginx como reverse proxy obrigatório em produção, com TLS termination no proxy.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Exposição direta** | Inseguro, sem TLS, sem proteção |
| **TLS nativo no VS Code** | Gerenciamento de certs complexo |
| **Traefik** | Mais complexo que necessário para caso simples |
| **HAProxy** | Configuração mais verbosa que Nginx |

### Consequências

**Positivas:**
- ✅ TLS centralizado no proxy
- ✅ Rate limiting e proteções DDoS
- ✅ Logging centralizado
- ✅ Possibilidade de múltiplos backends

**Negativas:**
- ⚠️ Componente adicional para manter
- ⚠️ Configuração de WebSocket requer atenção
- ⚠️ Mais um ponto de falha potencial

### Mitigação

- Configuração de exemplo bem documentada
- Health checks no backend
- Fallback para acesso direto (dev apenas)

---

## ADR-007: Extensões do Open VSX Registry

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-18 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Funcionalidade |

### Contexto

VS Code Web requer marketplace de extensões. Microsoft Marketplace tem restrições de uso fora do VS Code oficial.

### Decisão

**Usar Open VSX Registry como marketplace padrão, com opção de marketplace corporativo interno se necessário.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Microsoft Marketplace** | Violação de ToS para uso não-oficial |
| **Marketplace próprio do zero** | Esforço desproporcional |
| **Sem extensões** | Reduz drasticamente utilidade |
| **Side-loading apenas** | Experiência de usuário ruim |

### Consequências

**Positivas:**
- ✅ Legalmente seguro (open source)
- ✅ Catálogo razoável de extensões populares
- ✅ Auto-hospedável se necessário
- ✅ Compatível com VS Code

**Negativas:**
- ⚠️ Algumas extensões proprietárias indisponíveis
- ⚠️ Updates podem demorar mais que MS Marketplace
- ⚠️ Qualidade das extensões não curada

### Mitigação

- Lista de extensões testadas e recomendadas
- Processo para solicitar adição de extensões
- Opção de instalar manualmente via VSIX

---

## ADR-008: Single-User por Instância como Padrão

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-18 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Arquitetura |

### Contexto

Definir modelo de multi-tenancy: uma instância por usuário ou múltiplos usuários por instância?

### Decisão

**Single-user por instância como padrão, com opção de multi-user configurável para casos específicos.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Multi-user sempre** | Isolamento fraco, "noisy neighbor" |
| **Container por usuário** | Overhead de recursos, complexidade |
| **Kubernetes com auto-scale** | Overengineering para caso inicial |

### Consequências

**Positivas:**
- ✅ Isolamento total entre usuários
- ✅ Recursos dedicados por usuário
- ✅ Debug simplificado
- ✅ Security boundary clara

**Negativas:**
- ⚠️ Mais instâncias para gerenciar
- ⚠️ Custo maior de infraestrutura
- ⚠️ Orquestração necessária em escala

### Mitigação

- Scripts de orquestração simples
- Limites de recursos por instância
- Auto-shutdown de instâncias ociosas

---

## ADR-009: Logging Estruturado JSON

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-19 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Observabilidade |

### Contexto

Definir formato de logs para facilitar análise, troubleshooting e integração com ferramentas de observabilidade.

### Decisão

**Logs estruturados em formato JSON, com níveis padrão (error, warn, info, debug).**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Logs em texto puro** | Difícil parsing, análise manual |
| **Syslog** | Formato limitado, menos rico |
| **Binário** | Ilegível sem ferramenta específica |

### Consequências

**Positivas:**
- ✅ Parsing automático por ferramentas
- ✅ Campos estruturados para filtering
- ✅ Integração com ELK, Datadog, etc.
- ✅ Correlation IDs facilitam tracing

**Negativas:**
- ⚠️ Legibilidade humana reduzida
- ⚠️ Volume de logs maior
- ⚠️ Requer ferramenta de visualização

### Mitigação

- Ferramenta de pretty-print para dev
- Sample rate para logs debug em produção
- Rotação e retenção configuradas

---

## ADR-010: Sem Banco de Dados Externo

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-19 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Dados/Arquitetura |

### Contexto

Definir necessidade de banco de dados externo para armazenamento de estado da aplicação.

### Decisão

**Não usar banco de dados externo. Estado persistente em arquivos (workspaces, configs, extensões).**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **PostgreSQL** | Complexidade desnecessária |
| **MongoDB** | Mesmo motivo |
| **Redis** | Apenas cache, não persistência principal |
| **SQLite** | Adiciona complexidade sem benefício claro |

### Consequências

**Positivas:**
- ✅ Arquitetura simplificada
- ✅ Menos dependências
- ✅ Backup trivial (copy de arquivos)
- ✅ Menor custo operacional

**Negativas:**
- ⚠️ Consultas complexas limitadas
- ⚠️ Sem transações ACID
- ⚠️ Escalabilidade vertical apenas

### Mitigação

- Estrutura de arquivos bem organizada
- Lock files para concorrência
- Se necessário no futuro, introduzir SQLite local

---

## ADR-011: Ubuntu 22.04 como SO Base

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-20 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Infraestrutura |

### Contexto

Selecionar sistema operacional base para imagens Docker e deployments nativos.

### Decisão

**Ubuntu 22.04 LTS como SO base padrão.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Debian 12** | Menor suporte comercial, packages mais antigos |
| **Alpine** | Incompatibilidades com glibc, debugging complexo |
| **RHEL/CentOS** | Custo de licença, overkill |
| **Amazon Linux** | Vendor lock-in |

### Consequências

**Positivas:**
- ✅ Suporte LTS até 2027
- ✅ Packages atualizados
- ✅ Amplamente testado e documentado
- ✅ Familiaridade da equipe

**Negativas:**
- ⚠️ Imagem maior que Alpine (~77MB vs ~5MB)
- ⚠️ Surface de segurança maior

### Mitigação

- Usar variant `-slim` quando possível
- Scan regular de vulnerabilidades
- Updates de segurança automatizados

---

## ADR-012: WebSocket sobre Porta Única

| Campo | Valor |
|-------|-------|
| **Status** | ACEITA |
| **Data** | 2024-01-20 |
| **Decisor** | Equipe de Arquitetura BSC |
| **Impacto** | Rede |

### Contexto

Definir estratégia de portas: HTTP e WebSocket na mesma porta ou portas separadas?

### Decisão

**HTTP e WebSocket compartilhando a mesma porta (3000 por padrão), com upgrade de protocolo.**

### Alternativas Rejeitadas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Portas separadas** | Complexidade de firewall, NAT |
| **WebSocket apenas** | Quebra compatibilidade com HTTP |
| **Porta diferente para WebSocket** | Configuração extra, confusão |

### Consequências

**Positivas:**
- ✅ Firewall simples (uma porta apenas)
- ✅ Configuração de proxy única
- ✅ Compatível com ambientes restritivos

**Negativas:**
- ⚠️ Proxy precisa suportar WebSocket upgrade
- ⚠️ Debug de tráfego misto mais complexo

### Mitigação

- Configuração de proxy bem documentada
- Headers claros para identificação de tráfego
- Logs separam HTTP e WebSocket

---

## Resumo das Decisões

| ID | Decisão | Status | Impacto |
|----|---------|--------|---------|
| ADR-001 | OpenVSCode Server como base | ✅ Aceita | Estratégico |
| ADR-002 | Docker como deploy primário | ✅ Aceita | Tático |
| ADR-003 | Autenticação via token simples | ✅ Aceita | Segurança |
| ADR-004 | Node.js 20.x LTS | ✅ Aceita | Técnico |
| ADR-005 | Volumes Docker para persistência | ✅ Aceita | Dados |
| ADR-006 | Reverse proxy obrigatório | ✅ Aceita | Segurança |
| ADR-007 | Open VSX Registry | ✅ Aceita | Funcionalidade |
| ADR-008 | Single-user por instância | ✅ Aceita | Arquitetura |
| ADR-009 | Logging JSON estruturado | ✅ Aceita | Observabilidade |
| ADR-010 | Sem banco de dados externo | ✅ Aceita | Dados |
| ADR-011 | Ubuntu 22.04 LTS | ✅ Aceita | Infraestrutura |
| ADR-012 | WebSocket na porta única | ✅ Aceita | Rede |

---

## Processo de Mudança de ADR

Para modificar ou revogar um ADR existente:

1. **Proposta**: Criar issue descrevendo mudança proposta
2. **Análise**: Equipe avalia impacto técnico e de negócio
3. **Decisão**: Novo ADR referenciando anterior (ex: ADR-001v2)
4. **Implementação**: Atualizar documentação e código
5. **Comunicação**: Notificar stakeholders afetados

---

## Referências

- [ADR Format](https://github.com/joelparkerhenderson/architecture-decision-record)
- [OpenVSCode Server Architecture](https://github.com/gitpod-io/openvscode-server)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

**Próximo Documento:** [01-compliance-regulatorio.md](./01-compliance-regulatorio.md)

**Documento Anterior:** [11-roadmap-futuro.md](../14-roadmap/11-roadmap-futuro.md)
