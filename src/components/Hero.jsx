import React, { useState } from 'react'

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  return (
    <section className="relative flex items-center justify-center w-full mt-16 md:mt-32 z-10" style={{ backgroundColor: '#DBDBDB', paddingBottom: '150px' }}>
      <div className="flex items-center" style={{
        width: '1200px',
        height: '444px',
        gap: '50px',
        opacity: 1
      }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full h-full md:gap-12 mobile-hero-container">
          
          {/* Left Side - Text Content */}
          <div className="mobile-text-container" style={{
            width: '450px',
            height: '444px',
            opacity: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div className="mobile-title-container" style={{
              width: '450px',
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '56px',
              lineHeight: '110%',
              letterSpacing: '-3%',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ color: 'black', marginBottom: '0', whiteSpace: 'nowrap' }}>Dale un giro a tu</div>
              <div style={{ color: '#3B82F6', marginTop: '0' }}>camino</div>
            </div>
            
            <p className="text-left block mobile-subtitle-container" style={{
              width: '450px',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontStyle: 'Medium',
              fontSize: '18px',
              lineHeight: '22px',
              letterSpacing: '0%',
              opacity: 1,
              color: 'black'
            }}>
              Entrega tu carro usado y súbete hoy mismo al auto que siempre soñaste.
            </p>

            {/* Mobile CTA Button - Only visible on mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="mobile-cta-button w-full bg-primary-600 text-white py-4 px-6 rounded-full font-semibold text-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg"
                style={{
                  backgroundColor: '#2664C4',
                  fontFamily: 'Poppins',
                  fontWeight: 500
                }}
              >
                <span>Comenzar mi nuevo viaje</span>
              </button>
            </div>
          </div>

          {/* Right Side - Car and Bubbles */}
          <div className="relative flex justify-center mobile-car-container" style={{
            width: '696px',
            height: '444px',
            opacity: 1,
            maxWidth: '100%'
          }}>
            
            {/* Car Image */}
            <div className="relative z-10 mobile-car-image">
              <img 
                src="/hero_image_kars.png" 
                alt="Volkswagen Polo Track" 
                className="h-auto"
                style={{
                  width: '100%',
                  maxWidth: '1000px',
                  height: 'auto',
                  objectFit: 'contain',
                  animation: 'slideInFromRight 1.2s ease-out forwards',
                  transform: 'translateX(100%)',
                  opacity: 0
                }}
              />
            </div>
            
            <style jsx>{`
              @keyframes slideInFromRight {
                0% {
                  transform: translateX(100%);
                  opacity: 0;
                }
                100% {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              
              .mobile-hero-container {
                width: 380px;
                height: 467px;
                gap: 22px;
                opacity: 1;
              }
              
              @media (min-width: 768px) {
                .mobile-hero-container {
                  width: 100%;
                  height: 100%;
                  gap: 48px;
                }
              }
              
              .mobile-text-container {
                width: 380px;
                height: 140px;
                gap: 12px;
                opacity: 1;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
              }
              
              @media (min-width: 768px) {
                .mobile-text-container {
                  width: 450px;
                  height: 444px;
                  gap: 28px;
                  justify-content: center;
                }
              }
              
              .mobile-title-container {
                width: 380px;
                height: 80px;
                opacity: 1;
                font-family: Poppins;
                font-weight: 700;
                font-style: Bold;
                font-size: 32px;
                line-height: 40px;
                letter-spacing: 0%;
                vertical-align: middle;
                text-align: left;
                margin-bottom: 0;
              }
              
              @media (min-width: 768px) {
                .mobile-title-container {
                  width: 450px;
                  height: auto;
                  font-size: 56px;
                  line-height: 110%;
                  letter-spacing: -3%;
                  margin-bottom: 28px;
                }
              }
              
              .mobile-subtitle-container {
                width: 380px;
                height: 40px;
                opacity: 1;
                font-family: Poppins;
                font-weight: 500;
                font-style: Medium;
                font-size: 16px;
                line-height: 20px;
                letter-spacing: 0%;
                vertical-align: middle;
                color: black;
                margin: 0;
                padding: 0;
              }
              
              @media (min-width: 768px) {
                .mobile-subtitle-container {
                  width: 450px;
                  height: auto;
                  font-size: 18px;
                  line-height: 22px;
                }
              }
              
              .mobile-cta-button {
                width: 221px;
                height: 36px;
                padding-top: 8px;
                padding-right: 20px;
                padding-bottom: 8px;
                padding-left: 20px;
                gap: 8px;
                opacity: 1;
                border-radius: 30px;
                background-color: #2664C4;
                border: none;
                color: white;
                font-family: Poppins;
                font-weight: 500;
                font-style: Medium;
                font-size: 14px;
                line-height: 16px;
                letter-spacing: 0%;
                text-align: center;
                vertical-align: middle;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .mobile-cta-button span {
                width: 181px;
                height: 16px;
                opacity: 1;
                font-family: Poppins;
                font-weight: 500;
                font-style: Medium;
                font-size: 14px;
                line-height: 16px;
                letter-spacing: 0%;
                text-align: center;
                vertical-align: middle;
                display: block;
              }
              
              .mobile-cta-button:hover {
                background-color: #1e4a8c;
                transform: translateY(-1px);
              }
              
              .mobile-cta-button:active {
                background-color: #1a3d7a;
                transform: translateY(0);
              }
              
              @media (min-width: 768px) {
                .mobile-cta-button {
                  width: 100%;
                  height: auto;
                  padding: 16px 24px;
                  font-size: 18px;
                }
                
                .mobile-cta-button span {
                  width: auto;
                  height: auto;
                  font-size: 18px;
                  line-height: 22px;
                }
              }
              
              .mobile-car-container {
                width: 380px;
                height: 200px;
                opacity: 1;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 10px;
              }
              
              @media (min-width: 768px) {
                .mobile-car-container {
                  width: 696px;
                  height: 444px;
                }
              }
              
              .mobile-bubble-top {
                width: 228px;
                height: 45px;
                gap: 12px;
                opacity: 1;
                border-radius: 12px;
                top: 10px;
                left: 76px;
                padding: 10px;
                background-color: #DFF1FF;
                position: absolute;
                z-index: 20;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              
              @media (min-width: 768px) {
                .mobile-bubble-top {
                  width: 320px;
                  height: 55px;
                  top: 25px;
                  left: 10px;
                  padding: 12px;
                  max-width: calc(100% - 20px);
                }
              }
              
              .mobile-car-image {
                width: 323px;
                height: 180px;
                opacity: 1;
                position: absolute;
                top: 20px;
                left: 28px;
                z-index: 10;
              }
              
              .mobile-car-image img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                animation: slideInFromRight 1.2s ease-out forwards;
                transform: translateX(100%);
                opacity: 0;
              }
              
              @media (min-width: 768px) {
                .mobile-car-image {
                  position: relative;
                  width: 100%;
                  height: auto;
                  top: auto;
                  left: auto;
                }
                
                .mobile-car-image img {
                  width: 100%;
                  max-width: 1000px;
                  height: auto;
                }
              }
              
              .mobile-bubble-bottom {
                width: 176px;
                height: 52px;
                gap: 12px;
                opacity: 1;
                border-radius: 12px;
                top: 150px;
                left: 0px;
                padding: 10px;
                background-color: rgba(223, 241, 255, 0.8);
                position: absolute;
                z-index: 20;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                right: auto;
                bottom: auto;
              }
              
              @media (min-width: 768px) {
                .mobile-bubble-bottom {
                  width: 459px;
                  height: 55px;
                  bottom: 25px;
                  right: 10px;
                  padding: 15px;
                  max-width: calc(100% - 20px);
                  top: auto;
                  left: auto;
                }
              }
            `}</style>

            {/* Top Left Bubble */}
            <div className="absolute shadow-lg z-20 mobile-bubble-top" style={{
              backgroundColor: '#DFF1FF',
              width: '320px',
              height: '55px',
              top: '25px',
              left: '10px',
              borderRadius: '12px',
              padding: '12px',
              opacity: 1,
              maxWidth: 'calc(100% - 20px)'
            }}>
              <div className="flex items-center justify-center" style={{ gap: '12px', width: '100%', height: '100%' }}>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <img 
                    src="/planes_de_pago_a_tu_medida.png" 
                    alt="Planes de pago" 
                    className="w-6 h-6"
                  />
                </div>
                <p style={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontStyle: 'SemiBold',
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  opacity: 1,
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: 'black' }}>PLANES DE </span>
                  <span style={{ color: 'green' }}>PAGO A TU MEDIDA</span>
                </p>
              </div>
            </div>

            {/* Bottom Right Bubble */}
            <div className="absolute shadow-lg z-20 mobile-bubble-bottom hidden md:block" style={{
              backgroundColor: 'rgba(223, 241, 255, 0.8)',
              width: '459px',
              height: '55px',
              bottom: '25px',
              right: '10px',
              borderRadius: '12px',
              padding: '15px',
              opacity: 1,
              maxWidth: 'calc(100% - 20px)'
            }}>
              <div className="flex items-center justify-center" style={{ gap: '12px', width: '100%', height: '100%' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: 'transparent'
                }}>
                  <img 
                    src="/volante_tu_usado_vale_mas.png" 
                    alt="Volante" 
                    className="w-6 h-6"
                  />
                </div>
                <p style={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontStyle: 'SemiBold',
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  opacity: 1,
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: '#2664C4' }}>TU USADO VALE MAS </span>
                  <span style={{ color: 'black' }}>de lo que imaginas</span>
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Quote Modal for Mobile */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Cotizamos tu auto en poco tiempo</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content - Import CarQuote component here */}
            <div className="p-4">
              <p className="text-gray-600 text-center mb-6">
                Te acompañamos en cada paso de tu viaje
              </p>
              
              {/* Simple form for mobile */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Seleccione</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Ford">Ford</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Seleccione</option>
                    <option value="Polo">Polo</option>
                    <option value="Golf">Golf</option>
                    <option value="Jetta">Jetta</option>
                    <option value="Onix">Onix</option>
                    <option value="Cruze">Cruze</option>
                    <option value="Spark">Spark</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Seleccione</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kilometraje</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Seleccione</option>
                    <option value="0 - 10,000">0 - 10,000 km</option>
                    <option value="10,001 - 30,000">10,001 - 30,000 km</option>
                    <option value="30,001 - 50,000">30,001 - 50,000 km</option>
                    <option value="50,001 - 80,000">50,001 - 80,000 km</option>
                  </select>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowQuoteModal(false)
                    // Navigate to full quote page
                    window.location.href = '/vende-tu-auto'
                  }}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                  style={{ backgroundColor: '#2664C4' }}
                >
                  Comenzar cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Hero
