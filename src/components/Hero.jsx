import React from 'react'

const Hero = () => {
  return (
    <section className="relative bg-white flex items-center justify-center w-full mt-32">
      <div className="flex items-center" style={{
        width: '1200px',
        height: '444px',
        gap: '50px',
        opacity: 1
      }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full h-full">
          
          {/* Left Side - Text Content */}
          <div style={{
            width: '450px',
            height: '444px',
            opacity: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
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
            
            <p className="text-left block" style={{
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
          </div>

          {/* Right Side - Car and Bubbles */}
          <div className="relative flex justify-center lg:justify-end" style={{
            width: '696px',
            height: '444px',
            opacity: 1
          }}>
            
            {/* Car Image */}
            <div className="relative z-10">
              <img 
                src="/hero_image_kars.png" 
                alt="Volkswagen Polo Track" 
                className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-auto"
                style={{
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
            `}</style>

            {/* Top Left Bubble */}
            <div className="absolute shadow-lg z-20" style={{
              backgroundColor: '#DFF1FF',
              width: '320px',
              height: '55px',
              top: '25px',
              left: '25px',
              borderRadius: '12px',
              padding: '12px',
              opacity: 1
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
            <div className="absolute shadow-lg z-20" style={{
              backgroundColor: 'rgba(223, 241, 255, 0.8)',
              width: '459px',
              height: '55px',
              bottom: '25px',
              right: '25px',
              borderRadius: '12px',
              padding: '15px',
              opacity: 1
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
    </section>
  )
}

export default Hero
