import React, { useState } from 'react'

const CarQuote = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCondition, setSelectedCondition] = useState('excelente')
  
  // Estados para capturar los datos del formulario
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    año: '',
    version: '',
    kilometraje: '',
    nombre: '',
    email: '',
    ubicacion: ''
  })

  // Función para guardar los datos y navegar al resultado
  const handleCompleteQuote = () => {
    const completeData = {
      ...formData,
      estado: selectedCondition
    }
    
    // Guardar en localStorage
    localStorage.setItem('quoteData', JSON.stringify(completeData))
    
    // Navegar a la página de resultado
    window.location.href = '/quote-result'
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return renderStep1()
    } else if (currentStep === 2) {
      return renderStep2()
    } else if (currentStep === 3) {
      return renderStep3()
    }
    return null
  }

  const renderStep1 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 2 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 3 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>
      </div>
      {/* Title and Subtitle */}
      <div className="flex flex-col" style={{
        width: '1140px',
        height: '55px',
        gap: '11px',
        top: '94.5px',
        left: '30px',
        opacity: 1
      }}>
        <h2 style={{
          width: '1140px',
          height: '20px',
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontStyle: 'Bold',
          fontSize: '16px',
          lineHeight: '20px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p style={{
          width: '1140px',
          height: '24px',
          fontFamily: 'Poppins',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: '18px',
          lineHeight: '24px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Te acompañamos en cada paso de tu viaje
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4" style={{ marginTop: '40px' }}>
        {/* First Row */}
        <div className="flex justify-center mx-auto" style={{
          width: '810px',
          height: '56px',
          gap: '10px',
          top: '220px',
          opacity: 1
        }}>
          {/* Marca */}
          <div className="relative" style={{
            width: '263.3333435058594px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            opacity: 1
          }}>
            <select 
              value={formData.marca}
              onChange={(e) => setFormData({...formData, marca: e.target.value})}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500" 
              style={{
                border: 'none',
                outline: 'none'
              }}>
              <option value="">Marca</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Nissan">Nissan</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="Ford">Ford</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Modelo */}
          <div className="relative" style={{
            width: '263.3333435058594px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            opacity: 1
          }}>
            <select 
              value={formData.modelo}
              onChange={(e) => setFormData({...formData, modelo: e.target.value})}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500" 
              style={{
                border: 'none',
                outline: 'none'
              }}>
              <option value="">Modelo</option>
              <option value="Polo">Polo</option>
              <option value="Golf">Golf</option>
              <option value="Jetta">Jetta</option>
              <option value="Onix">Onix</option>
              <option value="Cruze">Cruze</option>
              <option value="Spark">Spark</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Año */}
          <div className="relative" style={{
            width: '263.3333435058594px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            opacity: 1
          }}>
            <select 
              value={formData.año}
              onChange={(e) => setFormData({...formData, año: e.target.value})}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500" 
              style={{
                border: 'none',
                outline: 'none'
              }}>
              <option value="">Año</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex justify-center items-center mx-auto" style={{
          width: '810px',
          height: '56px',
          gap: '10px',
          top: '280px',
          opacity: 1
        }}>
          {/* Versión */}
          <div className="relative" style={{
            width: '263px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            opacity: 1
          }}>
            <select 
              value={formData.version}
              onChange={(e) => setFormData({...formData, version: e.target.value})}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500" 
              style={{
                border: 'none',
                outline: 'none'
              }}>
              <option value="">Versión</option>
              <option value="Track">Track</option>
              <option value="Comfortline">Comfortline</option>
              <option value="Highline">Highline</option>
              <option value="LTZ Automático">LTZ Automático</option>
              <option value="LT Manual">LT Manual</option>
              <option value="LS">LS</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Kilometraje */}
          <div className="relative" style={{
            width: '263px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            opacity: 1
          }}>
            <select 
              value={formData.kilometraje}
              onChange={(e) => setFormData({...formData, kilometraje: e.target.value})}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500" 
              style={{
                border: 'none',
                outline: 'none'
              }}>
              <option value="">Kilometraje</option>
              <option value="0 - 10,000">0 - 10,000 km</option>
              <option value="10,001 - 30,000">10,001 - 30,000 km</option>
              <option value="30,001 - 50,000">30,001 - 50,000 km</option>
              <option value="50,001 - 80,000">50,001 - 80,000 km</option>
              <option value="45.000">45.000 km</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Button */}
          <button 
            className="text-white font-bold transition-colors duration-200"
            onClick={() => setCurrentStep(2)}
            style={{
              width: '264px',
              height: '48px',
              paddingTop: '10px',
              paddingRight: '20px',
              paddingBottom: '10px',
              paddingLeft: '20px',
              gap: '10px',
              borderRadius: '60px',
              borderWidth: '1px',
              border: '1px solid #2664C4',
              backgroundColor: '#2664C4',
              opacity: 1
            }}
          >
            Comenzar cotización
          </button>
        </div>
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'border-2 border-blue-600' : currentStep >= 1 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`} style={{
            backgroundColor: currentStep >= 2 ? '#2664C4' : 'white'
          }}>
            {currentStep >= 2 ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className={`w-2 h-2 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 2 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 3 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="flex flex-col" style={{
        width: '1140px',
        height: '55px',
        gap: '11px',
        top: '94.5px',
        left: '30px',
        opacity: 1
      }}>
        <h2 style={{
          width: '1140px',
          height: '20px',
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontStyle: 'Bold',
          fontSize: '16px',
          lineHeight: '20px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p style={{
          width: '1140px',
          height: '24px',
          fontFamily: 'Poppins',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: '18px',
          lineHeight: '24px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Estado general de tu auto
        </p>
      </div>

      {/* Condition Cards */}
      <div className="flex justify-center items-center space-x-6" style={{ marginTop: '40px' }}>
        {/* Excelente */}
        <div 
          className="cursor-pointer"
          onClick={() => setSelectedCondition('excelente')}
          style={{
            width: '263px',
            height: '96px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}
        >
          <div className="flex items-center justify-between mb-3" style={{
            width: '231px',
            height: '18px',
            justifyContent: 'space-between',
            opacity: 1
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              gap: '10px',
              borderRadius: '200px',
              padding: '3px',
              border: selectedCondition === 'excelente' ? '3px solid #04BD88' : '3px solid #D1D5DB',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedCondition === 'excelente' && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#04BD88'
                }}></div>
              )}
            </div>
            <span style={{
              width: '70px',
              height: '18px',
              opacity: 1,
              color: selectedCondition === 'excelente' ? '#4CAF50' : '#6B7280',
              fontWeight: 'bold'
            }}>
              Excelente
            </span>
          </div>
           <div style={{
             width: '231px',
             height: '54px',
             gap: '8px',
             opacity: 1,
             display: 'flex',
             alignItems: 'center'
           }}>
             <p style={{
               width: '231px',
               fontFamily: 'Poppins',
               fontWeight: 500,
               fontStyle: 'Medium',
               fontSize: '12px',
               lineHeight: '16px',
               letterSpacing: '0%',
               color: '#666666',
               opacity: 1,
               margin: 0
             }}>
               Todo en excelentes condiciones. No le falta ningún accesorio y todo funciona correctamente.
             </p>
           </div>
        </div>

        {/* Bueno */}
        <div 
          className="cursor-pointer"
          onClick={() => setSelectedCondition('bueno')}
          style={{
            width: '263px',
            height: '96px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}
        >
          <div className="flex items-center justify-between mb-3" style={{
            width: '231px',
            height: '18px',
            justifyContent: 'space-between',
            opacity: 1
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              gap: '10px',
              borderRadius: '200px',
              padding: '3px',
              border: selectedCondition === 'bueno' ? '3px solid #04BD88' : '3px solid #D1D5DB',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedCondition === 'bueno' && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#04BD88'
                }}></div>
              )}
            </div>
            <span style={{
              width: '70px',
              height: '18px',
              opacity: 1,
              color: selectedCondition === 'bueno' ? '#4CAF50' : '#6B7280',
              fontWeight: 'bold'
            }}>
              Bueno
            </span>
          </div>
           <div style={{
             width: '231px',
             height: '54px',
             opacity: 1,
             display: 'flex',
             alignItems: 'center'
           }}>
             <p style={{
               width: '231px',
               fontFamily: 'Poppins',
               fontWeight: 500,
               fontStyle: 'Medium',
               fontSize: '12px',
               lineHeight: '16px',
               letterSpacing: '0%',
               color: '#666666',
               opacity: 1,
               margin: 0
             }}>
               Sólo 1 ó 2 áreas dañadas o elementos faltantes y/o que no funcionan correctamente.
             </p>
           </div>
        </div>

        {/* Regular */}
        <div 
          className="cursor-pointer"
          onClick={() => setSelectedCondition('regular')}
          style={{
            width: '263px',
            height: '96px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            gap: '4px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}
        >
          <div className="flex items-center justify-between mb-3" style={{
            width: '231px',
            height: '18px',
            justifyContent: 'space-between',
            opacity: 1
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              gap: '10px',
              borderRadius: '200px',
              padding: '3px',
              border: selectedCondition === 'regular' ? '3px solid #04BD88' : '3px solid #D1D5DB',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedCondition === 'regular' && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#04BD88'
                }}></div>
              )}
            </div>
            <span style={{
              width: '70px',
              height: '18px',
              opacity: 1,
              color: selectedCondition === 'regular' ? '#4CAF50' : '#6B7280',
              fontWeight: 'bold'
            }}>
              Regular
            </span>
          </div>
           <div style={{
             width: '231px',
             height: '54px',
             gap: '8px',
             opacity: 1,
             display: 'flex',
             alignItems: 'center'
           }}>
             <p style={{
               width: '231px',
               fontFamily: 'Poppins',
               fontWeight: 500,
               fontStyle: 'Medium',
               fontSize: '12px',
               lineHeight: '16px',
               letterSpacing: '0%',
               color: '#666666',
               opacity: 1,
               margin: 0
             }}>
               Más de 1 ó 2 áreas dañadas o elementos faltantes y/o no funcionan correctamente.
             </p>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8" style={{
        width: '1129px',
        height: '48px',
        justifyContent: 'space-between',
        opacity: 1
      }}>
        <button 
          onClick={() => setCurrentStep(1)}
          style={{
            width: '153px',
            height: '28px',
            opacity: 1,
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: '15px',
            lineHeight: '27.75px',
            letterSpacing: '0%',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: '#0D0D0D',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
        <button 
          onClick={() => setCurrentStep(3)}
          style={{
            width: '234px',
            height: '48px',
            paddingTop: '10px',
            paddingRight: '20px',
            paddingBottom: '10px',
            paddingLeft: '20px',
            gap: '10px',
            opacity: 1,
            borderRadius: '60px',
            borderWidth: '1px',
            backgroundColor: '#2664C4',
            border: '1px solid #2664C4',
            color: 'white',
            fontFamily: 'Poppins',
            fontWeight: 'normal',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  )

  const renderStep3 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'border-2 border-blue-600' : 'border-2 border-gray-300 bg-white'
          }`} style={{
            backgroundColor: currentStep >= 2 ? '#2664C4' : 'white'
          }}>
            {currentStep >= 2 ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className={`w-2 h-2 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 2 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'border-2 border-blue-600' : 'border-2 border-gray-300 bg-white'
          }`} style={{
            backgroundColor: currentStep >= 3 ? '#2664C4' : 'white'
          }}>
            {currentStep >= 3 ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className={`w-2 h-2 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
          <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 3 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="flex flex-col" style={{
        width: '1140px',
        height: '55px',
        gap: '11px',
        top: '94.5px',
        left: '30px',
        opacity: 1
      }}>
        <h2 style={{
          width: '1140px',
          height: '20px',
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontStyle: 'Bold',
          fontSize: '16px',
          lineHeight: '20px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p style={{
          width: '1140px',
          height: '24px',
          fontFamily: 'Poppins',
          fontWeight: 400,
          fontStyle: 'Regular',
          fontSize: '18px',
          lineHeight: '24px',
          letterSpacing: '0%',
          textAlign: 'center',
          color: '#0D0D0D',
          opacity: 1
        }}>
          Tus datos de contacto
        </p>
      </div>

      {/* Contact Form Fields */}
      <div className="flex justify-center items-center space-x-6" style={{ marginTop: '40px' }}>
        {/* Nombre y apellido */}
        <div className="flex flex-col" style={{ width: '300px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: '14px',
            color: '#0D0D0D',
            marginBottom: '8px'
          }}>
            Nombre y apellido
          </label>
          <div className="relative" style={{
            width: '300px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}>
            <input 
              type="text" 
              placeholder="Nombre y apellido"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: 'none',
                outline: 'none',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col" style={{ width: '300px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: '14px',
            color: '#0D0D0D',
            marginBottom: '8px'
          }}>
            Correo electrónico
          </label>
          <div className="relative" style={{
            width: '300px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}>
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: 'none',
                outline: 'none',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col" style={{ width: '300px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: '14px',
            color: '#0D0D0D',
            marginBottom: '8px'
          }}>
            Ubicación
          </label>
          <div className="relative" style={{
            width: '300px',
            height: '56px',
            paddingTop: '12px',
            paddingRight: '16px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            borderRadius: '7px',
            border: '1px solid #0D0D0D',
            backgroundColor: 'white'
          }}>
            <input 
              type="text" 
              placeholder="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: 'none',
                outline: 'none',
                fontFamily: 'Poppins',
                fontSize: '14px'
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8" style={{
        width: '1129px',
        height: '48px',
        justifyContent: 'space-between',
        opacity: 1
      }}>
        <button 
          onClick={() => setCurrentStep(2)}
          style={{
            width: '153px',
            height: '28px',
            opacity: 1,
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: '15px',
            lineHeight: '27.75px',
            letterSpacing: '0%',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: '#0D0D0D',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
        <button 
          onClick={handleCompleteQuote}
          style={{
            width: '234px',
            height: '48px',
            paddingTop: '10px',
            paddingRight: '20px',
            paddingBottom: '10px',
            paddingLeft: '20px',
            gap: '10px',
            opacity: 1,
            borderRadius: '60px',
            borderWidth: '1px',
            backgroundColor: '#2664C4',
            border: '1px solid #2664C4',
            color: 'white',
            fontFamily: 'Poppins',
            fontWeight: 'normal',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  )

  return (
    <section className="flex items-center justify-center hidden md:flex relative z-20" style={{ height: '400px', marginTop: '-75px', background: 'linear-gradient(to bottom, #DBDBDB 50%, white 50%)' }}>
      <div className="flex items-center" style={{
        width: '1200px',
        height: '400px',
        gap: '50px',
        opacity: 1
      }}>
        {/* Form Container */}
        <div className="bg-white w-full" style={{
          width: '1200px',
          height: '400px',
          borderRadius: '12px',
          border: '1px solid #2664C4',
          boxShadow: '0px 2px 3px 0px #0000004D, 0px 6px 10px 4px #00000026',
          opacity: 1,
          padding: '32px'
        }}>
          {renderStepContent()}
        </div>
      </div>
    </section>
  )
}

export default CarQuote