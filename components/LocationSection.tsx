export default function LocationSection() {
  return (
    <section id="ubicacion" className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span style={{ color: "rgb(38, 100, 196)" }}>Dónde</span>{" "}
            <span style={{ color: "#000" }}>encontrarnos</span>
          </h2>
        </div>

        {/* Map Section */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="overflow-hidden shadow-xl rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.123456789!2d-58.456789!3d-34.567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM0JzA0LjQiUyA1OMKwMjcnMjQuNCJX!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar&q=Malaver+3733,+Florida+Oeste,+Vicente+López,+Argentina"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de KARS - Malaver 3733, Florida Oeste, Vicente López"
                className="w-full h-96"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
