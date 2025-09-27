export interface MarcaType {
  id: number;
  list_price: boolean;
  logo_url: null | string;
  name: string;
  prices: boolean;
  prices_from: number;
  prices_to: number;
  summary: string;
}

export interface listVehiclePostsFetchResponse {
  data: Datum[];
  success: boolean;
}

export interface Datum {
  anio: string;
  asientos: string;
  destacado: boolean;
  carroceria: string;
  cilindrada: string;
  ciudad: string;
  color_exterior: string;
  color_interior: string;
  combustible: string;
  concesionaria_nombre: string;
  condicion: string;
  created_at: Date;
  created_by: null;
  cuota_mensual: string;
  descripcion: string;
  disponible: string;
  enganche: string;
  estado: string;
  estado_provincia: string;
  id: string;
  images_urls: string[];
  kilometraje: string;
  marca: string;
  modelo: string;
  moneda: string;
  pais: string;
  potencia_hp: string;
  precio: string;
  precio_negociable: string;
  puertas: string;
  slug: string;
  titulo: string;
  traccion: string;
  transmision: string;
  updated_at: Date;
  vendedor_calificacion: string;
  vendedor_nombre: string;
  version: string;
}
