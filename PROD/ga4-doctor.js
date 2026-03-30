#!/usr/bin/env node

/**
 * GA4 Doctor
 * Diagnóstico rápido para validar se o monitor GA4 está operacional.
 */

const GA4Sync = require('./ga4-sync');

(async () => {
  console.log('🩺 GA4 Doctor iniciado...');
  console.log(`- GA4_PROPERTY_ID: ${process.env.GA4_PROPERTY_ID || '(não definido no ambiente)'}`);
  console.log(`- GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || '(não definido no ambiente)'}`);
  console.log(`- GA4_CREDENTIALS_JSON: ${process.env.GA4_CREDENTIALS_JSON ? 'definido' : 'não definido'}`);

  try {
    const sync = new GA4Sync();
    await sync.sync();
    console.log('✅ GA4 operacional: sincronização concluída com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('❌ GA4 ainda não operacional.');
    console.error(error?.message || error);
    process.exit(1);
  }
})();
