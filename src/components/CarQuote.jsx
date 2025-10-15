"use client"

import React, { useState, useEffect, useRef } from "react";
import { useCarInfo } from "../hooks/useCarInfo";
import { useRouter } from "next/navigation";

const CarQuote = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState("excelente");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef(null);
  const router = useRouter();
  const {
    brands,
    models,
    groups,
    years,
    loadingBrands,
    loadingGroups,
    loadingModels,
    getModel,
    getGroup,
    getModelsByBrand,
    getPrice,
  } = useCarInfo();
  // Estados para capturar los datos del formulario
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    año: "",
    version: "",
    kilometraje: "",
    grupo: "",
    precio: "",
    nombre: "",
    email: "",
    ubicacion: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      // Si cambia la marca, limpiar modelo y cargar modelos directamente
      if (field === "marca") {
        getModelsByBrand(value);
        setIsModelDropdownOpen(false); // Cerrar dropdown al cambiar marca
        return {
          ...prev,
          marca: value,
          modelo: "", // Limpiar modelo al cambiar marca
        };
      }
      if (field === "modelo") {
        console.log(field, value);
        getPrice(value);
        setIsModelDropdownOpen(false); // Cerrar dropdown al seleccionar modelo
        return {
          ...prev,
          modelo: value,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Función para manejar la selección de modelo
  const handleModelSelect = (model) => {
    handleInputChange("modelo", model.codia);
  };

  // Función para obtener el texto del modelo seleccionado
  const getSelectedModelText = () => {
    if (!formData.modelo) return "Modelo";
    const selectedModel = models.find((item) => item.codia === formData.modelo);
    return selectedModel ? selectedModel.description : "Modelo";
  };

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Función para guardar los datos y navegar al resultado
  const handleCompleteQuote = () => {
    // console.log(formData);
    if (years && years.length > 0 && formData.año) {
      const yearData = years.filter((item) => item.year == formData.año)[0];
      if (yearData) {
        formData.precio = yearData.price;
      }
    }

    if (brands && brands.length > 0 && formData.marca) {
      const brandData = brands.filter(
        (item) => item.id == formData.marca || item.name == formData.marca
      )[0];
      if (brandData) {
        formData.marca = brandData.name;
      }
    }

    if (models && models.length > 0 && formData.modelo) {
      const modelData = models.filter(
        (item) =>
          item.codia == formData.modelo || item.description == formData.modelo
      )[0];
      if (modelData) {
        formData.modelo = modelData.description;
      }
    }

    // Guardar en localStorage
    localStorage.removeItem("quoteData");
    localStorage.setItem("quoteData", JSON.stringify(formData));

    // Navegar a la página de resultado
    router.push('/cotizar/resultado')
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return renderStep1();
    } else if (currentStep === 2) {
      return renderStep3();
    }
    return null;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 3 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </div>
      {/* Title and Subtitle */}
      <div
        className="flex flex-col w-full px-4"
        style={{
          gap: "11px",
          opacity: 1,
        }}
      >
        <h2
          className="text-sm md:text-base font-bold text-center text-gray-900"
          style={{
            fontFamily: "Poppins",
            fontWeight: 700,
            lineHeight: "20px",
            letterSpacing: "0%",
          }}
        >
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p
          className="text-base md:text-lg text-center text-gray-900"
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0%",
          }}
        >
          Te acompañamos en cada paso de tu viaje
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4" style={{ marginTop: "40px" }}>
        {/* First Row - Marca, Modelo, Año */}
        <div
          className="flex flex-col md:flex-row justify-center mx-auto w-full max-w-4xl gap-2 md:gap-3"
          style={{
            opacity: 1,
          }}
        >
          {/* Marca */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              gap: "4px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              opacity: 1,
            }}
          >
            <select
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}
              disabled={loadingBrands}
            >
              <option value="">Marca</option>
              {brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <option key={brand.id || brand.name} value={brand.id}>
                    {brand.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {loadingBrands
                    ? "Cargando marcas..."
                    : "No hay marcas disponibles"}
                </option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Modelo */}
          <div
            ref={modelDropdownRef}
            className="relative w-full md:w-1/3"
            style={{
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              gap: "4px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              opacity: 1,
              cursor:
                formData.marca && !loadingModels ? "pointer" : "not-allowed",
            }}
          >
            {/* Dropdown personalizado */}
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer"
              onClick={() => {
                if (formData.marca && !loadingModels && models.length > 0) {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                }
              }}
              style={{
                cursor:
                  formData.marca && !loadingModels && models.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <span
                className={`${
                  formData.modelo ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {loadingModels
                  ? "Cargando modelos..."
                  : !formData.marca
                  ? "Modelo"
                  : models.length === 0
                  ? "No hay modelos disponibles"
                  : getSelectedModelText()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isModelDropdownOpen ? "rotate-180" : ""
                } ${
                  formData.marca && !loadingModels && models.length > 0
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Dropdown Options */}
            {isModelDropdownOpen && formData.marca && models.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  borderRadius: "7px",
                  border: "1px solid #0D0D0D",
                }}
              >
                {models.map((item) => (
                  <div
                    key={item.id || item.codia}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                    onClick={() => handleModelSelect(item)}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <span className="text-gray-900">{item.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Año */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              gap: "4px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              opacity: 1,
            }}
          >
            <select
              value={formData.año}
              onChange={(e) =>
                setFormData({ ...formData, año: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}
            >
              <option value="">Año</option>
              {years.map((year, i) => {
                return (
                  <option key={year.year} value={year.year}>
                    {year.year}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Second Row - Versión, Kilometraje, Button */}
        <div
          className="flex flex-col md:flex-row justify-center items-center mx-auto w-full max-w-4xl gap-2 md:gap-3"
          style={{
            opacity: 1,
          }}
        >
          {/* Versión */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              gap: "4px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              opacity: 1,
            }}
          >
            <select
              value={formData.version}
              onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}
            >
              <option value="">Versión</option>
              <option value="base">Base</option>
              <option value="intermedio">Intermedio</option>
              <option value="alto">Alto</option>
              <option value="premium">Premium</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Kilometraje */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              gap: "4px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              opacity: 1,
            }}
          >
            <select
              value={formData.kilometraje}
              onChange={(e) =>
                setFormData({ ...formData, kilometraje: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}
            >
              <option value="">Kilometraje</option>
              <option value="0-10000">0 - 10,000 km</option>
              <option value="10000-25000">10,000 - 25,000 km</option>
              <option value="25000-50000">25,000 - 50,000 km</option>
              <option value="50000-75000">50,000 - 75,000 km</option>
              <option value="75000-100000">75,000 - 100,000 km</option>
              <option value="100000+">Más de 100,000 km</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Button */}
          <button
            className="text-white font-bold transition-colors duration-200 w-full md:w-auto"
            onClick={() => setCurrentStep(2)}
            style={{
              height: "48px",
              paddingTop: "10px",
              paddingRight: "20px",
              paddingBottom: "10px",
              paddingLeft: "20px",
              gap: "10px",
              borderRadius: "60px",
              borderWidth: "1px",
              border: "1px solid #2664C4",
              backgroundColor: "#2664C4",
              opacity: 1,
            }}
          >
            Comenzar cotización
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600"
                : currentStep >= 1
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
            style={{
              backgroundColor: currentStep >= 2 ? "#2664C4" : "white",
            }}
          >
            {currentStep >= 2 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <div
                className={`w-2 h-2 rounded-full ${
                  currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 3 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div
        className="flex flex-col"
        style={{
          width: "1140px",
          height: "55px",
          gap: "11px",
          top: "94.5px",
          left: "30px",
          opacity: 1,
        }}
      >
        <h2
          style={{
            width: "1140px",
            height: "20px",
            fontFamily: "Poppins",
            fontWeight: 700,
            fontStyle: "Bold",
            fontSize: "16px",
            lineHeight: "20px",
            letterSpacing: "0%",
            textAlign: "center",
            color: "#0D0D0D",
            opacity: 1,
          }}
        >
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p
          style={{
            width: "1140px",
            height: "24px",
            fontFamily: "Poppins",
            fontWeight: 400,
            fontStyle: "Regular",
            fontSize: "18px",
            lineHeight: "24px",
            letterSpacing: "0%",
            textAlign: "center",
            color: "#0D0D0D",
            opacity: 1,
          }}
        >
          Estado general de tu auto
        </p>
      </div>

      {/* Condition Cards */}
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6"
        style={{ marginTop: "40px" }}
      >
        {/* Excelente */}
        <div
          className="cursor-pointer w-full md:w-80"
          onClick={() => setSelectedCondition("excelente")}
          style={{
            height: "96px",
            paddingTop: "12px",
            paddingRight: "16px",
            paddingBottom: "12px",
            paddingLeft: "16px",
            gap: "4px",
            borderRadius: "7px",
            border: "1px solid #0D0D0D",
            backgroundColor: "white",
          }}
        >
          <div
            className="flex items-center justify-between mb-3"
            style={{
              width: "231px",
              height: "18px",
              justifyContent: "space-between",
              opacity: 1,
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                gap: "10px",
                borderRadius: "200px",
                padding: "3px",
                border:
                  selectedCondition === "excelente"
                    ? "3px solid #04BD88"
                    : "3px solid #D1D5DB",
                opacity: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedCondition === "excelente" && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#04BD88",
                  }}
                ></div>
              )}
            </div>
            <span
              style={{
                width: "70px",
                height: "18px",
                opacity: 1,
                color:
                  selectedCondition === "excelente" ? "#4CAF50" : "#6B7280",
                fontWeight: "bold",
              }}
            >
              Excelente
            </span>
          </div>
          <div
            style={{
              width: "231px",
              height: "54px",
              gap: "8px",
              opacity: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                width: "231px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontStyle: "Medium",
                fontSize: "12px",
                lineHeight: "16px",
                letterSpacing: "0%",
                color: "#666666",
                opacity: 1,
                margin: 0,
              }}
            >
              Todo en excelentes condiciones. No le falta ningún accesorio y
              todo funciona correctamente.
            </p>
          </div>
        </div>

        {/* Bueno */}
        <div
          className="cursor-pointer w-full md:w-80"
          onClick={() => setSelectedCondition("bueno")}
          style={{
            height: "96px",
            paddingTop: "12px",
            paddingRight: "16px",
            paddingBottom: "12px",
            paddingLeft: "16px",
            gap: "4px",
            borderRadius: "7px",
            border: "1px solid #0D0D0D",
            backgroundColor: "white",
          }}
        >
          <div
            className="flex items-center justify-between mb-3"
            style={{
              width: "231px",
              height: "18px",
              justifyContent: "space-between",
              opacity: 1,
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                gap: "10px",
                borderRadius: "200px",
                padding: "3px",
                border:
                  selectedCondition === "bueno"
                    ? "3px solid #04BD88"
                    : "3px solid #D1D5DB",
                opacity: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedCondition === "bueno" && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#04BD88",
                  }}
                ></div>
              )}
            </div>
            <span
              style={{
                width: "70px",
                height: "18px",
                opacity: 1,
                color: selectedCondition === "bueno" ? "#4CAF50" : "#6B7280",
                fontWeight: "bold",
              }}
            >
              Bueno
            </span>
          </div>
          <div
            style={{
              width: "231px",
              height: "54px",
              opacity: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                width: "231px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontStyle: "Medium",
                fontSize: "12px",
                lineHeight: "16px",
                letterSpacing: "0%",
                color: "#666666",
                opacity: 1,
                margin: 0,
              }}
            >
              Sólo 1 ó 2 áreas dañadas o elementos faltantes y/o que no
              funcionan correctamente.
            </p>
          </div>
        </div>

        {/* Regular */}
        <div
          className="cursor-pointer w-full md:w-80"
          onClick={() => setSelectedCondition("regular")}
          style={{
            height: "96px",
            paddingTop: "12px",
            paddingRight: "16px",
            paddingBottom: "12px",
            paddingLeft: "16px",
            gap: "4px",
            borderRadius: "7px",
            border: "1px solid #0D0D0D",
            backgroundColor: "white",
          }}
        >
          <div
            className="flex items-center justify-between mb-3"
            style={{
              width: "231px",
              height: "18px",
              justifyContent: "space-between",
              opacity: 1,
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                gap: "10px",
                borderRadius: "200px",
                padding: "3px",
                border:
                  selectedCondition === "regular"
                    ? "3px solid #04BD88"
                    : "3px solid #D1D5DB",
                opacity: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedCondition === "regular" && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#04BD88",
                  }}
                ></div>
              )}
            </div>
            <span
              style={{
                width: "70px",
                height: "18px",
                opacity: 1,
                color: selectedCondition === "regular" ? "#4CAF50" : "#6B7280",
                fontWeight: "bold",
              }}
            >
              Regular
            </span>
          </div>
          <div
            style={{
              width: "231px",
              height: "54px",
              gap: "8px",
              opacity: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                width: "231px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontStyle: "Medium",
                fontSize: "12px",
                lineHeight: "16px",
                letterSpacing: "0%",
                color: "#666666",
                opacity: 1,
                margin: 0,
              }}
            >
              Más de 1 ó 2 áreas dañadas o elementos faltantes y/o no funcionan
              correctamente.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex flex-col md:flex-row justify-between items-center mt-8 w-full gap-4"
        style={{
          height: "48px",
          opacity: 1,
        }}
      >
        <button
          className="w-full md:w-auto"
          onClick={() => setCurrentStep(1)}
          style={{
            height: "28px",
            opacity: 1,
            fontFamily: "Poppins",
            fontWeight: 500,
            fontStyle: "Medium",
            fontSize: "15px",
            lineHeight: "27.75px",
            letterSpacing: "0%",
            textAlign: "center",
            verticalAlign: "middle",
            color: "#0D0D0D",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Volver
        </button>
        <button
          className="w-full md:w-auto"
          onClick={() => setCurrentStep(3)}
          style={{
            height: "48px",
            paddingTop: "10px",
            paddingRight: "20px",
            paddingBottom: "10px",
            paddingLeft: "20px",
            gap: "10px",
            opacity: 1,
            borderRadius: "60px",
            borderWidth: "1px",
            backgroundColor: "#2664C4",
            border: "1px solid #2664C4",
            color: "white",
            fontFamily: "Poppins",
            fontWeight: "normal",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1
                ? "border-2 border-blue-600"
                : "border-2 border-gray-300 bg-white"
            }`}
            style={{
              backgroundColor: currentStep >= 2 ? "#2664C4" : "white",
            }}
          >
            {currentStep >= 2 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <div
                className={`w-2 h-2 rounded-full ${
                  currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600"
                : "border-2 border-gray-300 bg-white"
            }`}
            style={{
              backgroundColor: currentStep >= 3 ? "#2664C4" : "white",
            }}
          >
            {currentStep >= 3 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <div
                className={`w-2 h-2 rounded-full ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>

          {/* Step 3 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div
        className="flex flex-col"
        style={{
          width: "1140px",
          height: "55px",
          gap: "11px",
          top: "94.5px",
          left: "30px",
          opacity: 1,
        }}
      >
        <h2
          style={{
            width: "1140px",
            height: "20px",
            fontFamily: "Poppins",
            fontWeight: 700,
            fontStyle: "Bold",
            fontSize: "16px",
            lineHeight: "20px",
            letterSpacing: "0%",
            textAlign: "center",
            color: "#0D0D0D",
            opacity: 1,
          }}
        >
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p
          style={{
            width: "1140px",
            height: "24px",
            fontFamily: "Poppins",
            fontWeight: 400,
            fontStyle: "Regular",
            fontSize: "18px",
            lineHeight: "24px",
            letterSpacing: "0%",
            textAlign: "center",
            color: "#0D0D0D",
            opacity: 1,
          }}
        >
          Tus datos de contacto
        </p>
      </div>

      {/* Contact Form Fields */}
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6"
        style={{ marginTop: "40px" }}
      >
        {/* Nombre y apellido */}
        <div className="flex flex-col w-full md:w-80">
          <label
            style={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "#0D0D0D",
              marginBottom: "8px",
            }}
          >
            Nombre y apellido
          </label>
          <div
            className="relative"
            style={{
              width: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}
          >
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
                fontFamily: "Poppins",
                fontSize: "14px",
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col w-full md:w-80">
          <label
            style={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "#0D0D0D",
              marginBottom: "8px",
            }}
          >
            Correo electrónico
          </label>
          <div
            className="relative"
            style={{
              width: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}
          >
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
                fontFamily: "Poppins",
                fontSize: "14px",
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col w-full md:w-80">
          <label
            style={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "#0D0D0D",
              marginBottom: "8px",
            }}
          >
            Ubicación
          </label>
          <div
            className="relative"
            style={{
              width: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}
          >
            <input
              type="text"
              placeholder="Ubicación"
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData({ ...formData, ubicacion: e.target.value })
              }
              className="w-full h-full bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
                fontFamily: "Poppins",
                fontSize: "14px",
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex flex-col md:flex-row justify-between items-center mt-8 w-full gap-4"
        style={{
          height: "48px",
          opacity: 1,
        }}
      >
        <button
          className="w-full md:w-auto"
          onClick={() => setCurrentStep(1)}
          style={{
            height: "28px",
            opacity: 1,
            fontFamily: "Poppins",
            fontWeight: 500,
            fontStyle: "Medium",
            fontSize: "15px",
            lineHeight: "27.75px",
            letterSpacing: "0%",
            textAlign: "center",
            verticalAlign: "middle",
            color: "#0D0D0D",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Volver
        </button>
        <button
          className="w-full md:w-auto"
          onClick={handleCompleteQuote}
          style={{
            height: "48px",
            paddingTop: "10px",
            paddingRight: "20px",
            paddingBottom: "10px",
            paddingLeft: "20px",
            gap: "10px",
            opacity: 1,
            borderRadius: "60px",
            borderWidth: "1px",
            backgroundColor: "#2664C4",
            border: "1px solid #2664C4",
            color: "white",
            fontFamily: "Poppins",
            fontWeight: "normal",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  return (
    <section
      className="flex items-center justify-center px-4 py-8 md:py-0 mt-0 md:mt-0"
      style={{
        minHeight: "400px",
        background: "linear-gradient(to bottom, #e5e5e5 50%, white 50%)",
      }}
    >
      <div
        className="flex items-center w-full max-w-7xl"
        style={{
          gap: "50px",
          opacity: 1,
        }}
      >
        {/* Form Container */}
        <div
          className="bg-white w-full mx-auto"
          style={{
            maxWidth: "1200px",
            minHeight: "400px",
            borderRadius: "12px",
            border: "1px solid #2664C4",
            boxShadow: "0px 2px 3px 0px #0000004D, 0px 6px 10px 4px #00000026",
            opacity: 1,
            padding: "16px",
          }}
        >
          {renderStepContent()}
        </div>
      </div>
    </section>
  );
};

export default CarQuote;
