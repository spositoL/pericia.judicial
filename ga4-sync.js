#!/usr/bin/env node

/**
 * GA4 SYNC - Sincronização Local de Dados do Google Analytics 4
 * Dr. Lincoln Sposito - Perícia Judicial
 * 
 * Uso: node ga4-sync.js
 * Salva dados em: ga4-data.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '471852848'; // SEU PROPERTY ID
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './ga4-credentials.json';
const INLINE_CREDENTIALS = process.env.GA4_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_JSON || '';

class GA4Sync {
  constructor() {
    this.credentialsPath = path.resolve(CREDENTIALS_PATH);
    this.propertyId = String(GA4_PROPERTY_ID).trim();
    this.dataFile = path.join(__dirname, 'ga4-data.json');
    this.credentials = null;
  }

  /**
   * Validar pré-requisitos antes de sincronizar
   */
  validateConfig() {
    if (!GA4_PROPERTY_ID || String(GA4_PROPERTY_ID).trim() === '') {
      throw new Error('GA4_PROPERTY_ID não definido. Configure no .env ou variável de ambiente.');
    }

    let parsed = null;

    if (INLINE_CREDENTIALS && String(INLINE_CREDENTIALS).trim() !== '') {
      parsed = this.parseInlineCredentials(INLINE_CREDENTIALS);
    } else {
      if (!fs.existsSync(this.credentialsPath)) {
        throw new Error(
          `Credenciais GA4 não encontradas em: ${this.credentialsPath}\n` +
          `Crie o arquivo ga4-credentials.json, ou defina GOOGLE_APPLICATION_CREDENTIALS, ou GA4_CREDENTIALS_JSON.`
        );
      }

      const raw = fs.readFileSync(this.credentialsPath, 'utf8');
      parsed = JSON.parse(raw);
    }

    if (!parsed.client_email || !parsed.private_key) {
      throw new Error('Credenciais inválidas: client_email/private_key ausentes.');
    }

    this.credentials = parsed;
  }

  parseInlineCredentials(value) {
    const input = String(value || '').trim();
    if (!input) {
      throw new Error('GA4_CREDENTIALS_JSON está vazio.');
    }

    const attempts = [
      () => JSON.parse(input.replace(/\\n/g, '\n')),
      () => JSON.parse(Buffer.from(input, 'base64').toString('utf8'))
    ];

    for (const attempt of attempts) {
      try {
        return attempt();
      } catch {
        // tenta próximo formato
      }
    }

    throw new Error('Não foi possível parsear GA4_CREDENTIALS_JSON (JSON ou base64 JSON).');
  }

  base64Url(input) {
    const value = Buffer.isBuffer(input)
      ? input.toString('base64')
      : Buffer.from(input).toString('base64');

    return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  createSignedJwt() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: this.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: this.credentials.token_uri || 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now - 60
    };

    const encodedHeader = this.base64Url(JSON.stringify(header));
    const encodedPayload = this.base64Url(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();

    const signature = signer.sign(this.credentials.private_key);
    return `${unsignedToken}.${this.base64Url(signature)}`;
  }

  async getAccessToken() {
    const assertion = this.createSignedJwt();
    const tokenUrl = this.credentials.token_uri || 'https://oauth2.googleapis.com/token';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
      }).toString()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Falha ao obter token OAuth (${response.status}): ${text}`);
    }

    const json = await response.json();
    if (!json.access_token) {
      throw new Error('Resposta OAuth sem access_token.');
    }

    return json.access_token;
  }

  async runReport(request) {
    const token = await this.getAccessToken();
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Falha runReport (${response.status}): ${text}`);
    }

    return response.json();
  }

  /**
   * Puxar métricas dos últimos 7 dias
   */
  async fetchMetrics() {
    try {
      console.log('🔄 Sincronizando dados do GA4...');
      
      const request = {
        dateRanges: [
          {
            startDate: this.getDateString(7),
            endDate: this.getDateString(0)
          }
        ],
        dimensions: [
          {
            name: 'pagePath',
          },
          {
            name: 'date',
          }
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
          {
            name: 'screenPageViews',
          },
          {
            name: 'bounceRate',
          },
          {
            name: 'averageSessionDuration',
          }
        ],
        limit: 100000
      };

      const response = await this.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao sincronizar GA4:', error.message);
      throw error;
    }
  }

  /**
   * Puxar eventos CRO específicos
   */
  async fetchCROEvents() {
    try {
      console.log('🎯 Sincronizando eventos CRO...');
      
      const request = {
        dateRanges: [
          {
            startDate: this.getDateString(7),
            endDate: this.getDateString(0)
          }
        ],
        dimensions: [
          {
            name: 'eventName',
          },
          {
            name: 'date',
          }
        ],
        metrics: [
          {
            name: 'eventCount',
          },
          {
            name: 'totalUsers',
          }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'BEGINS_WITH',
              value: 'cro_'
            }
          }
        }
      };

      const response = await this.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao buscar eventos CRO:', error.message);
      throw error;
    }
  }

  /**
   * Puxar eventos de conversão (generate_lead)
   */
  async fetchConversionEvents() {
    try {
      console.log('💰 Sincronizando eventos de conversão...');
      
      const request = {
        dateRanges: [
          {
            startDate: this.getDateString(7),
            endDate: this.getDateString(0)
          }
        ],
        dimensions: [
          {
            name: 'pagePath',
          },
          {
            name: 'date',
          }
        ],
        metrics: [
          {
            name: 'eventCount',
          }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: 'generate_lead'
            }
          }
        }
      };

      const response = await this.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao buscar eventos de conversão:', error.message);
      throw error;
    }
  }

  /**
   * Calcular taxa de conversão por página
   */
  async calculateConversionRate(metricsData, conversionData) {
    try {
      console.log('📊 Calculando taxas de conversão...');
      
      const conversionByPage = {};
      const viewsByPage = {};
      
      // Agrupar conversões por página
      if (conversionData && conversionData.rows) {
        conversionData.rows.forEach(row => {
          const page = row.dimensionValues[0].value;
          const count = parseInt(row.metricValues[0].value) || 0;
          
          if (!conversionByPage[page]) {
            conversionByPage[page] = 0;
          }
          conversionByPage[page] += count;
        });
      }

      // Agrupar visualizações por página
      if (metricsData && metricsData.rows) {
        metricsData.rows.forEach(row => {
          const page = row.dimensionValues[0].value;
          const views = parseInt(row.metricValues[1].value) || 0;

          if (!viewsByPage[page]) {
            viewsByPage[page] = 0;
          }
          viewsByPage[page] += views;
        });
      }
      
      // Consolidar taxas por página sem duplicar conversões por linha de data
      const rates = {};
      const allPages = new Set([
        ...Object.keys(viewsByPage),
        ...Object.keys(conversionByPage)
      ]);

      allPages.forEach(page => {
        rates[page] = {
          views: viewsByPage[page] || 0,
          conversions: conversionByPage[page] || 0
        };
      });
      
      return rates;
    } catch (error) {
      console.error('❌ Erro ao calcular taxa:', error.message);
      return {};
    }
  }

  /**
   * Parsear resposta do GA4
   */
  parseResponse(response) {
    if (!response.rows) {
      return { rows: [] };
    }
    
    return {
      rows: response.rows.map(row => ({
        dimensionValues: row.dimensionValues,
        metricValues: row.metricValues
      }))
    };
  }

  /**
   * Salvar dados em JSON local
   */
  async saveData(data) {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      console.log(`✅ Dados salvos em: ${this.dataFile}`);
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error.message);
    }
  }

  /**
   * Formatar data para YYYY-MM-DD
   */
  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * Executar sincronização completa
   */
  async sync() {
    try {
      this.validateConfig();

      const metrics = await this.fetchMetrics();
      const croEvents = await this.fetchCROEvents();
      const conversionEvents = await this.fetchConversionEvents();
      const conversionRates = await this.calculateConversionRate(metrics, conversionEvents);

      const data = {
        lastSync: new Date().toISOString(),
        dateRange: {
          startDate: this.getDateString(7),
          endDate: this.getDateString(0)
        },
        metrics: metrics?.rows || [],
        croEvents: croEvents?.rows || [],
        conversionEvents: conversionEvents?.rows || [],
        conversionRates: conversionRates,
        summary: {
          totalMetricsRows: metrics?.rows?.length || 0,
          totalCROEvents: croEvents?.rows?.length || 0,
          totalConversions: conversionEvents?.rows?.length || 0
        }
      };

      await this.saveData(data);
      
      console.log('\n📈 RESUMO DA SINCRONIZAÇÃO:');
      console.log(`   Métrica de página: ${data.summary.totalMetricsRows} registros`);
      console.log(`   Eventos CRO: ${data.summary.totalCROEvents} registros`);
      console.log(`   Eventos de conversão: ${data.summary.totalConversions} registros`);
      console.log(`   Última sincronização: ${new Date().toLocaleString('pt-BR')}`);
      
    } catch (error) {
      console.error('❌ Erro geral na sincronização:');
      console.error(error.message || error);
      throw error;
    }
  }
}

// Executar se rodado direto
if (require.main === module) {
  const sync = new GA4Sync();
  sync.sync().then(() => {
    console.log('\n✨ Sincronização concluída!');
    process.exit(0);
  }).catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
}

module.exports = GA4Sync;
