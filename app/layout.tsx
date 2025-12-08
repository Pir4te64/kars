import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import Script from 'next/script'
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
        {/* Meta Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1838656650108518');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1838656650108518&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {children}
        <Toaster />
        <WhatsAppButton />
        <FacebookDomainVerification />
      </body>
    </html>
  )
}
