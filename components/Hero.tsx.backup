'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [carVisible, setCarVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCarVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative z-10 w-full pt-24 pb-24 bg-neutral-200 md:pt-32">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-2">
          {/* Left: Texto */}
          <div className="flex flex-col justify-center">
            <h1 className="font-bold tracking-tight text-left text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              <span className="block text-black">Dale un giro a tu</span>
              <span className="block text-blue-500">camino</span>
            </h1>

            <p className="mt-4 max-w-md text-left text-sm sm:text-base md:text-lg text-black">
              Entrega tu carro usado y súbete hoy mismo al auto que siempre soñaste.
            </p>

            {/* CTA solo en móvil */}
            <div className="mt-6 md:hidden">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="w-full rounded-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2664C4]"
              >
                Comenzar mi nuevo viaje
              </button>
            </div>
          </div>

          {/* Right: Auto + Burbujas */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-3xl md:max-w-4xl aspect-[16/10] md:aspect-[16/9]">
              {/* Burbuja superior izquierda */}
              <div className="absolute z-20 flex items-center gap-3 px-3 py-2 shadow left-2 top-2 rounded-xl bg-sky-100/100 md:left-3 md:top-4 md:px-4 md:py-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <Image
                    src="/planes_de_pago_a_tu_medida.png"
                    alt="Planes de pago"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <p className="whitespace-nowrap text-xs sm:text-sm md:text-base font-semibold leading-5">
                  <span className="text-black">PLANES DE </span>
                  <span className="text-green-600">PAGO A TU MEDIDA</span>
                </p>
              </div>

              {/* Imagen del auto */}
              <Image
                src="/hero_image_kars.png"
                alt="Volkswagen Polo Track"
                width={1200}
                height={800}
                className={[
                  'absolute inset-0 h-full w-full object-contain transition-all duration-700 ease-out',
                  carVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0',
                ].join(' ')}
                priority
              />

              {/* Burbuja inferior derecha (solo ≥ md) */}
              <div className="absolute z-20 items-center hidden gap-3 px-4 py-3 shadow bottom-3 right-2 rounded-xl bg-sky-100/80 md:flex">
                <div className="flex items-center justify-center w-10 h-10 rounded-full">
                  <Image
                    src="/volante_tu_usado_vale_mas.png"
                    alt="Volante"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <p className="whitespace-nowrap text-base font-semibold leading-5">
                  <span className="text-[#2664C4]">TU USADO VALE MÁS </span>
                  <span className="text-black">de lo que imaginas</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cotización (móvil) */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 md:hidden">
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Kilometraje
                  </label>
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
