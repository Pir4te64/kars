import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CarQuoteSection from '@/components/CarQuoteSection'
import Benefits from '@/components/Benefits'
import StockSection from '@/components/StockSection'
import WhyChooseUs from '@/components/WhyChooseUs'
import Testimonials from '@/components/Testimonials'
import CallToAction from '@/components/CallToAction'
import AboutSection from '@/components/AboutSection'
import Footer from '@/components/Footer'
import { getVehiclePosts } from '@/lib/vehicles'
import type { VehiclePost } from '@/types'

export const metadata: Metadata = {
  title: 'KARS - Compra y Vende Autos Usados | Encuentra Tu Auto Ideal',
  description:
    'Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura. Proceso 100% en línea, autos certificados, financiamiento disponible. Stock actualizado de vehículos.',
  keywords: [
    'autos usados',
    'compra venta autos',
    'autos certificados',
    'financiamiento autos',
    'vender auto usado',
    'comprar auto',
  ],
  openGraph: {
    title: 'KARS - Compra y Vende Autos Usados',
    description: 'Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura.',
    images: ['/hero_image_kars.png'],
  },
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function HomePage() {
  let cars: VehiclePost[] = []

  try {
    cars = await getVehiclePosts(1000)
  } catch (error) {
    console.error('Error loading vehicles:', error)
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CarQuoteSection />
        <Benefits />
        <StockSection initialCars={cars} />
        <WhyChooseUs />
        <Testimonials />
        <CallToAction />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
