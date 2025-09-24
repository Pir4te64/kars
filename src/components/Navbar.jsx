import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    "Cómo funciona",
    "Beneficios",
    "Nosotros",
    // "Contacto",
    // "Vende tu auto",
    // "Vehículos en venta",
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavItemClick = (item) => {
    if (location.pathname !== "/") {
      // Si estamos en una página diferente a la principal, navegar a la principal primero
      navigate("/");
      // Esperar un poco para que la navegación se complete antes de hacer scroll
      setTimeout(() => {
        if (item === "Cómo funciona") {
          scrollToSection("como-funciona");
        } else {
          scrollToSection(item.toLowerCase().replace(/\s+/g, "-"));
        }
      }, 100);
    } else {
      // Si estamos en la página principal, hacer scroll directamente
      if (item === "Cómo funciona") {
        scrollToSection("como-funciona");
      } else {
        scrollToSection(item.toLowerCase().replace(/\s+/g, "-"));
      }
    }
  };

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      // Si ya estamos en la página principal, hacer scroll al inicio
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="absolute top-0 z-50 transform -translate-x-1/2 bg-white shadow-lg left-1/2"
      style={{
        width: "100%",
        maxWidth: "1440px",
        height: "66px",
        paddingTop: "15px",
        paddingRight: "120px",
        paddingBottom: "15px",
        paddingLeft: "120px",
        gap: "206px",
        opacity: 1,
      }}>
      <div className="w-full h-full">
        <div
          className="flex items-center justify-between h-full"
          style={{
            justifyContent: "space-between",
            gap: "206px",
          }}>
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
                  className="text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer hover:text-primary-600"
                  style={{
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    lineHeight: "1.2",
                  }}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/vende-tu-auto")}
                className="text-white transition-colors duration-200 cursor-pointer"
                style={{
                  width: "140px",
                  height: "36px",
                  paddingTop: "8px",
                  paddingRight: "20px",
                  paddingBottom: "8px",
                  paddingLeft: "20px",
                  gap: "8px",
                  opacity: 1,
                  borderRadius: "30px",
                  backgroundColor: "#2664C4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <span
                  style={{
                    width: "100px",
                    height: "16px",
                    opacity: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "16px",
                    letterSpacing: "0%",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}>
                  Vende tu auto
                </span>
              </button>
              {/* <button className="text-gray-900 transition-colors duration-200 bg-white" style={{
                width: '175px',
                height: '36px',
                paddingTop: '8px',
                paddingRight: '20px',
                paddingBottom: '8px',
                paddingLeft: '20px',
                gap: '8px',
                opacity: 1,
                borderRadius: '30px',
                border: '1px solid #202124',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  opacity: 1,
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '16px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  color: '#202124',
                  whiteSpace: 'nowrap'
                }}>
                  Vehículos en venta
                </span>
              </button> */}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t sm:px-3">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  handleNavItemClick(item);
                  setIsMenuOpen(false);
                }}
                className="block w-full px-3 py-2 text-base font-medium text-left text-gray-700 transition-colors duration-200 rounded-md cursor-pointer hover:text-primary-600">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
