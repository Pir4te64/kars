"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { VehiclePost } from "@/types";
import { useVehiclePosts } from "@/hooks/useVehiclePosts";

interface CarDetailClientProps {
  carData: VehiclePost;
  featuredCars: VehiclePost[];
}

export default function CarDetailClient({
  carData,
  featuredCars,
}: CarDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { cars } = useVehiclePosts(1000);

  // Map the carData to car object
  const car = {
    id: carData.id,
    title: carData.titulo,
    make: carData.marca,
    model: carData.modelo,
    year: carData.anio,
    mileage: carData.kilometraje,
    transmission: carData.transmision,
    price: carData.precio,
    status: carData.disponible || carData.estado,
    images:
      carData.images_urls && carData.images_urls.length > 0
        ? carData.images_urls
        : ["/hero_image.jpg"],
    specs: {
      general: {
        marca: carData.marca,
        modelo: carData.modelo,
        año: carData.anio,
        kilometraje: carData.kilometraje,
        transmisión: carData.transmision,
      },
      engine: {
        cilindrada: carData.cilindrada,
        combustible: carData.combustible,
        potencia: carData.potencia_hp,
        tracción: carData.traccion,
      },
      equipment: [],
    },
    seller: {
      name: carData.vendedor_nombre || "",
      title: "Asesor Certificado",
      rating: Number(carData.vendedor_calificacion) || 0,
      reviews: 0,
    },
  };

  // Prepare WhatsApp link
  const sellerPhoneRaw = null;
  const fallbackPhone = "5491121596100"; // Número de la agencia
  const normalize = (s: string | null) =>
    s ? String(s).replace(/[^0-9+]/g, "") : null;
  const phone = normalize(sellerPhoneRaw) || fallbackPhone;
  const message = encodeURIComponent(
    `Hola, estoy interesado en el auto: ${car.title} `
  );
  const waUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Inicio
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <Link
                    href="/#stock-disponible"
                    className="ml-4 text-gray-500 hover:text-gray-700">
                    Autos
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 font-medium text-gray-900">
                    {car.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8">
        <div className="flex flex-col lg:grid lg:gap-8 lg:grid-cols-3 space-y-6 lg:space-y-0">
          {/* Left Side - Image Gallery (2 columns) */}
          <div className="lg:col-span-2 w-full">
            {/* Main Image */}
            <div className="relative mb-3 sm:mb-4 w-full">
              <div className="relative w-full h-[250px] sm:h-[400px] lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={car.images[currentImageIndex]}
                  alt={car.title}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                  priority={currentImageIndex === 0}
                />
              </div>
              <div className="absolute px-2 py-1 text-xs sm:text-sm text-white bg-black bg-opacity-75 rounded-full bottom-3 left-3">
                {currentImageIndex + 1}/{car.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:gap-3 scrollbar-hide">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 relative ${
                    currentImageIndex === index
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}>
                  <Image
                    src={image}
                    alt={`${car.title} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Car Details & Actions (1 column) */}
          <div className="lg:col-span-1 w-full">
            {/* Status Badge */}
            <div className="mb-2 sm:mb-3">
              <span className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-green-800 bg-green-100 rounded-full">
                {car.status == "Sí" ? "Disponible" : "No disponible"}
              </span>
            </div>

            {/* Car Title */}
            <h1 className="mb-3 sm:mb-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {car.title}
            </h1>

            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5">
              <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                  {car.year}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Año</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">
                  {car.mileage}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">km</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
                <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-900">
                  {car.transmission}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">Trans.</div>
              </div>
            </div>

            {/* Price */}
<<<<<<< HEAD
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary-600">
                {car.moneda || 'USD'} {car.price}
=======
            <div className="mb-4 sm:mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600">
                {car.price}
>>>>>>> 7edc6a07c1780d3663d48862fad1eaa97143548c
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Precio de contado</div>
            </div>

            {/* Action Buttons */}
            <div className="mb-4 sm:mb-6 space-y-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 bg-gray-900 rounded-lg hover:bg-gray-800 hover:shadow-lg active:scale-95">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contactar vendedor
              </a>
            </div>
          </div>

          {/* Descripción Section */}
          {carData.descripcion && (
            <div className="lg:col-span-3 w-full">
              <h2 className="pb-2 mb-4 sm:mb-6 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 border-b border-primary-600">
                Descripción
              </h2>
              <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {carData.descripcion}
                </p>
              </div>
            </div>
          )}

          {/* Características Detalladas Section */}
          <div className="lg:col-span-3 w-full">
            <h2 className="pb-2 mb-4 sm:mb-6 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 border-b border-primary-600">
              Características Detalladas
            </h2>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {/* Información General */}
              <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
                  Información General
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {Object.entries(car.specs.general).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-500 capitalize">
                            {key}:
                          </span>
                          <span className="font-medium text-gray-900">
                            {value}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Motor */}
              <div className="p-3 sm:p-4 lg:p-5 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
                <h3 className="mb-2 sm:mb-3 lg:mb-4 text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Motor
                </h3>
                <div className="space-y-1.5 sm:space-y-2.5">
                  {Object.entries(car.specs.engine).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-500 capitalize">
                            {key}:
                          </span>
                          <span className="font-medium text-gray-900">
                            {value}
                          </span>
                        </div>
                      )
                  )}
                  {carData.alimentacion && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Alimentación:</span>
                      <span className="font-medium text-gray-900">
                        {carData.alimentacion}
                      </span>
                    </div>
                  )}
                  {carData.cilindros && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Cilindros:</span>
                      <span className="font-medium text-gray-900">
                        {carData.cilindros}
                      </span>
                    </div>
                  )}
                  {carData.valvulas && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Válvulas:</span>
                      <span className="font-medium text-gray-900">
                        {carData.valvulas}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transmisión y Chasis */}
              {(carData.velocidades ||
                carData.neumaticos ||
                carData.frenos_delanteros ||
                carData.frenos_traseros ||
                carData.direccion_asistida ||
                carData.freno_mano) && (
                <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
                    Transmisión y Chasis
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {carData.velocidades && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">Velocidades:</span>
                        <span className="font-medium text-gray-900">
                          {carData.velocidades}
                        </span>
                      </div>
                    )}
                    {carData.neumaticos && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Neumáticos:</span>
                        <span className="font-medium text-gray-900">
                          {carData.neumaticos}
                        </span>
                      </div>
                    )}
                    {carData.frenos_delanteros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Frenos Delanteros:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.frenos_delanteros}
                        </span>
                      </div>
                    )}
                    {carData.frenos_traseros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Frenos Traseros:</span>
                        <span className="font-medium text-gray-900">
                          {carData.frenos_traseros}
                        </span>
                      </div>
                    )}
                    {carData.direccion_asistida && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Dirección Asistida:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.direccion_asistida}
                        </span>
                      </div>
                    )}
                    {carData.freno_mano && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Freno de Mano:</span>
                        <span className="font-medium text-gray-900">
                          {carData.freno_mano}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confort */}
              {(carData.aire_acondicionado ||
                carData.asiento_delantero_ajuste_altura ||
                carData.volante_regulable ||
                carData.asientos_traseros ||
                carData.tapizados ||
                carData.cierre_puertas ||
                carData.vidrios_delanteros ||
                carData.vidrios_traseros ||
                carData.espejos_exteriores ||
                carData.espejo_interior_antideslumbrante ||
                carData.faros_delanteros ||
                carData.faros_antiniebla ||
                carData.faros_tipo ||
                carData.computadora_abordo ||
                carData.control_velocidad_crucero ||
                carData.limitador_velocidad ||
                carData.llantas_aleacion ||
                carData.techo_solar ||
                carData.sensores_estacionamiento ||
                carData.camara_estacionamiento ||
                carData.asistencia_arranque_pendientes) && (
                <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
                    Confort
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {carData.aire_acondicionado && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Aire Acondicionado:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.aire_acondicionado}
                        </span>
                      </div>
                    )}
                    {carData.asiento_delantero_ajuste_altura && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Asiento Delantero Ajuste Altura:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.asiento_delantero_ajuste_altura}
                        </span>
                      </div>
                    )}
                    {carData.volante_regulable && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Volante Regulable:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.volante_regulable}
                        </span>
                      </div>
                    )}
                    {carData.asientos_traseros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Asientos Traseros:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.asientos_traseros}
                        </span>
                      </div>
                    )}
                    {carData.tapizados && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tapizados:</span>
                        <span className="font-medium text-gray-900">
                          {carData.tapizados}
                        </span>
                      </div>
                    )}
                    {carData.cierre_puertas && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Cierre de Puertas:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.cierre_puertas}
                        </span>
                      </div>
                    )}
                    {carData.vidrios_delanteros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Vidrios Delanteros:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.vidrios_delanteros}
                        </span>
                      </div>
                    )}
                    {carData.vidrios_traseros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Vidrios Traseros:</span>
                        <span className="font-medium text-gray-900">
                          {carData.vidrios_traseros}
                        </span>
                      </div>
                    )}
                    {carData.espejos_exteriores && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Espejos Exteriores:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.espejos_exteriores}
                        </span>
                      </div>
                    )}
                    {carData.espejo_interior_antideslumbrante && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Espejo Interior Antideslumbrante:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.espejo_interior_antideslumbrante}
                        </span>
                      </div>
                    )}
                    {carData.faros_delanteros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Faros Delanteros:</span>
                        <span className="font-medium text-gray-900">
                          {carData.faros_delanteros}
                        </span>
                      </div>
                    )}
                    {carData.faros_antiniebla && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Faros Antiniebla:</span>
                        <span className="font-medium text-gray-900">
                          {carData.faros_antiniebla}
                        </span>
                      </div>
                    )}
                    {carData.faros_tipo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tipo de Faros:</span>
                        <span className="font-medium text-gray-900">
                          {carData.faros_tipo}
                        </span>
                      </div>
                    )}
                    {carData.computadora_abordo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Computadora de a Bordo:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.computadora_abordo}
                        </span>
                      </div>
                    )}
                    {carData.control_velocidad_crucero && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Control de Velocidad Crucero:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.control_velocidad_crucero}
                        </span>
                      </div>
                    )}
                    {carData.limitador_velocidad && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Limitador de Velocidad:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.limitador_velocidad}
                        </span>
                      </div>
                    )}
                    {carData.llantas_aleacion && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Llantas de Aleación:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.llantas_aleacion}
                        </span>
                      </div>
                    )}
                    {carData.techo_solar && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Techo Solar:</span>
                        <span className="font-medium text-gray-900">
                          {carData.techo_solar}
                        </span>
                      </div>
                    )}
                    {carData.sensores_estacionamiento && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Sensores de Estacionamiento:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.sensores_estacionamiento}
                        </span>
                      </div>
                    )}
                    {carData.camara_estacionamiento && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Cámara de Estacionamiento:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.camara_estacionamiento}
                        </span>
                      </div>
                    )}
                    {carData.asistencia_arranque_pendientes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Asistencia al Arranque en Pendientes:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.asistencia_arranque_pendientes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seguridad */}
              {(carData.abs ||
                carData.distribucion_electronica_frenado ||
                carData.asistencia_frenada_emergencia ||
                carData.airbags_delanteros ||
                carData.airbags_cortina ||
                carData.airbag_rodilla_conductor ||
                carData.airbags_laterales ||
                carData.cantidad_airbags ||
                carData.alarma ||
                carData.inmovilizador_motor ||
                carData.anclaje_asientos_infantiles ||
                carData.sensor_lluvia ||
                carData.sensor_luz ||
                carData.autobloqueo_puertas_velocidad ||
                carData.control_estabilidad ||
                carData.control_traccion ||
                carData.control_descenso ||
                carData.sensor_presion_neumaticos) && (
                <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
                    Seguridad
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {carData.abs && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ABS:</span>
                        <span className="font-medium text-gray-900">
                          {carData.abs}
                        </span>
                      </div>
                    )}
                    {carData.distribucion_electronica_frenado && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Distribución Electrónica de Frenado:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.distribucion_electronica_frenado}
                        </span>
                      </div>
                    )}
                    {carData.asistencia_frenada_emergencia && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Asistencia en Frenada de Emergencia:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.asistencia_frenada_emergencia}
                        </span>
                      </div>
                    )}
                    {carData.airbags_delanteros && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Airbags Delanteros:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.airbags_delanteros}
                        </span>
                      </div>
                    )}
                    {carData.airbags_cortina && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Airbags Cortina:</span>
                        <span className="font-medium text-gray-900">
                          {carData.airbags_cortina}
                        </span>
                      </div>
                    )}
                    {carData.airbag_rodilla_conductor && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Airbag de Rodilla Conductor:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.airbag_rodilla_conductor}
                        </span>
                      </div>
                    )}
                    {carData.airbags_laterales && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Airbags Laterales:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.airbags_laterales}
                        </span>
                      </div>
                    )}
                    {carData.cantidad_airbags && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Cantidad de Airbags:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.cantidad_airbags}
                        </span>
                      </div>
                    )}
                    {carData.alarma && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Alarma:</span>
                        <span className="font-medium text-gray-900">
                          {carData.alarma}
                        </span>
                      </div>
                    )}
                    {carData.inmovilizador_motor && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Inmovilizador de Motor:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.inmovilizador_motor}
                        </span>
                      </div>
                    )}
                    {carData.anclaje_asientos_infantiles && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Anclaje para Asientos Infantiles:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.anclaje_asientos_infantiles}
                        </span>
                      </div>
                    )}
                    {carData.sensor_lluvia && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sensor de Lluvia:</span>
                        <span className="font-medium text-gray-900">
                          {carData.sensor_lluvia}
                        </span>
                      </div>
                    )}
                    {carData.sensor_luz && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sensor de Luz:</span>
                        <span className="font-medium text-gray-900">
                          {carData.sensor_luz}
                        </span>
                      </div>
                    )}
                    {carData.autobloqueo_puertas_velocidad && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Autobloqueo de Puertas con Velocidad:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.autobloqueo_puertas_velocidad}
                        </span>
                      </div>
                    )}
                    {carData.control_estabilidad && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Control de Estabilidad:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.control_estabilidad}
                        </span>
                      </div>
                    )}
                    {carData.control_traccion && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Control de Tracción:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.control_traccion}
                        </span>
                      </div>
                    )}
                    {carData.control_descenso && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Control de Descenso:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.control_descenso}
                        </span>
                      </div>
                    )}
                    {carData.sensor_presion_neumaticos && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Sensor de Presión de Neumáticos:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.sensor_presion_neumaticos}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comunicación y Entretenimiento */}
              {(carData.equipo_musica ||
                carData.comandos_volante ||
                carData.conexion_auxiliar ||
                carData.conexion_usb ||
                carData.bluetooth ||
                carData.control_voz ||
                carData.pantalla ||
                carData.navegacion_gps ||
                carData.apple_carplay ||
                carData.android_auto) && (
                <div className="p-3 sm:p-4 rounded-lg bg-white shadow-sm">
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
                    Comunicación y Entretenimiento
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {carData.equipo_musica && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Equipo de Música:</span>
                        <span className="font-medium text-gray-900">
                          {carData.equipo_musica}
                        </span>
                      </div>
                    )}
                    {carData.comandos_volante && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Comandos al Volante:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.comandos_volante}
                        </span>
                      </div>
                    )}
                    {carData.conexion_auxiliar && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Conexión Auxiliar:
                        </span>
                        <span className="font-medium text-gray-900">
                          {carData.conexion_auxiliar}
                        </span>
                      </div>
                    )}
                    {carData.conexion_usb && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Conexión USB:</span>
                        <span className="font-medium text-gray-900">
                          {carData.conexion_usb}
                        </span>
                      </div>
                    )}
                    {carData.bluetooth && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bluetooth:</span>
                        <span className="font-medium text-gray-900">
                          {carData.bluetooth}
                        </span>
                      </div>
                    )}
                    {carData.control_voz && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Control por Voz:</span>
                        <span className="font-medium text-gray-900">
                          {carData.control_voz}
                        </span>
                      </div>
                    )}
                    {carData.pantalla && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pantalla:</span>
                        <span className="font-medium text-gray-900">
                          {carData.pantalla}
                        </span>
                      </div>
                    )}
                    {carData.navegacion_gps && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Navegación GPS:</span>
                        <span className="font-medium text-gray-900">
                          {carData.navegacion_gps}
                        </span>
                      </div>
                    )}
                    {carData.apple_carplay && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Apple CarPlay:</span>
                        <span className="font-medium text-gray-900">
                          {carData.apple_carplay}
                        </span>
                      </div>
                    )}
                    {carData.android_auto && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Android Auto:</span>
                        <span className="font-medium text-gray-900">
                          {carData.android_auto}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listados Destacados Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <h2 className="mb-6 sm:mb-8 lg:mb-12 text-xl sm:text-2xl lg:text-3xl font-bold text-left text-gray-900">
            Listados destacados
          </h2>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cars.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="p-6 transition-all duration-200 bg-white shadow-lg rounded-2xl group hover:scale-105">
                <div className="relative mb-4">
                  <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-xl relative">
                    {post.images_urls && post.images_urls[0] ? (
                      <Image
                        src={post.images_urls[0]}
                        alt={post.titulo}
                        fill
                        className="object-cover rounded-xl"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute px-3 py-1 text-sm font-semibold text-white rounded-full top-3 right-3 bg-primary-600">
                    {post.anio}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600">
                    {post.titulo}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {post.moneda || 'USD'} {post.precio}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t">
                    <span>{post.kilometraje}</span>
                    <span>{post.combustible}</span>
                    <span>{post.transmision}</span>
                  </div>
                  <Link
                    href={`/autos/${post.id}`}
                    className="flex items-center justify-start w-full gap-2 px-4 py-3 font-semibold transition-colors duration-200 bg-transparent rounded-lg text-primary-600 hover:bg-primary-50">
                    Ver unidad
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
