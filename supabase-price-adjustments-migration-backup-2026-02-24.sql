-- Migración de Ajustes de Precio a Supabase
-- Agregar columna price_adjustments a la tabla models

-- 1. Agregar columna JSONB para almacenar ajustes por año
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS price_adjustments JSONB DEFAULT '{}'::jsonb;

-- 2. Crear índice GIN para búsquedas eficientes en JSON
CREATE INDEX IF NOT EXISTS idx_models_price_adjustments 
ON models USING GIN (price_adjustments);

-- 3. Comentario en la columna
COMMENT ON COLUMN models.price_adjustments IS 'Ajustes de precio por año individual (2008-2018). Estructura: {"2008": 1.57, "2009": 2.00, "2010": null, ...}';

-- 4. UPDATE de datos de Volkswagen con porcentajes correctos
-- Nota: Los porcentajes están en formato numérico (ej: 1.57 para 1,57%, -17 para -17%)

-- Amarok
UPDATE models 
SET price_adjustments = '{
  "2008": 1.57,
  "2009": 1.57,
  "2010": 1.57,
  "2011": 1.57,
  "2012": 1.57,
  "2013": 1.57,
  "2014": 3.46,
  "2015": 5.34,
  "2016": 7.23,
  "2017": 9.11,
  "2018": 11.00
}'::jsonb
WHERE LOWER(name) LIKE '%amarok%' OR LOWER(description) LIKE '%amarok%';

-- Bora
UPDATE models 
SET price_adjustments = '{
  "2008": -17.00,
  "2009": -13.00,
  "2010": -9.00,
  "2011": -5.00,
  "2012": -1.00,
  "2013": 3.00,
  "2014": 3.00,
  "2015": 3.00,
  "2016": 3.00,
  "2017": 3.00,
  "2018": 3.00
}'::jsonb
WHERE LOWER(name) LIKE '%bora%' OR LOWER(description) LIKE '%bora%';

-- CrossFox
UPDATE models 
SET price_adjustments = '{
  "2008": -13.00,
  "2009": -12.80,
  "2010": -12.60,
  "2011": -12.40,
  "2012": -12.20,
  "2013": -12.00,
  "2014": -12.00,
  "2015": -12.00,
  "2016": -12.00,
  "2017": -12.00,
  "2018": -12.00
}'::jsonb
WHERE LOWER(name) LIKE '%crossfox%' OR LOWER(description) LIKE '%crossfox%';

-- Fox
UPDATE models 
SET price_adjustments = '{
  "2008": -7.00,
  "2009": -5.53,
  "2010": -4.06,
  "2011": -2.60,
  "2012": -1.13,
  "2013": 0.34,
  "2014": -0.13,
  "2015": -0.60,
  "2016": -1.06,
  "2017": -1.53,
  "2018": -2.00
}'::jsonb
WHERE LOWER(name) LIKE '%fox%' AND LOWER(name) NOT LIKE '%crossfox%' 
  OR (LOWER(description) LIKE '%fox%' AND LOWER(description) NOT LIKE '%crossfox%');

-- Gol
UPDATE models 
SET price_adjustments = '{
  "2008": -13.00,
  "2009": -13.80,
  "2010": -14.60,
  "2011": -15.40,
  "2012": -16.20,
  "2013": -17.00,
  "2014": -13.40,
  "2015": -9.80,
  "2016": -6.20,
  "2017": -2.60,
  "2018": 1.00
}'::jsonb
WHERE LOWER(name) LIKE '%gol%' AND LOWER(name) NOT LIKE '%gol trend%' 
  OR (LOWER(description) LIKE '%gol%' AND LOWER(description) NOT LIKE '%gol trend%');

-- Gol Trend
UPDATE models 
SET price_adjustments = '{
  "2008": -2.50,
  "2009": -3.00,
  "2010": -3.50,
  "2011": -4.00,
  "2012": -4.50,
  "2013": -5.00,
  "2014": -5.20,
  "2015": -5.40,
  "2016": -5.60,
  "2017": -5.80,
  "2018": -6.00
}'::jsonb
WHERE LOWER(name) LIKE '%gol trend%' OR LOWER(description) LIKE '%gol trend%';

