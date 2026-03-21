/**
 * Script para sincronizar precios de InfoAuto → Supabase
 *
 * Lee todos los modelos de Supabase, consulta InfoAuto por cada codia,
 * y guarda los precios en la columna custom_prices como JSONB:
 * { "2024": { "amount": 16500000, "currency": "ARS" }, ... }
 *
 * Uso: node scripts/sync-infoauto-prices.js [--brand PEUGEOT] [--dry-run] [--limit 10]
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nnczqktdznepvytnywcg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY3pxa3Rkem5lcHZ5dG55d2NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU2ODY3MywiZXhwIjoyMDc0MTQ0NjczfQ.9Jea2izy-5zE02NOxUN3iM5EF0yR51HJeToMMTbq7f0';

const INFOAUTO_BASE = 'https://api.infoauto.com.ar/cars';
const INFOAUTO_USER = 'vicmor601@gmail.com';
const INFOAUTO_PASS = 'XhqOsuVIK1MeXpAB';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let accessToken = null;
let refreshToken = null;
let tokenExpiry = 0;

// ─── Auth InfoAuto ───
async function getToken() {
  const now = Date.now();
  if (accessToken && tokenExpiry > now) return accessToken;

  if (refreshToken && tokenExpiry > 0) {
    try {
      const res = await fetch(`${INFOAUTO_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const d = await res.json();
        accessToken = d.access_token;
        tokenExpiry = now + 50 * 60 * 1000;
        return accessToken;
      }
    } catch {}
  }

  const creds = Buffer.from(`${INFOAUTO_USER}:${INFOAUTO_PASS}`).toString('base64');
  const res = await fetch(`${INFOAUTO_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`InfoAuto login failed: ${res.status}`);
  const d = await res.json();
  accessToken = d.access_token;
  refreshToken = d.refresh_token;
  tokenExpiry = now + 50 * 60 * 1000;
  return accessToken;
}

async function infoAutoGet(path) {
  const token = await getToken();
  const res = await fetch(`${INFOAUTO_BASE}/pub${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (res.status === 401) {
    accessToken = null;
    tokenExpiry = 0;
    return infoAutoGet(path); // retry once
  }
  if (!res.ok) return null;
  return res.json();
}

// ─── Obtener precios para un codia ───
async function getPricesForCodia(codia) {
  const data = await infoAutoGet(`/models/${codia}/prices/`);
  if (!data) return null;

  // InfoAuto devuelve { listPrice: [...], price: [...] } o un array directo
  let allPrices = [];
  if (Array.isArray(data)) {
    allPrices = data;
  } else if (data.data) {
    allPrices = [...(data.data.listPrice || []), ...(data.data.price || [])];
  } else {
    allPrices = [...(data.listPrice || []), ...(data.price || [])];
  }

  if (allPrices.length === 0) return null;

  // Convertir a { "2024": { amount: 16500, currency: "ARS" }, ... }
  // InfoAuto devuelve precios en miles (ej: 16500 = $16.500.000)
  const prices = {};
  for (const item of allPrices) {
    if (!item.year || item.price === null || item.price === undefined) continue;
    const year = String(item.year);
    const priceNum = Number(item.price);
    if (isNaN(priceNum) || priceNum <= 0) continue;
    // Guardar el precio en pesos (multiplicado por 1000)
    prices[year] = { amount: Math.round(priceNum * 1000), currency: "ARS" };
  }

  return Object.keys(prices).length > 0 ? prices : null;
}

// ─── Main ───
async function main() {
  const args = process.argv.slice(2);
  const brandFilter = args.includes('--brand') ? args[args.indexOf('--brand') + 1]?.toUpperCase() : null;
  const dryRun = args.includes('--dry-run');
  const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null;

  console.log('🔄 Sync InfoAuto → Supabase');
  if (brandFilter) console.log(`   Filtro marca: ${brandFilter}`);
  if (dryRun) console.log('   ⚠️  DRY RUN - no se guardan cambios');
  if (limitArg) console.log(`   Límite: ${limitArg} modelos`);

  // 1. Obtener marcas
  const { data: brands } = await supabase.from('brands').select('id, name');
  const brandMap = {};
  brands.forEach(b => { brandMap[b.id] = b.name; });

  // 2. Obtener modelos (paginado para superar límite de 1000)
  let allModels = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    let query = supabase.from('models').select('id, name, codia, brand_id, year_from, year_to, custom_prices');
    if (brandFilter) {
      const brand = brands.find(b => b.name.toUpperCase() === brandFilter);
      if (!brand) { console.error(`Marca "${brandFilter}" no encontrada`); return; }
      query = query.eq('brand_id', brand.id);
    }
    query = query.order('name').range(from, from + PAGE_SIZE - 1);
    const { data: page, error: pageErr } = await query;
    if (pageErr) { console.error('Error:', pageErr); return; }
    if (!page || page.length === 0) break;
    allModels = allModels.concat(page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  const models = allModels;

  const toProcess = limitArg ? models.slice(0, limitArg) : models;
  console.log(`\n📦 ${toProcess.length} modelos a procesar (de ${models.length} total)\n`);

  let updated = 0, skipped = 0, errors = 0, alreadyHas = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const m = toProcess[i];
    const brandName = brandMap[m.brand_id] || '?';
    const pct = ((i + 1) / toProcess.length * 100).toFixed(0);

    // Si ya tiene precios, saltar (a menos que queramos forzar)
    if (m.custom_prices && Object.keys(m.custom_prices).length > 0) {
      alreadyHas++;
      process.stdout.write(`\r[${pct}%] ${i + 1}/${toProcess.length} - ${brandName} ${m.name} → ya tiene precios, skip`);
      continue;
    }

    process.stdout.write(`\r[${pct}%] ${i + 1}/${toProcess.length} - ${brandName} ${m.name}...                    `);

    try {
      const prices = await getPricesForCodia(m.codia);
      if (!prices) {
        skipped++;
        continue;
      }

      if (dryRun) {
        const years = Object.keys(prices).sort();
        console.log(`\n  ✓ ${brandName} ${m.name}: ${years.length} años (${years[0]}-${years[years.length - 1]})`);
        const sample = years.slice(-2);
        sample.forEach(y => console.log(`    ${y}: $${prices[y].amount.toLocaleString()}`));
        updated++;
        continue;
      }

      const { error: updateErr } = await supabase
        .from('models')
        .update({ custom_prices: prices })
        .eq('id', m.id);

      if (updateErr) {
        errors++;
        console.log(`\n  ✗ Error ${m.name}: ${updateErr.message}`);
      } else {
        updated++;
      }

      // Rate limit: 100ms entre requests
      await new Promise(r => setTimeout(r, 100));

    } catch (err) {
      errors++;
      console.log(`\n  ✗ Error ${m.name}: ${err.message}`);
    }
  }

  console.log(`\n\n═══════════════════════════════`);
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⏭️  Ya tenían precios: ${alreadyHas}`);
  console.log(`⏩ Sin precios en InfoAuto: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`═══════════════════════════════`);
}

main().catch(console.error);
