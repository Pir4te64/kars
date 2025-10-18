import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span style={{ color: "rgb(38, 100, 196)" }}>Nosotros</span>{" "}
            <span style={{ color: "#000" }}>/ Nuestra Historia</span>
          </h2>
         
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-12 mb-16 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Story */}
          <div>
            <h3
              className="mb-6 text-2xl font-bold"
              style={{ color: "rgb(38, 100, 196)" }}>
              Nuestra Misión
            </h3>
            <div className="space-y-4 leading-relaxed text-gray-700">
              <p>
              Con más de 20 años en el mercado, somos una empresa 100% argentina, con un equipo local que te atiende directamente, sin intermediarios ni call centers en el exterior. Sabemos lo que tu auto representa y queremos ayudarte a obtener lo mejor por él.

              </p>
              <p>
              Nuestra forma de trabajar nos permite estar cerca de vos, entender lo que buscás y ofrecerte una cotización justa que realmente valore tu auto. Trabajamos con flexibilidad y atención para darte la mejor propuesta, sin intermediarios ni complicaciones.

              </p>
              <p>
              En KARS valoramos tanto a las personas como a los autos. Por eso te acompañamos con transparencia y calidez en cada paso, para que tu experiencia sea cómoda, segura y confiable.

Cada vehículo tiene su historia, y cada cliente, nuestro compromiso.

Eleginos por nuestra atención, quedate por nuestra propuesta.

              </p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="overflow-hidden shadow-xl rounded-2xl">
              <Image
                src="/about.png"
                alt="Showroom de la concesionaria"
                width={600}
                height={384}
                className="object-cover w-full h-96"
              />
            </div>
            <div
              className="absolute p-6 shadow-lg -bottom-6 -right-6 rounded-2xl"
              style={{ backgroundColor: "rgb(38, 100, 196)" }}>
              <p className="text-lg font-bold text-white">Showroom Moderno</p>
              <p className="text-blue-100">Más de 200 vehículos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
