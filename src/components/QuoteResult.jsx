import React from 'react'
import Navbar from './Navbar'
import EmailSummary from './EmailSummary'

const QuoteResult = () => {
  // Obtener los datos del localStorage o de la URL
  const getQuoteData = () => {
    const savedData = localStorage.getItem('quoteData')
    if (savedData) {
      return JSON.parse(savedData)
    }
    
    // Datos por defecto si no hay datos guardados
    return {
      marca: 'Chevrolet',
      grupo: "Onix",
      modelo: 'Onix',
      año: '2019',
      precio: "772",
      version: 'LTZ Automático',
      kilometraje: '45.000',
      estado: 'Bueno',
      nombre: '',
      email: '',
      ubicacion: 'Bogotá'
    }
  }

  const quoteData = getQuoteData()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Resultado de tu cotización
          </h1>
          <span className="text-gray-500 text-lg">Completado</span>
        </div>
        
        {/* Blue line separator */}
        <div className="w-full h-1 bg-blue-600 mb-8"></div>
        
        {/* Main content card */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          
          {/* Estimated Value Header */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Este es el valor estimado de tu vehículo
              </h2>
              <p className="text-gray-500 text-sm">
                Estimación basada en los datos proporcionados
              </p>
            </div>
          </div>
          
          {/* Vehicle Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Auto ingresado (resumen):
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Marca:</span>
                  <span className="font-bold text-gray-900">{quoteData.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Modelo:</span>
                  <span className="font-bold text-gray-900">{quoteData.modelo}</span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Grupo:</span>
                  <span className="font-bold text-gray-900">{quoteData.grupo} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Año:</span>
                  <span className="font-bold text-gray-900">{quoteData.año}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estimation */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Estimación:
            </h3>
            <div className="text-4xl font-bold text-blue-500 mb-2">
              ${quoteData.precio}
            </div>
            <p className="text-gray-500 text-sm">
              Nota: Este valor es una estimación inicial. El precio final se confirmará tras la inspección.
            </p>
          </div>
          
          {/* CTAs */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              CTAs principales:
            </h3>
            
            <div className="space-y-3">
              {/* Button 1 - Primary */}
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar inspección gratuita
              </button>
              
              {/* Button 2 - Secondary */}
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Hablar con un asesor (WhatsApp)
              </button>
              
              {/* Button 3 - Tertiary */}
              <button className="w-full bg-white text-blue-600 border border-blue-600 py-3 px-6 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
              
              {/* Button 4 - Tertiary */}
              <button className="w-full bg-white text-blue-600 border border-blue-600 py-3 px-6 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar por correo
              </button>
            </div>
          </div>
        </div>
        
        {/* Email Summary Component */}
        <EmailSummary />
      </div>
    </div>
  )
}

export default QuoteResult
