'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface CarouselImage {
  id: number;
  src: string;
  alt: string;
}

interface Testimonial {
  id: number;
  name: string;
  image: string;
  content: string;
  rating: number;
}

export default function Testimonials() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Carrusel de imágenes - 20 imágenes reales de KARS
  const carouselImages: CarouselImage[] = [
    { id: 1, src: "/carrusel_kars1.jpg", alt: "Cliente con Renault Duster" },
    { id: 2, src: "/carrusel_kars2.jpg", alt: "Pareja con Chevrolet" },
    { id: 3, src: "/carrusel_kars3.jpg", alt: "Familia con Ford Focus" },
    { id: 4, src: "/carrusel_kars4.jpg", alt: "Pareja con auto" },
    { id: 5, src: "/carrusel_kars5.jpg", alt: "Cliente con Honda PCX" },
    { id: 6, src: "/carrusel_kars6.jpg", alt: "Pareja con Honda CR-V" },
    { id: 7, src: "/carrusel_kars7.jpg", alt: "Clientes con Nissan Versa" },
    { id: 8, src: "/carrusel_kars8.jpg", alt: "Mujer con Chevrolet" },
    { id: 9, src: "/carrusel_kars9.jpg", alt: "Cliente con Honda dirt bike" },
    { id: 10, src: "/carrusel_kars10.jpg", alt: "Mujer con Volkswagen Golf" },
    { id: 11, src: "/carrusel_kars11.jpg", alt: "Cliente con Chevrolet" },
    { id: 12, src: "/carrusel_kars12.jpg", alt: "Mujer con Volkswagen SUV" },
    { id: 13, src: "/carrusel_kars13.jpg", alt: "Cliente con Dodge Journey" },
    { id: 14, src: "/carrusel_kars14.jpg", alt: "Mujer con Fiat Strada" },
    { id: 15, src: "/carrusel_kars15.jpg", alt: "Cliente con Peugeot" },
    { id: 16, src: "/carrusel_kars16.jpg", alt: "Cliente con Chevrolet Aveo" },
    { id: 17, src: "/carrusel_kars17.jpg", alt: "Mujer con auto rojo" },
    { id: 18, src: "/carrusel_kars18.jpg", alt: "Mujer con Peugeot" },
    { id: 19, src: "/carrusel_kars19.jpg", alt: "Cliente con Fiat Uno" },
    { id: 20, src: "/carrusel_kars20.jpg", alt: "Mujer con auto rojo" }
  ];

  // Detectar si es desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Funciones para navegación del carrusel (solo desktop)
  const scrollLeft = () => {
    if (scrollContainerRef.current && isDesktop) {
      const itemWidth = 320 + 16; // ancho del item + gap
      const newPosition = Math.max(0, currentPosition - itemWidth);
      setCurrentPosition(newPosition);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isDesktop) {
      const itemWidth = 320 + 16; // ancho del item + gap
      const maxScroll = (carouselImages.length - 1) * itemWidth;
      const newPosition = Math.min(maxScroll, currentPosition + itemWidth);
      setCurrentPosition(newPosition);
    }
  };

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ana Martínez",
      image: "https://via.placeholder.com/80x80/3b82f6/ffffff?text=AM",
      content: "El seguimiento en tiempo real me da mucha tranquilidad. Muy recomendado.",
      rating: 5
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      image: "https://via.placeholder.com/80x80/059669/ffffff?text=CR",
      content: "Excelente experiencia de compra. El equipo fue muy profesional y me guiaron en cada paso.",
      rating: 5
    },
    {
      id: 3,
      name: "María González",
      image: "https://via.placeholder.com/80x80/dc2626/ffffff?text=MG",
      content: "KARS me ayudó a encontrar exactamente lo que buscaba. El proceso fue transparente y rápido.",
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return [...Array(rating)].map((_, i) => (
      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Testimonios</span>{' '}
            <span className="text-primary-600">/ Confianza</span>
          </h2>
        </div>

        {/* Carrusel de imágenes */}
        <div className="mb-16 relative group">
          {/* Flecha izquierda - Solo visible en desktop */}
          <button
            onClick={scrollLeft}
            className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            style={{ marginTop: '-32px' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Flecha derecha - Solo visible en desktop */}
          <button
            onClick={scrollRight}
            className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            style={{ marginTop: '-32px' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Contenedor scrolleable con gestos táctiles */}
          <div
            ref={scrollContainerRef}
            className={`flex gap-4 scroll-smooth snap-x snap-mandatory scrollbar-hide ${
              isDesktop ? 'overflow-hidden' : 'overflow-x-auto'
            }`}
            style={{
              WebkitOverflowScrolling: 'touch',
              transform: isDesktop ? `translateX(-${currentPosition}px)` : 'none',
              transition: isDesktop ? 'transform 0.5s ease-in-out' : 'none'
            }}
          >
            {/* Imágenes del carrusel */}
            {carouselImages.map((image, index) => (
              <div key={`${image.id}-${index}`} className="flex-shrink-0 snap-start snap-always">
                {/* Contenedor tipo ventana - Rectangular vertical */}
                <div className="relative w-72 sm:w-80 md:w-80 h-72 sm:h-96 md:h-96 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center center'
                    }}
                    loading="lazy"
                    sizes="(max-width: 640px) 288px, 320px"
                  />
                  {/* Borde sutil para definir la ventana */}
                  <div className="absolute inset-0 border border-gray-200 rounded-xl pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 tablet:grid-cols-2 tablet-lg:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-7 tablet:gap-7 tablet-lg:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-5 md:p-5.5 tablet:p-6 tablet-lg:p-6 group hover:scale-105 transition-all duration-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </h3>
              </div>

              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <blockquote className="text-gray-900 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
