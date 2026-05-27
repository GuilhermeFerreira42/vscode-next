# Limitações Conhecidas - BSC Code

## 13.1 Limitações Técnicas

### 13.1.1 Performance e Escala

| Limitação | Descrição | Workaround | Status |
|---|---|---|---|
| **Latência em conexões lentas** | Em conexões < 1 Mbps, latência de digitação pode exceder 100ms | Usar modo "low bandwidth" que desabilita preview em tempo real | Mitigado em v1.0 |
| **Limite de workspaces simultâneos** | Máximo de 10 workspaces ativos por usuário (configurável) | Solicitar aumento via admin, ou fechar workspaces não utilizados | Planejado para v1.5 |
| **Tamanho máximo de arquivo** | Arquivos > 50MB podem ter performance degradada no editor | Usar terminal para editar arquivos grandes com vim/nano | Sem plano de correção |
| **Conexões WebSocket simultâneas** | Limite de 1000 conexões por nó WebSocket | Horizontal scaling adicionando mais nós | Documentado |
| **Tempo de cold start** | Primeiro workspace leva 30-45s para iniciar | Manter pool de containers pré-aquecidos (enterprise) | Parcialmente mitigado |

### 13.1.2 Compatibilidade de Extensions

| Categoria | Limitação | Exemplos | Alternativa |
|---|---|---|---|
| **Extensions nativas** | Extensions que requerem binários específicos do SO não funcionam | C/C++ extension com debugger GDB local | Usar extensions baseadas em language servers remotos |
| **Acesso ao filesystem** | Extensions que acessam paths absolutos fora do workspace | Algumas extensions de backup | Configurar paths relativos |
| **Portas locais** | Extensions que esperam ouvir em portas específicas (< 1024) | Alguns database GUIs | Usar port forwarding do BSC Code |
| **Processos em background** | Processos que persistem após fechamento do workspace | Alguns language servers | Garantir cleanup no shutdown |

**Extensions Testadas e Funcionais:** ✅
- ms-python.python
- ms-vscode.vscode-typescript
- golang.Go
- rust-lang.rust-analyzer
- esbenp.prettier-vscode
- dbaeumer.vscode-eslint

**Extensions com Problemas Conhecidos:** ⚠️
- Algumas extensions de Docker local
- Extensions de VPN específicas
- Extensions de sincronização com filesystem local

### 13.1.3 IA e Machine Learning

| Limitação | Impacto | Mitigação |
|---|---|---|
| **Context window limitado** | IA não vê todo o projeto se > 200K tokens | Implementar RAG (Retrieval-Augmented Generation) em v2.0 |
| **Latência de resposta** | Primeiras respostas podem levar 3-5s | Streaming de tokens, cache de contexto comum |
| **Custo imprevisível** | Uso intensivo de IA pode gerar custos altos | Budget alerts, rate limits por usuário |
| **Qualidade variável** | IA pode gerar código incorreto ou inseguro | Review humano obrigatório, warnings visuais |
| **Provider downtime** | Se provider principal cai, fallback tem qualidade inferior | Multi-provider chain, modelo local como último recurso |

### 13.1.4 Colaboração em Tempo Real

| Limitação | Descrição | Workaround |
|---|---|---|
| **Máximo de colaboradores** | Até 10 usuários simultâneos no mesmo workspace | Para mais usuários, usar múltiplas sessões de review |
| **Conflitos de edição** | Edições na mesma linha podem causar conflitos | Operational transform resolve maioria dos casos |
| **Latência de sync** | Em redes intercontinentais, sync pode levar > 1s | Usar regiões próximas aos colaboradores |
| **Ausência de áudio/vídeo** | Pair programming requer ferramenta externa | Integrar com Zoom/Meet/Discord |

---

## 13.2 Limitações de Segurança

### 13.2.1 Isolamento de Containers

| Risco Residual | Probabilidade | Impacto | Mitigação Atual |
|---|---|---|---|
| **Container escape** | Baixa | Crítico | Seccomp, AppArmor, non-root user, capabilities drop |
| **Ataque side-channel** | Média | Alto | CPU pinning, memory isolation, monitoring de anomalias |
| **Vazamento via rede** | Baixa | Alto | Network policies, egress filtering, proxy obrigatório |
| **Persistência maliciosa** | Média | Médio | Snapshots limpos, scan de malware no startup |

### 13.2.2 Dados e Privacidade

| Limitação | Regulamentação Afetada | Status de Compliance |
|---|---|---|
| **Data residency** | LGPD, GDPR | Suportado via seleção de região, mas dados de IA podem transitar globalmente |
| **Right to be forgotten** | GDPR, LGPD | Implementado, mas backups podem reter dados por até 30 dias |
| **Data portability** | GDPR | Export completo disponível, mas formato pode não ser compatível com todos sistemas |
| **Audit trail** | SOC 2, ISO 27001 | Logs completos disponíveis, retenção de 2 anos |

---

## 13.3 Limitações Operacionais

### 13.3.1 Backup e Recovery

