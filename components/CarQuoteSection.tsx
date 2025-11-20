"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCarInfo } from "@/hooks/useCarInfo";
import type { Brand, Model, Group, YearPrice } from "@/types/car";
import { calculatePriceByKilometers } from "@/lib/car-quote";
import { useDollarBlue } from "@/hooks/useDollarBlue";
import PhoneInput from "@/components/PhoneInput";

interface CarFormData {
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
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
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
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { dollarBlue } = useDollarBlue();

  const {
    brands,
    models,
    groups,
    years,
    groupYears,
    loadingBrands,
    loadingGroups,
    loadingModels,
    loadingYears,
    loadingGroupYears,
    getModel,
    getGroup,
    getPrice,
    getGroupYears,
  } = useCarInfo();

  // Función de respaldo si getGroupYears no está disponible
  const safeGetGroupYears =
    getGroupYears ||
    ((brandId: string, groupId: string) => {
      console.error(
        "❌ getGroupYears no está disponible. brandId:",
        brandId,
        "groupId:",
        groupId
      );
    });

  // Declarar formData primero para evitar errores de inicialización
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

  // Tipos explícitos para evitar errores de TypeScript
  // Agregar JEEP y DODGE hardcodeadas si no están en la lista
  const baseBrands: Brand[] = brands || [];
  // Usar IDs únicos negativos para JEEP y DODGE para evitar conflictos
  const jeepBrand: Brand = {
    id: -1, // ID único para JEEP (se mapeará a CHRYSLER ID 13 en el backend)
    name: "JEEP",
    brand_id: -1,
    logo_url: "/jeep.png", // Logo de JEEP
  };
  const dodgeBrand: Brand = {
    id: -2, // ID único para DODGE (se mapeará a CHRYSLER ID 13 en el backend)
    name: "DODGE",
    brand_id: -2,
    logo_url: "/dodge.png", // Logo de DODGE
  };

  // Filtrar JEEP y DODGE que vengan del backend (tienen ID 13 de CHRYSLER)
  // Solo queremos usar nuestras versiones hardcodeadas con IDs -1 y -2
  const filteredBaseBrands = baseBrands.filter(
    (b) => b.name.toUpperCase() !== "JEEP" && b.name.toUpperCase() !== "DODGE"
  );

  // Siempre agregar JEEP y DODGE con IDs únicos (-1 y -2)
  // Esto asegura que siempre usemos estos IDs específicos
  const typedBrands: Brand[] = [
    ...filteredBaseBrands,
    jeepBrand, // Siempre agregar JEEP con ID -1
    dodgeBrand, // Siempre agregar DODGE con ID -2
  ].sort((a, b) => a.name.localeCompare(b.name));

  const typedModels: Model[] = models || [];
  const typedGroups: Group[] = groups || [];
  const typedYears: YearPrice[] = years || [];
  // Filtrar años para mostrar solo del 2008 en adelante
  const typedGroupYears: number[] = (groupYears || []).filter(
    (year) => year >= 2008
  );

  // Filtrar modelos por año seleccionado si hay año
  // Los modelos del backend tienen prices_from y prices_to que indican el rango de años
  const filteredModels = useMemo(() => {
    if (!formData.año) return typedModels;
    const selectedYear = Number(formData.año);
    if (isNaN(selectedYear)) return typedModels;

    // Filtrar modelos que tengan el año seleccionado en su rango
    // Nota: Los modelos del backend tienen prices_from y prices_to
    // Por ahora mostramos todos los modelos del grupo, ya que el filtrado
    // por año se hace cuando se obtienen los precios del modelo específico
    return typedModels;
  }, [typedModels, formData.año]);

