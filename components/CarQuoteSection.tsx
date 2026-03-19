"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCarInfo } from "@/hooks/useCarInfo";
import type { Brand, Model, Group, YearPrice } from "@/types/car";
import { calculatePriceByKilometers } from "@/lib/car-quote";
import { useDollarBlue } from "@/hooks/useDollarBlue";
import PhoneInput from "@/components/PhoneInput";
import {
  getPriceAdjustment,
  applyPriceAdjustment,
} from "@/constants/priceAdjustments";
import { getCustomPriceFromSupabase } from "@/lib/supabase-price-adjustments";

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
      // getGroupYears no está disponible
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
    // jeepBrand, // Siempre agregar JEEP con ID -1
    // dodgeBrand, // Siempre agregar DODGE con ID -2
  ].sort((a, b) => a.name.localeCompare(b.name));

  const typedModels: Model[] = useMemo(() => models || [], [models]);
  const typedGroups: Group[] = groups || [];
  const typedYears: YearPrice[] = years || [];
  // Filtrar años para mostrar solo del 2008 en adelante
  const typedGroupYears: number[] = (groupYears || []).filter(
    (year) => year >= 2008
  );

  // Filtrar modelos por año seleccionado si hay año
  // Los modelos del backend tienen year_from y year_to que indican el rango de años
  const filteredModels = useMemo(() => {
    if (!formData.año) return typedModels;
    const selectedYear = Number(formData.año);
    if (isNaN(selectedYear)) return typedModels;

    // Filtrar modelos que tengan el año seleccionado en su rango
    // Un modelo es válido si: year_from <= año_seleccionado <= year_to
    return typedModels.filter((model) => {
      const yearFrom = model.year_from;
      const yearTo = model.year_to;

      // Si el modelo no tiene años definidos, mostrarlo (compatibilidad con modelos antiguos)
      if (yearFrom === null || yearFrom === undefined) {
        return true;
      }

      // Si solo tiene year_from, el modelo es válido si el año seleccionado >= year_from
      if (yearTo === null || yearTo === undefined) {
        return selectedYear >= yearFrom;
      }

      // Si tiene ambos, el año debe estar en el rango [year_from, year_to]
      return selectedYear >= yearFrom && selectedYear <= yearTo;
    });
  }, [typedModels, formData.año]);

  // Los años ahora vienen directamente del hook cuando se selecciona grupo
  // No necesitamos calcularlos desde typedYears

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Si cambia la marca, limpiar modelo y pedir modelos nuevos
      if (field === "marca") {
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
        const selectedGroup = typedGroups.find(
          (group: Group) => group.name === value
        );
        if (selectedGroup) {
          // Usar codia si id no está disponible (el backend retorna codia como ID)
          const groupId = selectedGroup.id || selectedGroup.codia;
          // Llamar a getGroupYears en lugar de getModel
          safeGetGroupYears(prev.marca, groupId?.toString() || "");
        }
        return {
          ...prev,
          grupo: value,
          año: "", // Limpiar año al cambiar grupo
          modelo: "", // Limpiar modelo al cambiar grupo
        };
      }
      if (field === "año") {
        // Cuando se selecciona un año, obtener los modelos del grupo
        const selectedGroup = typedGroups.find(
          (group: Group) => group.name === prev.grupo
        );
        if (selectedGroup && prev.marca) {
          const groupId = selectedGroup.id || selectedGroup.codia;
          getModel(prev.marca, groupId?.toString() || "");
        }
        return {
          ...prev,
          año: value,
          modelo: "", // Limpiar modelo al cambiar año
        };
      }
      if (field === "modelo") {
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

    // Obtener el precio del modelo para el año seleccionado desde la API
    let precioBaseUSD = 0;
    if (formData.modelo && formData.año) {
      try {
        const selectedYear = Number(formData.año);
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const response = await fetch(
          `${backendUrl}/api/models/${formData.modelo}/list_price?year=${selectedYear}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al obtener precio del modelo"
          );
        }

        const data = await response.json();

        if (
          data.success &&
          data.data &&
          typeof data.data.list_price === "number"
        ) {
          precioBaseUSD = data.data.list_price;
          console.log(`💰 Precio que arroja la API: ${precioBaseUSD} USD`);
          updatedFormData.precio = precioBaseUSD.toString();
        } else {
          precioBaseUSD = 0;
          updatedFormData.precio = "0";
        }
      } catch (error) {
        precioBaseUSD = 0;
        updatedFormData.precio = "0";
      }
    } else {
      precioBaseUSD = 0;
      updatedFormData.precio = "0";
    }

    // Aplicar ajuste de precio según marca, modelo y año (antes de convertir a pesos)
    let precioAjustadoUSD = precioBaseUSD;
    if (formData.marca && formData.modelo && formData.año && precioBaseUSD > 0) {
      const año = parseInt(formData.año);
      if (!isNaN(año)) {
        try {
          console.log(
            `🔍 Buscando ajuste por año para: ${formData.marca} ${formData.modelo} ${año}`
          );
          const adjustment = await getPriceAdjustment(
            formData.marca,
            formData.modelo,
            año
          );

          if (adjustment !== null) {
            console.log(
              `📈 Porcentaje aplicado: ${adjustment > 0 ? "+" : ""}${adjustment}%`
            );

            const precioConAjuste = applyPriceAdjustment(
              precioBaseUSD,
              adjustment
            );
            if (precioConAjuste !== null) {
              precioAjustadoUSD = precioConAjuste;
              console.log(
                `✅ Precio con el % aplicado: ${precioAjustadoUSD} USD (antes: ${precioBaseUSD} USD)`
              );
            }
          } else {
            console.log(
              `ℹ️ No se encontró ajuste por año para ${formData.marca} ${formData.modelo} ${año}, usando precio base`
            );
          }
        } catch (error) {
          console.warn(
            "Error al obtener ajuste de precio, usando precio base:",
            error
          );
        }
      }
    } else {
      console.log(
        `⚠️ No se puede aplicar ajuste por año - marca: ${formData.marca}, modelo: ${formData.modelo}, año: ${formData.año}, precioBaseUSD: ${precioBaseUSD}`
      );
    }

    // Obtener cotización del dólar blue
    const cotizacionDolar = dollarBlue?.venta || 1200;

    // Verificar si hay precio fijo configurado manualmente en admin
    let precioBasePesos = 0;
    if (formData.modelo && formData.año) {
      const añoNum = parseInt(formData.año);
      if (!isNaN(añoNum)) {
        const customPrice = await getCustomPriceFromSupabase(formData.modelo, añoNum);
        if (customPrice !== null) {
          if (customPrice.currency === "USD") {
            const blue = dollarBlue?.venta || 0;
            if (blue > 0) {
              precioBasePesos = customPrice.amount * blue;
              console.log(`💜 Precio fijo admin USD: ${customPrice.amount} USD → ${precioBasePesos.toLocaleString()} ARS`);
            }
          } else {
            precioBasePesos = customPrice.amount;
            console.log(`💜 Precio fijo admin ARS: ${precioBasePesos.toLocaleString()} ARS`);
          }
        }
      }
    }

    // Si no hay precio fijo, calcular desde InfoAuto
    if (precioBasePesos === 0) {
      precioBasePesos = precioAjustadoUSD * 1000 * cotizacionDolar;
    }

    // Aplicar ajuste por kilometraje si está disponible
    if (formData.kilometraje && formData.año && precioBasePesos > 0) {
      console.log(
        `🔍 Aplicando ajuste por kilometraje - Precio antes: ${precioBasePesos.toLocaleString()} ARS, Kilometraje: ${formData.kilometraje} km, Año: ${formData.año}`
      );
      const precioConAjusteKm = calculatePriceByKilometers(
        precioBasePesos,
        formData.kilometraje,
        formData.año,
        formData.modelo
      );
      precioBasePesos = precioConAjusteKm;
      console.log(
        `📏 Precio después del ajuste por kilometraje: ${precioBasePesos.toLocaleString()} ARS`
      );
    } else {
      console.log(
        `⚠️ No se aplica ajuste por kilometraje - kilometraje: ${formData.kilometraje}, año: ${formData.año}, precioBasePesos: ${precioBasePesos}`
      );
    }

    // 2. Compra Inmediata: precio base
    const precioInmediataPesos = precioBasePesos;
    // Recalcular USD basado en el precio ajustado por km
    const precioInmediataUSD = precioBasePesos / (1000 * cotizacionDolar);

    // 3. Consignación: 10% más que Inmediata
    const precioConsignacionPesos = precioInmediataPesos * 1.1;
    const precioConsignacionUSD = precioInmediataUSD * 1.1;

    // 4. Permuta: 5% más que Inmediata
    const precioPermutaPesos = precioInmediataPesos * 1.05;
    const precioPermutaUSD = precioInmediataUSD * 1.05;

    // Formatear precios
    const formatearPrecioPesos = (precio: number) => {
      if (!precio || isNaN(precio) || precio === 0) return "0";
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(precio);
    };

    const formatearPrecioDolares = (precio: number) => {
      if (!precio || isNaN(precio) || precio === 0) return "0";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(precio);
    };

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

    // Navegar a la página de resultado
    // El email y el lead se guardarán desde la página de resultados
    // usando los precios exactos que el usuario ve en pantalla
    router.push("/cotizar/resultado");
    setIsSendingEmail(false);
    return;

    // CÓDIGO ELIMINADO - El guardado de lead y envío de email se hace desde la página de resultados
    /*
    // Guardar lead en la base de datos con las tres cotizaciones
    try {
      console.log("�� Guardando lead con las tres cotizaciones...");
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
          // Agregar las tres cotizaciones
          precio_inmediata_ars: formatearPrecioPesos(precioInmediataPesos),
          precio_inmediata_usd: formatearPrecioDolares(precioInmediataUSD),
          precio_consignacion_ars: formatearPrecioPesos(
            precioConsignacionPesos
          ),
          precio_consignacion_usd: formatearPrecioDolares(
            precioConsignacionUSD
          ),
          precio_permuta_ars: formatearPrecioPesos(precioPermutaPesos),
          precio_permuta_usd: formatearPrecioDolares(precioPermutaUSD),
          cotizacion_dolar: cotizacionDolar.toString(),
        }),
      });

      const leadData = await leadResponse.json();

      if (!leadResponse.ok) {
        // Error al guardar lead, pero no bloqueamos el flujo
      }
    } catch (error) {
      // Error al guardar lead, pero no bloqueamos el flujo
    }

    // Enviar email
    try {
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
          cotizacionDolar: cotizacionDolar,
          kilometraje: updatedFormData.kilometraje,
          ubicacion: updatedFormData.ubicacion,
          // Enviar las tres cotizaciones al email también
          precio_inmediata_ars: formatearPrecioPesos(precioInmediataPesos),
          precio_inmediata_usd: formatearPrecioDolares(precioInmediataUSD),
          precio_consignacion_ars: formatearPrecioPesos(
            precioConsignacionPesos
          ),
          precio_consignacion_usd: formatearPrecioDolares(
            precioConsignacionUSD
          ),
          precio_permuta_ars: formatearPrecioPesos(precioPermutaPesos),
          precio_permuta_usd: formatearPrecioDolares(precioPermutaUSD),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el email");
      }
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : "Error al enviar el email"
      );
    } finally {
      setIsSendingEmail(false);
    }
    */
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
            style={{
              minWidth: "120px",
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
            style={{
              minWidth: "100px",
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
            style={{
              minWidth: "120px",
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
                if (
                  formData.año &&
                  !loadingModels &&
                  filteredModels.length > 0
                ) {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
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
            style={{
              minWidth: "150px",
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
            onClick={() => setCurrentStep(2)}
            style={{
              minWidth: "180px",
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
          {/* Banner de construcción */}
          <div className="mb-4 px-3 md:px-4">
            <div
              className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: "#fbbf24",
              }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-bold text-amber-900 mb-1">
                    ⚠️ Cotizador en construcción
                  </h3>
                  <p className="text-xs md:text-sm text-amber-800 mb-3">
                    Estamos mejorando el sistema. Para una respuesta rápida y
                    personalizada, contactanos directamente por WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/541121596100?text=Hola!%20Quiero%20cotizar%20mi%20vehículo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-xs md:text-sm shadow-md hover:shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </section>
  );
}