-- Golf
UPDATE models 
SET price_adjustments = '{
  "2008": 9.00,
  "2009": 3.40,
  "2010": -2.20,
  "2011": -7.80,
  "2012": -13.40,
  "2013": -19.00,
  "2014": -16.00,
  "2015": -13.00,
  "2016": -10.00,
  "2017": -7.00,
  "2018": -4.00
}'::jsonb
WHERE LOWER(name) LIKE '%golf%' AND LOWER(name) NOT LIKE '%golf variant%' 
  OR (LOWER(description) LIKE '%golf%' AND LOWER(description) NOT LIKE '%golf variant%');

-- Golf Variant
UPDATE models 
SET price_adjustments = '{
  "2008": -14.00,
  "2009": -14.00,
  "2010": -14.00,
  "2011": -14.00,
  "2012": -14.00,
  "2013": -14.00,
  "2014": -14.00,
  "2015": -14.00,
  "2016": -14.00,
  "2017": -14.00,
  "2018": -14.00
}'::jsonb
WHERE LOWER(name) LIKE '%golf variant%' OR LOWER(description) LIKE '%golf variant%';

-- Polo
UPDATE models 
SET price_adjustments = '{
  "2008": -2.00,
  "2009": -2.00,
  "2010": -2.00,
  "2011": -2.00,
  "2012": -2.00,
  "2013": -2.00,
  "2014": -2.00,
  "2015": -2.00,
  "2016": -2.00,
  "2017": -2.00,
  "2018": -2.00
}'::jsonb
WHERE LOWER(name) LIKE '%polo%' AND LOWER(name) NOT LIKE '%polo classic%' 
  OR (LOWER(description) LIKE '%polo%' AND LOWER(description) NOT LIKE '%polo classic%');

-- Polo Classic
UPDATE models 
SET price_adjustments = '{
  "2008": -28.00,
  "2009": -28.00,
  "2010": -28.00,
  "2011": -28.00,
  "2012": -28.00,
  "2013": -28.00,
  "2014": -28.00,
  "2015": -28.00,
  "2016": -28.00,
  "2017": -28.00,
  "2018": -28.00
}'::jsonb
WHERE LOWER(name) LIKE '%polo classic%' OR LOWER(description) LIKE '%polo classic%';

-- Saveiro
UPDATE models 
SET price_adjustments = '{
  "2008": -10.00,
  "2009": -10.80,
  "2010": -11.60,
  "2011": -12.40,
  "2012": -13.20,
  "2013": -14.00,
  "2014": -11.30,
  "2015": -8.60,
  "2016": -5.90,
  "2017": -3.20,
  "2018": -0.50
}'::jsonb
WHERE LOWER(name) LIKE '%saveiro%' OR LOWER(description) LIKE '%saveiro%';

-- Sharan
UPDATE models 
SET price_adjustments = '{
  "2008": -8.00,
  "2009": -9.20,
  "2010": -10.40,
  "2011": -11.60,
  "2012": -12.80,
  "2013": -14.00,
  "2014": -10.00,
  "2015": -6.00,
  "2016": -2.00,
  "2017": 2.00,
  "2018": 6.00
}'::jsonb
WHERE LOWER(name) LIKE '%sharan%' OR LOWER(description) LIKE '%sharan%';

-- Suran
UPDATE models 
SET price_adjustments = '{
  "2008": -7.00,
  "2009": -7.60,
  "2010": -8.20,
  "2011": -8.80,
  "2012": -9.40,
  "2013": -10.00,
  "2014": -10.60,
  "2015": -11.20,
  "2016": -11.80,
  "2017": -12.40,
  "2018": -13.00
}'::jsonb
WHERE LOWER(name) LIKE '%suran%' AND LOWER(name) NOT LIKE '%suran cross%' 
  OR (LOWER(description) LIKE '%suran%' AND LOWER(description) NOT LIKE '%suran cross%');

-- Suran Cross
UPDATE models 
SET price_adjustments = '{
  "2008": -10.00,
  "2009": -8.31,
  "2010": -6.63,
  "2011": -4.94,
  "2012": -3.26,
  "2013": -1.57,
  "2014": -3.66,
  "2015": -5.74,
  "2016": -7.83,
  "2017": -9.91,
  "2018": -12.00
}'::jsonb
WHERE LOWER(name) LIKE '%suran cross%' OR LOWER(description) LIKE '%suran cross%';

