/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VehiclePost } from '@/types'
import { getVehiclesFromSupabase, getVehicleById } from './supabase'

export async function getVehiclePosts(limit = 1000): Promise<VehiclePost[]> {
  try {
    const vehicles = await getVehiclesFromSupabase(limit)

    // Mapear de SupabaseVehicle a VehiclePost
    return vehicles.map(vehicle => {
      const v = vehicle as any // Type assertion to access all properties safely
      return {
        id: v.id || '',
        titulo: v.titulo || '',
        marca: v.marca || '',
        modelo: v.modelo || '',
        anio: v.anio?.toString() || '',
        precio: v.precio || '',
        kilometraje: v.kilometraje || '',
        combustible: v.combustible || '',
        transmision: v.transmision || '',
        images_urls: v.images_urls || [],
        descripcion: v.descripcion || '',
        // Required fields with defaults
        asientos: v.asientos || '',
        destacado: v.destacado || false,
        carroceria: v.carroceria || '',
        cilindrada: v.cilindrada || '',
        ciudad: v.ciudad || '',
        color_exterior: v.color_exterior || '',
        color_interior: v.color_interior || '',
        concesionaria_nombre: v.concesionaria_nombre || '',
        condicion: v.condicion || '',
        created_at: v.created_at ? new Date(v.created_at) : new Date(),
        created_by: v.created_by || null,
        cuota_mensual: v.cuota_mensual || '',
        disponible: v.disponible || 'No',
        enganche: v.enganche || '',
        estado: v.estado || 'draft',
        estado_provincia: v.estado_provincia || '',
        moneda: v.moneda || 'USD',
        pais: v.pais || '',
        potencia_hp: v.potencia_hp || '',
        precio_negociable: v.precio_negociable || 'No',
        puertas: v.puertas || '',
        slug: v.slug || '',
      traccion: v.traccion || '',
      updated_at: v.updated_at ? new Date(v.updated_at) : new Date(),
      vendedor_calificacion: v.vendedor_calificacion || '',
      vendedor_nombre: v.vendedor_nombre || '',
      version: v.version || '',
      // Campos nuevos de MOTOR
      alimentacion: v.alimentacion || null,
      cilindros: v.cilindros || null,
      valvulas: v.valvulas || null,
      // Campos nuevos de TRANSMISIÓN Y CHASIS
      velocidades: v.velocidades || null,
      neumaticos: v.neumaticos || null,
      frenos_delanteros: v.frenos_delanteros || null,
      frenos_traseros: v.frenos_traseros || null,
      direccion_asistida: v.direccion_asistida || null,
      freno_mano: v.freno_mano || null,
      // Campos nuevos de CONFORT
      aire_acondicionado: v.aire_acondicionado || null,
      asiento_delantero_ajuste_altura: v.asiento_delantero_ajuste_altura || null,
      volante_regulable: v.volante_regulable || null,
      asientos_traseros: v.asientos_traseros || null,
      tapizados: v.tapizados || null,
      cierre_puertas: v.cierre_puertas || null,
      vidrios_delanteros: v.vidrios_delanteros || null,
      vidrios_traseros: v.vidrios_traseros || null,
      espejos_exteriores: v.espejos_exteriores || null,
      espejo_interior_antideslumbrante: v.espejo_interior_antideslumbrante || null,
      faros_delanteros: v.faros_delanteros || null,
      faros_antiniebla: v.faros_antiniebla || null,
      faros_tipo: v.faros_tipo || null,
      computadora_abordo: v.computadora_abordo || null,
      control_velocidad_crucero: v.control_velocidad_crucero || null,
      limitador_velocidad: v.limitador_velocidad || null,
      llantas_aleacion: v.llantas_aleacion || null,
      techo_solar: v.techo_solar || null,
      sensores_estacionamiento: v.sensores_estacionamiento || null,
      camara_estacionamiento: v.camara_estacionamiento || null,
      asistencia_arranque_pendientes: v.asistencia_arranque_pendientes || null,
      // Campos nuevos de SEGURIDAD
      abs: v.abs || null,
      distribucion_electronica_frenado: v.distribucion_electronica_frenado || null,
      asistencia_frenada_emergencia: v.asistencia_frenada_emergencia || null,
      airbags_delanteros: v.airbags_delanteros || null,
      airbags_cortina: v.airbags_cortina || null,
      airbag_rodilla_conductor: v.airbag_rodilla_conductor || null,
      airbags_laterales: v.airbags_laterales || null,
      cantidad_airbags: v.cantidad_airbags || null,
      alarma: v.alarma || null,
      inmovilizador_motor: v.inmovilizador_motor || null,
      anclaje_asientos_infantiles: v.anclaje_asientos_infantiles || null,
      sensor_lluvia: v.sensor_lluvia || null,
      sensor_luz: v.sensor_luz || null,
      autobloqueo_puertas_velocidad: v.autobloqueo_puertas_velocidad || null,
      control_estabilidad: v.control_estabilidad || null,
      control_traccion: v.control_traccion || null,
      control_descenso: v.control_descenso || null,
      sensor_presion_neumaticos: v.sensor_presion_neumaticos || null,
      // Campos nuevos de COMUNICACIÓN Y ENTRETENIMIENTO
      equipo_musica: v.equipo_musica || null,
      comandos_volante: v.comandos_volante || null,
      conexion_auxiliar: v.conexion_auxiliar || null,
      conexion_usb: v.conexion_usb || null,
      bluetooth: v.bluetooth || null,
      control_voz: v.control_voz || null,
      pantalla: v.pantalla || null,
      navegacion_gps: v.navegacion_gps || null,
      apple_carplay: v.apple_carplay || null,
      android_auto: v.android_auto || null,
      }
    })
  } catch (error) {
    console.error('Error fetching vehicle posts from Supabase:', error)
    throw error
  }
}

