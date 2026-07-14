# Estrategia de Migracao da Home Atual para a Home Hibrida

## 1) Objetivo de negocio
Migrar a home atual para o modelo hibrido com 3 metas simultaneas:
1. Aumentar taxa de contato qualificado (WhatsApp + formulario).
2. Elevar fechamento com 3 segmentos prioritarios: empresas com dor bancaria/tributaria, instituicoes financeiras para Resolucao 4.966, escritorios de advocacia para assistencia tecnica.
3. Manter autoridade SEO da home atual, preservando indexacao e distribuicao de link equity para paginas de servico e artigos.

## 2) Diagnostico do estado atual (home principal)
Pontos fortes:
- Autoridade e prova social robustas no topo (depoimentos, experiencia, schema, GA4).
- Acervo amplo de conteudo (90+ artigos) e funis por LP ja existentes.
- Captura de lead ja funcional via formulario e CTA de WhatsApp.

Gargalos de conversao:
- Excesso de frentes na mesma dobra (institucional, educacional, tecnico, blog, simulador, FAQ), elevando carga cognitiva.
- Carrossel com muitos cards e baixa hierarquia de intencao comercial.
- CTA principal compete com multiplas rotas paralelas antes do visitante entender "qual problema resolvemos primeiro".
- Falta de bloco de parceiros estrategicos para transferencia de confianca e backlinks comerciais.

## 3) Arquitetura da nova home (hibrida em producao)
A home hibrida vira a pagina principal com esta sequencia:
1. Header flutuante com navegacao curta + CTA fixo de diagnostico.
2. Hero comercial com promessa unica e segmentacao explicita dos 3 publicos.
3. Bloco de "Entradas Comerciais" (3 ofertas de entrada):
   - Diagnostico Bancario Empresarial
   - Assessment Resolucao 4.966
   - Assistencia Tecnica em Pericia Bancaria
4. Bloco de provas de fechamento (autoridade, metodo, resultados, confianca).
5. CTA final de acao unica (WhatsApp + formulario opcional).
6. Bloco enxuto de conteudo recomendado (6 a 9 artigos), com links para hub de artigos.
7. Bloco de parceiros (backlink) com contexto de colaboracao.

## 4) Mapeamento de migracao de conteudo (sem perda de SEO)
Conteudo da home atual que deve permanecer:
- Metadados SEO e estruturados (ajustar titulo/descricao para narrativa comercial nova).
- Integracoes GA4 e eventos de lead.
- CTA WhatsApp flutuante e formulario (com refinamento de campos).
- Links para paginas-autoridade: pericia-resolucao-4966, pericia-aml-kyc, pericia-dados, LPs de alta intencao.

Conteudo da home atual que deve sair da area nobre:
- Carrossel gigante de artigos (mover para modulo secundario + pagina hub).
- Blocos longos de texto institucional.
- Navegacao extensa de menu no topo.

Reorganizacao recomendada:
- Home: foco em conversao.
- Paginas satelite: aprofundamento tecnico, educacao, artigos longos.
- Hub de conteudo: consolidar exploracao editorial sem contaminar a primeira conversa comercial.

## 5) Backlink com parceiros (modelo recomendado)
## 5.1 Parceiros alvo
- Grupo Reabre: https://reabre.com.br/
- Linsp TI: http://linspti.com.br/
- Dra Elo Rocha: https://draelorocha.github.io/advogada/

## 5.2 Estrutura na home
Criar secao "Ecossistema Tecnico e Juridico" com 3 cards:
- Card 1: Grupo Reabre
  - Angulo: apoio em juros abusivos, revisional e regularizacao de nome.
  - Link dofollow para pagina principal e, se houver, para pagina de servico especifica.
- Card 2: Linsp TI
  - Angulo: dados, IA e automacao para PMEs e sustentacao de esteira analitica.
  - Link dofollow para pagina principal.
