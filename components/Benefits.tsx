import Image from 'next/image';

interface Benefit {
  icon: {
    src: string;
    alt: string;
  };
  title: string;
  description: string;
}

export default function Benefits() {
  const benefits: Benefit[] = [
    {
      icon: {
        src: "/pago_rapido_y_seguro.jpg",
        alt: "Pago rápido y seguro"
      },
      title: "Pago rápido y seguro",
      description: "Recibe tu dinero en menos de 24 horas con total seguridad"
    },
    {
      icon: {
        src: "/autos_certificados.png",
        alt: "Autos certificados"
      },
      title: "Autos certificados",
      description: "Todos nuestros vehículos pasan por rigurosas inspecciones"
    },
    {
      icon: {
        src: "/proceso_100_en_linea.png",
        alt: "Proceso 100% en línea"
      },
      title: "Proceso 100% asegurado",
      description: "Sin papeleos complicados, todo el asesoramiento para agilizar tus trámites"
    },
    {
      icon: {
        src: "/confianza_y_respaldo.png",
        alt: "Confianza y respaldo"
      },
      title: "Confianza y respaldo",
      description: "Garantía completa en cada transacción que realizas"
    }
  ];

  return (
    <section id="beneficios" className="py-10 md:py-20 bg-white mt-32 md:mt-0 relative z-30">
      <div className="max-w-sm md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="text-gray-900">Beneficios</span>{' '}
            <span className="text-primary-600">principales</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-4xl">
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 tablet:grid-cols-2 tablet-lg:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 tablet:gap-7 tablet-lg:gap-8 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 md:p-5 tablet:p-6 tablet-lg:p-6 text-center group hover:scale-105 transition-transform duration-200 border border-gray-100">
              <div className="flex justify-center mb-4 md:mb-5 tablet:mb-6 tablet-lg:mb-6">
                <div className="p-3 md:p-3.5 tablet:p-4 tablet-lg:p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
                  <Image
                    src={benefit.icon.src}
                    alt={benefit.icon.alt}
                    width={48}
                    height={48}
                    className="w-12 h-12 md:w-11 md:h-11 tablet:w-12 tablet:h-12 tablet-lg:w-12 tablet-lg:h-12 object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg md:text-lg tablet:text-xl tablet-lg:text-xl font-semibold text-gray-900 mb-2 md:mb-2.5 tablet:mb-3 tablet-lg:mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm md:text-sm tablet:text-base tablet-lg:text-base text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
