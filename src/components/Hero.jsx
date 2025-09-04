import React from 'react'

const Hero = () => {
  return (
    <section className="relative mx-auto px-4 sm:px-6 lg:px-32" style={{
      maxWidth: '1440px',
      width: '100%',
      height: '600px',
      paddingTop: '36px',
      paddingBottom: '153px',
      gap: '26px',
      opacity: 1
    }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero_image.jpg)' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Hero Text Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Vende tu auto en minutos,
        </h1>
        <p className="text-xl md:text-2xl text-white font-normal leading-relaxed">
          con pago seguro e inmediato
        </p>
      </div>
    </section>
  )
}

export default Hero
