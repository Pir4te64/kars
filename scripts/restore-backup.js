/**
 * Restaura los price_adjustments desde el backup
 */

const fs = require('fs');
const path = require('path');

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function restore() {
  const backupPath = path.join(__dirname, 'backup-price-adjustments-2026-02-25.json');
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  console.log(`Restaurando ${backup.length} registros desde backup...`);

  let restored = 0;
  let errors = 0;

  for (const record of backup) {
    const { error } = await supabase
      .from('models')
      .update({ price_adjustments: record.price_adjustments })
      .eq('id', record.id);

    if (error) {
      console.error(`  ❌ Error restaurando id=${record.id} (${record.name}):`, error.message);
      errors++;
    } else {
      restored++;
    }
  }

  console.log(`\n✅ Restaurados: ${restored}, Errores: ${errors}`);
}

restore().catch(console.error);
