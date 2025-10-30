# Configuración de EmailJS para Cotizaciones

Este proyecto utiliza EmailJS para enviar las cotizaciones de vehículos por email a los clientes.

## Credenciales Configuradas

- **Public Key**: `JdcjOKPdOZL91kKwU`
- **Private Key**: `RGdWr228Mp-0TuEpuTeuK`
- **Template ID**: `template_561slea`
- **Service ID**: `default_service`

## Variables del Template

El template de EmailJS debe incluir las siguientes variables para funcionar correctamente:

```
{{to_email}}              - Email del destinatario
{{from_name}}             - Nombre del remitente (KARS)
{{marca}}                 - Marca del vehículo
{{modelo}}                - Modelo del vehículo
{{grupo}}                 - Grupo del vehículo
{{año}}                   - Año del vehículo
{{precio_consignacion_usd}} - Precio consignación en USD
{{precio_consignacion_ars}} - Precio consignación en ARS
{{precio_permuta_usd}}      - Precio permuta en USD
{{precio_permuta_ars}}      - Precio permuta en ARS
{{precio_inmediata_usd}}    - Precio compra inmediata en USD
{{precio_inmediata_ars}}    - Precio compra inmediata en ARS
{{dolar_blue}}             - Cotización del dólar blue
```

## Ejemplo de Template HTML para EmailJS

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .option { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e2e8f0; }
        .price { font-size: 24px; font-weight: bold; color: #1e293b; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tu Cotización KARS</h1>
        </div>

        <div class="content">
            <h2>Detalles del Vehículo</h2>
            <p><strong>Marca:</strong> {{marca}}</p>
            <p><strong>Modelo:</strong> {{modelo}}</p>
            <p><strong>Grupo:</strong> {{grupo}}</p>
            <p><strong>Año:</strong> {{año}}</p>

            <h2>Opciones de Venta</h2>

            <div class="option">
                <h3>🔵 Consignación (Mejor Precio)</h3>
                <div class="price">{{precio_consignacion_usd}}</div>
                <p>{{precio_consignacion_ars}}</p>
                <p>Precio completo, pagas al vender</p>
            </div>

            <div class="option">
                <h3>⚫ Permuta (-5%)</h3>
                <div class="price">{{precio_permuta_usd}}</div>
                <p>{{precio_permuta_ars}}</p>
                <p>Cambia tu auto por otro</p>
            </div>

            <div class="option">
                <h3>🟢 Compra Inmediata (-10%)</h3>
                <div class="price">{{precio_inmediata_usd}}</div>
                <p>{{precio_inmediata_ars}}</p>
                <p>Dinero en el momento</p>
            </div>

            <p><small><strong>Cotización Dólar Blue:</strong> {{dolar_blue}}</small></p>
            <p><small>* Precios calculados con descuento del 17%</small></p>
        </div>

        <div class="footer">
            <p>Gracias por confiar en KARS</p>
            <p>Este es un presupuesto estimado. El precio final puede variar tras la inspección del vehículo.</p>
        </div>
    </div>
</body>
</html>
```

## Cómo Configurar el Template en EmailJS

1. Ve a tu dashboard de EmailJS: https://dashboard.emailjs.com/
2. Selecciona "Email Templates" en el menú lateral
3. Busca el template con ID: `template_561slea`
4. Edita el template y pega el HTML de arriba
5. Asegúrate de que todas las variables estén correctamente escritas con doble llaves `{{}}`
6. Guarda los cambios

## Notas Importantes

- El template debe estar activo en tu cuenta de EmailJS
- Verifica que el Service ID configurado coincida con el de tu cuenta
- Las credenciales están hardcodeadas en `lib/emailjs-config.ts`
- El envío de emails se maneja automáticamente cuando el usuario completa la cotización

## Archivos Relacionados

- `/lib/emailjs-config.ts` - Configuración de EmailJS
- `/hooks/useEmailJS.ts` - Hook personalizado para enviar emails
- `/app/cotizar/resultado/page.tsx` - Integración del formulario de envío

## Flujo de Funcionamiento

1. El usuario completa la cotización de su vehículo
2. El sistema calcula los 3 tipos de precios (consignación, permuta, inmediata)
3. Se convierte el precio de pesos a dólares usando el dólar blue
4. El usuario ingresa su email en el formulario
5. Al hacer click en "Enviar", se envía un email con todos los detalles
6. EmailJS procesa el template y envía el email formateado

## Testing

Para probar el envío de emails:

1. Completa una cotización en el sistema
2. En la página de resultados, ingresa tu email
3. Haz click en "Enviar"
4. Verifica que llegue el email con el formato correcto

## Troubleshooting

Si los emails no se envían:

1. Verifica que las credenciales en `lib/emailjs-config.ts` sean correctas
2. Revisa que el template ID exista en tu cuenta de EmailJS
3. Asegúrate de que el service esté activo
4. Verifica la consola del navegador para errores
5. Revisa los logs en el dashboard de EmailJS
