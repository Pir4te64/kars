export interface MarcaType {
  id: number;
  list_price: boolean;
  logo_url: string | null;
  name: string;
  prices: boolean;
  prices_from: number;
  prices_to: number;
  summary: string;
}

// Re-export interfaces from car types
export type {
  Brand,
  Model,
  YearPrice,
  ModelFeature,
  UseCarInfoReturn,
} from "./car";

export interface ListVehiclePostsFetchResponse {
  data: VehiclePost[];
  success: boolean;
}

export interface VehiclePost {
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
  created_by: null | string;
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
  // Campos nuevos de MOTOR
  alimentacion?: string | null;
  cilindros?: string | null;
  valvulas?: string | null;
  // Campos nuevos de TRANSMISIÓN Y CHASIS
  velocidades?: string | null;
  neumaticos?: string | null;
  frenos_delanteros?: string | null;
  frenos_traseros?: string | null;
  direccion_asistida?: string | null;
  freno_mano?: string | null;
  // Campos nuevos de CONFORT
  aire_acondicionado?: string | null;
  asiento_delantero_ajuste_altura?: string | null;
  volante_regulable?: string | null;
  asientos_traseros?: string | null;
  tapizados?: string | null;
  cierre_puertas?: string | null;
  vidrios_delanteros?: string | null;
  vidrios_traseros?: string | null;
  espejos_exteriores?: string | null;
  espejo_interior_antideslumbrante?: string | null;
  faros_delanteros?: string | null;
  faros_antiniebla?: string | null;
  faros_tipo?: string | null;
  computadora_abordo?: string | null;
  control_velocidad_crucero?: string | null;
  limitador_velocidad?: string | null;
  llantas_aleacion?: string | null;
  techo_solar?: string | null;
  sensores_estacionamiento?: string | null;
  camara_estacionamiento?: string | null;
  asistencia_arranque_pendientes?: string | null;
  // Campos nuevos de SEGURIDAD
  abs?: string | null;
  distribucion_electronica_frenado?: string | null;
  asistencia_frenada_emergencia?: string | null;
  airbags_delanteros?: string | null;
  airbags_cortina?: string | null;
  airbag_rodilla_conductor?: string | null;
  airbags_laterales?: string | null;
  cantidad_airbags?: string | null;
  alarma?: string | null;
  inmovilizador_motor?: string | null;
  anclaje_asientos_infantiles?: string | null;
  sensor_lluvia?: string | null;
  sensor_luz?: string | null;
  autobloqueo_puertas_velocidad?: string | null;
  control_estabilidad?: string | null;
  control_traccion?: string | null;
  control_descenso?: string | null;
  sensor_presion_neumaticos?: string | null;
  // Campos nuevos de COMUNICACIÓN Y ENTRETENIMIENTO
  equipo_musica?: string | null;
  comandos_volante?: string | null;
  conexion_auxiliar?: string | null;
  conexion_usb?: string | null;
  bluetooth?: string | null;
  control_voz?: string | null;
  pantalla?: string | null;
  navegacion_gps?: string | null;
  apple_carplay?: string | null;
  android_auto?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name?: string;
  };
}
