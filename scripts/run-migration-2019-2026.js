/**
 * Script para ejecutar la migración de depreciación 2019-2026 en Supabase
 *
 * Para cada modelo:
 * 1. Busca el modelo en Supabase por nombre
 * 2. Obtiene los price_adjustments actuales
 * 3. Merge los nuevos datos 2019-2026 (conserva 2008-2018)
 * 4. Actualiza el registro
 *
 * También hace backup de los datos anteriores en un JSON.
 */

// Load env manually since dotenv may not be installed
const envContent = require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
});
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de depreciación generados por calculate-depreciation.js
const depreciationData = require('./depreciation-data.json');

async function backupExistingData() {
  console.log('📦 Haciendo backup de datos existentes...');

  const { data, error } = await supabase
    .from('models')
    .select('id, name, description, price_adjustments')
    .not('price_adjustments', 'is', null);

  if (error) {
    console.error('❌ Error al obtener datos para backup:', error.message);
    return null;
  }

  const backupPath = path.join(__dirname, `backup-price-adjustments-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`   ✅ Backup guardado: ${backupPath} (${data.length} registros)`);

  return data;
}

async function findModel(modelName, marca) {
  const normalized = modelName.trim().toLowerCase();

  // Usar búsqueda con palabra como token separado para evitar falsos positivos
  // Ej: "versa" NO debe matchear "ANIVERSARIO"
  // Buscar modelos cuyo name contenga el modelName como palabra
  const { data, error } = await supabase
    .from('models')
    .select('id, name, description, price_adjustments')
    .or(`name.ilike.%${normalized}%,description.ilike.%${normalized}%`);

  if (error) {
    console.error(`   ❌ Error buscando "${modelName}":`, error.message);
    return [];
  }

  if (!data) return [];

  // Filtro estricto: el nombre del modelo debe aparecer como palabra completa
  // o al inicio del name, no como substring de otra palabra
  const filtered = data.filter(m => {
    const name = (m.name || '').toUpperCase();
    const desc = (m.description || '').toUpperCase();
    const search = normalized.toUpperCase();

    return isWordMatch(name, search) || isWordMatch(desc, search);
  });

  return filtered;
}

/**
 * Verifica que `search` aparezca como palabra completa en `text`
 * Ej: "VERSA" matchea "VERSA 1.6" pero NO "ANIVERSARIO"
 *     "500" matchea "500 1.4" pero NO "1500"
 *     "SW4" matchea "SW4 2.0"
 */
function isWordMatch(text, search) {
  if (!text || !search) return false;

  // Crear regex que busca la palabra como token separado
  // Acepta que esté al inicio, final, o rodeada de espacios/puntuación
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[\\s.,;:()\\-/])${escaped}(?:[\\s.,;:()\\-/]|$)`, 'i');

  return regex.test(text);
}

async function updateModel(modelId, modelName, newDepreciation, existingAdjustments) {
  // Merge: conservar datos existentes + agregar nuevos 2019-2026
  const merged = { ...(existingAdjustments || {}) };

  for (const [year, value] of Object.entries(newDepreciation)) {
    merged[year] = value;
  }

  const { error } = await supabase
    .from('models')
    .update({ price_adjustments: merged })
    .eq('id', modelId);

  if (error) {
    console.error(`   ❌ Error actualizando ${modelName} (id: ${modelId}):`, error.message);
    return false;
  }

  return true;
}

async function main() {
  console.log('🚀 Migración de Depreciación 2019-2026\n');

  // 1. Backup
  const backup = await backupExistingData();

  // 2. Procesar cada marca/modelo
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalNotFound = 0;

  for (const [marca, modelos] of Object.entries(depreciationData)) {
    console.log(`\n📌 ${marca}:`);

    for (const [modeloName, data] of Object.entries(modelos)) {
      const { depreciation } = data;

      // Buscar modelo en Supabase
      const matches = await findModel(modeloName, marca);

      if (matches.length === 0) {
        console.log(`   ⚠️  ${modeloName}: No encontrado en Supabase (skipping)`);
        totalNotFound++;
        continue;
      }

      // Actualizar todos los matches
      for (const match of matches) {
        const existing = match.price_adjustments || {};
        const existingYears = Object.keys(existing).filter(y => parseInt(y) >= 2019);
        const newYears = Object.keys(depreciation);

        console.log(`   📝 ${modeloName} (id: ${match.id}, name: "${match.name}")`);
        console.log(`      Existente 2019+: ${existingYears.length > 0 ? existingYears.join(', ') : 'ninguno'}`);
        console.log(`      Nuevos: ${newYears.join(', ')}`);

        const success = await updateModel(match.id, modeloName, depreciation, existing);

        if (success) {
          console.log(`      ✅ Actualizado`);
          totalUpdated++;
        } else {
          console.log(`      ❌ Error al actualizar`);
          totalSkipped++;
        }
      }
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Actualizados: ${totalUpdated}`);
  console.log(`   No encontrados: ${totalNotFound}`);
  console.log(`   Errores: ${totalSkipped}`);

  // 3. Verificación
  console.log('\n🔍 Verificación post-migración...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('models')
    .select('name, price_adjustments')
    .not('price_adjustments', 'is', null)
    .limit(5);

  if (!verifyError && verifyData) {
    for (const model of verifyData) {
      const adjustments = model.price_adjustments;
      const years = Object.keys(adjustments).sort();
      const has2019Plus = years.some(y => parseInt(y) >= 2019);
      console.log(`   ${model.name}: ${years.length} años (${years[0]}-${years[years.length - 1]}) ${has2019Plus ? '✅ tiene 2019+' : '⚠️ sin 2019+'}`);
    }
  }

  console.log('\n✅ Migración completada.');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
