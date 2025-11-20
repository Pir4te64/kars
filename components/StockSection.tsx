'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { VehiclePost } from '@/types'

interface StockSectionProps {
  initialCars: VehiclePost[]
}

export default function StockSection({ initialCars }: StockSectionProps) {
  const [limit, setLimit] = useState(8)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setVisibleCards((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.1 }
    )

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [limit])

  if (!initialCars || initialCars.length === 0) {
    return (
      <section id="autos-disponibles" className="pt-8 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10 text-slate-600">No hay vehículos disponibles.</div>
        </div>
      </section>
    )
  }

  return (
    <section id="autos-disponibles" className="pt-8 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-2">
            <span className="text-slate-900">Stock</span>{' '}
            <span className="text-blue-600">disponible</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base">
            Encuentra el auto perfecto para ti
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 tablet:grid-cols-3 tablet-lg:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 tablet:gap-5 tablet-lg:gap-6 lg:gap-6">
          {initialCars.slice(0, limit).map((post, index) => (
            <div
              key={post.id}
              ref={(el) => { cardsRef.current[index] = el }}
              data-index={index}
              className={`bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl p-3 sm:p-4 md:p-4 tablet:p-5 tablet-lg:p-5 group hover:scale-105 hover:border-slate-300 transition-all duration-500 ${
                visibleCards.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${(index % 4) * 100}ms` }}
            >
              <div className="relative mb-2 sm:mb-3 md:mb-4">
                <div className="w-full h-32 sm:h-40 md:h-44 tablet:h-48 tablet-lg:h-48 bg-white rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                  {post.images_urls && post.images_urls[0] ? (
                    <Image
                      src={post.images_urls[0]}
                      alt={post.titulo}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  )}
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-slate-900 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                  {post.anio}
                </div>
              </div>
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                <h3 className="text-sm sm:text-base md:text-base tablet:text-lg tablet-lg:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3rem] tablet:min-h-[3.5rem] tablet-lg:min-h-[3.5rem]">
                  {post.titulo}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-xl md:text-xl tablet:text-2xl tablet-lg:text-2xl font-black text-slate-900">
                    {post.moneda || 'USD'} {post.precio}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600 pt-2 border-t border-slate-200 gap-1">
                  <span className="font-medium truncate">{post.kilometraje}</span>
                  <span className="font-medium truncate">{post.combustible}</span>
                  <span className="font-medium truncate">{post.transmision}</span>
                </div>
                <Link
                  href={`/autos/${post.id}`}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md"
                >
                  <span>Ver unidad</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {initialCars.length > limit && (
          <div className="text-center mt-16">
            <button
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => setLimit(limit + 8)}
            >
              Ver más autos
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
