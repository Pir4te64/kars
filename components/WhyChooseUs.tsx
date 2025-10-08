interface Stat {
  number: string;
  description: string;
}

export default function WhyChooseUs() {
  const stats: Stat[] = [
    {
      number: "+10 años",
      description: "AÑOS EN EL MERCADO"
    },
    {
      number: "+600 AUTOS",
      description: "ENCONTRARON NUEVO DUEÑO"
    },
    {
      number: "+54 MODELOS",
      description: "DE AUTOS EN STOCK"
    }
  ];

  return (
    <section id="por-que-elegirnos" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center relative">
          {/* Container without border */}
          <div className="p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              <span className="text-white">
                ¿Porqué
              </span>{' '}
              <span className="text-blue-400">
                elegirnos?
              </span>
            </h2>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {stats.map((stat, index) => (
                <div key={index} className="text-center relative">
                  <div className="text-4xl md:text-5xl font-bold mb-3" style={{
                    WebkitTextStroke: '1px white',
                    color: 'transparent'
                  }}>
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-blue-400 font-medium">
                    {stat.description}
                  </div>

                  {/* Vertical divider line - only show between columns on medium+ screens */}
                  {index < stats.length - 1 && (
                    <div className="hidden md:block absolute top-0 right-0 w-px h-32 bg-white opacity-30 transform translate-x-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
