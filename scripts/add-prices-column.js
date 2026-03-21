const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nnczqktdznepvytnywcg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0'
);

async function main() {
  // Test if 'prices' column exists
  const { data, error } = await supabase.from('models').select('prices').limit(1);
  if (error && error.message.includes('prices')) {
    console.log('Columna "prices" NO existe. Creándola via SQL...');
    const { error: sqlErr } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE models ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT NULL'
    });
    if (sqlErr) {
      console.log('No hay función exec_sql. Intentando vía REST...');
      // Try direct SQL via management API
      const res = await fetch('https://nnczqktdznepvytnywcg.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: "ALTER TABLE models ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT NULL" })
      });
      console.log('REST result:', res.status, await res.text());
    }
  } else if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Columna "prices" ya existe ✓');
  }
  
  // Also verify custom_prices exists
  const { error: e2 } = await supabase.from('models').select('custom_prices').limit(1);
  console.log('custom_prices:', e2 ? 'NO existe' : 'existe ✓');
}
main();
