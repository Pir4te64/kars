import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useVehiclePosts, useVehiclePostById } from "../hooks/useVehiclePosts";

const CarDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { carData, loading, error } = useVehiclePostById(id);
  const { cars } = useVehiclePosts(1000);
  // Si no hay datos, mostrar loading o error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl">
        Cargando...
      </div>
    );
  }
  if (error || !carData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl text-red-500">
        Error al cargar el auto
      </div>
    );
  }

  // Mapear los datos del carData (Datum)
  const car = {
    id: carData.id,
    title: carData.titulo,
    make: carData.marca,
    model: carData.modelo,
    year: carData.anio,
    mileage: carData.kilometraje,
    transmission: carData.transmision,
    price: carData.precio,
    monthlyPayment: carData.cuota_mensual,
    downPayment: carData.enganche,
    downPaymentPercent: carData.enganche
      ? carData.enganche.match(/\(([^)]+)\)/)?.[1]
      : "",
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
      equipment: carData.equipamiento || [],
    },
    seller: {
      name: carData.vendedor_nombre || "",
      title: carData.vendedor_titulo || "",
      rating: Number(carData.vendedor_calificacion) || 0,
      reviews: carData.vendedor_reviews || 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Inicio
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <Link
                    to="/#stock-disponible"
                    className="ml-4 text-gray-500 hover:text-gray-700"
                  >
                    Autos
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 text-gray-900 font-medium">
                    {car.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Image Gallery (2 columns) */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative mb-4">
              <img
                src={car.images[currentImageIndex]}
                alt={car.title}
                className="w-full h-[500px] object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1}/{car.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-2">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${car.title} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Car Details & Actions (1 column) */}
          <div className="lg:col-span-1">
            {/* Status Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {car.status == "Sí" ? "Disponible" : "No disponible"}
              </span>
            </div>

            {/* Car Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {car.title}
            </h1>

            {/* Key Specs */}
            <div className="flex space-x-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {car.year}
                </div>
                <div className="text-xs text-gray-500">Año</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {car.mileage}
                </div>
                <div className="text-xs text-gray-500">km</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {car.transmission}
                </div>
                <div className="text-xs text-gray-500">Transmisión</div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary-600">
                {car.price}
              </div>
              <div className="text-xs text-gray-500">Precio de contado</div>
            </div>

            {/* Financing Options */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Opciones de financiamiento
              </h3>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuota desde:</span>
                  <span className="font-semibold">
                    {car.monthlyPayment}/mes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enganche:</span>
                  <span className="font-semibold">
                    {car.downPayment} ({car.downPaymentPercent})
                  </span>
                </div>
              </div>
              <button className="w-full bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                Ver opciones de crédito
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm">
                Comprar ahora
              </button>
              <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contactar vendedor
              </button>
            </div>

            {/* Seller Information */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {car.seller.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {car.seller.title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Características Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-primary-600">
              Características
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Información General */}
              <div className="rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información general
                </h3>
                <div className="space-y-2">
                  {Object.entries(car.specs.general).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motor */}
              <div className="rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Motor
                </h3>
                <div className="space-y-2">
                  {Object.entries(car.specs.engine).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipamiento */}
              <div className="rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Equipamiento
                </h3>
                <div className="space-y-2">
                  {car.specs.equipment.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listados Destacados Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-left">
            Listados destacados
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars
              .filter((item) => item.destacado == true)
              .slice(0, 4)
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg p-6 group hover:scale-105 transition-all duration-200"
                >
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                      {/* Imagen principal si existe */}
                      {post.images_urls && post.images_urls[0] ? (
                        <img
                          src={post.images_urls[0]}
                          alt={post.titulo}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <svg
                          className="w-16 h-16 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                        </svg>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {post.anio}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {post.titulo}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {post.precio}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>{post.kilometraje}</span>
                      <span>{post.combustible}</span>
                      <span>{post.transmision}</span>
                    </div>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        navigate(`/auto/${post.id}`);
                      }}
                      className="w-full bg-transparent text-primary-600 hover:bg-primary-50 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-start gap-2"
                    >
                      Ver unidad
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* Footer */}
    </div>
  );
};

export default CarDetail;
