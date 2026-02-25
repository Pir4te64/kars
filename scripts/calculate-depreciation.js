/**
 * Script para parsear el CSV de precios y calcular curvas de depreciación 2019-2026
 *
 * - Lee autos2019-2026.csv
 * - Extrae rangos de precios (min-max) por modelo/año
 * - Calcula punto medio de cada rango
 * - Genera curva de depreciación: 2026 = 0% (base), años anteriores = % negativo
 * - Para modelos sin dato 2026, usa el año más reciente como base (0%)
 * - Solo genera datos para 2019-2026 (NO extrapola valores positivos)
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 1. PARSER DE CSV
// ============================================

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  const header = lines[0].split(';').map(h => h.trim());
  const yearColumns = header.slice(2);

  const models = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(';');
    const marca = fields[0] ? fields[0].trim() : '';
    const modelo = fields[1] ? fields[1].trim() : '';

    if (!marca || !modelo) continue;

    const prices = {};
    for (let j = 2; j < fields.length && j - 2 < yearColumns.length; j++) {
      const year = parseInt(yearColumns[j - 2]);
      const raw = fields[j] ? fields[j].trim() : '';

      if (!raw || raw === '' || raw.length < 3) continue;

      const parsed = parsePriceRange(raw);
      if (parsed) {
        prices[year] = parsed;
      } else {
        // Debug: reportar celdas que no se pudieron parsear
        if (raw.length > 2 && year >= 2019) {
          console.warn(`  ⚠️  No parseado: ${marca} ${modelo} ${year}: "${raw}"`);
        }
      }
    }

    if (Object.keys(prices).length > 0) {
      models.push({ marca, modelo, prices });
    }
  }

  return models;
}

/**
 * Parsea un string de rango de precios.
 * Maneja TODOS los formatos encontrados en el CSV:
 * - "$18.500.000  $25.000.000" (doble espacio)
 * - "5.000.000 -- 8.000.000"
 * - "5.000.000 – 8.000.000" (em dash)
 * - "5.000.000 ? 8.000.000"
 * - "5.000.000 y 8.000.000"
 * - "5.000.000 a 8.000.000"
 * - "10.000.000- 13.000.000" (dash pegado al primero)
 * - "5.000.000,00 – 8.000.000,00" (con decimales)
 * - "5.000.000" (valor único)
 */
function parsePriceRange(raw) {
  let cleaned = raw.trim();

  // Paso 1: Quitar todos los $ y puntos finales sueltos
  cleaned = cleaned.replace(/\$/g, '');
  cleaned = cleaned.replace(/\.$/g, '');

  // Paso 2: Intentar extraer DOS números del string
  // Un "número" en formato argentino es: dígitos separados por puntos (miles) opcionalmente con ,00
  // Patron: \d{1,3}(?:\.\d{3})*(?:,\d{2})?  o  \d{4,}
  // Pero también hay errores como "22.00.000" que debería ser "22.000.000"

  // Primero, normalizar: quitar ",00" y ",XX" al final de números
  cleaned = cleaned.replace(/,\d{2}(?=\s|$|[^0-9])/g, '');

  // Extraer todos los candidatos a números (secuencias de dígitos y puntos)
  const numberCandidates = [];
  const numRegex = /\d[\d.]*\d/g;
  let match;
  while ((match = numRegex.exec(cleaned)) !== null) {
    const candidate = match[0];
    const num = normalizeNumber(candidate);
    if (num !== null && num >= 1000000 && num <= 300000000) {
      numberCandidates.push(num);
    }
  }

  // También buscar números simples de 7+ dígitos sin puntos
  const simpleNumRegex = /\b(\d{7,})\b/g;
  while ((match = simpleNumRegex.exec(cleaned)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= 1000000 && num <= 300000000 && !numberCandidates.includes(num)) {
      numberCandidates.push(num);
    }
  }

  if (numberCandidates.length === 0) return null;

  if (numberCandidates.length === 1) {
    return { min: numberCandidates[0], max: numberCandidates[0], mid: numberCandidates[0] };
  }

  // Tomar el menor y el mayor
  const sorted = numberCandidates.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    min,
    max,
    mid: Math.round((min + max) / 2)
  };
}

/**
 * Normaliza un string de número argentino a entero.
 * "5.000.000" -> 5000000
 * "22.00.000" -> 22000000 (corrige typo: .00. → .000.)
 * "8.9000.000" -> null (malformado)
 * "15.00.000" -> 15000000
 */
function normalizeNumber(str) {
  if (!str) return null;

  // Quitar espacios
  let cleaned = str.replace(/\s/g, '');

  // Caso especial: números con .00. que son typos de .000.
  // Ej: "22.00.000" → "22.000.000", "15.00.000" → "15.000.000"
  cleaned = cleaned.replace(/\.00\./g, '.000.');

  // Caso especial: "8.9000.000" → typo, debería ser "8.900.000"
  // Detectar grupos de 4 dígitos entre puntos
  cleaned = cleaned.replace(/\.(\d{4})\./g, (m, digits) => `.${digits.substring(0, 3)}.`);

  // Quitar todos los puntos (separadores de miles)
  const numStr = cleaned.replace(/\./g, '');

  const num = parseInt(numStr, 10);
  if (isNaN(num) || num <= 0) return null;

  return num;
}

