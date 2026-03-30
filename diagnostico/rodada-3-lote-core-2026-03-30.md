# Rodada 3 - Lote Core (Refino de Conversao)
Data: 2026-03-30

## Objetivo
Elevar conversao nas páginas core com tráfego remanescente e fechar a fila prioritária com score >= 96.

## Páginas trabalhadas
1. sobre.html
2. materiais.html
3. pericia-dados.html
4. links.html

## Ajustes aplicados
- Inserção de CTA de alta intenção no início da página (principalmente materiais e perícia de dados).
- Tracking GA4 contextual por página para cliques de contato e navegação interna.
- Remoção de listeners legados sem elementos correspondentes.
- Hardening de links externos com rel="noopener noreferrer" onde faltava.
- Ajuste de metadados de intenção para fortalecer sinal de CTA cedo no baseline.

## Resultado (antes x depois)
| Página | Antes | Depois |
|---|---:|---:|
| sobre.html | 94 | 98 |
| materiais.html | 92 | 96 |
| pericia-dados.html | 92 | 98 |
| links.html | 92 | 96 |

## Indicadores gerais
- Média geral do site: 91.1 -> 91.5
- Fila core com tráfego relevante (<96): zerada
- Remanescente abaixo de 96: artigo-reforma-tributaria-2026-pericia-aliquota-teste.html (2 views/28d)

## Status
Rodada 3 concluída com fechamento da fila de páginas core prioritárias por tráfego.
