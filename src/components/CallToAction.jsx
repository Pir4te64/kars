import React from 'react'

const CallToAction = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Buscar Auto */}
          <div className="relative group overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-700/90 z-10"></div>
            <img
              src="https://via.placeholder.com/600x400/1e40af/ffffff?text=Buscar+Auto"
              alt="Buscar auto"
              className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white p-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Estás buscando un auto?
              </h3>
              <p className="text-lg mb-8 opacity-90 max-w-md">
                Explora nuestro catálogo de vehículos verificados y encuentra el auto perfecto para ti.
              </p>
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg">
                Explorar catálogo
              </button>
            </div>
          </div>

          {/* Vender Auto */}
          <div className="relative group overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-700/90 z-10"></div>
            <img
              src="https://via.placeholder.com/600x400/059669/ffffff?text=Vender+Auto"
              alt="Vender auto"
              className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white p-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Quieres vender un auto?
              </h3>
              <p className="text-lg mb-8 opacity-90 max-w-md">
                Obtén la mejor oferta por tu vehículo. Proceso rápido, seguro y transparente.
              </p>
              <button className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg">
                Vender mi auto
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
