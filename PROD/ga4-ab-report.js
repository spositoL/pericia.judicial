#!/usr/bin/env node

/**
 * GA4 A/B report for exposure and lead conversion by variant.
 *
 * Usage:
 *   node ga4-ab-report.js
 *   node ga4-ab-report.js --startDate=2026-03-23 --endDate=2026-03-30
 */

const fs = require('fs');
const path = require('path');
const GA4Sync = require('./ga4-sync');

const MIN_EXPOSURES_PER_VARIANT = 200;
const MIN_WIN_LIFT_PERCENT = 10;

function parseArgs(argv) {
  const args = {};
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) return;
    const [key, ...parts] = arg.slice(2).split('=');
    const value = parts.join('=').trim();
    if (key && value) args[key] = value;
  });
  return args;
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end)
  };
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function queryByTestAndVariant(sync, dateRange, eventName) {
  return sync.runReport({
    dateRanges: [dateRange],
    dimensions: [
      { name: 'customEvent:test_name' },
      { name: 'customEvent:variant' }
    ],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: eventName
        }
      }
    },
    limit: 100000
  });
}

function queryEventTotal(sync, dateRange, eventName) {
  return sync.runReport({
    dateRanges: [dateRange],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: eventName
        }
      }
    }
  });
}

function toRows(response) {
  return (response?.rows || []).map((row) => ({
    testName: row.dimensionValues?.[0]?.value || 'unknown_test',
    variant: row.dimensionValues?.[1]?.value || 'unknown_variant',
    count: toNumber(row.metricValues?.[0]?.value)
  }));
}

function buildReport(exposureRows, leadRows) {
  const grouped = {};

  exposureRows.forEach((row) => {
    if (!grouped[row.testName]) grouped[row.testName] = {};
    if (!grouped[row.testName][row.variant]) grouped[row.testName][row.variant] = { exposures: 0, leads: 0 };
    grouped[row.testName][row.variant].exposures += row.count;
  });

  leadRows.forEach((row) => {
    if (!grouped[row.testName]) grouped[row.testName] = {};
    if (!grouped[row.testName][row.variant]) grouped[row.testName][row.variant] = { exposures: 0, leads: 0 };
    grouped[row.testName][row.variant].leads += row.count;
  });

  const tests = Object.entries(grouped).map(([testName, variants]) => {
    const variantRows = Object.entries(variants).map(([variant, stats]) => {
      const conversionRate = stats.exposures > 0 ? (stats.leads / stats.exposures) * 100 : 0;
      return {
        variant,
        exposures: stats.exposures,
        leads: stats.leads,
        conversionRate
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);

    const minReached = variantRows.every((v) => v.exposures >= MIN_EXPOSURES_PER_VARIANT);
    let decision = 'PENDENTE: amostra insuficiente';

    if (minReached && variantRows.length > 1) {
      const best = variantRows[0];
      const second = variantRows[1];
      const lift = second.conversionRate > 0
        ? ((best.conversionRate - second.conversionRate) / second.conversionRate) * 100
        : (best.conversionRate > 0 ? 999 : 0);

      if (lift >= MIN_WIN_LIFT_PERCENT) {
        decision = `WINNER: variante ${best.variant} (lift ${lift.toFixed(2)}%)`;
      } else {
        decision = `PENDENTE: lift ${lift.toFixed(2)}% (< ${MIN_WIN_LIFT_PERCENT}%)`;
      }
    }

    return {
      testName,
      variants: variantRows,
      minReached,
      decision
    };
  });

  return tests.sort((a, b) => a.testName.localeCompare(b.testName));
}

function printReport(period, tests) {
  console.log('\nAB TEST REPORT');
  console.log('==============');
  console.log(`Periodo: ${period.startDate} ate ${period.endDate}`);

  if (!tests.length) {
    console.log('Sem linhas por variante no periodo.');
    return;
  }

  tests.forEach((test) => {
    console.log(`\nTeste: ${test.testName}`);
    test.variants.forEach((variant) => {
      console.log(
        `  Variante ${variant.variant}: exposicoes=${variant.exposures}, leads=${variant.leads}, conversao=${variant.conversionRate.toFixed(2)}%`
      );
    });
    console.log(`  Decisao: ${test.decision}`);
  });
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const def = defaultRange();
  const period = {
    startDate: args.startDate || def.startDate,
    endDate: args.endDate || def.endDate
  };

  const sync = new GA4Sync();

  try {
    sync.validateConfig();

    let exposureResponse;
    let leadResponse;

    try {
      exposureResponse = await queryByTestAndVariant(sync, period, 'cro_ab_exposure');
      leadResponse = await queryByTestAndVariant(sync, period, 'cro_ab_generate_lead');
    } catch (error) {
      const exposureTotal = await queryEventTotal(sync, period, 'cro_ab_exposure');
      const leadTotal = await queryEventTotal(sync, period, 'cro_ab_generate_lead');
      const fallback = {
        period,
        status: 'custom_dimensions_missing',
        message: 'Configure as dimensoes de evento test_name e variant no GA4 para quebrar por variante.',
        totals: {
          exposure: toNumber(exposureTotal?.rows?.[0]?.metricValues?.[0]?.value),
          leads: toNumber(leadTotal?.rows?.[0]?.metricValues?.[0]?.value)
        },
        error: error.message || String(error)
      };

      const outPath = path.join(__dirname, 'ga4-ab-report.json');
      fs.writeFileSync(outPath, JSON.stringify(fallback, null, 2));

      console.log('\nAB TEST REPORT');
      console.log('==============');
      console.log(`Periodo: ${period.startDate} ate ${period.endDate}`);
      console.log('Nao foi possivel quebrar por variante (dimensoes ainda nao configuradas).');
      console.log(`Exposicoes totais: ${fallback.totals.exposure}`);
      console.log(`Leads A/B totais: ${fallback.totals.leads}`);
      console.log(`Relatorio salvo em: ${outPath}`);
      process.exit(0);
    }

    const tests = buildReport(toRows(exposureResponse), toRows(leadResponse));
    printReport(period, tests);

    const payload = {
      generatedAt: new Date().toISOString(),
      period,
      thresholds: {
        minExposuresPerVariant: MIN_EXPOSURES_PER_VARIANT,
        minWinLiftPercent: MIN_WIN_LIFT_PERCENT
      },
      tests
    };

    const outPath = path.join(__dirname, 'ga4-ab-report.json');
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log(`\nRelatorio salvo em: ${outPath}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();
