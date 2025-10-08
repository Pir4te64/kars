import type { VehiclePost } from '@/types'
import { getVehiclesFromSupabase, getVehicleById } from './supabase'

export async function getVehiclePosts(limit = 1000): Promise<VehiclePost[]> {
  try {
    const vehicles = await getVehiclesFromSupabase(limit)

    // Mapear de SupabaseVehicle a VehiclePost
    return vehicles.map(vehicle => ({
      id: vehicle.id,
      titulo: vehicle.titulo,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      anio: vehicle.anio.toString(),
      precio: vehicle.precio,
      kilometraje: vehicle.kilometraje,
      combustible: vehicle.combustible,
      transmision: vehicle.transmision,
      images_urls: vehicle.images_urls,
      descripcion: vehicle.descripcion,
    }))
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
    return {
      id: vehicle.id,
      titulo: vehicle.titulo,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      anio: vehicle.anio.toString(),
      precio: vehicle.precio,
      kilometraje: vehicle.kilometraje,
      combustible: vehicle.combustible,
      transmision: vehicle.transmision,
      images_urls: vehicle.images_urls,
      descripcion: vehicle.descripcion,
    }
  } catch (error) {
    console.error('Error fetching vehicle post by id from Supabase:', error)
    throw error
  }
}