-- Tiguan
UPDATE models 
SET price_adjustments = '{
  "2008": -1.00,
  "2009": -3.20,
  "2010": -5.40,
  "2011": -7.60,
  "2012": -9.80,
  "2013": -12.00,
  "2014": -8.40,
  "2015": -4.80,
  "2016": -1.20,
  "2017": 2.40,
  "2018": 6.00
}'::jsonb
WHERE LOWER(name) LIKE '%tiguan%' AND LOWER(name) NOT LIKE '%tiguan allspace%' 
  OR (LOWER(description) LIKE '%tiguan%' AND LOWER(description) NOT LIKE '%tiguan allspace%');

-- Tiguan Allspace
UPDATE models 
SET price_adjustments = '{
  "2008": -13.00,
  "2009": -13.00,
  "2010": -13.00,
  "2011": -13.00,
  "2012": -13.00,
  "2013": -13.00,
  "2014": -13.00,
  "2015": -13.00,
  "2016": -13.00,
  "2017": -13.00,
  "2018": -13.00
}'::jsonb
WHERE LOWER(name) LIKE '%tiguan allspace%' OR LOWER(description) LIKE '%tiguan allspace%';

-- Vento
UPDATE models 
SET price_adjustments = '{
  "2008": -24.00,
  "2009": -21.60,
  "2010": -19.20,
  "2011": -16.80,
  "2012": -14.40,
  "2013": -12.00,
  "2014": -11.60,
  "2015": -11.20,
  "2016": -10.80,
  "2017": -10.40,
  "2018": -10.00
}'::jsonb
WHERE LOWER(name) LIKE '%vento%' AND LOWER(name) NOT LIKE '%vento variant%' 
  OR (LOWER(description) LIKE '%vento%' AND LOWER(description) NOT LIKE '%vento variant%');

-- Vento Variant
UPDATE models 
SET price_adjustments = '{
  "2008": -31.00,
  "2009": -28.80,
  "2010": -26.60,
  "2011": -24.40,
  "2012": -22.20,
  "2013": -20.00,
  "2014": -20.00,
  "2015": -20.00,
  "2016": -20.00,
  "2017": -20.00,
  "2018": -20.00
}'::jsonb
WHERE LOWER(name) LIKE '%vento variant%' OR LOWER(description) LIKE '%vento variant%';

-- Voyage
UPDATE models 
SET price_adjustments = '{
  "2008": -17.00,
  "2009": -16.60,
  "2010": -16.20,
  "2011": -15.80,
  "2012": -15.40,
  "2013": -15.00,
  "2014": -11.20,
  "2015": -7.40,
  "2016": -3.60,
  "2017": 0.20,
  "2018": 4.00
}'::jsonb
WHERE LOWER(name) LIKE '%voyage%' OR LOWER(description) LIKE '%voyage%';

-- ============================================
-- RENAULT
-- ============================================

-- Captur
UPDATE models 
SET price_adjustments = '{
  "2008": -5.50,
  "2009": -5.50,
  "2010": -5.50,
  "2011": -5.50,
  "2012": -5.50,
  "2013": -5.50,
  "2014": -5.50,
  "2015": -5.50,
  "2016": -5.50,
  "2017": -5.50,
  "2018": -5.50
}'::jsonb
WHERE LOWER(name) LIKE '%captur%' OR LOWER(description) LIKE '%captur%';

-- Clio
UPDATE models 
SET price_adjustments = '{
  "2008": -11.00,
  "2009": -11.30,
  "2010": -11.60,
  "2011": -11.90,
  "2012": -12.20,
  "2013": -12.50,
  "2014": -12.50,
  "2015": -12.50,
  "2016": -12.50,
  "2017": -12.50,
  "2018": -12.50
}'::jsonb
WHERE LOWER(name) LIKE '%clio%' AND LOWER(name) NOT LIKE '%clio mio%' 
  OR (LOWER(description) LIKE '%clio%' AND LOWER(description) NOT LIKE '%clio mio%');

