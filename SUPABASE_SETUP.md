# Configuración de Supabase para KARS

## 1. Configuración Inicial

### Paso 1: Obtener credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Settings > API
4. Copia:
   - **Project URL** (formato: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (empieza con `eyJ...`)

### Paso 2: Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

2. Edita `.env.local` y agrega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 2. Estructura de la Base de Datos

### Tabla: `vehicles`

Crea la tabla `vehicles` en Supabase con la siguiente estructura:

```sql
-- Crear tabla vehicles
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  titulo TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  precio TEXT NOT NULL,
  kilometraje TEXT NOT NULL,
  combustible TEXT NOT NULL,
  transmision TEXT NOT NULL,
  images_urls TEXT[] DEFAULT '{}',
  descripcion TEXT,
  ubicacion TEXT,
  estado TEXT DEFAULT 'disponible'
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_vehicles_marca ON vehicles(marca);
CREATE INDEX idx_vehicles_anio ON vehicles(anio);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Crear política para lectura pública
CREATE POLICY "Allow public read access"
  ON vehicles FOR SELECT
  USING (true);

-- Crear política para inserción (solo usuarios autenticados)
CREATE POLICY "Allow authenticated insert"
  ON vehicles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Crear política para actualización (solo usuarios autenticados)
CREATE POLICY "Allow authenticated update"
  ON vehicles FOR UPDATE
  USING (auth.role() = 'authenticated');
```

## 3. Campos de la Tabla

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | UUID | Sí | ID único del vehículo (auto-generado) |
| `created_at` | TIMESTAMP | Sí | Fecha de creación (auto-generado) |
| `titulo` | TEXT | Sí | Título descriptivo del vehículo |
| `marca` | TEXT | Sí | Marca del vehículo (ej: "Toyota", "Honda") |
| `modelo` | TEXT | Sí | Modelo del vehículo (ej: "Corolla", "Civic") |
| `anio` | INTEGER | Sí | Año del vehículo |
| `precio` | TEXT | Sí | Precio (ej: "$15,000") |
| `kilometraje` | TEXT | Sí | Kilometraje (ej: "50,000 km") |
| `combustible` | TEXT | Sí | Tipo de combustible (ej: "Gasolina", "Diésel") |
| `transmision` | TEXT | Sí | Tipo de transmisión (ej: "Automática", "Manual") |
| `images_urls` | TEXT[] | No | Array de URLs de imágenes |
| `descripcion` | TEXT | No | Descripción detallada del vehículo |
| `ubicacion` | TEXT | No | Ubicación del vehículo |
| `estado` | TEXT | No | Estado (ej: "disponible", "vendido") |

## 4. Ejemplo de Inserción de Datos

```sql
INSERT INTO vehicles (
  titulo,
  marca,
  modelo,
  anio,
  precio,
  kilometraje,
  combustible,
  transmision,
  images_urls,
  descripcion,
  ubicacion,
  estado
) VALUES (
  'Toyota Corolla 2020 - Excelente Estado',
  'Toyota',
  'Corolla',
  2020,
  '$18,000',
  '45,000 km',
  'Gasolina',
  'Automática',
  ARRAY[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  'Vehículo en excelente estado, único dueño, servicios al día',
  'Montevideo',
  'disponible'
);
```

## 5. Uso en el Código

### Opción A: Usar Supabase directamente

El código ya está configurado para usar Supabase. Solo necesitas:

1. Agregar las credenciales en `.env.local`
2. Modificar `lib/vehicles.ts` para usar Supabase:

```typescript
import { getVehiclesFromSupabase, SupabaseVehicle } from './supabase'
import type { VehiclePost } from '@/types'

export async function getVehiclePosts(limit = 1000): Promise<VehiclePost[]> {
  const vehicles = await getVehiclesFromSupabase(limit)

  // Mapear de SupabaseVehicle a VehiclePost
  return vehicles.map(vehicle => ({
    id: vehicle.id,
    titulo: vehicle.titulo,
    marca: vehicle.marca,
    modelo: vehicle.modelo,
    anio: vehicle.anio.toString(),
    precio: vehicle.precio,
    kilometraje: vehicle.kilometraje,
    combustible: vehicle.combustible,
    transmision: vehicle.transmision,
    images_urls: vehicle.images_urls,
    descripcion: vehicle.descripcion,
  }))
}
```

### Opción B: Migración de datos existentes

Si ya tienes datos en la API actual, puedes migrarlos a Supabase:

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from './lib/supabase'

async function migrateData() {
  const response = await fetch('https://api-test.kars.uy/v1/vehicle-posts?limit=1000')
  const data = await response.json()

  for (const vehicle of data.data) {
    await supabase.from('vehicles').insert({
      titulo: vehicle.titulo,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      anio: parseInt(vehicle.anio),
      precio: vehicle.precio,
      kilometraje: vehicle.kilometraje,
      combustible: vehicle.combustible,
      transmision: vehicle.transmision,
      images_urls: vehicle.images_urls,
    })
  }
}
```

## 6. Funciones Disponibles

### `getVehiclesFromSupabase(limit?: number)`
Obtiene vehículos de Supabase con límite opcional.

```typescript
const vehicles = await getVehiclesFromSupabase(10)
```

### `getVehicleById(id: string)`
Obtiene un vehículo específico por ID.

```typescript
const vehicle = await getVehicleById('uuid-here')
```

## 7. Storage para Imágenes (Opcional)

Para subir imágenes directamente a Supabase:

1. Ve a Storage en Supabase Dashboard
2. Crea un bucket llamado `vehicle-images`
3. Configura las políticas de acceso:

```sql
-- Política de lectura pública para imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vehicle-images' );

-- Política de escritura para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'vehicle-images' AND auth.role() = 'authenticated' );
```

4. Usa el siguiente código para subir imágenes:

```typescript
import { supabase } from '@/lib/supabase'

async function uploadVehicleImage(file: File, vehicleId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${vehicleId}-${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('vehicle-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

## 8. Verificación

Después de configurar todo:

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Verifica que no haya errores en la consola
3. Los vehículos deberían cargarse desde Supabase

## 9. Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Error: "Table doesn't exist"
- Ejecuta el SQL para crear la tabla `vehicles`
- Verifica que el nombre de la tabla sea exactamente `vehicles` (minúsculas)

### No se muestran vehículos
- Verifica que haya datos en la tabla
- Revisa las políticas RLS (Row Level Security)
- Asegúrate de que la política de lectura pública esté habilitada

## 10. Próximos Pasos

Una vez configurado Supabase:

1. ✅ CarQuote recuperado e integrado en la página principal
2. ✅ Supabase instalado y configurado
3. ⏳ Agregar credenciales en `.env.local`
4. ⏳ Crear tabla `vehicles` en Supabase
5. ⏳ Modificar `lib/vehicles.ts` para usar Supabase
6. ⏳ Migrar datos existentes (opcional)
7. ⏳ Probar la integración completa
