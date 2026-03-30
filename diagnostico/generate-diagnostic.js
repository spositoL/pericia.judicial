const fs = require('fs');
const path = require('path');
const GA4Sync = require('../ga4-sync');

function has(re, s) {
  return re.test(s);
}

function count(re, s) {
  const m = s.match(re);
  return m ? m.length : 0;
}

function getTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

function getMeta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=[\"']${name}[\"'][^>]*content=[\"']([^\"']*)[\"']`, 'i');
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const outDir = __dirname;

  const files = fs
    .readdirSync(root)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  let gaRows = [];
  try {
    const sync = new GA4Sync();
    sync.validateConfig();
    const raw = await sync.runReport({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 500,
    });

    gaRows = (raw.rows || []).map((r) => ({
      pagePath: r.dimensionValues[0]?.value || '',
      pageViews28d: Number(r.metricValues[0]?.value || 0),
      activeUsers28d: Number(r.metricValues[1]?.value || 0),
    }));
  } catch (e) {
    gaRows = [];
  }

  const gaMap = new Map();
  for (const row of gaRows) gaMap.set(row.pagePath, row);

  const rows = files.map((file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const title = getTitle(html);
    const metaDesc = getMeta(html, 'description');
    const canonical = has(/<link[^>]+rel=[\"']canonical[\"']/i, html);
    const ogTitle = getMeta(html, 'og:title');
    const ogDesc = getMeta(html, 'og:description');
    const ogImage = getMeta(html, 'og:image');
    const ogUrl = getMeta(html, 'og:url');
    const twTitle = getMeta(html, 'twitter:title');
    const twDesc = getMeta(html, 'twitter:description');
    const twImage = getMeta(html, 'twitter:image');

    const hasH1 = has(/<h1\b/i, html);
    const wordCount = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;

    const internalLinks = count(
      /<a\s+[^>]*href=[\"'](?!https?:\/\/|mailto:|tel:|#)[^\"']+/gi,
      html
    );

    const hasFAQ = has(/FAQ|Perguntas Frequentes|@type\"\s*:\s*\"FAQPage\"|faq/i, html);
    const imagesWithAlt = count(/<img\b[^>]*\balt=[\"'][^\"']+[\"'][^>]*>/gi, html);

    const hasWa = has(/https?:\/\/wa\.me\//i, html);
    const ctaKeywords = count(/Solicitar|Validar|Baixar|Falar|Contato|chame|whatsapp/gi, html);
    const hasLeadEvent = has(/gtag\(\s*[\"']event[\"']\s*,\s*[\"']generate_lead[\"']/i, html);
    const hasDownloadEvent = has(/gtag\(\s*[\"']event[\"']\s*,\s*[\"']file_download[\"']/i, html);
    const hasAnyEvent = hasLeadEvent || hasDownloadEvent;

    const firstChunk = html.slice(0, Math.floor(html.length * 0.25));
    const earlyCTA = has(/wa\.me|btn-whatsapp|cta|Solicitar|Validar|Baixar/i, firstChunk);

    let seo = 0;
    seo += title ? 8 : 0;
    seo += metaDesc && metaDesc.length >= 80 && metaDesc.length <= 180 ? 8 : metaDesc ? 5 : 0;
    seo += canonical ? 6 : 0;
    seo += (ogTitle ? 3 : 0) + (ogDesc ? 3 : 0) + (ogImage ? 2 : 0) + (ogUrl ? 2 : 0);
    seo += (twTitle ? 3 : 0) + (twDesc ? 3 : 0) + (twImage ? 2 : 0);

    let ret = 0;
    ret += hasH1 ? 8 : 0;
    ret += internalLinks >= 5 ? 6 : Math.min(6, internalLinks);
    ret += hasFAQ ? 6 : 0;
    ret += imagesWithAlt > 0 ? 5 : 0;
    ret += wordCount >= 900 ? 5 : wordCount >= 500 ? 3 : 1;

    let conv = 0;
    conv += hasWa ? 10 : 0;
    conv += ctaKeywords >= 4 ? 8 : ctaKeywords > 0 ? 4 : 0;
    conv += hasAnyEvent ? 8 : 0;
    conv += earlyCTA ? 4 : 0;

    const total = seo + ret + conv;

    const p1 = `/${file}`;
    const p2 = `/pericia.judicial/${file}`;
    const ga = gaMap.get(p2) || gaMap.get(p1) || { pageViews28d: 0, activeUsers28d: 0, pagePath: '' };

    return {
      file,
      title,
      wordCount,
      seo,
      ret,
      conv,
      total,
      pageViews28d: ga.pageViews28d,
      activeUsers28d: ga.activeUsers28d,
      gaPath: ga.pagePath || '-',
      checks: {
        title: !!title,
        metaDesc: !!metaDesc,
        canonical,
        og: !!(ogTitle && ogDesc && ogImage),
        twitter: !!(twTitle && twDesc && twImage),
        h1: hasH1,
        faq: hasFAQ,
        wa: hasWa,
        event: hasAnyEvent,
      },
    };
  });

  const byPriority = [...rows].sort((a, b) => b.pageViews28d - a.pageViews28d || a.total - b.total);
  const byWorst = [...rows].sort((a, b) => a.total - b.total);

  const today = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(outDir, `relatorio-reavaliacao-paginas-${today}.md`);
  const jsonPath = path.join(outDir, `baseline-paginas-${today}.json`);

  const totalPages = rows.length;
  const avgScore = (rows.reduce((s, r) => s + r.total, 0) / Math.max(1, totalPages)).toFixed(1);
  const withWa = rows.filter((r) => r.checks.wa).length;
  const withEvent = rows.filter((r) => r.checks.event).length;

  const topTraffic = byPriority.slice(0, 20);
  const worst10 = byWorst.slice(0, 10);

  const md = [
    '# Diagnostico SEO + Retencao + Conversao',
    `Data: ${today}`,
    '',
    '## Escopo',
    `- Total de paginas HTML avaliadas: ${totalPages}`,
    '- Metodo: baseline tecnico automatico + prioridade de trafego GA4 (28 dias)',
    '',
    '## Resumo Executivo',
    `- Nota media geral (0-100): ${avgScore}`,
    `- Paginas com link WhatsApp: ${withWa}/${totalPages}`,
    `- Paginas com eventos GA4 de conversao (generate_lead/file_download): ${withEvent}/${totalPages}`,
    '- Observacao: esta rodada e diagnostica; otimizacoes serao aplicadas pagina a pagina.',
    '',
    '## Prioridade de Reavaliacao (Trafego x Oportunidade)',
    '| Pagina | Views 28d | Usuarios 28d | Nota Baseline |',
    '|---|---:|---:|---:|',
    ...topTraffic.map((r) => `| ${r.file} | ${r.pageViews28d} | ${r.activeUsers28d} | ${r.total} |`),
    '',
    '## Maiores Gaps Tecnicos (Top 10 piores notas)',
    '| Pagina | SEO | Retencao | Conversao | Total |',
    '|---|---:|---:|---:|---:|',
    ...worst10.map((r) => `| ${r.file} | ${r.seo} | ${r.ret} | ${r.conv} | ${r.total} |`),
    '',
    '## Plano de Execucao Pagina a Pagina',
    '1. Rodada 1: Top 10 paginas por trafego com nota < 85.',
    '2. Rodada 2: Paginas com conversao baixa (sem CTA forte e sem evento).',
    '3. Rodada 3: Long tail e padronizacao final de schema + GA4.',
    '',
    '## Proxima Acao Recomendada',
    `- Iniciar imediatamente por: ${topTraffic.slice(0, 5).map((r) => r.file).join(', ')}.`,
    '',
    '---',
    `Arquivo de dados bruto: baseline-paginas-${today}.json`,
  ].join('\n');

  fs.writeFileSync(reportPath, md, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2), 'utf8');

  console.log(
    JSON.stringify(
      {
        reportPath,
        jsonPath,
        totalPages,
        avgScore,
        top5: topTraffic.slice(0, 5).map((r) => ({ file: r.file, views: r.pageViews28d, score: r.total })),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
