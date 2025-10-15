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
    }
  } catch (error) {
    console.error('Error fetching vehicle post by id from Supabase:', error)
    throw error
  }
}
