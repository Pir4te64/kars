"use client";

import { useState, useRef, useEffect } from "react";
import countries from "@/lib/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Teléfono",
  required = false,
  className = "",
  style = {},
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === "AR") || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar con el valor si existe (solo una vez al montar)
  useEffect(() => {
    if (value) {
      // Extraer país y número del valor existente
      const country = countries.find((c) => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        const number = value.replace(country.dialCode, "").trim();
        setPhoneNumber(formatPhoneNumber(number, country.format));
      } else {
        // Si no hay prefijo, asumir que es solo el número
        setPhoneNumber(value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar el valor completo cuando cambia el país o el número
  useEffect(() => {
    const numbers = phoneNumber.replace(/\D/g, "");
    if (numbers) {
      const fullNumber = selectedCountry.dialCode + " " + numbers;
      if (fullNumber !== value) {
        onChange(fullNumber);
      }
    } else if (phoneNumber === "" && value) {
      // Si se borra el número, limpiar el valor
      onChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, phoneNumber]);

  const formatPhoneNumber = (value: string, format: string): string => {
    // Remover todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, "");
    
    // Aplicar formato según el patrón del país
    if (!format || !numbers) return numbers;
    
    let formatted = "";
    let numberIndex = 0;
    
    for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
      if (format[i] === "x" || format[i] === "X") {
        formatted += numbers[numberIndex];
        numberIndex++;
      } else {
        formatted += format[i];
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue, selectedCountry.format);
    setPhoneNumber(formatted);
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    // Mantener solo los números del número actual
    const numbers = phoneNumber.replace(/\D/g, "");
    const formatted = formatPhoneNumber(numbers, country.format);
    setPhoneNumber(formatted);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative w-full" style={style}>
      <div className="flex items-center h-full">
        {/* Selector de país */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 h-full bg-transparent border-r border-gray-300 hover:bg-gray-50 transition-colors"
            style={{
              borderRight: "1px solid rgba(148, 163, 184, 0.3)",
              minWidth: "100px",
            }}>
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-xs text-gray-600">{selectedCountry.dialCode}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown de países */}
          {isDropdownOpen && (
            <div
              className="absolute bottom-full left-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto"
              style={{
                width: "280px",
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}>
              {/* Lista de países */}
              <div className="max-h-80 overflow-y-auto">
                {countries.map((country) => (
                  <div
                    key={country.code}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedCountry.code === country.code ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleCountrySelect(country)}
                    style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <span className="text-xl flex-shrink-0">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {country.name}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {country.dialCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input de teléfono */}
        <input
          ref={inputRef}
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={`flex-1 h-full bg-transparent text-gray-500 text-sm px-3 ${className}`}
          style={{ border: "none", outline: "none" }}
          required={required}
        />
      </div>
    </div>
  );
}

