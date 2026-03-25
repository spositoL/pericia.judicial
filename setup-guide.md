# 📚 Setup Guide: GA4 Integration com pericia.judicial

## Visão Geral

Este guia ensina como configurar a sincronização automática de dados Google Analytics 4 (GA4) para o site pericia.judicial, com dashboard local em HTML.

**Objetivo:** Substituir o acesso ao GA4 dashboard no navegador por um arquivo JSON + dashboard HTML que você atualiza automaticamente.

**Tempo de Setup:** 15-20 minutos

---

## ✅ Pré-requisitos

- Node.js 14+ instalado ([Download aqui](https://nodejs.org/))
- Acesso ao Google Cloud Console
- Permissões de admin no GA4 (propriedade 471852848)
- Terminal PowerShell (já tem no Windows)

---

## 🔧 Etapa 1: Criar Service Account no Google Cloud

Um "Service Account" é uma conta de máquina que permite ao seu script acessar GA4.

### 1.1 Acessar Google Cloud Console

1. Abra https://console.cloud.google.com/
2. Faça login com sua conta Google (aquela vinculada ao GA4)
3. Selecione o projeto de analytics

### 1.2 Habilitar API

1. Vá para **APIs & Services** → **Library**
2. Procure por **Google Analytics Data API**
3. Clique nela → **Enable**
4. Aguarde 30 segundos para ativar

### 1.3 Criar Service Account

1. Vá para **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **Service Account**
3. Preencha:
   - **Service account name:** `ga4-pericia-sync`
   - **Service account ID:** (deixe auto-gerado)
   - Clique **Create and Continue**
4. Na próxima tela, pule as permissões (click **Continue** 2x)
5. Pronto! Clique **Done**

### 1.4 Criar JSON Key

1. Volte para **APIs & Services** → **Credentials**
2. Encontre o Service Account `ga4-pericia-sync`
3. Clique na linha → aba **Keys**
4. Clique **Add Key** → **Create new key** → **JSON**
5. Um arquivo `ga4-pericia-sync-XXXXX.json` será baixado

**Guarde este arquivo!** Você vai precisar dele nos próximos passos.

---

## 📂 Etapa 2: Configurar Arquivos Locais

### 2.1 Copiar JSON de Credenciais

1. Coloque o arquivo JSON baixado na pasta do projeto:
   ```
   g:\Meu Drive\PROFISSIONAL\CONSULTORIA\pericia.judicial\ga4-credentials.json
   ```

2. Se o arquivo tem nome diferente (tipo `ga4-pericia-sync-12345.json`), pode renomear para `ga4-credentials.json`

### 2.2 Criar arquivo .env

1. Abra `.env.example` no VS Code
2. Salve como `.env` (sem .example)
3. Verifique:
   ```
   GA4_PROPERTY_ID=471852848
   GOOGLE_APPLICATION_CREDENTIALS=./ga4-credentials.json
   ```

### 2.3 Dar Acesso ao Service Account no GA4

1. Abra https://analytics.google.com/
2. Vá para a propriedade 471852848
3. **Admin** (engrenagem, canto inferior esquerdo)
4. Selecione a propriedade
5. **Property User Management**
6. Clique **Add users**
7. Cole o email do service account (encontra em `ga4-credentials.json`, campo `client_email`)
8. Selecione role: **Editor**
9. Clique **Add**

---

## 🚀 Etapa 3: Instalar Dependências e Rodar Script

### 3.1 Abrir Terminal

1. No VS Code, pressione **Ctrl + `** (backtick) para abrir terminal
2. Ou abra PowerShell em: `g:\Meu Drive\PROFISSIONAL\CONSULTORIA\pericia.judicial\`

### 3.2 Instalar Packages

```powershell
npm install
```

Isso vai fazer download das dependências em `node_modules/`:
- `@google-analytics/data` - Cliente GA4
- `dotenv` - Carregar variáveis do .env

### 3.3 Rodar Script Pela Primeira Vez

```powershell
node ga4-sync.js
```

**Esperado:**
```
✅ Inicializando sincronização GA4...
📊 Propriedade: 471852848
⏳ Buscando métricas (últimos 7 dias)...
✅ Métricas obtidas com sucesso
✅ Eventos CRO buscados
✅ Eventos de conversão buscados
✅ Dados salvos em ga4-data.json
🎉 Sincronização concluída!
```

Se der erro de credenciais, volte à Etapa 2.3 para verificar permissões no GA4.

---

## 📊 Etapa 4: Visualizar Dashboard

### 4.1 Abrir Dashboard

1. No VS Code, abra o arquivo `ga4-dashboard.html`
2. Clique em **Preview** (ou **Ctrl + Shift + V**)
3. Aaah! Dashboard linda com gráficos

### 4.2 O que você verá

**KPIs Principais:**
- Visitantes únicos (últimos 7 dias)
- Visualizações de página
- Bounce rate médio
- Tempo médio na página

**Eventos CRO:**
- Total de interações CRO
- Cliques em WhatsApp
- Aberturas de pop-up exit-intent
- CTR geral (click-through rate)

**Gráficos:**
- Top 10 páginas por conversão (bar chart)
- Engajamento ao longo do tempo (line chart)

**Tabelas:**
- Ranking de páginas por conversão
- Taxa de conversão por página
- Status (Excelente/Bom/Baixo)

---

## ⏰ Etapa 5: Automatizar Sincronização Diária

### 5.1 Windows Task Scheduler

Para rodar `ga4-sync.js` automaticamente todo dia:

1. Pressione **Windows + R**
2. Digite `taskschd.msc` → Enter
3. Clique em **Create Task**
4. **General:**
   - Name: `GA4 Sync pericia.judicial`
   - Check: "Run with highest privileges"
5. **Triggers:**
   - Click **New**
   - Set to **Daily** at **02:00 AM**
6. **Actions:**
   - Click **New**
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `ga4-sync.js`
   - Start in: `G:\Meu Drive\PROFISSIONAL\CONSULTORIA\pericia.judicial`
7. **OK** → Salvar

Pronto! Todos os dias às 2h da manhã, GA4 sincroniza sozinho.

### 5.2 Verificar Sincronização Manual

Abra terminal na pasta do projeto e rode:
```powershell
node ga4-sync.js
```

Ou clique no botão **🔄 Sincronizar Agora** no dashboard (requer servidor rodando em background).

---

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory, open 'ga4-data.json'"

**Solução:** Rode `node ga4-sync.js` uma vez para criar o arquivo.

### Erro: "Not authorized to access this property"

**Solução:** 
- Volte à Etapa 2.3
- Copie `client_email` do `ga4-credentials.json`
- Adicione como **Editor** na propriedade GA4

### Erro: "Cannot find module '@google-analytics/data'"

**Solução:** 
```powershell
npm install @google-analytics/data dotenv
```

### Dashboard mostra "Carregando dados..." permanentemente

**Solução:**
- Rode `node ga4-sync.js` novamente
- Verifique se `ga4-data.json` existe na pasta
- Abra DevTools (F12) → Console para ver erro específico

---

## 📋 Script de Teste (Verificar Setup)

Para testar se tudo está configurado:

```powershell
# Testar Node.js
node --version  # Deve retornar versão (ex: v18.0.0)

# Testar npm
npm --version   # Deve retornar versão (ex: 8.0.0)

# Testar arquivo .env
cat .env        # Deve mostrar as variáveis

# Testar credenciais
cat ga4-credentials.json | findstr "client_email"  # Mostrar email da service account

# Rodar sync
node ga4-sync.js
```

---

## 📚 Próximos Passos

---

## 🌐 Etapa 6: Monitoramento Online (Tempo quase real)

Para evitar sincronização manual e manter o dashboard sempre atualizado:

### 6.1 Subir monitor local

```powershell
npm run monitor
```

Saída esperada:

```text
🚀 GA4 Monitor Server rodando em http://localhost:3000
🔁 Auto-sync configurado para cada 5 min
✅ Primeira sincronização concluída.
```

### 6.2 Verificar saúde da API

Abra no navegador:

- `http://localhost:3000/health`
- `http://localhost:3000/api/ga4/latest`

### 6.3 Sincronização manual via API (opcional)

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/ga4/sync
```

### 6.4 Dashboard com auto-refresh

Com o monitor ativo, o `ga4-dashboard.html` atualiza automaticamente a cada 60 segundos.

---

### Fase 1: ✅ Monitoramento (Pronto)
- [x] ga4-sync.js sincronizando dados
- [x] ga4-dashboard.html visualizando dados
- [x] Automação diária/semanal

### Fase 2: Expansão do CRO (Proxima)
- [ ] Deploy CRO em 8 páginas adicionais
- [ ] Coletar baseline de conversão (target: 2.5% em 30 dias)
- [ ] Configurar alertas quando conversão cair abaixo de X%

### Fase 3: A/B Testing (Semanas 3-4)
- [ ] Teste color: botão verde vs vermelho
- [ ] Teste copy: "Clique agora" vs "Saiba mais"
- [ ] Teste timing: pop-up após 15s vs 30s

### Fase 4: Otimização Cont. (Semanas 5+)
- [ ] Rodar google optimize tests
- [ ] Analisar cohort de conversão
- [ ] Implementar recomendações top 3

---

## 🔐 Segurança

⚠️ **NÃO FAÇA:**
- ❌ Commitar `ga4-credentials.json` no Git
- ❌ Compartilhar `client_email` e `private_key` com ninguém
- ❌ Expor .env em repositórios públicos

✅ **FAÇA:**
- ✅ Adicione `ga4-credentials.json` ao `.gitignore`
- ✅ Adicione `.env` ao `.gitignore`
- ✅ Revogue acesso via Google Cloud Console se vazar key

---

## 📞 Suporte Rápido

| Erro | Solução |
|------|---------|
| "403 Forbidden" | Falta permissão no GA4 (Etapa 2.3) |
| "401 Unauthorized" | Credenciais inválidas ou expiradas |
| "Cannot find module" | Execute `npm install` na pasta |
| Dashboard branco | Rode `node ga4-sync.js` antes de abrir |

---

**Parabéns! 🎉 Agora você tem monitoramento GA4 local em tempo real!**

Qualquer dúvida, código está documentado em `ga4-sync.js` e `ga4-dashboard.html`.
