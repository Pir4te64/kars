import type { VehiclePost, ListVehiclePostsFetchResponse } from '@/types'

const API_BASE_URL = 'https://kars-backend-y4w9.vercel.app/api'

export async function getVehiclePosts(limit = 1000): Promise<VehiclePost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vehicle-posts?limit=${limit}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data: ListVehiclePostsFetchResponse = await res.json()
    return data.data
  } catch (error) {
    console.error('Error fetching vehicle posts:', error)
    throw error
  }
}

export async function getVehiclePostById(id: string): Promise<VehiclePost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/vehicle-posts/${id}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    return data.data || null
  } catch (error) {
    console.error('Error fetching vehicle post by id:', error)
    throw error
  }
}
