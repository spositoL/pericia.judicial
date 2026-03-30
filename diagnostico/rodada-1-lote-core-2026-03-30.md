# Rodada 1 - Lote Core
Data: 2026-03-30

## Objetivo
Atacar exclusivamente paginas core do funil (aquisição, conteúdo e conversão), removendo foco em paginas de apoio.

## Páginas Core Atacadas
1. links.html
2. calculo-financiamento-sistema-sac-price-sacre.html
3. calculo-financiamento-sistema-sac-price-sacre-pericia-backend.html

## Alterações Aplicadas
- links.html:
  - Inclusão de bloco "Próximos passos recomendados" com trilha interna de navegação.
  - Inclusão de imagem com atributo alt para reforço de retenção e acessibilidade.
  - Tracking GA4 para cliques de continuidade (checklist, calculadora, perícia).
  - Remoção de listeners legados sem elementos correspondentes na página.

- calculo-financiamento-sistema-sac-price-sacre.html:
  - Inclusão de seção "Depois da simulação" com links internos de continuidade.
  - Tracking GA4 de navegação e materiais.
  - Hardening de links externos com rel="noopener noreferrer".

- calculo-financiamento-sistema-sac-price-sacre-pericia-backend.html:
  - Inclusão de seção "próximos passos técnicos" com links internos.
  - Tracking GA4 de navegação e materiais.
  - Hardening de links externos com rel="noopener noreferrer".

## Resultado do Baseline (após lote)
- Média geral do site: 90.9
- Média das páginas core: 95.7
- Páginas core abaixo de 90: 0

## Métricas das páginas editadas
| Página | Antes | Depois |
|---|---:|---:|
| links.html | 85 | 92 |
| calculo-financiamento-sistema-sac-price-sacre.html | 89 | 92 |
| calculo-financiamento-sistema-sac-price-sacre-pericia-backend.html | 89 | 92 |

## Status
Rodada core concluída com fechamento do gap de pontuação nas páginas prioritárias do funil.
