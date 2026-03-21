const { createClient } = require('@supabase/supabase-js');
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njg2NzMsImV4cCI6MjA3NDE0NDY3M30.OcrepUoSohATQf-ZJctnqU0K5rlHNlj77vZqVOLKAds';
const url = 'https://nnczqktdznepvytnywcg.supabase.co';

async function main() {
  const sb = createClient(url, serviceKey);
  const sbAnon = createClient(url, anonKey);

  // 1. Guardar un precio fijo en un 308
  console.log('=== 1. Guardando custom_price en 308 1.6 ALLURE NAV (id=320640, 2018) ===');
  const { error: e1 } = await sb
    .from('models')
    .update({ custom_prices: { "2018": { amount: 15000000, currency: "ARS" } } })
    .eq('id', 320640);
  console.log(e1 ? 'ERROR: ' + e1.message : 'OK guardado');

  // 2. Simular lo que hace el cotizador: buscar por nombre de modelo
  // El cotizador busca con quoteData.modelo que viene del formulario
  // Por ejemplo el usuario elige "308 1.6 ALLURE NAV"
  const modelName = '308';
  console.log(`\n=== 2. Buscando como lo haría el cotizador: "${modelName}" ===`);
  const normalized = modelName.trim().toLowerCase();
  const { data: d2, error: e2 } = await sbAnon
    .from('models')
    .select('id, name, custom_prices')
    .or(`name.ilike.%${normalized}%,description.ilike.%${normalized}%`)
    .limit(1);
  
  console.log('Resultado búsqueda:', d2?.[0]?.name, '→ custom_prices:', JSON.stringify(d2?.[0]?.custom_prices));
  
  // ¿El resultado tiene el custom_price para 2018?
  const cp = d2?.[0]?.custom_prices;
  if (cp && cp['2018']) {
    console.log('✅ Cotizador encontraría:', JSON.stringify(cp['2018']));
  } else {
    console.log('❌ Cotizador NO encontraría custom_price para 2018');
  }

  // 3. ¿Pero qué modelo encuentra? Puede ser OTRO 308 (sin custom_price)
  console.log('\n=== 3. ¿Cuántos modelos matchean "308"? ===');
  const { data: d3 } = await sbAnon
    .from('models')
    .select('id, name, custom_prices')
    .or(`name.ilike.%${normalized}%`)
    .limit(10);
  d3?.forEach(m => console.log(`  ${m.id} ${m.name} → custom: ${m.custom_prices ? JSON.stringify(m.custom_prices) : 'null'}`));

  // 4. Limpiar
  await sb.from('models').update({ custom_prices: null }).eq('id', 320640);
  console.log('\n(limpiado)');
}
main();
