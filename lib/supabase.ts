import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// TODO: Add your Supabase credentials in .env.local:
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase types for vehicles table
export interface SupabaseVehicle {
  id: string
  created_at: string
  titulo: string
  marca: string
  modelo: string
  anio: number
  precio: string
  kilometraje: string
  combustible: string
  transmision: string
  images_urls: string[]
  descripcion?: string
  ubicacion?: string
  estado?: string
}

// Helper function to fetch vehicles from Supabase
export async function getVehiclesFromSupabase(limit = 1000): Promise<SupabaseVehicle[]> {
  const { data, error } = await supabase
    .from('vehicle_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching vehicles from Supabase:', error)
    throw error
  }

  return data || []
}

// Helper function to get a single vehicle by ID
export async function getVehicleById(id: string): Promise<SupabaseVehicle | null> {
  const { data, error } = await supabase
    .from('vehicle_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching vehicle by ID:', error)
    return null
  }

  return data
}