export async function getVehiclePostById(id: string): Promise<VehiclePost | null> {
  try {
    const vehicle = await getVehicleById(id)

    if (!vehicle) return null

    // Mapear de SupabaseVehicle a VehiclePost
    const v = vehicle as any // Type assertion to access all properties safely
    return {
      id: v.id || '',
      titulo: v.titulo || '',
      marca: v.marca || '',
      modelo: v.modelo || '',
      anio: v.anio?.toString() || '',
      precio: v.precio || '',
      kilometraje: v.kilometraje || '',
      combustible: v.combustible || '',
      transmision: v.transmision || '',
      images_urls: v.images_urls || [],
      descripcion: v.descripcion || '',
      // Required fields with defaults
      asientos: v.asientos || '',
      destacado: v.destacado || false,
      carroceria: v.carroceria || '',
      cilindrada: v.cilindrada || '',
      ciudad: v.ciudad || '',
      color_exterior: v.color_exterior || '',
      color_interior: v.color_interior || '',
      concesionaria_nombre: v.concesionaria_nombre || '',
      condicion: v.condicion || '',
      created_at: v.created_at ? new Date(v.created_at) : new Date(),
      created_by: v.created_by || null,
      cuota_mensual: v.cuota_mensual || '',
      disponible: v.disponible || 'No',
      enganche: v.enganche || '',
      estado: v.estado || 'draft',
      estado_provincia: v.estado_provincia || '',
      moneda: v.moneda || 'USD',
      pais: v.pais || '',
      potencia_hp: v.potencia_hp || '',
      precio_negociable: v.precio_negociable || 'No',
      puertas: v.puertas || '',
      slug: v.slug || '',
      traccion: v.traccion || '',
      updated_at: v.updated_at ? new Date(v.updated_at) : new Date(),
      vendedor_calificacion: v.vendedor_calificacion || '',
      vendedor_nombre: v.vendedor_nombre || '',
      version: v.version || '',
      // Campos nuevos de MOTOR
      alimentacion: v.alimentacion || null,
      cilindros: v.cilindros || null,
      valvulas: v.valvulas || null,
      // Campos nuevos de TRANSMISIÓN Y CHASIS
      velocidades: v.velocidades || null,
      neumaticos: v.neumaticos || null,
      frenos_delanteros: v.frenos_delanteros || null,
      frenos_traseros: v.frenos_traseros || null,
      direccion_asistida: v.direccion_asistida || null,
      freno_mano: v.freno_mano || null,
      // Campos nuevos de CONFORT
      aire_acondicionado: v.aire_acondicionado || null,
      asiento_delantero_ajuste_altura: v.asiento_delantero_ajuste_altura || null,
      volante_regulable: v.volante_regulable || null,
      asientos_traseros: v.asientos_traseros || null,
      tapizados: v.tapizados || null,
      cierre_puertas: v.cierre_puertas || null,
      vidrios_delanteros: v.vidrios_delanteros || null,
      vidrios_traseros: v.vidrios_traseros || null,
      espejos_exteriores: v.espejos_exteriores || null,
      espejo_interior_antideslumbrante: v.espejo_interior_antideslumbrante || null,
      faros_delanteros: v.faros_delanteros || null,
      faros_antiniebla: v.faros_antiniebla || null,
      faros_tipo: v.faros_tipo || null,
      computadora_abordo: v.computadora_abordo || null,
      control_velocidad_crucero: v.control_velocidad_crucero || null,
      limitador_velocidad: v.limitador_velocidad || null,
      llantas_aleacion: v.llantas_aleacion || null,
      techo_solar: v.techo_solar || null,
      sensores_estacionamiento: v.sensores_estacionamiento || null,
      camara_estacionamiento: v.camara_estacionamiento || null,
      asistencia_arranque_pendientes: v.asistencia_arranque_pendientes || null,
      // Campos nuevos de SEGURIDAD
      abs: v.abs || null,
      distribucion_electronica_frenado: v.distribucion_electronica_frenado || null,
      asistencia_frenada_emergencia: v.asistencia_frenada_emergencia || null,
      airbags_delanteros: v.airbags_delanteros || null,
      airbags_cortina: v.airbags_cortina || null,
      airbag_rodilla_conductor: v.airbag_rodilla_conductor || null,
      airbags_laterales: v.airbags_laterales || null,
      cantidad_airbags: v.cantidad_airbags || null,
      alarma: v.alarma || null,
      inmovilizador_motor: v.inmovilizador_motor || null,
      anclaje_asientos_infantiles: v.anclaje_asientos_infantiles || null,
      sensor_lluvia: v.sensor_lluvia || null,
      sensor_luz: v.sensor_luz || null,
      autobloqueo_puertas_velocidad: v.autobloqueo_puertas_velocidad || null,
      control_estabilidad: v.control_estabilidad || null,
      control_traccion: v.control_traccion || null,
      control_descenso: v.control_descenso || null,
      sensor_presion_neumaticos: v.sensor_presion_neumaticos || null,
      // Campos nuevos de COMUNICACIÓN Y ENTRETENIMIENTO
      equipo_musica: v.equipo_musica || null,
      comandos_volante: v.comandos_volante || null,
      conexion_auxiliar: v.conexion_auxiliar || null,
      conexion_usb: v.conexion_usb || null,
      bluetooth: v.bluetooth || null,
      control_voz: v.control_voz || null,
      pantalla: v.pantalla || null,
      navegacion_gps: v.navegacion_gps || null,
      apple_carplay: v.apple_carplay || null,
      android_auto: v.android_auto || null,
    }
  } catch (error) {
    console.error('Error fetching vehicle post by id from Supabase:', error)
    throw error
  }
}
