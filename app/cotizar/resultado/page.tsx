"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDollarBlue } from "@/hooks/useDollarBlue";

interface QuoteData {
  marca: string;
  grupo: string;
  modelo: string;
  año: string;
  precio: string;
  version?: string;
  kilometraje?: string;
  estado?: string;
  nombre?: string;
  email?: string;
  ubicacion?: string;
}

export default function QuoteResultPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const {
    dollarBlue,
    loading: dollarLoading,
    error: dollarError,
    convertToPesos,
    formatDollarBlue,
    getLastUpdate,
  } = useDollarBlue();

  useEffect(() => {
    const getQuoteData = (): QuoteData => {
      const savedData = localStorage.getItem("quoteData");
      if (savedData) {
        return JSON.parse(savedData);
      }

      return {
        marca: "Chevrolet",
        grupo: "Onix",
        modelo: "Onix",
        año: "2019",
        precio: "772",
        version: "LTZ Automático",
        kilometraje: "45.000",
        estado: "Bueno",
        nombre: "",
        email: "",
        ubicacion: "Bogotá",
      };
    };

    setQuoteData(getQuoteData());
  }, []);

  const handleDownloadImage = async () => {
    try {
      if (!cardRef.current) return;

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      const filename = `cotizacion_${quoteData?.marca || "auto"}_${
        quoteData?.modelo || "modelo"
      }_${quoteData?.año || "anio"}.png`;
      link.download = filename.replace(/\s+/g, "-").toLowerCase();
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("No se pudo generar la imagen:", err);
      alert(
        "No se pudo descargar la imagen en este momento. Por favor, intenta nuevamente."
      );
    }
  };

  // Calcular los 3 tipos de venta
  const calcularTiposVenta = () => {
    const precioBase = parseFloat(quoteData?.precio || "0");

    return {
      consignacion: precioBase, // Precio normal
      permuta: precioBase * 0.95, // 5% menos
      inmediata: precioBase * 0.90, // 10% menos
    };
  };

  const formatearPrecio = (precio: number) => {
    return precio.toFixed(0);
  };

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-slate-600 font-medium">Cargando tu cotización...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 overflow-hidden">
      <Navbar />
      <div className="w-full h-full px-4 pt-16 pb-8 mx-auto max-w-7xl flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-0.5">
            Tu cotización está lista
          </h1>
          <p className="text-xs text-slate-600">
            Basada en los datos de tu vehículo
          </p>
        </div>

        {/* Main content card */}
        <div
          ref={cardRef}
          className="flex-1 mx-auto w-full max-w-6xl bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl overflow-hidden flex flex-col mb-8"
        >
          {/* Estimated Value Header */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 py-3 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
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
                <h2 className="text-base md:text-lg font-black text-white">
                  Valor estimado de tu vehículo
                </h2>
                <p className="text-xs text-white/70">
                  Basado en datos del mercado
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* LEFT COLUMN - Vehicle Details & Price */}
              <div className="flex flex-col">
                {/* Vehicle Summary */}
                <div className="mb-3">
                  <h3 className="text-sm font-black text-slate-800 mb-2">
                    Detalles de tu vehículo
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">Marca</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.marca}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">Modelo</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.modelo}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">Grupo</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.grupo}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">Año</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.año}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipos de Venta */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-sm font-black text-slate-800 mb-2">
                    Opciones de venta
                  </h3>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Consignación - Precio Normal */}
                    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Consignación</h4>
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full font-semibold">
                          Mejor precio
                        </span>
                      </div>
                      <div className="mb-1">
                        <div className="text-xl font-black">
                          ${formatearPrecio(calcularTiposVenta().consignacion)}
                        </div>
                        {dollarBlue && !dollarLoading && !dollarError && (
                          <div className="text-sm font-bold text-white/90">
                            {convertToPesos(formatearPrecio(calcularTiposVenta().consignacion))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Precio completo, pagas al vender
                      </p>
                    </div>

                    {/* Permuta - 5% menos */}
                    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Permuta</h4>
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full font-semibold">
                          -5%
                        </span>
                      </div>
                      <div className="mb-1">
                        <div className="text-xl font-black">
                          ${formatearPrecio(calcularTiposVenta().permuta)}
                        </div>
                        {dollarBlue && !dollarLoading && !dollarError && (
                          <div className="text-sm font-bold text-white/90">
                            {convertToPesos(formatearPrecio(calcularTiposVenta().permuta))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Cambia tu auto por otro
                      </p>
                    </div>

                    {/* Compra Inmediata - 10% menos */}
                    <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-600 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Compra inmediata</h4>
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full font-semibold">
                          -10%
                        </span>
                      </div>
                      <div className="mb-1">
                        <div className="text-xl font-black">
                          ${formatearPrecio(calcularTiposVenta().inmediata)}
                        </div>
                        {dollarBlue && !dollarLoading && !dollarError && (
                          <div className="text-sm font-bold text-white/90">
                            {convertToPesos(formatearPrecio(calcularTiposVenta().inmediata))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Dinero en el momento
                      </p>
                    </div>

                    {/* Nota de conversión en pesos */}
                    {dollarBlue && !dollarLoading && !dollarError && (
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">Dólar Blue:</span> {formatDollarBlue()}
                        </p>
                      </div>
                    )}

                    {/* Estados de carga y error */}
                    {dollarLoading && (
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
                        <p className="text-xs text-slate-600">
                          Cargando cotización...
                        </p>
                      </div>
                    )}

                    {dollarError && (
                      <div className="bg-red-50 rounded-lg p-2 border border-red-200 text-center">
                        <p className="text-xs text-red-600">
                          Error al cargar cotización
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - CTAs */}
              <div className="flex flex-col justify-center">
                <h3 className="text-sm font-black text-slate-800 mb-3 text-center">
                  ¿Qué deseas hacer ahora?
                </h3>

                <div className="space-y-3">
                  {/* Button - WhatsApp */}
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 px-4 rounded-full flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all duration-300 font-bold text-sm">
                    <svg
                      className="w-4 h-4 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    <span>Hablar con un asesor</span>
                  </button>

                  {/* Button - Nueva Cotización */}
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-white text-slate-900 border-2 border-slate-300 py-2.5 px-4 rounded-full flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-bold text-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Hacer otra cotización</span>
                  </button>

                  {/* Email form - compact inline version */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mt-4">
                    <p className="text-xs font-semibold text-slate-700 mb-2 text-center">
                      Recibe tu cotización por email
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none"
                      />
                      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