-- Duster
UPDATE models 
SET price_adjustments = '{
  "2008": -1.50,
  "2009": -1.50,
  "2010": -1.50,
  "2011": -1.50,
  "2012": -1.50,
  "2013": -1.50,
  "2014": -1.00,
  "2015": -0.50,
  "2016": 0.00,
  "2017": 0.50,
  "2018": 1.00
}'::jsonb
WHERE LOWER(name) LIKE '%duster%' AND LOWER(name) NOT LIKE '%duster oroch%' 
  OR (LOWER(description) LIKE '%duster%' AND LOWER(description) NOT LIKE '%duster oroch%');

-- Duster Oroch
UPDATE models 
SET price_adjustments = '{
  "2008": -3.00,
  "2009": -3.00,
  "2010": -3.00,
  "2011": -3.00,
  "2012": -3.00,
  "2013": -3.00,
  "2014": -3.00,
  "2015": -3.00,
  "2016": -3.00,
  "2017": -3.00,
  "2018": -3.00
}'::jsonb
WHERE LOWER(name) LIKE '%duster oroch%' OR LOWER(description) LIKE '%duster oroch%' 
  OR LOWER(name) LIKE '%oroch%' OR LOWER(description) LIKE '%oroch%';

-- Fluence
UPDATE models 
SET price_adjustments = '{
  "2008": -14.00,
  "2009": -14.00,
  "2010": -14.00,
  "2011": -14.00,
  "2012": -14.00,
  "2013": -14.00,
  "2014": -10.80,
  "2015": -7.60,
  "2016": -4.40,
  "2017": -1.20,
  "2018": 2.00
}'::jsonb
WHERE LOWER(name) LIKE '%fluence%' OR LOWER(description) LIKE '%fluence%';

-- Kangoo
UPDATE models 
SET price_adjustments = '{
  "2008": -20.00,
  "2009": -15.00,
  "2010": -10.00,
  "2011": -5.00,
  "2012": 0.00,
  "2013": 5.00,
  "2014": 4.50,
  "2015": 4.00,
  "2016": 3.50,
  "2017": 3.00,
  "2018": 2.50
}'::jsonb
WHERE LOWER(name) LIKE '%kangoo%' OR LOWER(description) LIKE '%kangoo%';

-- Koleos
UPDATE models 
SET price_adjustments = '{
  "2008": -3.00,
  "2009": -3.00,
  "2010": -3.00,
  "2011": -3.00,
  "2012": -3.00,
  "2013": -3.00,
  "2014": -2.90,
  "2015": -2.80,
  "2016": -2.70,
  "2017": -2.60,
  "2018": -2.50
}'::jsonb
WHERE LOWER(name) LIKE '%koleos%' OR LOWER(description) LIKE '%koleos%';

-- Kwid
UPDATE models 
SET price_adjustments = '{
  "2008": -2.50,
  "2009": -2.50,
  "2010": -2.50,
  "2011": -2.50,
  "2012": -2.50,
  "2013": -2.50,
  "2014": -2.50,
  "2015": -2.50,
  "2016": -2.50,
  "2017": -2.50,
  "2018": -2.50
}'::jsonb
WHERE LOWER(name) LIKE '%kwid%' OR LOWER(description) LIKE '%kwid%';

-- Logan
UPDATE models 
SET price_adjustments = '{
  "2008": -15.00,
  "2009": -15.30,
  "2010": -15.60,
  "2011": -15.90,
  "2012": -16.20,
  "2013": -16.50,
  "2014": -14.60,
  "2015": -12.70,
  "2016": -10.80,
  "2017": -8.90,
  "2018": -7.00
}'::jsonb
WHERE LOWER(name) LIKE '%logan%' OR LOWER(description) LIKE '%logan%';

-- Megane
UPDATE models 
SET price_adjustments = '{
  "2008": -12.00,
  "2009": -7.80,
  "2010": -3.60,
  "2011": 0.60,
  "2012": 4.80,
  "2013": 9.00,
  "2014": 9.00,
  "2015": 9.00,
  "2016": 9.00,
  "2017": 9.00,
  "2018": 9.00
}'::jsonb
WHERE LOWER(name) LIKE '%megane%' OR LOWER(description) LIKE '%megane%';

