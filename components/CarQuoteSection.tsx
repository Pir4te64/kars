"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCarInfo } from "@/src/hooks/useCarInfo";
import type { Brand, Model, Group, YearPrice } from "@/types/car";
import { calculatePriceByKilometers } from "@/lib/car-quote";
import { useDollarBlue } from "@/hooks/useDollarBlue";

interface FormData {
  marca: string;
  modelo: string;
  año: string;
  version: string;
  kilometraje: string;
  grupo: string;
  precio: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
}

export default function CarQuoteSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState("excelente");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    nombre?: string;
    email?: string;
    ubicacion?: string;
  }>({});
  const [yearError, setYearError] = useState<string | null>(null);

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { dollarBlue } = useDollarBlue();

  const {
    brands,
    models,
    groups,
    years,
    loadingBrands,
    loadingGroups,
    loadingModels,
    loadingYears,
    getModel,
    getGroup,
    getPrice,
  } = useCarInfo();

  // Tipos explícitos para evitar errores de TypeScript
  const typedBrands: Brand[] = brands || [];
  const typedModels: Model[] = models || [];
  const typedGroups: Group[] = groups || [];
  const typedYears: YearPrice[] = years || [];

  const [formData, setFormData] = useState({
    marca: "",
    grupo: "",
    precio: "",
    modelo: "",
    año: "",
    version: "",
    kilometraje: "",
    nombre: "",
    email: "",
    telefono: "",
    ubicacion: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Si cambia la marca, limpiar modelo y pedir modelos nuevos

      if (field === "marca") {
        getGroup(value);
        return {
          ...prev,
          marca: value,
          grupo: "",
          modelo: "", // Limpiar modelo al cambiar marca
        };
      }
      if (field === "grupo") {
        // Buscar el grupo seleccionado para obtener su name
        console.log("field bro y el value", field, value);
        const selectedGroup = typedGroups.find(
          (group: Group) => group.name === value
        );
        console.log("=== DEBUG GRUPO ===");
        console.log("Grupo seleccionado:", value);
        console.log("Marca actual (prev.marca):", prev.marca);
        console.log("selectedGroup:", selectedGroup);
        console.log("Grupos disponibles:", typedGroups);
        if (selectedGroup) {
          console.log(
            "Ejecutando getModel con marca:",
            prev.marca,
            "y grupo (name):",
            selectedGroup.name
          );
          getModel(prev.marca, selectedGroup.id);
        } else {
          console.log(
            "ERROR: No se encontró el grupo seleccionado en el array"
          );
        }
        return {
          ...prev,
          grupo: value,
          modelo: "", // Limpiar modelo al cambiar grupo
        };
      }
      if (field === "modelo") {
        console.log(field, value);
        getPrice(value);
        return {
          ...prev,
          modelo: value, // Limpiar modelo al cambiar marca
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleModelSelect = (model: { codia: string; description: string }) => {
    setIsModelDropdownOpen(!isModelDropdownOpen);
    handleInputChange("modelo", model.codia);
  };
  const handleGroupSelect = (group: Group) => {
    console.log("handleGroupSelect llamado con:", group);
    setIsGroupDropdownOpen(!isGroupDropdownOpen);
    handleInputChange("grupo", group.name);
  };

  const getSelectedModelText = () => {
    if (!formData.modelo) return "Modelo";
    const selectedModel = typedModels.find(
      (item) => item.codia === formData.modelo
    );
    return selectedModel ? selectedModel.description : "Modelo";
  };
  const getSelectedGroupText = () => {
    console.log("grupo seleccionado");
    if (!formData.grupo) return "Grupo";
    const selectedGroup = typedGroups.find(
      (item) => item.name === formData.grupo
    );
    return selectedGroup ? selectedGroup.name : "Grupo";
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGroupDropdownOpen(false);
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
  }, [isGroupDropdownOpen]);

  const validateStep2 = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.nombre || formData.nombre.trim() === "") {
      errors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email || formData.email.trim() === "") {
      errors.email = "El email es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "El email no es válido";
      }
    }

    if (!formData.ubicacion || formData.ubicacion.trim() === "") {
      errors.ubicacion = "La ubicación es obligatoria";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteQuote = async () => {
    // Validar campos del paso 2
    if (!validateStep2()) {
      return;
    }

    setEmailError(null);
    setIsSendingEmail(true);

    const updatedFormData = { ...formData };

    // Obtener nombres reales de los datos
    if (typedYears && typedYears.length > 0 && formData.año) {
      const yearData = typedYears.find(
        (item) => Number(item.year) === Number(formData.año)
      );
      if (yearData) {
        // Aplicar la fórmula de depreciación por kilómetros
        const basePrice = parseFloat(yearData.price);
        const adjustedPrice = calculatePriceByKilometers(
          basePrice,
          formData.kilometraje
        );
        updatedFormData.precio = adjustedPrice.toString();
      }
    }

    if (typedBrands && typedBrands.length > 0 && formData.marca) {
      const brandData = typedBrands.find(
        (item) =>
          item.id.toString() === formData.marca || item.name === formData.marca
      );
      if (brandData) {
        updatedFormData.marca = brandData.name;
      }
    }
    if (typedGroups && typedGroups.length > 0 && formData.grupo) {
      const groupData = typedGroups.find(
        (item) => item.codia === formData.grupo || item.name === formData.grupo
      );
      if (groupData) {
        updatedFormData.grupo = groupData.name;
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

    // Guardar en localStorage
    localStorage.removeItem("quoteData");
    localStorage.setItem("quoteData", JSON.stringify(updatedFormData));

    // Guardar lead en la base de datos
    try {
      console.log("🔄 Guardando lead...");
      const leadResponse = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: updatedFormData.nombre,
          email: updatedFormData.email,
          telefono: updatedFormData.telefono,
          ubicacion: updatedFormData.ubicacion,
          marca: updatedFormData.marca,
          modelo: updatedFormData.modelo,
          grupo: updatedFormData.grupo,
          año: updatedFormData.año,
          kilometraje: updatedFormData.kilometraje,
          precio: updatedFormData.precio,
        }),
      });

      const leadData = await leadResponse.json();

      if (!leadResponse.ok) {
        console.error("❌ Error al guardar el lead:", leadData);
      } else {
        console.log("✅ Lead guardado exitosamente:", leadData);
      }
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      // No bloqueamos el flujo si falla el guardado del lead
    }

    // Enviar email
    try {
      // Obtener cotización del dólar blue
      const cotizacionDolar = dollarBlue?.venta || 1200; // Fallback a 1200 si no está disponible

      const response = await fetch("/api/send-quote-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedFormData.email,
          nombre: updatedFormData.nombre,
          marca: updatedFormData.marca,
          modelo: updatedFormData.modelo,
          grupo: updatedFormData.grupo,
          año: updatedFormData.año,
          precio: updatedFormData.precio,
          cotizacionDolar: cotizacionDolar, // Enviar la cotización actual
          kilometraje: updatedFormData.kilometraje,
          ubicacion: updatedFormData.ubicacion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el email");
      }

      // Si todo está bien, navegar a la página de resultado
      router.push("/cotizar/resultado");
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailError(
        error instanceof Error ? error.message : "Error al enviar el email"
      );
    } finally {
      setIsSendingEmail(false);
    }
  };
  console.log("years", years);

  const renderStep1 = () => (
    <>
      {/* Title and Subtitle */}
      <div className="flex flex-col w-full px-2 md:px-4">
        <h2 className="text-base md:text-xl font-black text-center text-slate-800 mb-0.5 md:mb-1">
          Cotiza tu auto
        </h2>
        <p className="text-xs md:text-sm text-center text-slate-600">
          Ingresa los datos de tu vehículo
        </p>
      </div>

      {/* Form Fields */}
      <div
        className="space-y-1.5 md:space-y-2 w-full"
        style={{ marginTop: "8px" }}>
        {/* First Row - Marca, Grupo, Modelo */}
        <div className="flex flex-col md:flex-row justify-center items-stretch mx-auto w-full max-w-4xl gap-2 md:gap-3 px-2 sm:px-0">
          {/* Marca */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
            }}>
            <select
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500 text-sm md:text-base px-3"
              style={{ border: "none", outline: "none", paddingRight: "40px" }}
              disabled={loadingBrands}>
              <option value="">Marca</option>
              {typedBrands && typedBrands.length > 0 ? (
                typedBrands.map((brand) => (
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
          {/* Grupo */}
          <div
            ref={groupDropdownRef}
            className="relative w-full md:w-1/3"
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor:
                formData.marca && !loadingGroups ? "pointer" : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer px-3"
              onClick={() => {
                if (
                  formData.marca &&
                  !loadingGroups &&
                  typedGroups.length > 0
                ) {
                  setIsGroupDropdownOpen(!isGroupDropdownOpen);
                }
              }}
              style={{
                cursor:
                  formData.marca && !loadingGroups && typedGroups.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}>
              <span
                className={`text-sm md:text-base ${
                  formData.grupo ? "text-gray-900" : "text-gray-500"
                }`}>
                {loadingGroups
                  ? "Cargando Modelos..."
                  : !formData.marca
                  ? "Modelo"
                  : typedGroups.length === 0
                  ? "No hay grupos disponibles"
                  : getSelectedGroupText()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isGroupDropdownOpen ? "rotate-180" : ""
                } ${
                  formData.marca && !loadingGroups && typedGroups.length > 0
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
            {isGroupDropdownOpen &&
              formData.marca &&
              typedGroups.length > 0 && (
                <div
                  className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}>
                  {typedGroups.map((item) => (
                    <div
                      key={item.id || item.codia}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                      onClick={() => handleGroupSelect(item)}
                      style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <span className="text-gray-900 text-xs sm:text-sm md:text-base">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          {/* Modelo */}
          <div
            ref={modelDropdownRef}
            className="relative w-full md:w-1/3"
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor:
                formData.grupo && !loadingModels && typedModels.length > 0
                  ? "pointer"
                  : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer px-3"
              onClick={() => {
                console.log("=== CLICK EN MODELO ===");
                console.log("formData.grupo:", formData.grupo);
                console.log("loadingModels:", loadingModels);
                console.log("models.length:", typedModels.length);
                console.log("models:", typedModels);
                if (
                  formData.grupo &&
                  !loadingModels &&
                  typedModels.length > 0
                ) {
                  console.log("Abriendo dropdown de modelos");
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                } else {
                  console.log(
                    "No se puede abrir dropdown - condiciones no cumplidas"
                  );
                }
              }}
              style={{
                cursor:
                  formData.grupo && !loadingModels && typedModels.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}>
              <span
                className={`text-sm md:text-base ${
                  formData.modelo ? "text-gray-900" : "text-gray-500"
                }`}>
                {loadingModels
                  ? "Cargando Versiones..."
                  : !formData.grupo
                  ? "Version"
                  : typedModels.length === 0
                  ? "No hay modelos disponibles"
                  : getSelectedModelText()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isModelDropdownOpen ? "rotate-180" : ""
                } ${
                  formData.grupo && !loadingModels && typedModels.length > 0
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

            {isModelDropdownOpen &&
              formData.grupo &&
              typedModels.length > 0 && (
                <div
                  className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}>
                  {typedModels.map((item) => (
                    <div
                      key={item.id || item.codia}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                      onClick={() => handleModelSelect(item)}
                      style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <span className="text-gray-900 text-sm md:text-base">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Second Row - Año, Kilometraje, Button */}
        <div className="flex flex-col md:flex-row justify-center items-stretch mx-auto w-full max-w-4xl gap-2 md:gap-3 px-2 sm:px-0">
          {/* Año */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor:
                formData.modelo && !loadingYears ? "pointer" : "not-allowed",
            }}>
            <select
              value={formData.año}
              onChange={(e) => {
                const selectedYear = parseInt(e.target.value);
                if (selectedYear && selectedYear < 2008) {
                  setYearError("Lo sentimos, solo aceptamos vehículos del año 2008 en adelante.");
                  setFormData({ ...formData, año: "" });
                } else {
                  setYearError(null);
                  setFormData({ ...formData, año: e.target.value });
                }
              }}
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500 text-sm md:text-base px-3"
              style={{
                border: "none",
                outline: "none",
                paddingRight: "40px",
                cursor:
                  formData.modelo && !loadingYears ? "pointer" : "not-allowed",
              }}
              disabled={!formData.modelo || loadingYears}>
              {formData.modelo && typedYears.length > 0 ? (
                <>
                  <option value="">Año</option>

                  {typedYears.map((year) => (
                    <option key={year.year} value={year.year}>
                      {year.year}
                    </option>
                  ))}
                </>
              ) : (
                <option value="" disabled>
                  {loadingYears
                    ? "Cargando Años..."
                    : !formData.modelo
                    ? "Año"
                    : "No hay años disponibles"}
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

          {/* Mensaje de error para año */}
          {yearError && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">¡Atención! </strong>
              <span className="block sm:inline">{yearError}</span>
            </div>
          )}

          {/* Versión */}
          {/* <div
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
              style={{ border: "none", outline: "none" }}>
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
          </div> */}

          {/* Kilometraje */}
          <div
            className="relative w-full md:w-1/3"
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
            }}>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Kilometraje"
              value={formData.kilometraje}
              onChange={(e) =>
                setFormData({ ...formData, kilometraje: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-500 text-sm md:text-base px-3"
              style={{ border: "none", outline: "none" }}
            />
          </div>

          {/* Button */}
          <button
            className="text-slate-900 font-bold transition-all duration-300 w-full md:w-1/3 whitespace-nowrap hover:scale-105 hover:shadow-lg text-xs md:text-sm"
            onClick={() => setCurrentStep(2)}
            style={{
              height: "40px",
              minHeight: "40px",
              paddingTop: "8px",
              paddingRight: "16px",
              paddingBottom: "8px",
              paddingLeft: "16px",
              borderRadius: "60px",
              border: "none",
              backgroundColor: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            }}>
            Comenzar cotización
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Title and Subtitle */}
      <div className="flex flex-col w-full px-4">
        <h2 className="text-xl md:text-2xl font-black text-center text-slate-800 mb-2">
          Casi listo
        </h2>
        <p className="text-xs md:text-base text-center text-slate-600">
          Tus datos de contacto
        </p>
      </div>

      {/* Contact Form Fields */}
      <div
        className="flex flex-col md:flex-row justify-center items-stretch gap-3 md:gap-4 w-full px-4"
        style={{ marginTop: "20px" }}>
        {/* Nombre y apellido */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs">
          <label className="font-medium text-sm text-slate-700 mb-1">
            Nombre y apellido <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div
            className="relative w-full"
            style={{
              height: "48px",
              borderRadius: "12px",
              border: formErrors.nombre
                ? "1px solid #ef4444"
                : "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
            }}>
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (formErrors.nombre) {
                  setFormErrors({ ...formErrors, nombre: undefined });
                }
              }}
              className="w-full h-full bg-transparent text-gray-500 text-sm px-3"
              style={{ border: "none", outline: "none" }}
              required
            />
          </div>
          {formErrors.nombre && (
            <p className="text-xs text-red-500 mt-1">{formErrors.nombre}</p>
          )}
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs">
          <label className="font-medium text-sm text-slate-700 mb-1">
            Correo electrónico <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div
            className="relative w-full"
            style={{
              height: "48px",
              borderRadius: "12px",
              border: formErrors.email
                ? "1px solid #ef4444"
                : "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
            }}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: undefined });
                }
              }}
              className="w-full h-full bg-transparent text-gray-500 text-sm px-3"
              style={{ border: "none", outline: "none" }}
              required
            />
          </div>
          {formErrors.email && (
            <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs">
          <label className="font-medium text-sm text-slate-700 mb-1">
            Teléfono <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div
            className="relative w-full"
            style={{
              height: "48px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
            }}>
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => {
                setFormData({ ...formData, telefono: e.target.value });
              }}
              className="w-full h-full bg-transparent text-gray-500 text-sm px-3"
              style={{ border: "none", outline: "none" }}
              required
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs">
          <label className="font-medium text-sm text-slate-700 mb-1">
            Ubicación <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div
            className="relative w-full"
            style={{
              height: "48px",
              borderRadius: "12px",
              border: formErrors.ubicacion
                ? "1px solid #ef4444"
                : "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
            }}>
            <select
              value={formData.ubicacion}
              onChange={(e) => {
                setFormData({ ...formData, ubicacion: e.target.value });
                if (formErrors.ubicacion) {
                  setFormErrors({ ...formErrors, ubicacion: undefined });
                }
              }}
              className="w-full h-full bg-transparent text-gray-500 text-sm px-3 appearance-none"
              style={{ border: "none", outline: "none", paddingRight: "40px" }}
              required
            >
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
          {formErrors.ubicacion && (
            <p className="text-xs text-red-500 mt-1">{formErrors.ubicacion}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {emailError && (
        <div className="px-4 mb-4">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            role="alert">
            <strong>Error:</strong> {emailError}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-8 w-full gap-4 px-4">
        <button
          className="w-full md:w-auto font-medium text-sm text-slate-600 bg-transparent border-none cursor-pointer py-2 hover:text-slate-900 transition-colors"
          onClick={() => setCurrentStep(1)}
          disabled={isSendingEmail}>
          ← Volver
        </button>
        <button
          className="w-full md:w-auto whitespace-nowrap text-slate-900 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCompleteQuote}
          disabled={isSendingEmail}
          style={{
            height: "48px",
            minHeight: "48px",
            paddingTop: "10px",
            paddingRight: "24px",
            paddingBottom: "10px",
            paddingLeft: "24px",
            borderRadius: "60px",
            backgroundColor: "white",
            border: "none",
            fontSize: "16px",
            cursor: isSendingEmail ? "not-allowed" : "pointer",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          }}>
          {isSendingEmail ? "Enviando..." : "Siguiente"}
        </button>
      </div>
    </>
  );

  return (
    <section
      id="vende-tu-auto"
      className="flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3"
      style={{
        minHeight: "auto",
        background: "transparent",
      }}>
      <div className="flex items-center w-full max-w-7xl">
        <div
          className="bg-gradient-to-br from-slate-100 via-white to-slate-50 w-full mx-auto px-2 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 rounded-xl md:rounded-2xl"
          style={{
            maxWidth: "1100px",
            minHeight: "auto",
            borderRadius: "20px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.06)",
          }}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </section>
  );
}
