'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">Error</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Algo salió mal
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </p>
          <button
            onClick={reset}
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}