  // Los años ahora vienen directamente del hook cuando se selecciona grupo
  // No necesitamos calcularlos desde typedYears

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Si cambia la marca, limpiar modelo y pedir modelos nuevos
      if (field === "marca") {
        console.log("🟢 handleInputChange - Cambiando marca a:", value);
        // Llamar a getGroup con el nuevo brandId
        // El hook se encargará de limpiar grupos y modelos cuando detecte el cambio de marca
        getGroup(value);

        return {
          ...prev,
          marca: value,
          grupo: "",
          modelo: "", // Limpiar modelo al cambiar marca
          año: "", // Limpiar año al cambiar marca
        };
      }
      if (field === "grupo") {
        // Buscar el grupo seleccionado para obtener su ID
        console.log("🟢 handleInputChange - Cambiando grupo a:", value);
        const selectedGroup = typedGroups.find(
          (group: Group) => group.name === value
        );
        if (selectedGroup) {
          // Usar codia si id no está disponible (el backend retorna codia como ID)
          const groupId = selectedGroup.id || selectedGroup.codia;
          console.log(
            "🟢 Obteniendo años para marca:",
            prev.marca,
            "y grupo:",
            groupId
          );
          // Llamar a getGroupYears en lugar de getModel
          safeGetGroupYears(prev.marca, groupId?.toString() || "");
        } else {
          console.log(
            "ERROR: No se encontró el grupo seleccionado en el array"
          );
        }
        return {
          ...prev,
          grupo: value,
          año: "", // Limpiar año al cambiar grupo
          modelo: "", // Limpiar modelo al cambiar grupo
        };
      }
      if (field === "año") {
        console.log("🟢 handleInputChange - Cambiando año a:", value);
        // Cuando se selecciona un año, obtener los modelos del grupo
        const selectedGroup = typedGroups.find(
          (group: Group) => group.name === prev.grupo
        );
        if (selectedGroup && prev.marca) {
          const groupId = selectedGroup.id || selectedGroup.codia;
          console.log(
            "🟢 Obteniendo modelos para marca:",
            prev.marca,
            "y grupo:",
            groupId
          );
          getModel(prev.marca, groupId?.toString() || "");
        }
        return {
          ...prev,
          año: value,
          modelo: "", // Limpiar modelo al cambiar año
        };
      }
      if (field === "modelo") {
        console.log("🟢 handleInputChange - Cambiando modelo a:", value);
        console.log("🟢 Llamando getPrice con codia:", value);
        getPrice(value);
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

  // Debug: Log para verificar modelos
  useEffect(() => {
    console.log("🔍 DEBUG MODELOS:");
    console.log("  - models (del hook):", models);
    console.log("  - typedModels:", typedModels);
    console.log("  - filteredModels:", filteredModels);
    console.log("  - formData.año:", formData.año);
    console.log("  - loadingModels:", loadingModels);
  }, [models, typedModels, filteredModels, formData.año, loadingModels]);

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

    if (isGroupDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isGroupDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
      }
    };

