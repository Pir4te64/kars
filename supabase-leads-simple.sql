-- Versión SIMPLIFICADA de la tabla de leads
-- Ejecuta esto SI la versión completa da error

-- 1. Eliminar tabla si existe (para empezar de cero)
DROP TABLE IF EXISTS leads CASCADE;

-- 2. Crear la tabla de leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  grupo TEXT,
  año TEXT,
  kilometraje TEXT,
  precio TEXT,
  estado TEXT DEFAULT 'nuevo',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear índices
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 5. Política PERMISIVA - permite TODO sin autenticación (para testing)
CREATE POLICY "Permitir todo acceso público" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
