import React from 'react'
import { useNavigate } from 'react-router-dom'

const StockSection = () => {
  const navigate = useNavigate()

  const vehicles = [
    {
      id: 1,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "BMW Serie 3 2023",
      price: "$45,000",
      year: "2023",
      mileage: "15,000 km",
      fuel: "Gasolina",
      transmission: "Automático"
    },
    {
      id: 2,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Toyota RAV4 2022",
      price: "$32,500",
      year: "2022",
      mileage: "28,000 km",
      fuel: "Híbrido",
      transmission: "Automático"
    },
    {
      id: 3,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Honda Civic 2023",
      price: "$28,900",
      year: "2023",
      mileage: "12,500 km",
      fuel: "Gasolina",
      transmission: "Manual"
    },
    {
      id: 4,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Mercedes Clase A 2022",
      price: "$38,750",
      year: "2022",
      mileage: "22,000 km",
      fuel: "Gasolina",
      transmission: "Automático"
    },
    {
      id: 5,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Volkswagen Golf 2023",
      price: "$26,800",
      year: "2023",
      mileage: "8,900 km",
      fuel: "Gasolina",
      transmission: "Manual"
    },
    {
      id: 6,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Hyundai Tucson 2022",
      price: "$29,500",
      year: "2022",
      mileage: "35,000 km",
      fuel: "Gasolina",
      transmission: "Automático"
    },
    {
      id: 7,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Audi A4 2023",
      price: "$42,300",
      year: "2023",
      mileage: "18,500 km",
      fuel: "Gasolina",
      transmission: "Automático"
    },
    {
      id: 8,
      icon: (
        <svg className="w-full h-full text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      model: "Mazda CX-5 2022",
      price: "$31,200",
      year: "2022",
      mileage: "25,000 km",
      fuel: "Gasolina",
      transmission: "Automático"
    }
  ]

  return (
    <section id="vehiculos-en-venta" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Stock</span>{' '}
            <span className="text-primary-600">disponible</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg p-6 group hover:scale-105 transition-all duration-200">
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  {vehicle.icon}
                </div>
                <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {vehicle.year}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                  {vehicle.model}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {vehicle.price}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{vehicle.mileage}</span>
                  <span>{vehicle.fuel}</span>
                  <span>{vehicle.transmission}</span>
                </div>
                
                <button 
                  onClick={() => navigate(`/auto/${vehicle.id}`)}
                  className="w-full bg-transparent text-primary-600 hover:bg-primary-50 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-start gap-2"
                >
                  Ver unidad
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-white text-gray-900 font-semibold py-3 px-8 rounded-full border border-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm">
            Ver todos
          </button>
        </div>
      </div>
    </section>
  )
}

export default StockSection
