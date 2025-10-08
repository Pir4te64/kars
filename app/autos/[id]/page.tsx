import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getVehiclePostById, getVehiclePosts } from '@/lib/vehicles'
import CarDetailClient from '@/components/CarDetailClient'
import Navbar from '@/components/Navbar'

interface PageProps {
  params: {
    id: string
  }
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const carData = await getVehiclePostById(params.id)

  if (!carData) {
    return {
      title: 'Auto no encontrado',
      description: 'El auto que buscas no está disponible.',
    }
  }

  const title = `${carData.titulo} | KARS`
  const description = `${carData.marca} ${carData.modelo} ${carData.anio} - ${carData.kilometraje} km - ${carData.precio}. ${carData.descripcion || 'Vehículo en excelente estado.'}`
  const image = carData.images_urls?.[0] || '/hero_image.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: carData.titulo,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  // Fetch car data and featured cars in parallel
  const [carData, allCars] = await Promise.all([
    getVehiclePostById(params.id),
    getVehiclePosts(1000),
  ])

  // Handle 404 if car not found
  if (!carData) {
    notFound()
  }

  // Filter featured cars
  const featuredCars = allCars.filter((car) => car.destacado === true)

  return (
    <>
      <Navbar />
      <CarDetailClient carData={carData} featuredCars={featuredCars} />
    </>
  )
}
