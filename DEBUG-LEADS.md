# 🐛 Debug: Los Leads No Se Guardan

## 🔍 Pasos para Encontrar el Problema

### 1. Ejecuta la Versión Simple del SQL

**Usa este archivo:** `supabase-leads-simple.sql`

1. Ve a Supabase → SQL Editor
2. Copia y pega **TODO** el contenido de `supabase-leads-simple.sql`
3. Click **Run**
4. Deberías ver: ✅ "Success"

**Este SQL:**
- Elimina la tabla anterior (si existe)
- Crea una versión simple
- Permite acceso público (sin autenticación)

### 2. Verifica que la Tabla Existe

1. En Supabase, ve a **Table Editor**
2. Busca la tabla **"leads"**
3. Si NO aparece → El SQL falló, revisa el paso 1
4. Si SÍ aparece → Continúa al paso 3

### 3. Verifica Variables de Entorno

**Abre tu archivo `.env.local` y verifica:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Cómo conseguirlas?**
1. Supabase → Settings (⚙️) → API
2. Copia **Project URL** → Pega en `NEXT_PUBLIC_SUPABASE_URL`
3. Copia **anon public** (click Reveal) → Pega en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**⚠️ IMPORTANTE:**
- NO uses comillas en el .env.local
- Asegúrate que el archivo se llama `.env.local` (con el punto al inicio)
- Debe estar en la raíz del proyecto (al lado de `package.json`)

### 4. Reinicia el Servidor

```bash
# Detén el servidor: Ctrl+C

# Inicia de nuevo:
npm run dev
```

### 5. Prueba con la Consola del Navegador

1. Abre el navegador en `http://localhost:3000/cotizar`
2. **Presiona F12** para abrir la consola
3. Ve a la pestaña **"Console"**
4. Completa el formulario del cotizador
5. Click en **"Completar cotización"**

**¿Qué deberías ver?**

#### ✅ Si TODO funciona:
```
🔄 Guardando lead...
📥 API /api/leads - POST recibido
📦 Datos recibidos: {nombre: "...", email: "...", ...}
✅ Validación OK, guardando en Supabase...
🔑 Supabase URL: https://xxxxx.supabase.co
🔑 Usando key: Configurada ✓
✅ Lead guardado exitosamente: {...}
✅ Lead guardado exitosamente: {success: true, ...}
```

#### ❌ Error: "NO CONFIGURADA"
```
🔑 Usando key: NO CONFIGURADA ✗
```
**Solución:** Variables de entorno mal configuradas (paso 3)

#### ❌ Error: "relation 'leads' does not exist"
```
❌ Error de Supabase: {message: "relation 'leads' does not exist"}
```
**Solución:** La tabla no existe (paso 1)

#### ❌ Error: "permission denied"
```
❌ Error de Supabase: {message: "permission denied for table leads"}
```
**Solución:** Problema con RLS, usa `supabase-leads-simple.sql` (paso 1)

#### ❌ Error: "Failed to fetch"
```
❌ Error saving lead: TypeError: Failed to fetch
```
**Solución:** El servidor no está corriendo o hay error de red

### 6. Verifica en la Terminal del Servidor

**Mira la terminal donde corre `npm run dev`**

Deberías ver:
```
📥 API /api/leads - POST recibido
📦 Datos recibidos: {...}
✅ Validación OK, guardando en Supabase...
✅ Lead guardado exitosamente: {...}
```

### 7. Verifica en Supabase Directamente

1. Ve a Supabase → **Table Editor** → **leads**
2. Deberías ver una fila con tus datos
3. Si NO hay datos → Revisa los pasos anteriores

### 8. Verifica en el Dashboard Admin

1. Ve a `http://localhost:3000/admin/leads`
2. Deberías ver tu cotización
3. Si no aparece, abre la consola (F12) y busca errores

## 🧪 Prueba Manual del API

**Opción 1: Desde la consola del navegador**

1. Ve a cualquier página del sitio
2. Abre consola (F12)
3. Pega esto:

```javascript
fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Test',
    email: 'test@test.com',
    telefono: '1234567890',
    ubicacion: 'Test City',
    marca: 'Toyota',
    modelo: 'Corolla',
    año: '2020',
    kilometraje: '50000',
    precio: '15000'
  })
})
.then(r => r.json())
.then(d => console.log('Respuesta:', d))
```

**Opción 2: Con curl**

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test@test.com",
    "telefono": "1234567890",
    "ubicacion": "Test City",
    "marca": "Toyota",
    "modelo": "Corolla",
    "año": "2020",
    "kilometraje": "50000",
    "precio": "15000"
  }'
```

## 📋 Checklist de Verificación

- [ ] Ejecuté `supabase-leads-simple.sql` en Supabase
- [ ] La tabla `leads` aparece en Table Editor
- [ ] Tengo `.env.local` con las variables correctas
- [ ] Las variables NO tienen comillas
- [ ] Reinicié el servidor después de configurar env
- [ ] Veo los logs en la consola del navegador
- [ ] Veo "Configurada ✓" en los logs
- [ ] No hay errores rojos en la consola
- [ ] Aparece en Supabase Table Editor
- [ ] Aparece en /admin/leads

## 🆘 Si Sigue Sin Funcionar

**Copia y envía:**

1. El error COMPLETO de la consola del navegador
2. Los logs de la terminal del servidor
3. Screenshot de Supabase Table Editor mostrando la tabla `leads`
4. Tu archivo `.env.local` (SIN mostrar las keys completas, solo las primeras letras)

**Ejemplo:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abc...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```
