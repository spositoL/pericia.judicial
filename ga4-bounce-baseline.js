#!/usr/bin/env node

/**
 * Compare bounce rate between two periods in GA4.
 *
 * Usage:
 *   node ga4-bounce-baseline.js
 *   node ga4-bounce-baseline.js --baselineStart=20260314 --baselineEnd=20260320 --currentStart=20260321 --currentEnd=20260327
 *   node ga4-bounce-baseline.js --baselineReference=65
 */

const fs = require('fs');
const path = require('path');
const GA4Sync = require('./ga4-sync');

const DEFAULTS = {
  baselineStart: '20260314',
  baselineEnd: '20260320',
  currentStart: '20260321',
  currentEnd: '20260327',
  baselineReference: 65,
  outputFile: 'ga4-bounce-baseline-report.json'
};

function parseArgs(argv) {
  const parsed = {};

  argv.forEach((arg) => {
    if (!arg.startsWith('--')) return;

    const [rawKey, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();
    if (!rawKey || value === '') return;

    parsed[rawKey] = value;
  });

  return parsed;
}

function normalizeDate(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function formatDate(value) {
  const normalized = normalizeDate(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return String(value);
  return `${normalized.slice(8, 10)}/${normalized.slice(5, 7)}/${normalized.slice(0, 4)}`;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toPercent(value) {
  const num = toNumber(value);
  return num <= 1 ? num * 100 : num;
}

function pct(value) {
  return `${toNumber(value).toFixed(2)}%`;
}

function secs(value) {
  return `${toNumber(value).toFixed(1)}s`;
}

async function fetchPeriodSummary(sync, startDate, endDate) {
  const request = {
    dateRanges: [
      {
        startDate: normalizeDate(startDate),
        endDate: normalizeDate(endDate)
      }
    ],
    metrics: [
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'activeUsers' },
      { name: 'screenPageViews' }
    ]
  };

  const response = await sync.runReport(request);
  const row = response?.rows?.[0]?.metricValues || [];

  return {
    bounceRate: toPercent(row[0]?.value),
    avgSessionDuration: toNumber(row[1]?.value),
    activeUsers: toNumber(row[2]?.value),
    pageViews: toNumber(row[3]?.value)
  };
}

function compare(current, baseline) {
  const absoluteDelta = current - baseline;
  const relativeDelta = baseline > 0 ? (absoluteDelta / baseline) * 100 : 0;

  return {
    absoluteDelta,
    relativeDelta,
    improved: absoluteDelta < 0
  };
}

function printReport(config, baselinePeriod, currentPeriod, baselineReference) {
  const deltaMeasured = compare(currentPeriod.bounceRate, baselinePeriod.bounceRate);
  const deltaReference = compare(currentPeriod.bounceRate, baselineReference);

  console.log('\nBOUNCE RATE VS BASELINE');
  console.log('========================');
  console.log(`Baseline medido (${formatDate(config.baselineStart)} ate ${formatDate(config.baselineEnd)}): ${pct(baselinePeriod.bounceRate)}`);
  console.log(`Periodo atual (${formatDate(config.currentStart)} ate ${formatDate(config.currentEnd)}): ${pct(currentPeriod.bounceRate)}`);
  console.log(`Delta absoluto (atual - baseline medido): ${deltaMeasured.absoluteDelta.toFixed(2)} p.p.`);
  console.log(`Delta relativo (atual vs baseline medido): ${deltaMeasured.relativeDelta.toFixed(2)}%`);

  console.log('\nContexto de engajamento');
  console.log('----------------------');
  console.log(`Duracao media baseline: ${secs(baselinePeriod.avgSessionDuration)}`);
  console.log(`Duracao media atual: ${secs(currentPeriod.avgSessionDuration)}`);
  console.log(`Usuarios ativos baseline: ${baselinePeriod.activeUsers}`);
  console.log(`Usuarios ativos atual: ${currentPeriod.activeUsers}`);
  console.log(`PageViews baseline: ${baselinePeriod.pageViews}`);
  console.log(`PageViews atual: ${currentPeriod.pageViews}`);

  console.log('\nComparacao com baseline historico do plano');
  console.log('------------------------------------------');
  console.log(`Baseline historico de referencia: ${pct(baselineReference)}`);
  console.log(`Delta absoluto (atual - historico): ${deltaReference.absoluteDelta.toFixed(2)} p.p.`);
  console.log(`Delta relativo (atual vs historico): ${deltaReference.relativeDelta.toFixed(2)}%`);

  if (deltaMeasured.improved) {
    console.log('\nStatus: bounce melhorou vs baseline medido.');
  } else {
    console.log('\nStatus: bounce piorou ou ficou estavel vs baseline medido.');
  }

  return {
    baselineMeasured: baselinePeriod,
    current: currentPeriod,
    comparisonMeasured: deltaMeasured,
    baselineReference,
    comparisonReference: deltaReference
  };
}

(async () => {
  const args = parseArgs(process.argv.slice(2));

  const config = {
    baselineStart: normalizeDate(args.baselineStart || DEFAULTS.baselineStart),
    baselineEnd: normalizeDate(args.baselineEnd || DEFAULTS.baselineEnd),
    currentStart: normalizeDate(args.currentStart || DEFAULTS.currentStart),
    currentEnd: normalizeDate(args.currentEnd || DEFAULTS.currentEnd),
    baselineReference: toNumber(args.baselineReference, DEFAULTS.baselineReference),
    outputFile: args.outputFile || DEFAULTS.outputFile
  };

  const sync = new GA4Sync();

  try {
    sync.validateConfig();

    const baselinePeriod = await fetchPeriodSummary(sync, config.baselineStart, config.baselineEnd);
    const currentPeriod = await fetchPeriodSummary(sync, config.currentStart, config.currentEnd);
    const result = printReport(config, baselinePeriod, currentPeriod, config.baselineReference);

    const output = {
      generatedAt: new Date().toISOString(),
      periods: {
        baseline: {
          startDate: config.baselineStart,
          endDate: config.baselineEnd
        },
        current: {
          startDate: config.currentStart,
          endDate: config.currentEnd
        }
      },
      result
    };

    const outputPath = path.join(__dirname, config.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nRelatorio salvo em: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('\nFalha ao comparar bounce rate.');
    console.error(error.message || error);
    process.exit(1);
  }
})();