// ============================================
// 2. CÁLCULO DE DEPRECIACIÓN
// ============================================

function calculateDepreciation(models) {
  const results = [];

  for (const model of models) {
    // Filtrar solo años 2019-2026
    const recentPrices = {};
    for (const [yearStr, priceData] of Object.entries(model.prices)) {
      const year = parseInt(yearStr);
      if (year >= 2019 && year <= 2026) {
        recentPrices[year] = priceData;
      }
    }

    // Necesitamos al menos 2 puntos de datos en 2019-2026 para calcular una curva
    const availableYears = Object.keys(recentPrices).map(Number).sort((a, b) => b - a);
    if (availableYears.length < 2) {
      if (availableYears.length === 1) {
        console.log(`   ⚠️ ${model.marca} ${model.modelo}: solo 1 dato (${availableYears[0]}), insuficiente para curva`);
      }
      continue;
    }

    // Determinar año base: preferir 2026, luego 2025, luego el más reciente
    let baseYear = availableYears[0]; // El más reciente
    const baseMid = recentPrices[baseYear].mid;

    // Calcular depreciación relativa al año base
    const depreciation = {};
    for (const year of availableYears) {
      if (year === baseYear) {
        depreciation[year] = 0;
      } else {
        const yearMid = recentPrices[year].mid;
        const pct = ((yearMid / baseMid) - 1) * 100;
        depreciation[year] = Math.round(pct * 100) / 100;
      }
    }

    results.push({
      marca: model.marca,
      modelo: model.modelo,
      baseYear,
      baseMid,
      availableYears,
      depreciation,
      rawPrices: recentPrices
    });
  }

  return results;
}

// ============================================
// 3. INTERPOLACIÓN: solo entre puntos conocidos y hacia atrás (2019)
//    NUNCA extrapolar valores positivos más allá del base year
// ============================================

function interpolateDepreciation(depreciation, baseYear) {
  const years = Object.keys(depreciation).map(Number).sort((a, b) => a - b);
  if (years.length < 2) return { ...depreciation };

  const interpolated = { ...depreciation };

  // 1. Llenar gaps ENTRE años conocidos (interpolación lineal)
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    const v1 = depreciation[y1];
    const v2 = depreciation[y2];

    for (let y = y1 + 1; y < y2; y++) {
      if (interpolated[y] === undefined) {
        const ratio = (y - y1) / (y2 - y1);
        interpolated[y] = Math.round((v1 + ratio * (v2 - v1)) * 100) / 100;
      }
    }
  }

  // 2. Extrapolar hacia ATRÁS (hacia 2019) si falta
  const minKnown = years[0];
  if (minKnown > 2019 && years.length >= 2) {
    // Usar los 2 primeros puntos para calcular la tendencia
    const y1 = years[0];
    const y2 = years[1];
    const slope = (depreciation[y2] - depreciation[y1]) / (y2 - y1);

    for (let y = y1 - 1; y >= 2019; y--) {
      if (interpolated[y] === undefined) {
        interpolated[y] = Math.round((depreciation[y1] + slope * (y - y1)) * 100) / 100;
      }
    }
  }

  // 3. Si baseYear < 2026: extrapolar SOLO hasta 2026 con valores que tengan sentido
  //    La depreciación para años futuros al base debería ser MENOR (más cercana a 0 o 0)
  //    Pero como NO tenemos datos reales, mejor dejar 2026 = 0% y ajustar
  if (baseYear < 2026) {
    // Recalcular: el año base es 0%, pero necesitamos que 2026 sea 0%
    // Shift: restar el valor del baseYear de todos (que ya es 0)
    // y agregar la diferencia para que el más reciente known year antes de 2026 conecte a 0
    // Simplemente: para años > baseYear, extrapolar con la tendencia pero cap a 0
    // O mejor: no incluir años > baseYear
    // DECISIÓN: solo incluir años desde 2019 hasta baseYear
    for (let y = baseYear + 1; y <= 2026; y++) {
      delete interpolated[y];
    }
  }

  return interpolated;
}

// ============================================
// 4. GENERAR SQL DE MIGRACIÓN
// ============================================

