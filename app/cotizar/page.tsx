"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCarInfo } from "@/hooks/useCarInfo";
import type { Brand, Model, YearPrice } from "@/types/car";

export default function CotizarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState("excelente");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const {
    brands,
    models,
    years,
    loadingBrands,
    loadingModels,
    getModelsByBrand,
    getPrice,
  } = useCarInfo();

  // Tipos explícitos para evitar errores de TypeScript
  const typedBrands: Brand[] = brands || [];
  const typedModels: Model[] = models || [];
  const typedYears: YearPrice[] = years || [];

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
    localidadId: "",
    localidadNombre: "",
    provinciaNombre: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === "marca") {
        // Nota: getModelsByBrand requiere brandId y groupId
        // Este componente parece usar un flujo diferente, así que no llamamos aquí
        // Se llamará cuando se seleccione el grupo
        setIsModelDropdownOpen(false);
        return {
          ...prev,
          marca: value,
          modelo: "",
        };
      }
      if (field === "modelo") {
        console.log(field, value);
        getPrice(value);
        setIsModelDropdownOpen(false);
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

  const handleModelSelect = (model: any) => {
    handleInputChange("modelo", model.codia);
  };

  const getSelectedModelText = () => {
    if (!formData.modelo) return "Modelo";
    const selectedModel = typedModels.find(
      (item) => item.codia === formData.modelo
    );
    return selectedModel ? selectedModel.description : "Modelo";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
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

  const handleCompleteQuote = () => {
    const updatedFormData = { ...formData };

    // Asegurar que el precio esté guardado antes de completar
    if (typedYears && typedYears.length > 0 && formData.año) {
      const yearData = typedYears.find(
        (item) => item.year === Number(formData.año)
      );
      console.log("📋 Completando cotización - año:", formData.año);
      console.log("📋 Datos del año encontrado:", yearData);
      console.log("📋 Precio actual en formData:", formData.precio);
      
      if (yearData) {
        // Guardar el precio numérico (USD) para los cálculos en el resultado
        // Priorizar priceValue (el precio numérico directo)
        let precioFinal: string | null = null;
        
        if (yearData.priceValue !== null && yearData.priceValue !== undefined && !isNaN(Number(yearData.priceValue))) {
          precioFinal = String(yearData.priceValue);
          console.log("✅ Precio final guardado desde priceValue:", precioFinal);
        } else if (yearData.price && yearData.price !== "Consultar") {
          // Extraer el número del string formateado (ej: "$7,700" -> 7700)
          const numericPrice = yearData.price.replace(/[^0-9]/g, "");
          if (numericPrice && numericPrice !== "" && !isNaN(Number(numericPrice))) {
            precioFinal = numericPrice;
            console.log("✅ Precio final extraído del string:", precioFinal);
          } else {
            console.warn("⚠️ No se pudo extraer precio válido del string:", yearData.price);
          }
        } else {
          console.warn("⚠️ No se encontró precio en yearData. yearData:", yearData);
        }
        
        // Solo actualizar si tenemos un precio válido
        if (precioFinal !== null && precioFinal !== "" && !isNaN(Number(precioFinal))) {
          updatedFormData.precio = precioFinal;
        } else {
          console.error("❌ No se pudo obtener precio válido. Usando precio actual o 0");
          if (!updatedFormData.precio || updatedFormData.precio === "" || updatedFormData.precio === "NaN" || isNaN(Number(updatedFormData.precio))) {
            updatedFormData.precio = "0";
          }
        }
      } else {
        console.warn("⚠️ No se encontró yearData para el año:", formData.año);
        console.warn("⚠️ typedYears disponibles:", typedYears);
        if (!updatedFormData.precio || updatedFormData.precio === "" || updatedFormData.precio === "NaN" || isNaN(Number(updatedFormData.precio))) {
          updatedFormData.precio = "0";
        }
      }
    } else if (!updatedFormData.precio || updatedFormData.precio === "") {
      updatedFormData.precio = "0";
      console.warn("⚠️ No hay año seleccionado o años disponibles, usando precio 0");
    }
    
    console.log("💾 Datos finales a guardar:", updatedFormData);

    if (typedBrands && typedBrands.length > 0 && formData.marca) {
      const brandData = typedBrands.find(
        (item) =>
          item.id.toString() === formData.marca || item.name === formData.marca
      );
      if (brandData) {
        updatedFormData.marca = brandData.name;
      }
    }

    if (typedModels && typedModels.length > 0 && formData.modelo) {
      const modelData = typedModels.find(
        (item) =>
          item.codia === formData.modelo || item.description === formData.modelo
      );
      if (modelData) {
        updatedFormData.modelo = modelData.description;
      }
    }

    console.log("💾 Guardando en localStorage:", updatedFormData);
    console.log("💰 Precio que se guarda:", updatedFormData.precio);
    
    localStorage.removeItem("quoteData");
    localStorage.setItem("quoteData", JSON.stringify(updatedFormData));
    
    // Verificar que se guardó correctamente
    const verify = localStorage.getItem("quoteData");
    if (verify) {
      const parsed = JSON.parse(verify);
      console.log("✅ Verificación - Datos guardados:", parsed);
      console.log("✅ Verificación - Precio guardado:", parsed.precio);
    }

    router.push("/cotizar/resultado");
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
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
              }`}></div>
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}></div>

          {/* Step 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}></div>
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}></div>

          {/* Step 3 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
              }`}></div>
          </div>
        </div>
      </div>
      {/* Title and Subtitle */}
      <div
        className="flex flex-col w-full px-4"
        style={{
          gap: "11px",
          opacity: 1,
        }}>
        <h2
          className="text-sm md:text-base font-bold text-center text-gray-900"
          style={{
            fontFamily: "Poppins",
            fontWeight: 700,
            lineHeight: "20px",
            letterSpacing: "0%",
          }}>
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p
          className="text-base md:text-lg text-center text-gray-900"
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0%",
          }}>
          Te acompañamos en cada paso de tu viaje
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4" style={{ marginTop: "40px" }}>
        {/* First Row - Marca, Año, Modelo */}
        <div
          className="flex flex-col md:flex-row justify-center mx-auto w-full max-w-4xl gap-2 md:gap-3"
          style={{
            opacity: 1,
          }}>
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
            }}>
            <select
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}
              disabled={loadingBrands}>
              <option value="">Marca</option>
              {typedBrands && typedBrands.length > 0 ? (
                typedBrands
                  .filter((brand) =>
                    ["FORD", "HONDA", "PEUGEOT", "CHEVROLET"].includes(
                      brand.name
                    )
                  )
                  .map((brand) => (
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
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
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
            }}>
            <select
              value={formData.año}
              onChange={(e) => {
                const selectedYear = e.target.value;
                
                // Actualizar el precio cuando se selecciona un año
                if (selectedYear && typedYears.length > 0) {
                  const yearData = typedYears.find(
                    (item) => item.year === Number(selectedYear)
                  );
                  console.log("📅 Año seleccionado:", selectedYear);
                  console.log("💰 Datos del año:", yearData);
                  
                  if (yearData) {
                    let precioToSave: string | null = null;
                    
                    // Guardar el precio numérico (USD) para los cálculos
                    // Verificar que priceValue sea un número válido
                    if (yearData.priceValue !== null && yearData.priceValue !== undefined && !isNaN(Number(yearData.priceValue))) {
                      precioToSave = String(yearData.priceValue);
                      console.log("✅ Precio guardado desde priceValue:", precioToSave);
                    } else if (yearData.price && yearData.price !== "Consultar") {
                      // Extraer el número del string formateado (ej: "$7,700" -> 7700)
                      const numericPrice = yearData.price.replace(/[^0-9]/g, "");
                      if (numericPrice && numericPrice !== "" && !isNaN(Number(numericPrice))) {
                        precioToSave = numericPrice;
                        console.log("✅ Precio extraído del string:", precioToSave);
                      } else {
                        console.warn("⚠️ No se pudo extraer precio válido del string:", yearData.price);
                      }
                    } else {
                      console.warn("⚠️ No se encontró precio para el año", selectedYear, "yearData:", yearData);
                    }
                    
                    // Solo actualizar si tenemos un precio válido
                    if (precioToSave !== null && precioToSave !== "" && !isNaN(Number(precioToSave))) {
                      setFormData((prev) => ({
                        ...prev,
                        año: selectedYear,
                        precio: precioToSave,
                      }));
                      console.log("💾 FormData actualizado - precio:", precioToSave);
                    } else {
                      console.error("❌ No se pudo guardar precio válido. precioToSave:", precioToSave);
                      setFormData((prev) => ({
                        ...prev,
                        año: selectedYear,
                        precio: "0",
                      }));
                    }
                  } else {
                    console.warn("⚠️ No se encontró yearData para el año", selectedYear);
                    setFormData((prev) => ({
                      ...prev,
                      año: selectedYear,
                      precio: "0",
                    }));
                  }
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    año: selectedYear,
                    precio: "",
                  }));
                }
              }}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}>
              <option value="">Año</option>
              {typedYears.map((year) => {
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
                viewBox="0 0 24 24">
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
                formData.marca && !loadingModels && typedModels.length > 0
                  ? "pointer"
                  : "not-allowed",
            }}>
            {/* Dropdown personalizado */}
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer"
              onClick={() => {
                if (
                  formData.marca &&
                  !loadingModels &&
                  typedModels.length > 0
                ) {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                }
              }}
              style={{
                cursor:
                  formData.marca && !loadingModels && typedModels.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}>
              <span
                className={`${
                  formData.modelo ? "text-gray-900" : "text-gray-500"
                }`}>
                {loadingModels
                  ? "Cargando modelos..."
                  : !formData.marca
                  ? "Modelo"
                  : typedModels.length === 0
                  ? "No hay modelos disponibles"
                  : getSelectedModelText()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isModelDropdownOpen ? "rotate-180" : ""
                } ${
                  formData.marca && !loadingModels && typedModels.length > 0
                    ? "text-gray-600"
                    : "text-gray-400"
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
            </div>

            {/* Dropdown Options */}
            {isModelDropdownOpen &&
              formData.marca &&
              typedModels.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  style={{
                    borderRadius: "7px",
                    border: "1px solid #0D0D0D",
                  }}>
                  {typedModels.map((item) => (
                    <div
                      key={item.id || item.codia}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                      onClick={() => handleModelSelect(item)}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                      }}>
                      <span className="text-gray-900">{item.description}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Second Row - Versión, Kilometraje, Button */}
        <div
          className="flex flex-col md:flex-row justify-center items-center mx-auto w-full max-w-4xl gap-2 md:gap-3"
          style={{
            opacity: 1,
          }}>
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
            }}>
            <select
              value={formData.version}
              onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}>
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
                viewBox="0 0 24 24">
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
            }}>
            <select
              value={formData.kilometraje}
              onChange={(e) =>
                setFormData({ ...formData, kilometraje: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
              }}>
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
                viewBox="0 0 24 24">
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
            }}>
            Comenzar cotización
          </button>
        </div>
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
            }}>
            {currentStep >= 2 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
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
                }`}></div>
            )}
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}></div>

          {/* Step 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2
                ? "border-2 border-blue-600"
                : "border-2 border-gray-300 bg-white"
            }`}
            style={{
              backgroundColor: currentStep >= 3 ? "#2664C4" : "white",
            }}>
            {currentStep >= 3 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
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
                }`}></div>
            )}
          </div>
          <div
            className={`w-16 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
            }`}></div>

          {/* Step 3 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3
                ? "border-2 border-blue-600 bg-white"
                : "border-2 border-gray-300 bg-white"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
              }`}></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div
        className="flex flex-col"
        style={{
          width: "100%",
          maxWidth: "1140px",
          margin: "0 auto",
          gap: "11px",
          opacity: 1,
        }}>
        <h2
          className="text-center"
          style={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "20px",
            letterSpacing: "0%",
            color: "#0D0D0D",
            opacity: 1,
          }}>
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p
          className="text-center"
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "24px",
            letterSpacing: "0%",
            color: "#0D0D0D",
            opacity: 1,
          }}>
          Tus datos de contacto
        </p>
      </div>

      {/* Contact Form Fields */}
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6"
        style={{ marginTop: "40px" }}>
        {/* Nombre y apellido */}
        <div className="flex flex-col w-full md:w-80">
          <label
            style={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "#0D0D0D",
              marginBottom: "8px",
            }}>
            Nombre y apellido
          </label>
          <div
            className="relative"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}>
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
                viewBox="0 0 24 24">
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
            }}>
            Correo electrónico
          </label>
          <div
            className="relative"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}>
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
                viewBox="0 0 24 24">
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
            }}>
            Ubicación
          </label>
          <div
            className="relative"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "56px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              borderRadius: "7px",
              border: "1px solid #0D0D0D",
              backgroundColor: "white",
            }}>
            <select
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData({ ...formData, ubicacion: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
                fontFamily: "Poppins",
                fontSize: "14px",
              }}>
              <option value="">Selecciona tu provincia</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">CABA</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
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
        }}>
        <button
          className="w-full md:w-auto"
          onClick={() => setCurrentStep(1)}
          style={{
            height: "28px",
            opacity: 1,
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "15px",
            lineHeight: "27.75px",
            letterSpacing: "0%",
            textAlign: "center",
            color: "#0D0D0D",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}>
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
          }}>
          Siguiente
        </button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <section
        className="flex items-center justify-center px-4 py-8 md:py-0 mt-0 md:mt-0"
        style={{
          minHeight: "400px",
          background: "linear-gradient(to bottom, #e5e5e5 50%, white 50%)",
        }}>
        <div
          className="flex items-center w-full max-w-7xl"
          style={{
            gap: "50px",
            opacity: 1,
          }}>
          {/* Form Container */}
          <div
            className="bg-white w-full mx-auto"
            style={{
              maxWidth: "1200px",
              minHeight: "400px",
              borderRadius: "12px",
              border: "1px solid #2664C4",
              boxShadow:
                "0px 2px 3px 0px #0000004D, 0px 6px 10px 4px #00000026",
              opacity: 1,
              padding: "16px",
            }}>
            {renderStepContent()}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
