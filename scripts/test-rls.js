const { createClient } = require('@supabase/supabase-js');

// Test con anon key (lo que usa la API si no tiene service key)
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njg2NzMsImV4cCI6MjA3NDE0NDY3M30.OcrepUoSohATQf-ZJctnqU0K5rlHNlj77vZqVOLKAds';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0';

async function testWrite(label, key) {
  const sb = createClient('https://nnczqktdznepvytnywcg.supabase.co', key);
  const { data, error } = await sb
    .from('models')
    .update({ custom_prices: { "2024": { amount: 11111, currency: "ARS" } } })
    .eq('id', 320640)
    .select('id, name, custom_prices');
  
  if (error) console.log(label + ': ERROR -', error.message);
  else if (!data || data.length === 0) console.log(label + ': NO DATA RETURNED (RLS bloqueó silenciosamente)');
  else console.log(label + ': OK -', JSON.stringify(data[0].custom_prices));
  
  // Limpiar con service key
  const sbService = createClient('https://nnczqktdznepvytnywcg.supabase.co', serviceKey);
  await sbService.from('models').update({ custom_prices: null }).eq('id', 320640);
}

async function main() {
  await testWrite('ANON KEY', anonKey);
  await testWrite('SERVICE KEY', serviceKey);
}
main();
