import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    'Cómo funciona',
    'Beneficios',
    'Nosotros',
    'Contacto',
    'Vende tu auto',
    'Vehículos en venta'
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavItemClick = (item) => {
    if (location.pathname !== '/') {
      // Si estamos en una página diferente a la principal, navegar a la principal primero
      navigate('/')
      // Esperar un poco para que la navegación se complete antes de hacer scroll
      setTimeout(() => {
        if (item === 'Cómo funciona') {
          scrollToSection('como-funciona')
        } else {
          scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))
        }
      }, 100)
    } else {
      // Si estamos en la página principal, hacer scroll directamente
      if (item === 'Cómo funciona') {
        scrollToSection('como-funciona')
      } else {
        scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))
      }
    }
  }

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/')
    } else {
      // Si ya estamos en la página principal, hacer scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white shadow-lg z-50 w-full max-w-7xl h-16 px-4 md:px-32 py-4">
      <div className="w-full h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={handleLogoClick} className="cursor-pointer">
              <Logo className="h-10" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.slice(0, 4).map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavItemClick(item)}
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 text-sm font-medium cursor-pointer"
                  style={{
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    lineHeight: '1.2'
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/vende-tu-auto')}
                className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Vende tu auto
              </button>
              <button 
                onClick={() => handleNavItemClick('Vehículos en venta')}
                className="bg-white text-gray-900 border border-gray-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Vehículos en venta
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              {navItems.slice(0, 4).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    handleNavItemClick(item)
                    setIsMenuOpen(false)
                  }}
                  className="text-gray-700 hover:text-primary-600 block px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 w-full text-left cursor-pointer hover:bg-gray-50"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => {
                  navigate('/vende-tu-auto')
                  setIsMenuOpen(false)
                }}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 hover:bg-primary-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 14a3 3 0 016 0v3H7v-3zM14 14a3 3 0 016 0v3h-6v-3z" />
                </svg>
                Vende tu auto
              </button>
              
              <button 
                onClick={() => {
                  handleNavItemClick('Vehículos en venta')
                  setIsMenuOpen(false)
                }}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors duration-200 border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Vehículos en venta
              </button>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda?</p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="tel:+59812345678" 
                    className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">Llamar</span>
                  </a>
                  <a 
                    href="https://wa.me/59812345678" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
