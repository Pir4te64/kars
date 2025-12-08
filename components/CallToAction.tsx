import Image from 'next/image';

export default function CallToAction() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Buscar Auto */}
          <div className="relative group overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <Image
              src="/buscando_un_auto.jpg"
              alt="Buscar auto"
              width={700}
              height={320}
              className="w-full h-56 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 700px"
              priority={false}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start text-left text-white p-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Estás buscando un auto?
              </h3>
              <p className="text-lg mb-8 opacity-90 max-w-md">
                Explora nuestro catálogo de vehículos verificados y encuentra el auto perfecto para ti.
              </p>
              <button className="bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-full transition-colors duration-200 text-base flex items-center gap-2">
                Empezar 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Vender Auto */}
          <div className="relative group overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <Image
              src="/vender_un_auto.jpg"
              alt="Vender auto"
              width={700}
              height={320}
              className="w-full h-56 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 700px"
              priority={false}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start text-left text-white p-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Quieres vender un auto?
              </h3>
              <p className="text-lg mb-8 opacity-90 max-w-md">
                Obtén la mejor oferta por tu vehículo. Proceso rápido, seguro y transparente.
              </p>
              <button className="bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-full transition-colors duration-200 text-base flex items-center gap-2">
                Empezar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
