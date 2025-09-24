const AboutSection = () => {
  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span style={{ color: "rgb(38, 100, 196)" }}>Nosotros</span>{" "}
            <span style={{ color: "#000" }}>/ Nuestra Historia</span>
          </h2>
          <p
            className="max-w-3xl mx-auto text-lg leading-relaxed"
            style={{ color: "#000" }}>
            Somos una concesionaria líder en el mercado automotriz con más de 15
            años de experiencia. Nos especializamos en ofrecer vehículos de la
            más alta calidad, brindando un servicio excepcional y construyendo
            relaciones duraderas con nuestros clientes.
          </p>
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis.
              </p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="overflow-hidden shadow-xl rounded-2xl">
              <img
                src="/about.jpg"
                alt="Showroom de la concesionaria"
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
};

export default AboutSection;
