"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCarInfo } from "@/src/hooks/useCarInfo";

export default function VendeTuAutoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const {
    brands,
    models,
    years,
    loadingBrands,
    loadingModels,
    getModelsByBrand,
    getPrice,
  } = useCarInfo();

  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    marca: "",
    grupo: "",
    precio: "",
    modelo: "",
    año: "",
    kilometraje: "",
    transmision: "",
    combustible: "",
    estadoGeneral1: "",
    estadoGeneral2: "",
    ciudad: "",
    placa: "",
    nombre: "",
    telefono: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Si cambia la marca, limpiar modelo y pedir modelos nuevos

      if (field === "marca") {
        getModelsByBrand(value);
        return {
          ...prev,
          marca: value,
          grupo: "",
          modelo: "", // Limpiar modelo al cambiar marca
        };
      }
      if (field === "grupo") {
        // Grupo field - no longer used with InfoAuto API
        return {
          ...prev,
          grupo: value,
        };
      }
      if (field === "modelo") {
        console.log(field, value);
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

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOnSubmit = async () => {
    handleInputChange(
      "precio",
      years.filter((item) => item.year === Number(formData.año))[0].price
    );
    console.log(years.filter((item) => item.year === Number(formData.año))[0].price);

    handleNext();
  };

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex items-center">
          <svg
            className="w-6 h-6 text-white mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 14a3 3 0 016 0v3H7v-3zM14 14a3 3 0 016 0v3h-6v-3z"
            />
          </svg>
          <h1 className="text-xl font-bold text-white">
            Datos básicos del vehículo
          </h1>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <div className="relative">
                <select
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loadingBrands}
                >
                  <option value="">Seleccione</option>
                  {brands && brands.length > 0 ? (
                    brands.map((brand) =>
                      ["FORD", "HONDA", "PEUGEOT", "CHEVROLET"].includes(
                        brand.name
                      ) ? (
                        <option key={brand.id || brand.name} value={brand.id}>
                          {brand.name}
                        </option>
                      ) : null
                    )
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
            </div>
            {/* grupo - Disabled with InfoAuto API */}
            <div style={{ display: 'none' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo
              </label>
              <div className="relative">
                <select
                  value={formData.grupo}
                  onChange={(e) => handleInputChange("grupo", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={true}
                >
                  <option value="">Seleccione</option>
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
            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <div className="relative">
                <select
                  value={formData.modelo}
                  onChange={(e) => handleInputChange("modelo", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!formData.marca || loadingModels}
                >
                  <option value="">Seleccione</option>
                  {formData.marca &&
                  Array.isArray(models) &&
                  models.length > 0 ? (
                    models.map((model) => (
                      <option key={model.id || model.codia} value={model.codia}>
                        {model.description}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loadingModels
                        ? "Cargando modelos..."
                        : !formData.marca
                        ? "Seleccione una marca primero"
                        : "No hay modelos disponibles"}
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
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año de fabricación
              </label>
              <div className="relative">
                <select
                  value={formData.año}
                  onChange={(e) => handleInputChange("año", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
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
          </div>

          {/* Next Button */}
          <div className="mt-8">
            <button
              onClick={handleNext}
              disabled={!formData.marca || !formData.año}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex items-center">
          <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Estado del vehículo</h1>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Kilometraje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometraje
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.kilometraje}
                  onChange={(e) =>
                    handleInputChange("kilometraje", e.target.value)
                  }
                  placeholder="Ej: 45000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">km</span>
                </div>
              </div>
            </div>

            {/* Tipo de transmisión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de transmisión
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="transmision"
                    value="manual"
                    checked={formData.transmision === "manual"}
                    onChange={(e) =>
                      handleInputChange("transmision", e.target.value)
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Manual</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="transmision"
                    value="automatica"
                    checked={formData.transmision === "automatica"}
                    onChange={(e) =>
                      handleInputChange("transmision", e.target.value)
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Automática</span>
                </label>
              </div>
            </div>

            {/* Combustible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Combustible
              </label>
              <div className="relative">
                <select
                  value={formData.combustible}
                  onChange={(e) =>
                    handleInputChange("combustible", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
                  <option value="nafta">Nafta</option>
                  <option value="diesel">Diesel</option>
                  <option value="electrico">Eléctrico</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="gnc">GNC</option>
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

            {/* Estado general (primero) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado general
              </label>
              <div className="relative">
                <select
                  value={formData.estadoGeneral1}
                  onChange={(e) =>
                    handleInputChange("estadoGeneral1", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
                  <option value="excelente">Excelente</option>
                  <option value="muy-bueno">Muy bueno</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="necesita-reparacion">
                    Necesita reparación
                  </option>
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

            {/* Estado general (segundo) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado general
              </label>
              <div className="relative">
                <select
                  value={formData.estadoGeneral2}
                  onChange={(e) =>
                    handleInputChange("estadoGeneral2", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
                  <option value="interior-perfecto">Interior perfecto</option>
                  <option value="exterior-perfecto">Exterior perfecto</option>
                  <option value="motor-perfecto">Motor perfecto</option>
                  <option value="suspension-perfecta">
                    Suspensión perfecta
                  </option>
                  <option value="frenos-perfectos">Frenos perfectos</option>
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
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={
                !formData.kilometraje ||
                !formData.transmision ||
                !formData.combustible ||
                !formData.estadoGeneral1 ||
                !formData.estadoGeneral2
              }
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex items-center">
          <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Ubicación</h1>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Ciudad / Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad / Departamento
              </label>
              <div className="relative">
                <select
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
                  <option value="montevideo">Montevideo</option>
                  <option value="canelones">Canelones</option>
                  <option value="maldonado">Maldonado</option>
                  <option value="rocha">Rocha</option>
                  <option value="treinta-y-tres">Treinta y Tres</option>
                  <option value="cerro-largo">Cerro Largo</option>
                  <option value="rivera">Rivera</option>
                  <option value="artigas">Artigas</option>
                  <option value="salto">Salto</option>
                  <option value="paysandu">Paysandú</option>
                  <option value="rio-negro">Río Negro</option>
                  <option value="soriano">Soriano</option>
                  <option value="colonia">Colonia</option>
                  <option value="san-jose">San José</option>
                  <option value="flores">Flores</option>
                  <option value="florida">Florida</option>
                  <option value="lavalleja">Lavalleja</option>
                  <option value="durazno">Durazno</option>
                  <option value="tacuarembo">Tacuarembó</option>
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

            {/* Placa del vehículo (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa del vehículo (opcional)
              </label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => handleInputChange("placa", e.target.value)}
                placeholder="ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Informational Text */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Para validar historial y obtener una cotización más precisa
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    ¿Para qué necesitamos la placa?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Con la placa podemos validar el historial del vehículo y
                    ofrecerte una cotización más precisa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.ciudad}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex items-center">
          <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Datos de contacto</h1>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ingresa la información"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="Ej: +57 300 123 4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleBack}
              className="flex-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleOnSubmit}
              disabled={
                !formData.nombre || !formData.telefono || !formData.email
              }
              className="flex-2 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Ver resultado
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resultado de tu cotización
            </h1>
            <div className="w-24 h-1 bg-primary-600"></div>
          </div>
          <span className="text-lg text-gray-400">Completado</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Estimated Value Section */}
          <div className="flex items-start mb-8">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Este es el valor estimado de tu vehículo
              </h2>
              <p className="text-gray-500">
                Estimación basada en los datos proporcionados
              </p>
            </div>
          </div>

          {/* Vehicle Summary Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Auto ingresado (resumen):
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Marca:</span>
                  <span className="font-bold text-gray-900">
                    {brands.filter((item) => item.id === Number(formData.marca))[0]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modelo:</span>
                  <span className="font-bold text-gray-900">
                    {
                      models.filter((item) => item.codia == formData.modelo)[0]
                        ?.description
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grupo:</span>
                  <span className="font-bold text-gray-900">
                    {formData.grupo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Año:</span>
                  <span className="font-bold text-gray-900">
                    {formData.año}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estimation Section */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Estimación:
            </h3>
            <div className="bg-blue-50 rounded-lg p-6 inline-block">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                ${formData.precio}
              </div>
              <p className="text-sm text-gray-500">
                Nota: Este valor es una estimación inicial. El precio final se
                confirmará tras la inspección.
              </p>
            </div>
          </div>

          {/* Main CTAs Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              CTAs principales:
            </h3>
            <div className="space-y-4">
              {/* Agendar inspección gratuita */}
              <button className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Agendar inspección gratuita
              </button>

              {/* Hablar con un asesor */}
              <button className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Hablar con un asesor (WhatsApp)
              </button>

              {/* Secondary CTAs */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Descargar PDF
                </button>
                <button className="bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Enviar por correo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Summary Module */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Enviar resumen a tu correo
              </h2>
            </div>

            {/* Email Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-lg">@</span>
                  </div>
                </div>
              </div>

              {/* Checkbox Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-estimate"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="email-estimate"
                  className="ml-3 text-sm text-gray-700"
                >
                  Quiero recibir mi estimado por correo
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        {/* Progress Bar */}
        {!showResults ? (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Cotiza tu vehículo
              </h2>
              <span className="text-lg font-semibold text-primary-600">
                Paso {currentStep} de 4
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : null}

        {/* Step Content */}
        {showResults ? (
          renderResults()
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep4()}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
