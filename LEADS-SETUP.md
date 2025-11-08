# Sistema de Gestión de Leads - Configuración

## 📋 Descripción

Sistema completo para capturar, almacenar y gestionar los leads generados desde el cotizador de vehículos.

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar el SQL en Supabase

Ve a tu proyecto de Supabase → SQL Editor → Nuevo query → Pega y ejecuta el contenido de `supabase-leads-schema.sql`

Esto creará:
- ✅ Tabla `leads` con todos los campos necesarios
- ✅ Índices para mejorar el performance
- ✅ Trigger para actualizar `updated_at` automáticamente
- ✅ Políticas de Row Level Security (RLS)

### 2. Verificar Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key  # Opcional, para mayor seguridad
```

## 📝 Campos del Formulario

El formulario ahora captura:

### Información del Cliente
- ✅ **Nombre y apellido** (requerido)
- ✅ **Email** (requerido)
- ✅ **Teléfono** (requerido) ← NUEVO
- ✅ **Ubicación** (requerido)

### Información del Vehículo
- Marca
- Modelo
- Grupo
- Año
- Kilometraje
- Precio estimado (USD)

## 🎯 Flujo de Funcionamiento

1. **Usuario completa la cotización** en `/cotizar`
2. **Sistema guarda automáticamente**:
   - Lead en Supabase (estado: "nuevo")
   - Email de cotización enviado
   - Datos en localStorage
3. **Administrador revisa leads** en `/admin/leads`

## 🔐 Acceso al Dashboard

### URL del Dashboard
```
https://tu-dominio.com/admin/leads
```

### Características del Dashboard

#### 📊 Estadísticas
- Total de leads
- Leads nuevos
- Leads contactados
- Leads calificados

#### 🔍 Filtros
- Todos
- Nuevos
- Contactados
- Calificados
- Cerrados
- Perdidos

#### 📋 Tabla de Leads
Muestra:
- Fecha de creación
- Datos del cliente (nombre, ubicación)
- Información de contacto (email, teléfono)
- Detalles del vehículo
- Precio estimado
- Estado actual
- Acciones rápidas (WhatsApp, Email)

## 🚀 Uso del Sistema

### Para Capturar Leads

Los leads se guardan automáticamente cuando el usuario:
1. Completa el formulario de cotización
2. Click en "Completar cotización"
3. El sistema guarda en Supabase antes de enviar el email

### Para Gestionar Leads

1. Accede a `/admin/leads`
2. Filtra por estado
3. Click en "WhatsApp" para contactar directamente
4. Click en "Email" para enviar correo

## 📊 Estados de Leads

| Estado | Descripción |
|--------|-------------|
| **nuevo** | Lead recién creado, sin contactar |
| **contactado** | Se hizo primer contacto |
| **calificado** | Lead con interés confirmado |
| **cerrado** | Venta concretada |
| **perdido** | Lead no interesado |

## 🔧 API Endpoints

### POST /api/leads
Crea un nuevo lead

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+54 9 11 1234-5678",
  "ubicacion": "Buenos Aires",
  "marca": "Toyota",
  "modelo": "Corolla",
  "grupo": "Sedán",
  "año": "2020",
  "kilometraje": "50000",
  "precio": "15000"
}
```

### GET /api/leads
Obtiene todos los leads

**Query params:**
- `estado`: Filtrar por estado (opcional)

**Ejemplo:**
```
GET /api/leads?estado=nuevo
```

## 🛡️ Seguridad

### Row Level Security (RLS)

- ✅ **INSERT público**: Cualquiera puede crear leads (formulario público)
- ✅ **SELECT autenticado**: Solo usuarios autenticados pueden ver leads
- ✅ **UPDATE autenticado**: Solo usuarios autenticados pueden actualizar

### Recomendaciones

1. Protege la ruta `/admin/leads` con autenticación
2. Usa `SUPABASE_SERVICE_KEY` para operaciones sensibles
3. Implementa middleware de Next.js para proteger rutas admin

## 📱 Integración con WhatsApp

El dashboard incluye enlaces directos a WhatsApp:
```
https://wa.me/5491112345678
```

El número se limpia automáticamente (solo dígitos).

## 🎨 Personalización

### Cambiar Estados Disponibles

Edita en `app/admin/leads/page.tsx`:
```typescript
const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    nuevo: "bg-blue-100 text-blue-800",
    // Agrega más estados aquí
  };
  return colors[estado] || "bg-gray-100 text-gray-800";
};
```

### Agregar Campos Personalizados

1. Actualiza la tabla en Supabase:
```sql
ALTER TABLE leads ADD COLUMN nuevo_campo VARCHAR(255);
```

2. Actualiza el formulario para capturar el campo
3. Actualiza el dashboard para mostrarlo

## 🐛 Troubleshooting

### Los leads no se guardan
- Verifica las variables de entorno
- Revisa la consola del navegador
- Confirma que la tabla existe en Supabase

### Error de permisos en Supabase
- Verifica las políticas de RLS
- Asegúrate de usar la clave correcta (anon_key o service_key)

### El dashboard no carga leads
- Verifica la conexión a Supabase
- Revisa los logs del servidor
- Confirma que hay leads en la base de datos

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs de Supabase
2. Verifica la consola del navegador
3. Revisa los logs del servidor Next.js