| Cenário | RTO (Recovery Time) | RPO (Data Loss) | Notas |
|---|---|---|---|
| **Falha de container único** | < 1 minuto | Zero (auto-save) | Restart automático |
| **Falha de nó worker** | < 5 minutos | < 1 minuto | Workspaces migrados para outro nó |
| **Falha de database primary** | < 15 minutos | < 5 minutos | Failover para réplica |
| **Disaster regional** | < 1 hora | < 15 minutos | Restore de backup cross-region |
| **Corrupção de dados** | < 4 horas | Variável | Restore de snapshot, possível perda de trabalho recente |

### 13.3.2 Manutenção e Downtime

| Tipo de Manutenção | Frequência | Duração Esperada | Impacto |
|---|---|---|---|
| **Deploy de aplicação** | Semanal | 5-10 minutos | Zero downtime (rolling deploy) |
| **Atualização de database** | Mensal | 15-30 minutos | Read-only mode durante migração |
| **Patch de segurança crítico** | Conforme necessário | 30-60 minutos | Downtime planejado com aviso prévio |
| **Upgrade de Kubernetes** | Trimestral | 1-2 horas | Zero downtime com node pooling |
| **Manutenção de infraestrutura** | Mensal | Variável | Agendado para horário de menor uso |

---

## 13.4 Limitações de Recursos

### 13.4.1 Alocação por Workspace

| Recurso | Free Tier | Pro Tier | Enterprise |
|---|---|---|---|
| **CPU** | 1 core | 2 cores | 4-8 cores |
| **Memória RAM** | 2 GB | 4 GB | 8-16 GB |
| **Storage** | 10 GB | 20 GB | 50-100 GB |
| **Network bandwidth** | 50 Mbps | 100 Mbps | 1 Gbps |
| **GPU** | Não disponível | Não disponível | Opcional (NVIDIA T4) |

### 13.4.2 Quotas de Uso

| Recurso | Limite | Reset | Upgrade Disponível |
|---|---|---|---|
| **Horas de workspace/mês** | 100h (free), ilimitado (paid) | Mensal | Sim |
| **Requests de IA/dia** | 50 (free), 500 (pro), ilimitado (enterprise) | Diário | Sim |
| **Armazenamento total** | 50 GB (free), 200 GB (pro), 1 TB+ (enterprise) | N/A | Sim |
| **Workspaces suspensos** | 5 (free), 20 (pro), 100+ (enterprise) | N/A | Sim |

---

## 13.5 Limitações Conhecidas por Navegador

| Navegador | Versão Mínima | Issues Conhecidas | Status |
|---|---|---|---|
| **Chrome** | 120+ | Nenhum issue crítico | ✅ Totalmente suportado |
| **Firefox** | 115+ | Terminal pode ter lag em versões antigas | ⚠️ Suportado com ressalvas |
| **Safari** | 16+ | Clipboard API limitada em iOS | ⚠️ Funcionalidade reduzida em mobile |
| **Edge** | 120+ | Nenhum issue crítico | ✅ Totalmente suportado |
| **Opera** | 100+ | Não testado extensivamente | ❓ Use por sua conta e risco |
| **Mobile browsers** | N/A | UI não otimizada para telas pequenas | ❌ Não suportado oficialmente |

---

## 13.6 Roadmap de Correções

### v1.1 (Q2 2025)
- [ ] Melhorar performance de arquivos grandes (> 50MB)
- [ ] Adicionar suporte a GPU para workspaces enterprise
- [ ] Reduzir cold start time para < 20s
- [ ] Implementar cache de contexto de IA entre sessões

### v1.5 (Q3 2025)
- [ ] Aumentar limite de colaboradores para 25 usuários
- [ ] Adicionar áudio/vídeo integrado para pair programming
- [ ] Suporte a extensions nativas via sandboxing avançado
- [ ] RAG para contexto de IA além do window limit

### v2.0 (Q1 2026)
- [ ] Editor mobile otimizado (iOS/Android app)
- [ ] Offline mode com sync quando online
- [ ] Suporte a GPUs consumer (RTX 4090, etc.)
- [ ] AI models locais rodando no workspace

---

## 13.7 Reportando Novas Limitações

Se você encontrou uma limitação não documentada:

1. **Verifique issues existentes** no GitHub
2. **Teste workaround** sugeridos na documentação
3. **Colete informações**:
   - Passos para reproduzir
   - Ambiente (browser, OS, network)
   - Logs do console (F12)
   - Screenshots/screen recording
4. **Reporte via GitHub Issue** com label `limitation`

Template de reporte:

```markdown
**Tipo de Limitação**
[Performance / Segurança / Compatibilidade / Outro]

**Descrição**
Descreva a limitação encontrada.

**Impacto**
Como isso afeta seu workflow?

**Ambiente**
- Browser: Chrome 120
- OS: Ubuntu 22.04
- Network: 100 Mbps corporate

**Workaround Tentado**
O que você já tentou para contornar?

**Sugestão de Melhoria**
Como poderia ser melhorado?
```

---

*Documento de Limitações Conhecidas. Próximo: Roadmap Futuro.*