-- Sandero
UPDATE models 
SET price_adjustments = '{
  "2008": -19.00,
  "2009": -18.20,
  "2010": -17.40,
  "2011": -16.60,
  "2012": -15.80,
  "2013": -15.00,
  "2014": -14.00,
  "2015": -13.00,
  "2016": -12.00,
  "2017": -11.00,
  "2018": -10.00
}'::jsonb
WHERE LOWER(name) LIKE '%sandero%' AND LOWER(name) NOT LIKE '%sandero stepway%' 
  OR (LOWER(description) LIKE '%sandero%' AND LOWER(description) NOT LIKE '%sandero stepway%');

-- Sandero Stepway
UPDATE models 
SET price_adjustments = '{
  "2008": -7.00,
  "2009": -7.00,
  "2010": -7.00,
  "2011": -7.00,
  "2012": -7.00,
  "2013": -7.00,
  "2014": -7.40,
  "2015": -7.80,
  "2016": -8.20,
  "2017": -8.60,
  "2018": -9.00
}'::jsonb
WHERE LOWER(name) LIKE '%sandero stepway%' OR LOWER(description) LIKE '%sandero stepway%';

-- Scenic II
UPDATE models 
SET price_adjustments = '{
  "2008": 11.00,
  "2009": 11.00,
  "2010": 11.00,
  "2011": 11.00,
  "2012": 11.00,
  "2013": 11.00,
  "2014": 11.00,
  "2015": 11.00,
  "2016": 11.00,
  "2017": 11.00,
  "2018": 11.00
}'::jsonb
WHERE LOWER(name) LIKE '%scenic ii%' OR LOWER(description) LIKE '%scenic ii%' 
  OR (LOWER(name) LIKE '%scenic%' AND LOWER(name) LIKE '%ii%')
  OR (LOWER(description) LIKE '%scenic%' AND LOWER(description) LIKE '%ii%');

-- Symbol
UPDATE models 
SET price_adjustments = '{
  "2008": 5.00,
  "2009": 5.00,
  "2010": 5.00,
  "2011": 5.00,
  "2012": 5.00,
  "2013": 5.00,
  "2014": 5.00,
  "2015": 5.00,
  "2016": 5.00,
  "2017": 5.00,
  "2018": 5.00
}'::jsonb
WHERE LOWER(name) LIKE '%symbol%' OR LOWER(description) LIKE '%symbol%';

-- ============================================
-- SUZUKI
-- ============================================

-- Fun
UPDATE models 
SET price_adjustments = '{
  "2008": -6.00,
  "2009": -6.00,
  "2010": -6.00,
  "2011": -6.00,
  "2012": -6.00,
  "2013": -6.00,
  "2014": -6.00,
  "2015": -6.00,
  "2016": -6.00,
  "2017": -6.00,
  "2018": -6.00
}'::jsonb
WHERE LOWER(name) LIKE '%fun%' OR LOWER(description) LIKE '%fun%';

-- Grand Vitara
UPDATE models 
SET price_adjustments = '{
  "2008": 19.00,
  "2009": 19.00,
  "2010": 19.00,
  "2011": 19.00,
  "2012": 19.00,
  "2013": 19.00,
  "2014": 19.00,
  "2015": 19.00,
  "2016": 19.00,
  "2017": 19.00,
  "2018": 19.00
}'::jsonb
WHERE LOWER(name) LIKE '%grand vitara%' OR LOWER(description) LIKE '%grand vitara%';

-- Swift
UPDATE models 
SET price_adjustments = '{
  "2008": -10.50,
  "2009": -10.50,
  "2010": -10.50,
  "2011": -10.50,
  "2012": -10.50,
  "2013": -10.50,
  "2014": -10.50,
  "2015": -10.50,
  "2016": -10.50,
  "2017": -10.50,
  "2018": -10.50
}'::jsonb
WHERE LOWER(name) LIKE '%swift%' OR LOWER(description) LIKE '%swift%';

-- Vitara
UPDATE models 
SET price_adjustments = '{
  "2008": 13.00,
  "2009": 13.00,
  "2010": 13.00,
  "2011": 13.00,
  "2012": 13.00,
  "2013": 13.00,
  "2014": 13.00,
  "2015": 13.00,
  "2016": 13.00,
  "2017": 13.00,
  "2018": 13.00
}'::jsonb
WHERE LOWER(name) LIKE '%vitara%' AND LOWER(name) NOT LIKE '%grand vitara%' 
  OR (LOWER(description) LIKE '%vitara%' AND LOWER(description) NOT LIKE '%grand vitara%');
