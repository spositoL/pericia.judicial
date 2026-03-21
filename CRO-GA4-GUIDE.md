# 📊 GUIA DE MONITORAMENTO - CRO SYSTEM

## Como Rastrear Conversões em Tempo Real

### 1. EVENTS ENVIADOS PARA GA4

Todos estes eventos estão sendo capturados automaticamente:

```
✓ generate_lead
  event_category: "WhatsApp"
  event_label: "CRO System - [source]"
  sources: exit-intent, micro-cta, floating-bar, default

✓ cro_interaction
  event_category: "CRO System"
  event_label: "[elemento clicado]"

✓ exit_intent_popup
  event_category: "Engagement"
```

### 2. CRIAR DASHBOARD GA4

#### 2.1 - Acessar Google Analytics
1. Ir para: https://analytics.google.com/
2. Selecionar Property: "pericia.judicial"
3. Ir em: Relatórios > Personalizado > Relatório em Branco

#### 2.2 - Criar Card 1: "Conversões WhatsApp por Página"

**Dimensões:**
- Page title
- Event label

**Métricas:**
- Event count
- Users

**Filtro:**
- Event name = "generate_lead"

**Gráfico:** Tabela ordenada por "Event count" decrescente

#### 2.3 - Criar Card 2: "CRO Interactions Timeline"

**Dimensões:**
- Date
- Event label

**Métricas:**
- Event count

**Filtro:**
- Event name = "cro_interaction"

**Gráfico:** Série temporal (linha)

#### 2.4 - Criar Card 3: "Scroll Depth & Conversão"

**Dimensões:**
- Page title

**Métricas:**
- Scroll_percentage (custom)
- Event count (generate_lead)

**Ordem:** Por Event count DESC

---

### 3. MÉTRICAS CRÍTICAS PARA MONITORAR

#### A. Taxa de Conversão
```
Fórmula: Leads de WhatsApp / Sessões Únicas × 100

Baseline: < 0.5%
Target: 2.5% - 5%
```

**Como medir:**
1. GA4 > Relatórios > Engajamento > Eventos
2. Filtro: Event name = "generate_lead"
3. Dividir por usuários únicos da página

#### B. Click-Through Rate por Elemento CRO
```
Fórmula: Cliques em CRO-Element / Visualizações da página × 100

Target:
- Floating Bar: > 3% (25% de quem viu × 15% de quem clicou)
- Exit Intent: > 8% (de quem acionou)
- Micro-CTA: > 2.5%
```

#### C. Scroll Depth
```
Target: > 60% dos visitantes chegam ao fim da página

Rastrear via:
GA4 > Eventos > "scroll" (configurado no script)
```

#### D. Tempo Médio na Página
```
Target: +40s (vs baseline)

Métrica: Average session duration de artigos
```

---

### 4. CONFIGURAR ALERTAS NO GA4

#### Alert 1: Aumento de Leads
```
Ir a: Relatórios > Personalizado
Clique em "Criar alerta"
Condição: generate_lead events > 5 (dia)
Notificação: Email diário
```

#### Alert 2: Queda de Leads
```
Condição: generate_lead events < 2 (dia)
Aviso: Verificar se CRO system está ativo
```

---

### 5. RELATÓRIO SEMANAL (Copy/Cola no Google Sheets)

```markdown
## RELATÓRIO CRO SEMANA XX

### Dados Agregados
- Total de Leads WhatsApp: __
- Taxa de Conversão Média: __%
- Página com Melhor Performance: ___________
- Página com Pior Performance: ___________

### Por Página
| Página | Visitors | Leads | TC% | Principal CTA |
|--------|----------|-------|-----|--------------|
| Validador | 234 | 8 | 3.4% | Floating Bar |
| Stalking | 456 | 14 | 3.1% | Micro-CTA |

### Elementos CRO
- Floating Bar Appearances: ___
- Floating Bar Clicks: ___ (__% CTR)
- Exit Intent Pop-ups: ___
- Exit Intent Conversions: ___ (__% conversion)

### Insights
1. [O que funcionou]
2. [O que não funcionou]
3. [A testar próxima semana]

### Ações
- [ ] Ajustar copy de floating bar
- [ ] Expandir para página X
- [ ] Iniciar A/B Test de cores
```

---

### 6. CHECKER DE SAÚDE DO CRO SYSTEM

**Verificar semanalmente:**

- [ ] CSS `cro-system.css` carregando (DevTools > Aba de Styles)
- [ ] JS `cro-system.js` no final da página (DevTools > Console > sem errors)
- [ ] Floating bar aparece após 20-30s
- [ ] Exit-intent popup funciona (sair do mouse)
- [ ] GA4 capturando eventos (GA4 debugger ativo)

---

### 7. QUICK GA4 DEBUGGER

Para ativar modo debug:

```javascript
// Abrir Console (F12) e colar:
gtag('config', 'G-5F1FGJ25TK', {
  'debug_mode': true
});
```

Agora todos os eventos aparecem em:
Google Analytics > Admin > DebugView (vida real)

---

### 8. COMPARATIVOS PRÉ vs PÓS

**Escolher período de 14 dias:**

Antes (14 dias antes de ativar CRO):
```
GA4 > Relatórios > Comparador de períodos
Data início: [Data - 28 dias]
Data fim: [Data - 14 dias]
```

Depois (14 dias após ativar):
```
Data início: [Data CRO ativação]
Data fim: [Data + 14 dias]
```

Comparar:
- Bounce rate (deve cair)
- Avg. session duration (deve subir)
- generate_lead events (deve multiplicar)

---

## 🎯 METAS POR SEMANA

### Semana 1-2 (Validação)
- [ ] Floating bar aparecendo relats
- [ ] Exit-intent popup funcional
- [ ] GA4 capturando >5 leads/dia
- [ ] Teste: Color do button

### Semana 3-4 (Expansão)
- [ ] Implementado em 10+ páginas
- [ ] Taxa de conversão >2%
- [ ] Micro-CTAs com >2.5% CTR
- [ ] 1º A/B Test completo

### Semana 5+ (Otimização)
- [ ] Taxa 3.5%+
- [ ] Teste dinâmico de copy
- [ ] Video testimonials
- [ ] Push notifications

---

**Troubleshooting:**
- Floating bar não aparece → Checar `floatingBarDelay` em config
- GA4 não registra → Verificar gtag() no HTML
- Exit-intent muito agressivo → Aumentar delay ou desabilitar
- Micro-CTA não visível → Verificar HTML structure (h2/h3 presentes)
