import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import WhatsAppButton from "@/components/WhatsAppButton"
import FacebookDomainVerification from "@/components/FacebookDomainVerification"

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'KARS - Compra y Vende Autos Usados',
  description: ' Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura. Proceso 100% en línea, financiamiento disponible.',
  keywords: ['autos usados', 'compra venta autos', 'autos certificados', 'financiamiento autos'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo_kars_blanco.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/logo_kars_blanco.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'YsoKZhVyTAsy15w8AmYhU4x6YOEyzZU3Qbovm-Eeec',
    other: {
      'facebook-domain-verification': '2prisasaheadexeps5804x28with1',
    },
  },
  openGraph: {
    title: 'KARS - Compra y Vende Autos Usados',
    description: 'Encuentra el auto de tus sueños o vende tu auto usado de manera rápida y segura.',
    type: 'website',
    locale: 'es_MX',
  },
}


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
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
        <WhatsAppButton />
        <FacebookDomainVerification />
      </body>
    </html>
  )
}
