import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Ana Martínez",
      image: "https://via.placeholder.com/80x80/3b82f6/ffffff?text=AM",
      content:
        "El seguimiento en tiempo real me da mucha tranquilidad. Muy recomendado.",
      rating: 5,
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      image: "https://via.placeholder.com/80x80/059669/ffffff?text=CR",
      content:
        "Excelente experiencia de compra. El equipo fue muy profesional y me guiaron en cada paso.",
      rating: 5,
    },
    {
      id: 3,
      name: "María González",
      image: "https://via.placeholder.com/80x80/dc2626/ffffff?text=MG",
      content:
        "AutoVenta me ayudó a encontrar exactamente lo que buscaba. El proceso fue transparente y rápido.",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    return [...Array(rating)].map((_, i) => (
      <svg
        key={i}
        className="w-5 h-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="px-4 mx-auto mb-12 max-w-7xl sm:px-6 lg:px-8"></div>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="text-gray-900">Testimonios</span>{" "}
            <span className="text-primary-600">/ Confianza</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 transition-all duration-200 bg-white rounded-2xl group hover:scale-105">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 mr-4 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <blockquote className="leading-relaxed text-gray-900">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
