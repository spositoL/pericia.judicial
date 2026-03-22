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
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
require('dotenv').config();

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '471852848'; // SEU PROPERTY ID
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './ga4-credentials.json';

class GA4Sync {
  constructor() {
    this.credentialsPath = path.resolve(CREDENTIALS_PATH);
    this.client = new BetaAnalyticsDataClient({
      keyFilename: this.credentialsPath
    });
    this.propertyId = `properties/${GA4_PROPERTY_ID}`;
    this.dataFile = path.join(__dirname, 'ga4-data.json');
  }

  /**
   * Validar pré-requisitos antes de sincronizar
   */
  validateConfig() {
    if (!fs.existsSync(this.credentialsPath)) {
      throw new Error(
        `Credenciais GA4 não encontradas em: ${this.credentialsPath}\n` +
        `Crie o arquivo ga4-credentials.json ou defina GOOGLE_APPLICATION_CREDENTIALS.`
      );
    }

    if (!GA4_PROPERTY_ID || String(GA4_PROPERTY_ID).trim() === '') {
      throw new Error('GA4_PROPERTY_ID não definido. Configure no .env ou variável de ambiente.');
    }
  }

  /**
   * Puxar métricas dos últimos 7 dias
   */
  async fetchMetrics() {
    try {
      console.log('🔄 Sincronizando dados do GA4...');
      
      const request = {
        property: this.propertyId,
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
          },
          {
            name: 'conversionRate',
          }
        ],
        limit: 100000
      };

      const [response] = await this.client.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao sincronizar GA4:', error.message);
      return null;
    }
  }

  /**
   * Puxar eventos CRO específicos
   */
  async fetchCROEvents() {
    try {
      console.log('🎯 Sincronizando eventos CRO...');
      
      const request = {
        property: this.propertyId,
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
            name: 'eventLabel',
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

      const [response] = await this.client.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao buscar eventos CRO:', error.message);
      return null;
    }
  }

  /**
   * Puxar eventos de conversão (generate_lead)
   */
  async fetchConversionEvents() {
    try {
      console.log('💰 Sincronizando eventos de conversão...');
      
      const request = {
        property: this.propertyId,
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
            name: 'eventLabel',
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

      const [response] = await this.client.runReport(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('❌ Erro ao buscar eventos de conversão:', error.message);
      return null;
    }
  }

  /**
   * Calcular taxa de conversão por página
   */
  async calculateConversionRate(metricsData, conversionData) {
    try {
      console.log('📊 Calculando taxas de conversão...');
      
      const conversionByPage = {};
      
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
      
      // Calcular taxa
      const rates = {};
      if (metricsData && metricsData.rows) {
        metricsData.rows.forEach(row => {
          const page = row.dimensionValues[0].value;
          const views = parseInt(row.metricValues[1].value) || 1;
          const conversions = conversionByPage[page] || 0;
          
          if (!rates[page]) {
            rates[page] = {
              views: 0,
              conversions: 0
            };
          }
          
          rates[page].views += views;
          rates[page].conversions += conversions;
        });
      }
      
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
   * Formatar data para YYYYMMDD
   */
  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0].replace(/-/g, '');
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
      process.exit(1);
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
