'use client'

import { useEffect, useState } from 'react'
import CarQuoteSection from './CarQuoteSection'

export default function HeroV2() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    // Mobile-only hero (no car image), preserves title + cotizador
    <section className="relative md:hidden w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-200 to-white flex items-start justify-center overflow-hidden z-0">
      <div className="container px-4 mx-auto max-w-7xl w-full pt-20 pb-8">
        {/* Header content */}
        <div className="w-full max-w-xl mx-auto space-y-4 text-center">
          <h1
            className={`text-3xl sm:text-4xl font-black leading-[1.15] text-slate-900 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Dale un giro a tu <span className="text-blue-600">camino</span>
          </h1>

          <p
            className={`text-sm sm:text-base text-slate-700 leading-relaxed transition-all duration-700 delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Tu próxima historia arranca con nosotros.
          </p>
        </div>

        {/* Cotizador dentro del flujo (no absolute) */}
        <div
          className={`mt-6 sm:mt-8 transition-opacity duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <CarQuoteSection />
        </div>
      </div>
    </section>
  )
}