    if (isBrandDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isBrandDropdownOpen]);

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
        {/* First Row - Marca, Grupo, Año, Modelo */}
        <div
          className="flex flex-col md:flex-row quote-form-row justify-center items-stretch mx-auto w-full max-w-4xl gap-2 md:gap-2.5 tablet:gap-3 tablet-lg:gap-3 px-2 sm:px-0"
          style={{
            minWidth: "min(100%, 600px)",
          }}>
          {/* Marca */}
          <div
            ref={brandDropdownRef}
            className="relative w-full md:w-1/4 tablet:w-1/4 tablet-lg:w-1/4 flex-shrink-0 quote-form-field w-1-4"
            style={{
              minWidth: "120px",
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor: !loadingBrands ? "pointer" : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer px-3"
              onClick={() => {
                if (!loadingBrands && typedBrands.length > 0) {
                  setIsBrandDropdownOpen(!isBrandDropdownOpen);
                }
              }}
              style={{
                cursor:
                  !loadingBrands && typedBrands.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {formData.marca ? (
                  <>
                    {(() => {
                      const selectedBrand = typedBrands.find(
                        (b) => b.id.toString() === formData.marca
                      );
                      return selectedBrand?.logo_url ? (
                        <img
                          src={selectedBrand.logo_url}
                          alt={selectedBrand.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : null;
                    })()}
                    <span className="text-sm md:text-base text-gray-900 truncate">
                      {(() => {
                        const selectedBrand = typedBrands.find(
                          (b) => b.id.toString() === formData.marca
                        );
                        console.log(
                          "🔍 Mostrando marca seleccionada - formData.marca:",
                          formData.marca,
                          "selectedBrand:",
                          selectedBrand?.name
                        );
                        return selectedBrand?.name || "Marca";
                      })()}
                    </span>
                  </>
                ) : (
                  <span className="text-sm md:text-base text-gray-500">
                    Marca
                  </span>
                )}
              </div>
              <svg
                className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
                  isBrandDropdownOpen ? "rotate-180" : ""
                } ${
                  !loadingBrands && typedBrands.length > 0
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
            {isBrandDropdownOpen &&
              !loadingBrands &&
              typedBrands.length > 0 && (
                <div
                  className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 sm:max-h-96 overflow-y-auto"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}>
                  {typedBrands.map((brand, index) => (
                    <div
                      key={`brand-${brand.id}-${brand.name}-${index}`}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 flex items-center gap-3"
                      onClick={() => {
                        console.log(
                          "🔵 Seleccionando marca:",
                          brand.name,
                          "ID:",
                          brand.id.toString()
                        );
                        handleInputChange("marca", brand.id.toString());
                        setIsBrandDropdownOpen(false);
                      }}
                      style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {brand.logo_url && (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      )}
                      <span className="text-gray-900 text-xs sm:text-sm md:text-base">
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          {/* Grupo */}
          <div
            ref={groupDropdownRef}
            className="relative w-full md:w-1/4 tablet:w-1/4 tablet-lg:w-1/4 flex-shrink-0 quote-form-field w-1-4"
            style={{ minWidth: "120px" }}
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
                  className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 sm:max-h-96 overflow-y-auto"
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
          {/* Año */}
          <div
            className="relative w-full md:w-1/4 tablet:w-1/4 tablet-lg:w-1/4 flex-shrink-0 quote-form-field w-1-4"
            style={{ minWidth: "100px" }}
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor:
                formData.grupo && !loadingGroupYears
                  ? "pointer"
                  : "not-allowed",
            }}>
            <select
              value={formData.año}
              onChange={(e) => {
                const selectedYear = parseInt(e.target.value);
                if (selectedYear && selectedYear < 2008) {
                  setYearError(
                    "Lo sentimos, solo aceptamos vehículos del año 2008 en adelante."
                  );
                  setFormData({ ...formData, año: "" });
                } else {
                  setYearError(null);
                  handleInputChange("año", e.target.value);
                }
              }}
              disabled={
                !formData.grupo ||
                loadingGroupYears ||
                typedGroupYears.length === 0
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500 text-sm md:text-base px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: "none",
                outline: "none",
                paddingRight: "40px",
              }}>
              <option value="">
                {loadingGroupYears
                  ? "Cargando años..."
                  : !formData.grupo
                  ? "Selecciona grupo"
                  : typedGroupYears.length === 0
                  ? "No hay años disponibles"
                  : "Año"}
              </option>
              {typedGroupYears && typedGroupYears.length > 0
                ? typedGroupYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                : null}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className={`w-5 h-5 ${
                  formData.grupo &&
                  !loadingGroupYears &&
                  typedGroupYears.length > 0
                    ? "text-gray-400"
                    : "text-gray-300"
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
          </div>
          {/* Modelo */}
          <div
            ref={modelDropdownRef}
            className="relative w-full md:w-1/4 tablet:w-1/4 tablet-lg:w-1/4 flex-shrink-0 quote-form-field w-1-4"
            style={{ minWidth: "120px" }}
            style={{
              height: "40px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(248, 250, 252, 0.5)",
              opacity: 1,
              cursor:
                formData.año && !loadingModels && filteredModels.length > 0
                  ? "pointer"
                  : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer px-3"
              onClick={() => {
                console.log("=== CLICK EN MODELO ===");
                console.log("formData.año:", formData.año);
                console.log("loadingModels:", loadingModels);
                console.log("typedModels.length:", typedModels.length);
                console.log("typedModels:", typedModels);
                console.log("filteredModels.length:", filteredModels.length);
                console.log("filteredModels:", filteredModels);
                if (
                  formData.año &&
                  !loadingModels &&
                  filteredModels.length > 0
                ) {
                  console.log("Abriendo dropdown de modelos");
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                } else {
                  console.log(
                    "No se puede abrir dropdown - condiciones no cumplidas",
                    {
                      tieneAño: !!formData.año,
                      noEstaCargando: !loadingModels,
                      tieneModelos: filteredModels.length > 0,
                    }
                  );
                }
              }}
              style={{
                cursor:
                  formData.año && !loadingModels && filteredModels.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}>
              <span
                className={`text-sm md:text-base ${
                  formData.modelo ? "text-gray-900" : "text-gray-500"
                }`}>
                {loadingModels
                  ? "Cargando Versiones..."
                  : !formData.año
                  ? "Selecciona año"
                  : filteredModels.length === 0
                  ? "No hay modelos disponibles"
                  : getSelectedModelText()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isModelDropdownOpen ? "rotate-180" : ""
                } ${
                  formData.año && !loadingModels && filteredModels.length > 0
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
              formData.año &&
              filteredModels.length > 0 && (
                <div
                  className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 sm:max-h-96 overflow-y-auto"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}>
                  {filteredModels.map((item) => (
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

        {/* Second Row - Kilometraje, Button */}
        <div
          className="flex flex-col md:flex-row quote-form-row justify-center items-stretch mx-auto w-full max-w-4xl gap-2 md:gap-2.5 tablet:gap-3 tablet-lg:gap-3 px-2 sm:px-0"
          style={{ minWidth: "min(100%, 600px)" }}>
          {/* Mensaje de error para año */}
          {yearError && (
            <div
              className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert">
              <strong className="font-bold">¡Atención! </strong>
              <span className="block sm:inline">{yearError}</span>
            </div>
          )}

          {/* Kilometraje */}
          <div
            className="relative w-full md:w-1/3 tablet:w-1/3 tablet-lg:w-1/3 flex-shrink-0 quote-form-field w-1-3"
            style={{ minWidth: "150px" }}
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
            className="text-slate-900 font-bold transition-all duration-300 w-full md:w-1/3 tablet:w-1/3 tablet-lg:w-1/3 whitespace-nowrap hover:scale-105 hover:shadow-lg text-xs md:text-sm tablet:text-sm tablet-lg:text-sm flex-shrink-0 quote-form-field w-1-3"
            style={{ minWidth: "180px" }}
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
        className="flex flex-col md:flex-row justify-center items-stretch gap-3 md:gap-3.5 tablet:gap-4 tablet-lg:gap-4 w-full px-4"
        style={{ marginTop: "20px" }}>
        {/* Nombre y apellido */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs tablet:flex-1 tablet:max-w-xs tablet-lg:flex-1 tablet-lg:max-w-xs">
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
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs tablet:flex-1 tablet:max-w-xs tablet-lg:flex-1 tablet-lg:max-w-xs">
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
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs tablet:flex-1 tablet:max-w-xs tablet-lg:flex-1 tablet-lg:max-w-xs">
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
            <PhoneInput
              value={formData.telefono}
              onChange={(value) => {
                setFormData({ ...formData, telefono: value });
              }}
              placeholder="Teléfono"
              required
              className="text-gray-500 text-sm"
              style={{ height: "100%" }}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col w-full md:flex-1 md:max-w-xs tablet:flex-1 tablet:max-w-xs tablet-lg:flex-1 tablet-lg:max-w-xs">
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
              required>
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
            minWidth: "min(100%, 600px)",
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
