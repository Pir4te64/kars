import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const CarDetail = () => {
  const { id } = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const navigate = useNavigate()

  // Datos del auto (en un proyecto real vendrían de una API)
  const car = {
    id: id,
    title: "Ford Territory 1.5 SEL CVT SUV 2021",
    make: "Ford",
    model: "Territory",
    year: "2021",
    mileage: "45,280",
    transmission: "Automático CVT",
    price: "$4,890,000",
    monthlyPayment: "$89,500",
    downPayment: "$978,000",
    downPaymentPercent: "20%",
    status: "Disponible",
    images: [
      "/hero_image.jpg", // Imagen principal temporal
      "/hero_image.jpg",
      "/hero_image.jpg", 
      "/hero_image.jpg",
      "/hero_image.jpg"
    ],
    specs: {
      general: {
        marca: "Ford",
        modelo: "Territory",
        año: "2021",
        kilometraje: "45,280 km",
        transmisión: "Automática CVT"
      },
      engine: {
        cilindrada: "1.5L",
        combustible: "Nafta",
        potencia: "150 HP",
        tracción: "Delantera"
      },
      equipment: [
        "Aire acondicionado",
        "Pantalla táctil 10\"",
        "Cámara de retroceso",
        "Sensores de estacionamiento",
        "Bluetooth"
      ]
    },
    seller: {
      name: "Carlos Mendoza",
      title: "Asesor certificado",
      rating: 4.9,
      reviews: 127
    }
  }

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
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/#stock-disponible" className="ml-4 text-gray-500 hover:text-gray-700">
                    Autos
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-900 font-medium">{car.title}</span>
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
                     currentImageIndex === index ? 'border-primary-600' : 'border-gray-200'
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
                 {car.status}
               </span>
             </div>

             {/* Car Title */}
             <h1 className="text-2xl font-bold text-gray-900 mb-3">{car.title}</h1>

             {/* Key Specs */}
             <div className="flex space-x-4 mb-4">
               <div className="text-center">
                 <div className="text-lg font-bold text-gray-900">{car.year}</div>
                 <div className="text-xs text-gray-500">Año</div>
               </div>
               <div className="text-center">
                 <div className="text-lg font-bold text-gray-900">{car.mileage}</div>
                 <div className="text-xs text-gray-500">km</div>
               </div>
               <div className="text-center">
                 <div className="text-lg font-bold text-gray-900">{car.transmission}</div>
                 <div className="text-xs text-gray-500">Transmisión</div>
               </div>
             </div>

             {/* Price */}
             <div className="mb-4">
               <div className="text-3xl font-bold text-primary-600">{car.price}</div>
               <div className="text-xs text-gray-500">Precio de contado</div>
             </div>

             {/* Financing Options */}
             <div className="bg-gray-50 rounded-lg p-3 mb-4">
               <h3 className="text-sm font-semibold text-gray-900 mb-2">Opciones de financiamiento</h3>
               <div className="space-y-1 mb-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Cuota desde:</span>
                   <span className="font-semibold">{car.monthlyPayment}/mes</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Enganche:</span>
                   <span className="font-semibold">{car.downPayment} ({car.downPaymentPercent})</span>
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
               <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-sm">
                 Agendar prueba de manejo
               </button>
               <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center text-sm">
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
                 Contactar vendedor
               </button>
             </div>

             {/* Seller Information */}
             <div className="border-t pt-4">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="font-semibold text-gray-900 text-sm">{car.seller.name}</div>
                   <div className="text-xs text-gray-500">{car.seller.title}</div>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center">
                     <div className="flex text-yellow-400">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} className={`w-4 h-4 ${i < Math.floor(car.seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                         </svg>
                       ))}
                     </div>
                     <span className="ml-2 text-xs text-gray-600">
                       {car.seller.rating} ({car.seller.reviews})
                     </span>
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
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Información general</h3>
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
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Motor</h3>
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
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipamiento</h3>
                 <div className="space-y-2">
                   {car.specs.equipment.map((item, index) => (
                     <div key={index} className="flex items-center text-sm">
                       <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
            {/* Card 1 - Gran precio */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-all duration-200">
              <div className="relative">
                <img 
                  src="/hero_image.jpg" 
                  alt="Ford Transit 2021" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Gran precio
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ford Transit - 2021</h3>
                <p className="text-sm text-gray-600 mb-3">2500 Miles • Diesel • Manual</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">$22,000</span>
                </div>
                <button 
                  onClick={() => navigate('/auto/2')}
                  className="w-full text-primary-600 hover:text-primary-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-primary-50"
                >
                  Ver unidad
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card 2 - Bajo kilometraje */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-all duration-200">
              <div className="relative">
                <img 
                  src="/hero_image.jpg" 
                  alt="Ford Transit 2021" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Bajo kilometraje
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ford Transit - 2021</h3>
                <p className="text-sm text-gray-600 mb-3">2500 Miles • Diesel • Manual</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">$22,000</span>
                </div>
                <button 
                  onClick={() => navigate('/auto/3')}
                  className="w-full text-primary-600 hover:text-primary-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-primary-50"
                >
                  Ver unidad
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card 3 - Sin etiqueta especial */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-all duration-200">
              <div className="relative">
                <img 
                  src="/hero_image.jpg" 
                  alt="Ford Transit 2021" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ford Transit - 2021</h3>
                <p className="text-sm text-gray-600 mb-3">2500 Miles • Diesel • Manual</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">$22,000</span>
                </div>
                <button 
                  onClick={() => navigate('/auto/4')}
                  className="w-full text-primary-600 hover:text-primary-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-primary-50"
                >
                  Ver unidad
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card 4 - Sin etiqueta especial */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:scale-105 transition-all duration-200">
              <div className="relative">
                <img 
                  src="/hero_image.jpg" 
                  alt="Ford Transit 2021" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ford Transit - 2021</h3>
                <p className="text-sm text-gray-600 mb-3">2500 Miles • Diesel • Manual</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">$22,000</span>
                </div>
                <button 
                  onClick={() => navigate('/auto/5')}
                  className="w-full text-primary-600 hover:text-primary-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-primary-50"
                >
                  Ver unidad
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
    </div>
  )
}

export default CarDetail