- Card 3: Dra Elo Rocha
  - Angulo: atuacao juridica complementar em litigios e estrategia processual.
  - Link dofollow para pagina principal.

## 5.3 Regras de anchor text
Evitar anchor generico repetido (ex.: "clique aqui").
Alternar intencao sem over-optimization:
- "parceiro em revisao de contratos e juros abusivos"
- "solucoes de dados e inteligencia artificial para PMEs"
- "assessoria juridica especializada para litigios estrategicos"

## 5.4 Contrapartida para backlink reciproco
Criar paginas de parceria no dominio principal:
- /parceiros/grupo-reabre.html
- /parceiros/linspti.html
- /parceiros/dra-elo-rocha.html

Cada pagina com:
- Contexto de sinergia real de atendimento.
- Casos de uso conjunto.
- Link de ida e volta entre parceiros.
- UTM para medicao de trafego e conversao.

## 6) Plano de UX e conversao
1. Reduzir formulario para 5 campos no primeiro contato:
   - Nome
   - WhatsApp
   - Perfil (Empresa / Instituicao Financeira / Advocacia)
   - Tema
   - Resumo curto
2. Tornar email opcional no primeiro passo (ou capturar no segundo contato).
3. Incluir microcopy de tempo de resposta: "retorno inicial em ate X horas uteis".
4. Manter CTA principal unico por secao (evitar 3+ botoes concorrentes na mesma dobra).
5. Garantir mobile-first:
   - Header flutuante compacto
   - CTA fixo inferior
   - Cards em coluna unica

## 7) Plano de dados, CRO e medicao
Eventos minimos GA4:
- view_home_hibrida
- click_cta_hero_whatsapp
- click_cta_header
- click_cta_segmento_empresas
- click_cta_segmento_4966
- click_cta_segmento_advogados
- click_backlink_reabre
- click_backlink_linspti
- click_backlink_elo
- form_submit_lead

KPIs de sucesso (30 dias):
- +25% cliques em CTA principal.
- +20% taxa de envio de formulario qualificado.
- +15% trafego para LPs estrategicas a partir da home.
- Pelo menos 3 backlinks reciprocos ativos com parceiros.

## 8) Roadmap de implantacao
Fase 1 (Dia 0 a Dia 2) - Preparacao:
- Congelar layout atual como backup.
- Definir index hibrida como base de publicacao.
- Revisar metadados SEO e canonical.

Fase 2 (Dia 3 a Dia 5) - Publicacao controlada:
- Promover home hibrida para index principal.
- Preservar scripts de GA4 e eventos de lead.
- Inserir secao de parceiros com backlinks.

Fase 3 (Dia 6 a Dia 10) - Afinacao de conversao:
- Simplificar formulario.
- Ajustar copy por segmento.
- Reduzir ruido do bloco de artigos.

Fase 4 (Dia 11 a Dia 20) - Otimizacao:
- Medir eventos e heatmap.
- Refinar CTA por segmento com base em dados reais.
- Validar qualidade dos leads captados.

## 9) Riscos e mitigacoes
Risco: queda de trafego organico por mudanca de estrutura.
Mitigacao: manter canonical, links internos chave, sitemap atualizado e blocos de conteudo relevante.

Risco: perda de profundidade tecnica percebida.
Mitigacao: manter links para paginas tecnicas e provas de autoridade logo apos hero.

Risco: backlink artificial sem contexto.
Mitigacao: secao editorializada de ecossistema e paginas de parceria com caso de uso.

## 10) Definicao de pronto da migracao
A migracao so e considerada concluida quando:
1. Home hibrida estiver publicada como index principal.
2. CTA e formulario estiverem rastreados no GA4 sem erro.
3. Secao de parceiros com 3 backlinks ativos estiver no ar.
4. Sitemap refletir as paginas novas de parceria.
5. Conversao de lead mostrar melhora no periodo de 2 a 4 semanas.
