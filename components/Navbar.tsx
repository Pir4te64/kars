"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  "Cómo funciona",
  "Beneficios",
  "Nosotros",
  "Contacto",
  "Vende tu auto",
  "Vehículos en venta",
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavItemClick = (item: string) => {
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        if (item === "Cómo funciona") {
          scrollToSection("como-funciona");
        } else if (item === "Contacto") {
          scrollToSection("ubicacion");
        } else {
          scrollToSection(item.toLowerCase().replace(/\s+/g, "-"));
        }
      }, 100);
    } else {
      if (item === "Cómo funciona") {
        scrollToSection("como-funciona");
      } else if (item === "Contacto") {
        scrollToSection("ubicacion");
      } else {
        scrollToSection(item.toLowerCase().replace(/\s+/g, "-"));
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="px-4 sm:px-6 md:px-12">
        <div className="relative flex items-center justify-between h-16 sm:h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center justify-center flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item}
                onClick={() => handleNavItemClick(item)}
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-full hover:text-primary-600 hover:bg-gray-50">
                {item}
              </button>
            ))}
          </div>

          {/* Action Buttons - Right Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3">
            {/* <button
              onClick={() => handleNavItemClick('Vende tu auto')}
              className="px-5 py-2 text-sm font-medium text-white transition-colors duration-200 rounded-full bg-primary-600 hover:bg-primary-700"
            >
              Vende tu auto
            </button> */}
            <button
              onClick={() => handleNavItemClick("Vehículos en venta")}
              className="px-5 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 bg-white border border-gray-800 rounded-full hover:bg-gray-50">
              Vehículos en venta
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-3 text-gray-700 transition-colors duration-200 hover:text-primary-600 focus:outline-none focus:text-primary-600"
              aria-label="Abrir menú">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation: Sheet con cotizador */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-[90vw] sm:w-[24rem] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Menú y Cotizador</SheetTitle>
          </SheetHeader>

          <div className="h-full overflow-y-auto">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="space-y-3">
                {navItems.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      handleNavItemClick(item);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-3 py-3 text-base font-medium text-left text-gray-700 transition-colors duration-200 rounded-lg cursor-pointer hover:text-primary-600 hover:bg-gray-50">
                    {item}
                  </button>
                ))}
              </div>

              <div className="my-4 border-t mr-52 border-gray-200"></div>

              <div className="space-y-3 mr-70">
                {/* <button
                  onClick={() => {
                    handleNavItemClick("Vende tu auto");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors duration-200 rounded-lg bg-primary-600 hover:bg-primary-700">
                  Vende tu auto
                </button> */}

                <button
                  onClick={() => {
                    handleNavItemClick("Vehículos en venta");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 font-medium text-gray-900 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Vehículos en venta
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="mb-2 text-sm text-gray-600">
                    ¿Necesitas ayuda?
                  </p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href="tel:+59812345678"
                      className="flex items-center transition-colors text-primary-600 hover:text-primary-700">
                      <span className="text-sm">Llamar</span>
                    </a>
                    <a
                      href="https://wa.me/59812345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 transition-colors hover:text-green-700">
                      <span className="text-sm">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
