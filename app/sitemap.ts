import { MetadataRoute } from 'next'
import { getVehiclePosts } from '@/lib/vehicles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/vende-tu-auto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cotizar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic vehicle routes
  let vehicleRoutes: MetadataRoute.Sitemap = []

  try {
    const vehicles = await getVehiclePosts(1000)
    vehicleRoutes = vehicles.map((vehicle) => ({
      url: `${baseUrl}/autos/${vehicle.id}`,
      lastModified: new Date(vehicle.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error generating sitemap for vehicles:', error)
  }

  return [...staticRoutes, ...vehicleRoutes]
}
