import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'KARS - Compra y Vende Autos Usados',
  description: 'Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura. Proceso 100% en línea, financiamiento disponible.',
  keywords: ['autos usados', 'compra venta autos', 'autos certificados', 'financiamiento autos'],
  openGraph: {
    title: 'KARS - Compra y Vende Autos Usados',
    description: 'Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura.',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
