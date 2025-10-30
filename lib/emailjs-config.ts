/**
 * Configuración de EmailJS para envío de cotizaciones
 */

export const EMAILJS_CONFIG = {
  publicKey: 'JdcjOKPdOZL91kKwU',
  privateKey: 'RGdWr228Mp-0TuEpuTeuK',
  serviceId: 'default_service', // Puedes cambiar esto si tienes un service ID específico
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
