# Checklist Operacional de Pós-Implantação CRO
Data: 2026-04-02

## Objetivo
Garantir que as otimizações de CRO publicadas estejam gerando impacto real em conversão, com rastreabilidade técnica no GA4 e decisão confiável de experimento A/B.

## Janela 0-24h (Validação Rápida)
1. Abrir as páginas core prioritárias em desktop e mobile:
   - index.html
   - sobre.html
   - materiais.html
   - pericia-dados.html
   - links.html
2. Validar links críticos:
   - WhatsApp principal
   - CTA de checklist
   - CTA de contato interno (#contato)
3. Confirmar que não há quebra visual em hero, blocos de CTA e rodapé.
4. Validar eventos em Tempo Real no GA4:
   - generate_lead
   - file_download
   - select_content
5. Registrar anomalias em uma lista única (URL, ação, erro, prioridade).

## Janela 24-72h (Telemetria e Dados)
1. Confirmar volume mínimo de eventos por página core.
2. Revisar consistência de nomenclatura dos eventos (sem variações de label por erro de digitação).
3. Validar cobertura de conversão por página:
   - cada página deve ter ao menos 1 evento de intenção forte (generate_lead ou file_download).
4. Executar leitura de tendência:
   - CTR de CTA principal
   - Engajamento da sessão
   - Conversão por página

## Janela 7 dias (Análise de Impacto)
1. Comparar período pós-publicação vs baseline anterior.
2. Separar análise por grupo:
   - Páginas core de tráfego alto
   - Páginas core de tráfego médio/baixo
3. Marcar páginas para micro-ajuste apenas se:
   - conversão cair
   - CTR de CTA ficar estável abaixo da meta
   - engajamento piorar após mudança de copy/layout

## A/B Testing (Governança)
1. Definir regra de decisão oficial (winner):
   - mínimo de 200 exposições por variante
   - janela mínima de 7 dias corridos
2. Configurar dimensões necessárias no GA4 para quebra por variante:
   - test_name
   - variant
   - lead_source
3. Reprocessar relatório A/B somente após atingir amostra mínima.
4. Não promover winner antes de cumprir regra de amostragem.

## Search Console (SEO pós-CRO)
1. Solicitar reindexação das páginas core alteradas.
2. Confirmar canonical e snippet atualizado (title/description).
3. Monitorar cobertura e impressões por 7-14 dias.

## Critério de Encerramento do Ciclo
Considerar ciclo CRO encerrado quando:
1. Eventos críticos estiverem estáveis no GA4.
2. Nenhuma quebra funcional relevante for encontrada.
3. Páginas core mantiverem performance >= baseline da rodada final.
4. Regra de decisão A/B estiver formalmente aplicada.

## Próxima Ação Recomendada
Executar imediatamente a etapa 0-24h e abrir um relatório único de validação operacional (checklist preenchido com status OK/Pendente).
