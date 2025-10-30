/**
 * Configuración de EmailJS para envío de cotizaciones
 *
 * ⚠️ ERROR ACTUAL: Service ID no encontrado
 *
 * PASOS PARA CORREGIR:
 * 1. Ve a: https://dashboard.emailjs.com/admin
 * 2. Haz login con tu cuenta
 * 3. En el menú lateral, selecciona "Email Services"
 * 4. Verás tu servicio de email con un ID como "service_abc123"
 * 5. Copia ese Service ID
 * 6. Reemplaza 'YOUR_SERVICE_ID_HERE' abajo con tu Service ID real
 *
 * Ejemplo:
 * Si tu Service ID es "service_xyz789", cambia:
 * serviceId: 'service_xyz789',
 */

export const EMAILJS_CONFIG = {
  publicKey: 'JdcjOKPdOZL91kKwU',
  privateKey: 'RGdWr228Mp-0TuEpuTeuK',
  serviceId: 'YOUR_SERVICE_ID_HERE', // ⚠️ REEMPLAZAR CON TU SERVICE ID REAL
  templateId: 'template_561slea',
} as const;

export interface EmailTemplateParams {
  to_email: string;
  from_name: string;
  marca: string;
  modelo: string;
  grupo: string;
  año: string;
  precio_consignacion_usd: string;
  precio_consignacion_ars: string;
  precio_permuta_usd: string;
  precio_permuta_ars: string;
  precio_inmediata_usd: string;
  precio_inmediata_ars: string;
  dolar_blue: string;
}
