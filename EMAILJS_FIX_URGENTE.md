# 🚨 URGENTE: Configurar Service ID de EmailJS

## ❌ Error Actual:
```
The service ID not found. To find this ID, visit https://dashboard.emailjs.com/admin
```

## ✅ Solución (5 pasos):

### Paso 1: Ir al Dashboard
Ve a: **https://dashboard.emailjs.com/admin**

### Paso 2: Login
Inicia sesión con tu cuenta de EmailJS

### Paso 3: Ir a Email Services
En el menú lateral izquierdo, haz click en **"Email Services"**

### Paso 4: Copiar tu Service ID
Verás algo como esto:

```
Gmail / service_abc123
```

El Service ID es la parte que dice **"service_abc123"** (puede tener otros caracteres)

**IMPORTANTE**: Copia TODO el Service ID, incluyendo el prefijo "service_"

### Paso 5: Actualizar el archivo de configuración

Abre el archivo:
```
C:\Users\Vic\Documents\kars\lib\emailjs-config.ts
```

Busca esta línea (línea 22):
```typescript
serviceId: 'YOUR_SERVICE_ID_HERE', // ⚠️ REEMPLAZAR CON TU SERVICE ID REAL
```

Reemplázala con tu Service ID real. Por ejemplo, si tu Service ID es `service_xyz789`:
```typescript
serviceId: 'service_xyz789',
```

## 📝 Ejemplo Completo:

**ANTES** (no funciona):
```typescript
export const EMAILJS_CONFIG = {
  publicKey: 'JdcjOKPdOZL91kKwU',
  privateKey: 'RGdWr228Mp-0TuEpuTeuK',
  serviceId: 'YOUR_SERVICE_ID_HERE', // ❌ INCORRECTO
  templateId: 'template_561slea',
} as const;
```

**DESPUÉS** (funciona):
```typescript
export const EMAILJS_CONFIG = {
  publicKey: 'JdcjOKPdOZL91kKwU',
  privateKey: 'RGdWr228Mp-0TuEpuTeuK',
  serviceId: 'service_xyz789', // ✅ CORRECTO (usa tu propio Service ID)
  templateId: 'template_561slea',
} as const;
```

## 🔍 ¿Dónde encuentro cada cosa?

| Dato | Dónde está | Cómo se ve |
|------|-----------|------------|
| **Public Key** | Account > API Keys | `JdcjOKPdOZL91kKwU` |
| **Service ID** | Email Services | `service_abc123` |
| **Template ID** | Email Templates | `template_561slea` |

## ✅ Verificación

Después de actualizar el Service ID:

1. Guarda el archivo `emailjs-config.ts`
2. Recarga la página de cotizaciones en el navegador
3. Intenta enviar una cotización nuevamente
4. Deberías ver "✓ Cotización enviada exitosamente"

## 🆘 Si aún no funciona:

Verifica que:
- [ ] El Service ID comienza con "service_"
- [ ] Copiaste el Service ID completo sin espacios
- [ ] El servicio está activo en tu dashboard de EmailJS
- [ ] El template `template_561slea` existe en tu cuenta
- [ ] Guardaste el archivo después de editarlo
- [ ] Recargaste completamente la página (Ctrl + Shift + R)

## 📧 Checklist de EmailJS:

- [ ] Service ID configurado ✅
- [ ] Template creado con ID: `template_561slea`
- [ ] Template tiene todas las variables necesarias
- [ ] Servicio de email está activo
- [ ] Public Key es correcta

---

**Tiempo estimado**: 5 minutos
**Dificultad**: Fácil 🟢
