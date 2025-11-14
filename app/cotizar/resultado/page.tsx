"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDollarBlue } from "@/hooks/useDollarBlue";
import { useEmailJS } from "@/hooks/useEmailJS";
import { toast } from "sonner";

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
  const [userEmail, setUserEmail] = useState("");

  const encodedMessage = encodeURIComponent(
    "Hola soy Ramon, tengo un fiat toro 2017 100mil km tal modelo a 17mil usd"
  );
  const whatsappUrl = `https://wa.me/541121596100?text=${encodedMessage}`;

  const {
    dollarBlue,
    loading: dollarLoading,
    error: dollarError,
    convertToPesos,
    formatDollarBlue,
    getLastUpdate,
  } = useDollarBlue();

  const {
    sending: sendingEmail,
    error: emailError,
    success: emailSuccess,
    sendQuoteEmail,
    resetStatus: resetEmailStatus,
  } = useEmailJS();

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

  // Convertir precio de InfoAuto (en miles de pesos sin 3 ceros) a precio real
  const obtenerPrecioBasePesos = () => {
    // 1. Precio de InfoAuto (ej: "772")
    const precioInfoAuto = parseFloat(quoteData?.precio || "0");

    // 2. Descontar 10%
    const precioConDescuento = precioInfoAuto * 0.90;

    // 3. Multiplicar por 1000 para obtener pesos reales
    const precioEnPesos = precioConDescuento * 1000;

    return precioEnPesos;
  };

  // Convertir pesos a dólares
  const convertirPesosADolares = (precioEnPesos: number): number => {
    if (!dollarBlue || !dollarBlue.venta) return 0;
    return precioEnPesos / dollarBlue.venta;
  };

  // Calcular los 3 tipos de venta (en pesos)
  // Inmediata es el precio de referencia (17.900.000 → 17.429.123)
  // Consignación es 10% más que Inmediata
  // Permuta es 5% más que Inmediata
  const calcularTiposVenta = () => {
    const precioBasePesos = obtenerPrecioBasePesos();

    // Factor para ajustar 17.900.000 a 17.429.123
    // 17.429.123 / 17.900.000 = 0.9726
    const factorAjuste = 17429123 / 17900000;

    // Inmediata: precio de referencia con el factor de ajuste
    const precioInmediata = precioBasePesos * factorAjuste;

    // Consignación: 10% más que Inmediata
    const precioConsignacion = precioInmediata * 1.1;

    // Permuta: 5% más que Inmediata
    const precioPermuta = precioInmediata * 1.05;

    return {
      inmediata: {
        pesos: precioInmediata,
        dolares: convertirPesosADolares(precioInmediata),
      },
      consignacion: {
        pesos: precioConsignacion,
        dolares: convertirPesosADolares(precioConsignacion),
      },
      permuta: {
        pesos: precioPermuta,
        dolares: convertirPesosADolares(precioPermuta),
      },
    };
  };

  const formatearPrecio = (precio: number) => {
    return precio.toFixed(0);
  };

  const formatearPrecioPesos = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const formatearPrecioDolares = (precio: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  // Manejar envío de email
  const handleSendEmail = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    if (!quoteData) {
      toast.error("No hay datos de cotización disponibles");
      return;
    }

    const tiposVenta = calcularTiposVenta();

    const emailParams = {
      to_email: userEmail,
      from_name: "KARS - Tu concesionario de confianza",
      marca: quoteData.marca,
      modelo: quoteData.modelo,
      grupo: quoteData.grupo,
      año: quoteData.año,
      precio_consignacion_usd: formatearPrecioDolares(
        tiposVenta.consignacion.dolares
      ),
      precio_consignacion_ars: formatearPrecioPesos(
        tiposVenta.consignacion.pesos
      ),
      precio_permuta_usd: formatearPrecioDolares(tiposVenta.permuta.dolares),
      precio_permuta_ars: formatearPrecioPesos(tiposVenta.permuta.pesos),
      precio_inmediata_usd: formatearPrecioDolares(
        tiposVenta.inmediata.dolares
      ),
      precio_inmediata_ars: formatearPrecioPesos(tiposVenta.inmediata.pesos),
      dolar_blue: dollarBlue ? formatDollarBlue() : "No disponible",
    };

    const success = await sendQuoteEmail(emailParams);

    if (success) {
      toast.success("¡Cotización enviada exitosamente!");
      setUserEmail(""); // Limpiar el campo
    } else {
      toast.error(
        "Error al enviar la cotización. Por favor intenta nuevamente."
      );
    }
  };

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-slate-600 font-medium">
              Cargando tu cotización...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Navbar />
      <div className="w-full px-4 pt-8 pb-16 mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            Tu cotización está lista
          </h1>
          <p className="text-sm text-slate-600">
            Basada en los datos de tu vehículo
          </p>
        </div>

        {/* Main content card */}
        <div
          ref={cardRef}
          className="mx-auto w-full max-w-6xl bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-xl overflow-visible flex flex-col">
          {/* Estimated Value Header */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 py-3 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
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

          <div className="flex-1 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT COLUMN - Vehicle Details & Price */}
              <div className="flex flex-col space-y-4">
                {/* Vehicle Summary */}
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-2">
                    Detalles de tu vehículo
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">
                          Marca
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.marca}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">
                          Modelo
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {quoteData.modelo}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 mb-1">
                          Grupo
                        </span>
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
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-2">
                    Opciones de venta
                  </h3>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Consignación - 10% más que Inmediata */}
                    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Consignación</h4>
                      </div>
                      <div className="mb-1">
                        {dollarBlue && !dollarLoading && !dollarError ? (
                          <>
                            <div className="text-sm font-bold text-white/90">
                              {formatearPrecioPesos(
                                calcularTiposVenta().consignacion.pesos
                              )}{" "}
                              ARS
                            </div>
                            <div className="text-xl font-black">
                              {formatearPrecioDolares(
                                calcularTiposVenta().consignacion.dolares
                              )}{" "}
                              USD
                            </div>
                          </>
                        ) : (
                          <div className="text-xl font-black">
                            {formatearPrecioPesos(
                              calcularTiposVenta().consignacion.pesos
                            )}{" "}
                            ARS
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">Cobras al vender</p>
                    </div>

                    {/* Permuta - 5% más que Inmediata */}
                    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Permuta</h4>
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full font-semibold">
                          +5%
                        </span>
                      </div>
                      <div className="mb-1">
                        {dollarBlue && !dollarLoading && !dollarError ? (
                          <>
                            <div className="text-sm font-bold text-white/90">
                              {formatearPrecioPesos(
                                calcularTiposVenta().permuta.pesos
                              )}{" "}
                              ARS
                            </div>
                            <div className="text-xl font-black">
                              {formatearPrecioDolares(
                                calcularTiposVenta().permuta.dolares
                              )}{" "}
                              USD
                            </div>
                          </>
                        ) : (
                          <div className="text-xl font-black">
                            {formatearPrecioPesos(
                              calcularTiposVenta().permuta.pesos
                            )}
                            ARS
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Cambia tu auto por otro
                      </p>
                    </div>

                    {/* Compra Inmediata - Precio de referencia */}
                    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-lg p-3 text-white shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold">Compra inmediata</h4>
                      </div>
                      <div className="mb-1">
                        {dollarBlue && !dollarLoading && !dollarError ? (
                          <>
                            <div className="text-sm font-bold text-white/90">
                              {formatearPrecioPesos(
                                calcularTiposVenta().inmediata.pesos
                              )}{" "}
                              ARS
                            </div>
                            <div className="text-xl font-black">
                              {formatearPrecioDolares(
                                calcularTiposVenta().inmediata.dolares
                              )}{" "}
                              USD
                            </div>
                          </>
                        ) : (
                          <div className="text-xl font-black">
                            {formatearPrecioPesos(
                              calcularTiposVenta().inmediata.pesos
                            )}{" "}
                            ARS
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Dinero en el momento
                      </p>
                    </div>

                    {dollarBlue && !dollarLoading && !dollarError && (
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">
                            Cotización Dólar Blue:
                          </span>{" "}
                          {formatDollarBlue()}
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

              {/* RIGHT COLUMN - Image Card */}
              <div className="flex flex-col">
                <div className="bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-300 p-4 h-full flex items-center justify-center">
                  <img
                    src="/karscotizacion.png"
                    alt="KARS Cotización"
                    className="w-full h-auto object-contain rounded-xl"
                    style={{
                      objectPosition: "center",
                    }}
                  />
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
