#!/usr/bin/env node

/**
 * GA4 Monitor Server
 * API local para monitoramento online do GA4 com auto-sync.
 *
 * Endpoints:
 * - GET  /health
 * - GET  /api/ga4/latest
 * - POST /api/ga4/sync
 * - POST /sync (compatibilidade com dashboard existente)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separator = trimmed.indexOf('=');
    if (separator <= 0) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const PORT = Number(process.env.GA4_MONITOR_PORT || 3000);
const SYNC_INTERVAL_MINUTES = Number(process.env.SYNC_INTERVAL_MINUTES || 5);
const DATA_FILE = path.join(__dirname, 'ga4-data.json');

let syncRunning = false;
let lastSyncStatus = {
  lastAttempt: null,
  lastSuccess: null,
  status: 'idle',
  message: 'Aguardando primeira sincronização.'
};

function withCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  withCors(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readLocalData() {
  if (!fs.existsSync(DATA_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function serveStaticFile(res, filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, { ok: false, error: 'Arquivo não encontrado.' });
    return;
  }

  try {
    const data = fs.readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  } catch {
    sendJson(res, 500, { ok: false, error: 'Falha ao servir arquivo.' });
  }
}

async function runSync() {
  if (syncRunning) {
    return { ok: false, message: 'Sincronização já em execução.' };
  }

  syncRunning = true;
  lastSyncStatus.lastAttempt = new Date().toISOString();
  lastSyncStatus.status = 'running';
  lastSyncStatus.message = 'Sincronização em andamento...';

  try {
    const GA4Sync = require('./ga4-sync');
    const sync = new GA4Sync();
    await sync.sync();
    lastSyncStatus.lastSuccess = new Date().toISOString();
    lastSyncStatus.status = 'ok';
    lastSyncStatus.message = 'Sincronização concluída com sucesso.';
    return { ok: true, message: lastSyncStatus.message };
  } catch (error) {
    lastSyncStatus.status = 'error';
    lastSyncStatus.message = error?.message || 'Erro desconhecido na sincronização.';
    return { ok: false, message: lastSyncStatus.message };
  } finally {
    syncRunning = false;
  }
}

function isSyncRuntimeAvailable() {
  try {
    require.resolve('./ga4-sync');
    return true;
  } catch {
    return false;
  }
}

function scheduleSync() {
  const intervalMs = Math.max(1, SYNC_INTERVAL_MINUTES) * 60 * 1000;

  setInterval(async () => {
    await runSync();
  }, intervalMs);
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (req.method === 'GET' && (pathname === '/' || pathname === '/ga4-dashboard.html')) {
    serveStaticFile(res, path.join(__dirname, 'ga4-dashboard.html'), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'OPTIONS') {
    withCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && pathname === '/health') {
    sendJson(res, 200, {
      service: 'ga4-monitor',
      status: syncRunning ? 'running' : 'up',
      syncRuntimeAvailable: isSyncRuntimeAvailable(),
      sync: lastSyncStatus,
      dataFileExists: fs.existsSync(DATA_FILE),
      syncIntervalMinutes: SYNC_INTERVAL_MINUTES
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/ga4/latest') {
    const data = readLocalData();

    if (!data) {
      sendJson(res, 404, {
        ok: false,
        error: 'Dados GA4 ainda não disponíveis. Execute sincronização.',
        sync: lastSyncStatus
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      source: 'ga4-data.json',
      sync: lastSyncStatus,
      data
    });
    return;
  }

  if (req.method === 'POST' && (pathname === '/api/ga4/sync' || pathname === '/sync')) {
    const result = await runSync();
    sendJson(res, result.ok ? 200 : 409, {
      ok: result.ok,
      message: result.message,
      sync: lastSyncStatus
    });
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: 'Endpoint não encontrado.'
  });
});

server.listen(PORT, async () => {
  console.log(`🚀 GA4 Monitor Server rodando em http://localhost:${PORT}`);
  console.log(`🔁 Auto-sync configurado para cada ${SYNC_INTERVAL_MINUTES} min`);

  scheduleSync();

  const result = await runSync();
  if (result.ok) {
    console.log('✅ Primeira sincronização concluída.');
  } else {
    console.log(`⚠️ Primeira sincronização falhou: ${result.message}`);
  }
});
