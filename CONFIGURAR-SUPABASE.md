# 🚀 Configuración de Supabase para Leads

## ⚠️ IMPORTANTE: Esto es OBLIGATORIO para que funcionen los leads

Si completaste el cotizador y no apareció en `/admin/leads`, es porque **falta configurar Supabase**.

## 📋 Pasos para Configurar

### 1. Acceder a Supabase

1. Ve a https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto KARS (o crea uno si no existe)

### 2. Crear la Tabla de Leads

1. En el panel de Supabase, ve a **SQL Editor** (ícono de código)
2. Click en **"+ New query"**
3. Copia y pega TODO el contenido del archivo `supabase-leads-schema.sql`
4. Click en **"Run"** (botón verde)
5. Deberías ver: ✅ **"Success. No rows returned"**

### 3. Verificar que la Tabla se Creó

1. Ve a **Table Editor** (ícono de tabla)
2. Deberías ver una nueva tabla llamada **"leads"**
3. Click en la tabla para ver las columnas:
   - id
   - nombre
   - email
   - telefono
   - ubicacion
   - marca
   - modelo
   - grupo
   - año
   - kilometraje
   - precio
   - estado
   - notas
   - created_at
   - updated_at

### 4. Verificar las Variables de Entorno

Asegúrate de tener en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui
```

**Dónde encontrar estos valores:**

1. En Supabase, ve a **Settings** → **API**
2. **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **service_role** = `SUPABASE_SERVICE_KEY` (click en "Reveal" para verla)

### 5. Reiniciar el Servidor

Después de configurar las variables de entorno:

```bash
# Detén el servidor (Ctrl+C)
# Luego inícialo de nuevo:
npm run dev
```

## 🧪 Probar que Funciona

### Opción 1: Desde el Navegador

1. Abre la consola del navegador (F12)
2. Ve a `/cotizar`
3. Completa el formulario
4. Click en "Completar cotización"
5. En la consola deberías ver:
   ```
   🔄 Guardando lead...
   ✅ Lead guardado exitosamente: {...}
   ```

### Opción 2: Prueba Manual del API

```bash
node test-leads-api.js
```

Deberías ver:
```
✅ Respuesta del API: { success: true, ... }
🎉 Lead guardado exitosamente!
```

### Opción 3: Verificar en Supabase

1. Ve a Supabase → **Table Editor** → **leads**
2. Deberías ver las filas con los datos que enviaste

## ❌ Solución de Problemas

### Error: "relation 'leads' does not exist"

**Causa:** La tabla no se creó
**Solución:** Ejecuta el SQL del paso 2

### Error: "Invalid API key"

**Causa:** Variables de entorno incorrectas
**Solución:**
1. Verifica que copiaste las keys correctas
2. Asegúrate que el archivo es `.env.local` (no `.env`)
3. Reinicia el servidor

### Error: "permission denied for table leads"

**Causa:** Políticas de RLS incorrectas
**Solución:** Re-ejecuta el SQL completo (incluye las políticas)

### Los leads no aparecen en el dashboard

**Causa 1:** La tabla está vacía
- Verifica en Supabase Table Editor si hay datos

**Causa 2:** Error en la consulta
- Abre la consola del navegador en `/admin/leads`
- Busca errores en rojo

**Causa 3:** Variables de entorno en el cliente
- El dashboard usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Asegúrate que tengan el prefijo `NEXT_PUBLIC_`

## ✅ Checklist Final

- [ ] Tabla `leads` creada en Supabase
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor reiniciado después de configurar env vars
- [ ] Probé completar el cotizador
- [ ] Vi el mensaje "✅ Lead guardado" en la consola
- [ ] El lead aparece en Supabase Table Editor
- [ ] El lead aparece en `/admin/leads`

## 📞 Si Sigue sin Funcionar

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes que empiecen con ❌
4. Copia el error completo
5. Verifica que corresponda a alguno de los casos anteriores

## 🎯 Resultado Esperado

Cuando TODO esté configurado correctamente:

1. Usuario completa cotizador → ✅
2. Lead se guarda en Supabase → ✅
3. Aparece en `/admin/leads` → ✅
4. Email se envía → ✅
5. En consola: "✅ Lead guardado exitosamente" → ✅
