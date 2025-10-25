'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import CarQuoteSection from './CarQuoteSection'

export default function Hero() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const scrollToCotizador = () => {
    const cotizadorElement = document.getElementById('vende-tu-auto')
    if (cotizadorElement) {
      cotizadorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative w-full flex items-start justify-center bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 overflow-hidden z-0 pt-0 pb-0">

      {/* Card principal única - estilo 1.jpg */}
      <div className={`
        relative w-full max-w-full
        bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100
        shadow-2xl overflow-visible
        transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}>

        {/* Grid de 2 columnas: Texto Izquierda - Auto Derecha */}
        <div className="grid lg:grid-cols-2 min-h-screen">

          {/* COLUMNA IZQUIERDA - Texto y CTAs */}
          <div className="relative z-10 flex flex-col justify-center items-center p-8 md:p-12 space-y-8 pt-32">

            {/* Título Principal */}
            <div className={`
              space-y-4 transition-all duration-700 delay-400 text-left max-w-lg w-full lg:w-auto lg:ml-auto lg:mr-12
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900">
                Dale un giro a<br />
                tu <span className="text-blue-600">camino</span>
              </h1>
            </div>

            {/* Descripción */}
            <p className={`
              text-base md:text-lg text-slate-700 leading-relaxed max-w-md text-left w-full lg:w-auto lg:ml-auto lg:mr-12
              transition-all duration-700 delay-600
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              Tu próxima historia arranca con nosotros.
            </p>

            {/* Botones CTA */}
            <div className={`
              flex flex-wrap gap-4 items-center justify-start w-full lg:w-auto lg:ml-auto lg:mr-12
              transition-all duration-700 delay-800
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              <button
                onClick={() => {
                  const autosSection = document.getElementById('autos-disponibles')
                  if (autosSection) {
                    autosSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Autos disponibles
              </button>
            </div>

            {/* Horario de atención */}
            <div className={`
              text-xs text-slate-600 pt-4
              transition-all duration-700 delay-1000
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
            </div>
          </div>

          {/* COLUMNA DERECHA - Auto */}
          <div className="relative flex items-center justify-start lg:pl-0 overflow-hidden pt-32 -mt-[30%]">

            {/* Imagen del auto */}
            <div className={`
              relative w-full h-full
              transition-all duration-1000 delay-300
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}
            `}>
              <Image
                src="/hero_image_kars.png"
                alt="Vehículo Kars"
                fill
                className="object-contain object-left scale-75"
                priority
              />
            </div>

            {/* Overlay gradient para mezclar auto con fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-200/50 pointer-events-none"></div>
          </div>
        </div>

        {/* Cotizador integrado */}
        <div className="absolute bottom-8 left-0 right-0 px-4 z-30">
          <CarQuoteSection />
        </div>
      </div>

      {/* Modal de cotización - SIN MODIFICAR */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md overflow-y-auto bg-white rounded-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Cotizamos tu auto en poco tiempo
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <p className="mb-6 text-center text-gray-600">
                Te acompañamos en cada paso de tu viaje
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Marca</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Modelo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Año</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Kilometraje</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione</option>
                    <option value="0 - 10,000">0 - 10,000 km</option>
                    <option value="10,001 - 30,000">10,001 - 30,000 km</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowQuoteModal(false)
                    window.location.href = '/vende-tu-auto'
                  }}
                  className="w-full rounded-lg bg-[#2664C4] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Comenzar cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
