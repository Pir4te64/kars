# Campos Adicionales Sugeridos para vehicle_posts

Basado en el análisis de [Carmak.com.ar](https://carmak.com.ar/venta-autos-misiones/todos-0/fiat-11/cross-plus-automatico-4x4-3713/), estos son los campos adicionales que podrían agregarse a la tabla `vehicle_posts`:

## 📋 Campos Actuales vs. Campos Sugeridos

### ✅ Campos que YA existen:

- titulo, slug, marca, modelo, version, anio, kilometraje
- carroceria, condicion, color_exterior, color_interior
- puertas, asientos, transmision, traccion
- cilindrada, combustible, potencia_hp
- moneda, precio, precio_negociable
- cuota_mensual, enganche
- pais, estado_provincia, ciudad
- vendedor_nombre, vendedor_calificacion, concesionaria_nombre
- disponible, descripcion, images_urls

---

## 🆕 Campos Adicionales Sugeridos

### 🔧 MOTOR (Detalles adicionales)

```sql
-- Campos adicionales para motor
alimentacion text null,              -- Ej: "Turbo", "Aspirado", "Híbrido"
cilindros text null,                 -- Ej: "4", "6", "8"
valvulas text null,                  -- Ej: "16", "24", "32"
```

### 🚗 TRANSMISIÓN Y CHASIS (Detalles adicionales)

```sql
-- Campos adicionales para transmisión
velocidades text null,              -- Ej: "Caja de Novena", "5 velocidades"
neumaticos text null,                -- Ej: "R17", "R18", "R19"
frenos_delanteros text null,         -- Ej: "Discos ventilados", "Discos"
frenos_traseros text null,           -- Ej: "Discos", "Tambor"
direccion_asistida text null,        -- Ej: "Hidráulica", "Eléctrica", "Electro-hidráulica"
freno_mano text null,                -- Ej: "Mecánico", "Eléctronico"
```

### 🎛️ EQUIPAMIENTO - CONFORT

```sql
-- Campos de confort (booleanos o text)
aire_acondicionado text null,        -- Ej: "Climatizador", "Aire acondicionado", "No"
asiento_delantero_ajuste_altura text null,  -- Ej: "Sí", "No"
volante_regulable text null,        -- Ej: "Sí", "No"
asientos_traseros text null,        -- Ej: "Abatibles 60/40", "Fijos"
tapizados text null,                 -- Ej: "Cuero", "Tela", "Alcantara"
cierre_puertas text null,            -- Ej: "Centralizado con mando", "Manual"
vidrios_delanteros text null,        -- Ej: "Eléctricos", "Manuales"
vidrios_traseros text null,          -- Ej: "Eléctricos", "Manuales"
espejos_exteriores text null,        -- Ej: "Eléctricos", "Manuales"
espejo_interior_antideslumbrante text null, -- Ej: "Automático", "Manual", "No"
faros_delanteros text null,          -- Ej: "Automáticos con regulación", "Manuales"
faros_antiniebla text null,          -- Ej: "Sí", "No"
faros_tipo text null,                -- Ej: "Xenón", "LED", "Halógenos"
computadora_abordo text null,        -- Ej: "Sí", "No"
control_velocidad_crucero text null, -- Ej: "Sí", "No"
limitador_velocidad text null,       -- Ej: "Sí", "No"
llantas_aleacion text null,          -- Ej: "Sí", "No"
techo_solar text null,               -- Ej: "Doble - Eléctrico", "Simple", "No"
sensores_estacionamiento text null, -- Ej: "Delanteros", "Traseros", "Delanteros y traseros", "No"
camara_estacionamiento text null,   -- Ej: "Sí", "No"
asistencia_arranque_pendientes text null, -- Ej: "Sí", "No"
```

### 🛡️ SEGURIDAD

```sql
-- Campos de seguridad
abs text null,                       -- Ej: "Sí", "No"
distribucion_electronica_frenado text null, -- Ej: "Sí", "No"
asistencia_frenada_emergencia text null,    -- Ej: "Sí", "No"
airbags_delanteros text null,       -- Ej: "Sí", "No"
airbags_cortina text null,          -- Ej: "Delanteros", "Delanteros y traseros", "No"
airbag_rodilla_conductor text null, -- Ej: "Sí", "No"
airbags_laterales text null,        -- Ej: "Delanteros", "Delanteros y traseros", "No"
cantidad_airbags text null,         -- Ej: "7", "6", "4"
alarma text null,                    -- Ej: "Sí", "No"
inmovilizador_motor text null,       -- Ej: "Sí", "No"
anclaje_asientos_infantiles text null, -- Ej: "Sí", "No"
sensor_lluvia text null,            -- Ej: "Sí", "No"
sensor_luz text null,               -- Ej: "Sí", "No"
autobloqueo_puertas_velocidad text null, -- Ej: "Sí", "No"
control_estabilidad text null,      -- Ej: "Sí", "No"
control_traccion text null,         -- Ej: "Sí", "No"
control_descenso text null,          -- Ej: "Sí", "No"
sensor_presion_neumaticos text null, -- Ej: "Sí", "No"
```

### 📻 COMUNICACIÓN Y ENTRETENIMIENTO

```sql
-- Campos de entretenimiento
equipo_musica text null,             -- Ej: "AM - FM", "AM/FM/CD", "No"
comandos_volante text null,          -- Ej: "Sí", "No"
conexion_auxiliar text null,         -- Ej: "Sí", "No"
conexion_usb text null,              -- Ej: "Sí", "No"
bluetooth text null,                 -- Ej: "Sí", "No"
control_voz text null,               -- Ej: "Sí", "No"
pantalla text null,                  -- Ej: "Sí", "No", "Touchscreen 7 pulgadas"
navegacion_gps text null,            -- Ej: "Sí", "No"
apple_carplay text null,            -- Ej: "Sí", "No"
android_auto text null,             -- Ej: "Sí", "No"
```

### 💰 FINANCIAMIENTO (Detalles adicionales)

```sql
-- Campos adicionales de financiamiento
entrega_minima text null,            -- Ej: "$15.980.000"
cuotas_disponibles text null,       -- Ej: "12, 24, 36, 48, 60"
tasa_interes text null,              -- Ej: "Tasa Fija", "Variable"
banco_financiamiento text null,      -- Ej: "Santander", "BBVA", "Múltiples"
```

### 📝 INFORMACIÓN ADICIONAL

```sql
-- Campos informativos adicionales
observaciones text null,             -- Ej: "Solicitar cita para ver el vehiculo"
garantia text null,                  -- Ej: "GarantíaCARMAK", "1 año", "Sin garantía"
services_oficiales text null,        -- Ej: "Sí", "No"
precio_debajo_info text null,        -- Ej: "PRECIO DEBAJO DE INFO" (nota especial)
contacto_telefono text null,        -- Ej: "3765439082"
contacto_whatsapp text null,         -- Ej: "(376) 433.0096"
contacto_email text null,            -- Ej: "ventas@carmak.com.ar"
horarios_atencion text null,         -- Ej: "Lunes a Viernes de 9 a 13 y de 15 a 19. Sábados de 8:30 a 13 hs."
direccion_fisica text null,          -- Ej: "Av. Corrientes 1772 - Posadas - Misiones"
```

### 🏷️ METADATOS Y SEO

```sql
-- Campos para mejor organización
categoria text null,                 -- Ej: "SUV", "Sedán", "Hatchback", "Pickup"
destacado boolean not null default false, -- Ya existe, pero mencionado
tags text[] null,                    -- Ej: ["4x4", "automático", "turbo"]
video_url text null,                  -- URL de video del vehículo
```

---

## 📊 Resumen de Campos Sugeridos

### Por Categoría:

- **Motor (detalles):** 3 campos
- **Transmisión y Chasis:** 6 campos
- **Confort:** 20 campos
- **Seguridad:** 18 campos
- **Entretenimiento:** 10 campos
- **Financiamiento:** 4 campos
- **Información adicional:** 8 campos
- **Metadatos:** 3 campos

**Total: ~72 campos adicionales sugeridos**

---

## 💡 Recomendación de Implementación

### Opción 1: Campos Individuales (Recomendado para búsquedas específicas)

Agregar todos los campos como columnas individuales. Esto permite:

- Búsquedas y filtros específicos
- Mejor rendimiento en consultas
- Validación individual por campo

### Opción 2: Campos JSONB (Recomendado para flexibilidad)

Agregar campos JSONB para agrupar información:

```sql
equipamiento jsonb null,  -- { confort: {...}, seguridad: {...}, entretenimiento: {...} }
financiamiento jsonb null, -- { entrega_minima: "...", cuotas: [...] }
contacto jsonb null,       -- { telefono: "...", whatsapp: "...", email: "..." }
```

### Opción 3: Híbrido (Recomendado)

- Campos más importantes como columnas individuales
- Campos menos usados en JSONB

---

## 🎯 Prioridad de Implementación

### Alta Prioridad:

1. `alimentacion` (Turbo, Aspirado, Híbrido)
2. `velocidades` (Cantidad de velocidades)
3. `neumaticos` (Tamaño de ruedas)
4. `aire_acondicionado` (Tipo de aire)
5. `tapizados` (Material de asientos)
6. `abs`, `airbags_delanteros`, `cantidad_airbags` (Seguridad básica)
7. `bluetooth`, `pantalla`, `navegacion_gps` (Entretenimiento básico)
8. `entrega_minima` (Financiamiento)
9. `observaciones` (Notas importantes)
10. `garantia` (Información de garantía)

### Media Prioridad:

- Resto de campos de confort y seguridad
- Campos de contacto

### Baja Prioridad:

- Campos muy específicos que pocos vehículos tendrán
- Metadatos avanzados

---

## 📝 SQL para Agregar Campos (Ejemplo - Alta Prioridad)

```sql
-- Agregar campos de alta prioridad
ALTER TABLE public.vehicle_posts
ADD COLUMN IF NOT EXISTS alimentacion text null,
ADD COLUMN IF NOT EXISTS velocidades text null,
ADD COLUMN IF NOT EXISTS neumaticos text null,
ADD COLUMN IF NOT EXISTS aire_acondicionado text null,
ADD COLUMN IF NOT EXISTS tapizados text null,
ADD COLUMN IF NOT EXISTS abs text null,
ADD COLUMN IF NOT EXISTS airbags_delanteros text null,
ADD COLUMN IF NOT EXISTS cantidad_airbags text null,
ADD COLUMN IF NOT EXISTS bluetooth text null,
ADD COLUMN IF NOT EXISTS pantalla text null,
ADD COLUMN IF NOT EXISTS navegacion_gps text null,
ADD COLUMN IF NOT EXISTS entrega_minima text null,
ADD COLUMN IF NOT EXISTS observaciones text null,
ADD COLUMN IF NOT EXISTS garantia text null;
```

---

## 🔄 Siguiente Paso

1. Revisar esta lista y decidir qué campos son realmente necesarios
2. Crear el SQL de migración
3. Actualizar el schema de Zod
4. Actualizar el formulario de creación/edición
5. Actualizar los tipos TypeScript
