# 📊 GA4 Integration - pericia.judicial

Dashboard local de Google Analytics 4 para monitorar conversões do CRO System em tempo real.

## 🎯 O que é isso?

Em vez de acessar Google Analytics no navegador, você rodará um **script Node.js** que:

1. **Busca dados do GA4** via API (conversões, eventos CRO, engajamento)
2. **Salva em JSON local** (`ga4-data.json`)
3. **Visualiza em dashboard HTML** belissimo com gráficos e KPIs

## 🚀 Quick Start (5 minutos)

### 1️⃣ Instalar Node.js

Se não tiver ainda: [Download NodeJS](https://nodejs.org/)

### 2️⃣ Configurar Google Cloud

Siga [setup-guide.md](setup-guide.md) **Etapa 1 e 2** (cria service account e baixa credenciais JSON)

### 3️⃣ Preparar Pasta

```powershell
# Na pasta do projeto
npm install
```

### 4️⃣ Rodar Script

```powershell
node ga4-sync.js
```

Saída esperada:
```
✅ Inicializando sincronização GA4...
📊 Propriedade: 471852848
✅ Dados salvos em ga4-data.json
🎉 Sincronização concluída!
```

### 5️⃣ Abrir Dashboard

1. Abra `ga4-dashboard.html` no VS Code
2. Clique **Preview** 
3. Veja os gráficos lindíssimos! 📈

## 📁 Arquivos Criados

| Arquivo | Função |
|---------|--------|
| `ga4-sync.js` | Script Node.js que puxa dados do GA4 |
| `ga4-dashboard.html` | Dashboard HTML com gráficos Chart.js |
| `.env.example` | Template de variáveis (copie para `.env`) |
| `package.json` | Dependências npm |
| `setup-guide.md` | Guia completo de configuração |
| `ga4-data.json` | Dados sincronizados (criado automaticamente) |
| `ga4-credentials.json` | Chave de autenticação Google Cloud (criar manualmente) |

## 📊 Métricas que Você Verá

### KPIs Principais
- 👥 Visitantes únicos (últimos 7 dias)
- 📄 Visualizações de página  
- 🔄 Bounce rate
- ⏱️ Tempo médio na página

### Eventos CRO
- 🎯 Total de interações CRO
- 💬 Cliques em WhatsApp
- ❌ Pop-ups exit-intent
- 📊 CTR (click-through rate)

### Conversões por Página
- 💰 Ranking de páginas
- 📈 Gráfico de barras (top 10)
- 📊 Taxa de conversão percentual
- 🟢 Status (Excelente/Bom/Baixo)

### Gráficos
- 📊 Conversões ao longo de 7 dias
- 📈 Engajamento por página
- 📉 Tendências de bounce rate

## ⏰ Automatizar

### Sincronização Diária Automática

Windows:
```powershell
# Criar um Task Scheduler para rodar ga4-sync.js todo dia
```

Ver [setup-guide.md](setup-guide.md) **Etapa 5** para instruções completas.

### Sincronização Manual

Sempre que quiser:
```powershell
node ga4-sync.js
```

Dashboard vai ler `ga4-data.json` e mostrar dados atualizados.

## 🔧 Configuração

### Variáveis (.env)

```env
GA4_PROPERTY_ID=471852848              # ID da propriedade GA4
GOOGLE_APPLICATION_CREDENTIALS=./ga4-credentials.json  # Path da chave JSON
SYNC_INTERVAL_HOURS=24                 # Atualizar a cada 24h
```

### Mudar Propriedade GA4

Se quiser sincronizar outra propriedade:

1. Edite `.env`
2. Mude `GA4_PROPERTY_ID` para novo ID
3. Certifique que service account tem acesso
4. Rode `node ga4-sync.js`

## 🐛 Erros Comuns

| Erro | Solução |
|------|---------|
| `"ga4-credentials.json" not found` | Baixe chave JSON do Google Cloud (setup-guide.md) |
| `403 Forbidden` | Service account sem acesso ao GA4 (setup-guide.md, Etapa 2.3) |
| `Cannot find module '@google-analytics/data'` | Rode `npm install` |
| Dashboard vazio | Rode `node ga4-sync.js` antes de abrir |

Full troubleshooting em [setup-guide.md](setup-guide.md#-troubleshooting)

## 📈 Integrando com CRO System

Este dashboard monitora:

- **cro_interaction** - Cliques em botões CRO (floating bar, micro-CTAs)
- **exit_intent_popup** - Pop-ups quando usuário tenta sair
- **generate_lead** - Cliques em WhatsApp (conversão final)

Métricas aparecem em "Eventos CRO" no dashboard.

Os dados ajudam a:
✅ Medir efetividade do CRO System
✅ Identificar qual elemento converte mais
✅ Otimizar timing, cores e copy
✅ A/B testing com dados reais

## 📚 Documentação Completa

- **[setup-guide.md](setup-guide.md)** - Setup completo passo-a-passo
- **[ga4-sync.js](ga4-sync.js)** - Código comentado do script
- **[CRO-GA4-GUIDE.md](CRO-GA4-GUIDE.md)** - Integração CRO + GA4

## 🎯 Próximas Fases

### Fase 2: Expansão ($AÇAO)
- [ ] Deploy CRO em 8 páginas adicionais
- [ ] Baseline de conversão: target 2.5% em 30 dias
- [ ] Update plan_cro_implementacao.txt com métricas reais

### Fase 3: A/B Testing (Semana 3-5)
- [ ] Teste color: verde vs vermelho
- [ ] Teste copy: "Clique agora" vs "Saiba mais"
- [ ] Teste timing: pop-up após 15s vs 30s vs 60s

### Fase 4: Otimização Contínua (Semana 5+)
- [ ] Analyse cohorts de conversão
- [ ] Teste heatmaps
- [ ] Implementar top 3 recomendações

---

**Status:** ✅ Dashboard funcional, pronto para sincronização

**Próximo passo:** Siga [setup-guide.md](setup-guide.md) para configurar credenciais do Google Cloud
