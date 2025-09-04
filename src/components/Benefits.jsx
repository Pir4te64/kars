import React from 'react'

const Benefits = () => {
  const benefits = [
    {
      icon: (
        <img 
          src="/pago_rapido_y_seguro.jpg" 
          alt="Pago rápido y seguro"
          className="w-12 h-12 object-contain"
        />
      ),
      title: "Pago rápido y seguro",
      description: "Transacciones seguras y procesamiento inmediato de pagos"
    },
    {
      icon: (
        <img 
          src="/autos_certificados.png" 
          alt="Autos certificados"
          className="w-12 h-12 object-contain"
        />
      ),
      title: "Autos certificados",
      description: "Vehículos verificados y con garantía de calidad"
    },
    {
      icon: (
        <img 
          src="/proceso_100_en_linea.png" 
          alt="Proceso 100% en línea"
          className="w-12 h-12 object-contain"
        />
      ),
      title: "Proceso 100% en línea",
      description: "Compra tu auto desde cualquier lugar, sin salir de casa"
    },
    {
      icon: (
        <img 
          src="/confianza_y_respaldo.png" 
          alt="Confianza y respaldo"
          className="w-12 h-12 object-contain"
        />
      ),
      title: "Confianza y respaldo",
      description: "Soporte completo y garantía de satisfacción"
    }
  ]

  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Beneficios</span>{' '}
            <span className="text-primary-600">principales</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-blue-50 rounded-2xl shadow-lg p-6 text-center group hover:scale-105 transition-transform duration-200">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {benefit.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits
