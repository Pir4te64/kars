'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { VehiclePost } from '@/types'

interface StockSectionProps {
  initialCars: VehiclePost[]
}

export default function StockSection({ initialCars }: StockSectionProps) {
  const router = useRouter()
  const [limit, setLimit] = useState(8)

  if (!initialCars || initialCars.length === 0) {
    return (
      <section id="vehiculos-en-venta" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10">No hay vehículos disponibles.</div>
        </div>
      </section>
    )
  }

  return (
    <section id="vehiculos-en-venta" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Stock</span>{' '}
            <span className="text-primary-600">disponible</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {initialCars.slice(0, limit).map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 group hover:scale-105 transition-all duration-200"
            >
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {post.images_urls && post.images_urls[0] ? (
                    <Image
                      src={post.images_urls[0]}
                      alt={post.titulo}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {post.anio}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                  {post.titulo}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{post.precio}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{post.kilometraje}</span>
                  <span>{post.combustible}</span>
                  <span>{post.transmision}</span>
                </div>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    router.push(`/autos/${post.id}`)
                  }}
                  className="w-full bg-transparent text-primary-600 hover:bg-primary-50 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-start gap-2"
                >
                  Ver unidad
                </button>
              </div>
            </div>
          ))}
        </div>

        {initialCars.length > limit && (
          <div className="text-center mt-12">
            <button
              className="bg-white text-gray-900 font-semibold py-2 px-6 sm:py-3 sm:px-8 text-sm sm:text-base rounded-full border border-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              onClick={() => setLimit(limit + 8)}
            >
              Ver más
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
