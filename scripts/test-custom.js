const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nnczqktdznepvytnywcg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0'
);

async function main() {
  // 1. Verificar si la columna custom_prices existe
  console.log('=== Test 1: Leer custom_prices ===');
  const { data: d1, error: e1 } = await supabase
    .from('models')
    .select('id, name, custom_prices')
    .limit(3);
  
  if (e1) {
    console.log('ERROR al leer custom_prices:', e1.message);
    console.log('-> La columna NO existe en Supabase');
  } else {
    console.log('OK - columna existe. Ejemplo:', JSON.stringify(d1?.[0], null, 2));
  }

  // 2. Buscar modelos con custom_prices no vacío
  console.log('\n=== Test 2: Modelos con custom_prices configurado ===');
  const { data: d2, error: e2 } = await supabase
    .from('models')
    .select('id, name, custom_prices')
    .not('custom_prices', 'is', null)
    .limit(5);
  
  if (e2) console.log('ERROR:', e2.message);
  else if (!d2 || d2.length === 0) console.log('NINGUN modelo tiene custom_prices configurado');
  else d2.forEach(m => console.log(m.name, '→', JSON.stringify(m.custom_prices)));

  // 3. Probar escribir un custom_price
  console.log('\n=== Test 3: Escribir custom_price de prueba ===');
  const { data: d3, error: e3 } = await supabase
    .from('models')
    .update({ custom_prices: { "2024": { amount: 99999, currency: "ARS" } } })
    .eq('id', 320640)
    .select('id, name, custom_prices');
  
  if (e3) {
    console.log('ERROR al escribir:', e3.message, e3.details);
  } else {
    console.log('OK escritura:', JSON.stringify(d3?.[0]));
    // Limpiar
    await supabase.from('models').update({ custom_prices: null }).eq('id', 320640);
    console.log('(limpiado)');
  }
}
main();