function generateSQL(results) {
  let sql = `-- Migración de Curvas de Depreciación 2019-2026
-- Generado automáticamente desde autos2019-2026.csv
-- Fecha: ${new Date().toISOString().split('T')[0]}
--
-- 2026 = 0% (año base, sin depreciación)
-- Años anteriores = porcentaje negativo (más viejo = más depreciación)
--
-- Los datos existentes (2008-2018) NO se modifican.
-- Se agregan/actualizan las claves 2019-2026 al JSONB existente usando ||.

`;

  for (const result of results) {
    const { marca, modelo, depreciation, baseYear, baseMid } = result;

    // Interpolar años faltantes
    const fullDepreciation = interpolateDepreciation(depreciation, baseYear);

    // Construir JSONB parcial solo con 2019-2026
    const jsonParts = [];
    for (let year = 2019; year <= 2026; year++) {
      if (fullDepreciation[year] !== undefined) {
        jsonParts.push(`  "${year}": ${fullDepreciation[year]}`);
      }
    }

    if (jsonParts.length === 0) continue;

    const jsonStr = `{${jsonParts.join(', ')}}`;

    // Escapar nombre del modelo para SQL LIKE
    const modelLike = modelo.toLowerCase().replace(/'/g, "''");

    sql += `-- ${marca} ${modelo} (base: ${baseYear}, precio medio: $${baseMid.toLocaleString('es-AR')})\n`;
    sql += `UPDATE models\n`;
    sql += `SET price_adjustments = COALESCE(price_adjustments, '{}'::jsonb) || '${jsonStr}'::jsonb\n`;
    sql += `WHERE LOWER(name) LIKE '%${modelLike}%' OR LOWER(description) LIKE '%${modelLike}%';\n\n`;
  }

  return sql;
}

// ============================================
// 5. GENERAR REPORTE
// ============================================

function generateReport(results) {
  let report = `# Reporte de Curvas de Depreciación 2019-2026\n\n`;
  report += `Generado: ${new Date().toISOString()}\n\n`;
  report += `Total modelos procesados: ${results.length}\n\n`;

  for (const result of results) {
    const { marca, modelo, baseYear, baseMid, depreciation, rawPrices } = result;
    const fullDep = interpolateDepreciation(depreciation, baseYear);

    report += `## ${marca} ${modelo}\n`;
    report += `Base: ${baseYear} (precio medio: $${baseMid.toLocaleString('es-AR')})\n\n`;
    report += `| Año | Precio Medio | Depreciación |\n`;
    report += `|-----|-------------|-------------|\n`;

    for (let year = 2019; year <= 2026; year++) {
      const price = rawPrices[year] ? `$${rawPrices[year].mid.toLocaleString('es-AR')}` : '-';
      const dep = fullDep[year] !== undefined ? `${fullDep[year]}%` : '-';
      const isReal = rawPrices[year] ? '' : ' (interp)';
      report += `| ${year} | ${price} | ${dep}${isReal} |\n`;
    }
    report += '\n';
  }

  return report;
}

// ============================================
// MAIN
// ============================================

function main() {
  const csvPath = path.join(__dirname, '..', 'autos2019-2026.csv');

  console.log('1. Parseando CSV...');
  const models = parseCSV(csvPath);
  console.log(`   Modelos encontrados: ${models.length}`);

  for (const m of models) {
    const years = Object.keys(m.prices).sort();
    const recentYears = years.filter(y => parseInt(y) >= 2019);
    const tag = recentYears.length > 0 ? ` ✅ 2019+: ${recentYears.join(', ')}` : ' (solo datos antiguos)';
    console.log(`   - ${m.marca} ${m.modelo}: ${years.length} años${tag}`);
  }

  console.log('\n2. Calculando depreciación (solo modelos con 2+ datos en 2019-2026)...');
  const results = calculateDepreciation(models);
  console.log(`   Modelos con curva calculable: ${results.length}\n`);

  for (const r of results) {
    const fullDep = interpolateDepreciation(r.depreciation, r.baseYear);
    console.log(`   ${r.marca} ${r.modelo} (base: ${r.baseYear} = $${r.baseMid.toLocaleString('es-AR')}):`);
    for (let y = 2019; y <= 2026; y++) {
      if (fullDep[y] !== undefined) {
        const raw = r.rawPrices[y] ? `$${r.rawPrices[y].mid.toLocaleString('es-AR')}` : 'interpolado';
        console.log(`     ${y}: ${fullDep[y]}% (${raw})`);
      }
    }
    console.log('');
  }

  console.log('3. Generando SQL de migración...');
  const sql = generateSQL(results);
  const sqlPath = path.join(__dirname, '..', 'supabase-price-adjustments-2019-2026-migration.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`   → ${sqlPath}`);

  console.log('\n4. Generando reporte y JSON...');
  const report = generateReport(results);
  fs.writeFileSync(path.join(__dirname, 'depreciation-report.md'), report);

  const jsonData = {};
  for (const r of results) {
    if (!jsonData[r.marca]) jsonData[r.marca] = {};
    jsonData[r.marca][r.modelo] = {
      baseYear: r.baseYear,
      depreciation: interpolateDepreciation(r.depreciation, r.baseYear)
    };
  }
  fs.writeFileSync(path.join(__dirname, 'depreciation-data.json'), JSON.stringify(jsonData, null, 2));

  console.log('\n✅ Proceso completado.');
}

main();
