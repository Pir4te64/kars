-- Tabla de leads para el cotizador
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(255),
  grupo VARCHAR(100),
  año VARCHAR(10),
  kilometraje VARCHAR(50),
  precio VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'nuevo',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT sin autenticación (para el formulario público)
CREATE POLICY "Allow public insert" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir SELECT solo a usuarios autenticados
CREATE POLICY "Allow authenticated read" ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir UPDATE solo a usuarios autenticados
CREATE POLICY "Allow authenticated update" ON leads
  FOR UPDATE
  TO authenticated
  USING (true);

-- Comentarios en la tabla
COMMENT ON TABLE leads IS 'Tabla para almacenar los leads generados desde el cotizador';
COMMENT ON COLUMN leads.estado IS 'Estados posibles: nuevo, contactado, calificado, cerrado, perdido';
