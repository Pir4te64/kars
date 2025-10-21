"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCarInfo } from "@/src/hooks/useCarInfo";
import type { Brand, Model, Group, YearPrice } from "@/types/car";

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
  ubicacion: string;
}

export default function CarQuoteSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState("excelente");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

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

  const handleCompleteQuote = () => {
    const updatedFormData = { ...formData };

    if (typedYears && typedYears.length > 0 && formData.año) {
      const yearData = typedYears.find(
        (item) => Number(item.year) === Number(formData.año)
      );
      if (yearData) {
        updatedFormData.precio = yearData.price;
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

    localStorage.removeItem("quoteData");
    localStorage.setItem("quoteData", JSON.stringify(updatedFormData));
    router.push("/cotizar/resultado");
  };
  console.log("years", years);

  const renderStep1 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Title and Subtitle */}
      <div
        className="flex flex-col w-full px-4"
        style={{ gap: "11px", opacity: 1 }}>
        <h2 className="text-sm md:text-base font-bold text-center text-gray-900">
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p className="text-base md:text-lg text-center text-gray-900">
          Te acompañamos en cada paso de tu viaje
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4" style={{ marginTop: "40px" }}>
        {/* First Row - Marca, Modelo, Año */}
        <div className="flex flex-col md:flex-row justify-center mx-auto w-full max-w-4xl gap-2 md:gap-3">
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
              style={{ border: "none", outline: "none" }}
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
                formData.marca && !loadingGroups ? "pointer" : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer"
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
                className={`${
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
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  style={{ borderRadius: "7px", border: "1px solid #0D0D0D" }}>
                  {typedGroups.map((item) => (
                    <div
                      key={item.id || item.codia}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                      onClick={() => handleGroupSelect(item)}
                      style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <span className="text-gray-900">{item.name}</span>
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
                formData.grupo && !loadingModels && typedModels.length > 0
                  ? "pointer"
                  : "not-allowed",
            }}>
            <div
              className="w-full h-full flex items-center justify-between cursor-pointer"
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
                className={`${
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
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  style={{ borderRadius: "7px", border: "1px solid #0D0D0D" }}>
                  {typedModels.map((item) => (
                    <div
                      key={item.id || item.codia}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                      onClick={() => handleModelSelect(item)}
                      style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <span className="text-gray-900">{item.description}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Second Row - Versión, Kilometraje, Button */}
        <div className="flex flex-col md:flex-row justify-center items-center mx-auto w-full max-w-4xl gap-2 md:gap-3">
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
              cursor:
                formData.modelo && !loadingYears ? "pointer" : "not-allowed",
            }}>
            <select
              value={formData.año}
              onChange={(e) =>
                setFormData({ ...formData, año: e.target.value })
              }
              className="w-full h-full focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent text-gray-500"
              style={{
                border: "none",
                outline: "none",
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
              style={{ border: "none", outline: "none" }}>
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

  const renderStep2 = () => (
    <>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue-600"
            style={{ backgroundColor: "#2664C4" }}>
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
          </div>
          <div className="w-16 h-0.5 bg-blue-600"></div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue-600 bg-white">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div
        className="flex flex-col w-full px-4"
        style={{ gap: "11px", opacity: 1 }}>
        <h2 className="text-sm md:text-base font-bold text-center text-gray-900">
          Cotizamos tu auto en poco tiempo, ingresa los datos
        </h2>
        <p className="text-base md:text-lg text-center text-gray-900">
          Tus datos de contacto
        </p>
      </div>

      {/* Contact Form Fields */}
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6"
        style={{ marginTop: "40px" }}>
        {/* Nombre y apellido */}
        <div className="flex flex-col w-full md:w-80">
          <label className="font-medium text-sm text-gray-900 mb-2">
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
            }}>
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full h-full bg-transparent text-gray-500 text-sm"
              style={{ border: "none", outline: "none" }}
            />
          </div>
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col w-full md:w-80">
          <label className="font-medium text-sm text-gray-900 mb-2">
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
              className="w-full h-full bg-transparent text-gray-500 text-sm"
              style={{ border: "none", outline: "none" }}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col w-full md:w-80">
          <label className="font-medium text-sm text-gray-900 mb-2">
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
            <input
              type="text"
              placeholder="Ubicación"
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData({ ...formData, ubicacion: e.target.value })
              }
              className="w-full h-full bg-transparent text-gray-500 text-sm"
              style={{ border: "none", outline: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 w-full gap-4">
        <button
          className="w-full md:w-auto font-medium text-sm text-gray-900 bg-transparent border-none cursor-pointer"
          onClick={() => setCurrentStep(1)}>
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
    <section
      id="vende-tu-auto"
      className="flex items-center justify-center px-4 py-8 md:py-0 mt-0 md:mt-0"
      style={{
        minHeight: "400px",
        background: "linear-gradient(to bottom, #e5e5e5 50%, white 50%)",
      }}>
      <div
        className="flex items-center w-full max-w-7xl"
        style={{ gap: "50px", opacity: 1 }}>
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
          }}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </section>
  );
}
