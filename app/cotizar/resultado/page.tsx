"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useRef, useEffect, useState } from "react";
import * as htmlToImage from "html-to-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDollarBlue } from "@/hooks/useDollarBlue";
import { toast } from "sonner";
import {
  getPriceAdjustment,
  applyPriceAdjustment,
} from "@/constants/priceAdjustments";
import { calculatePriceByKilometers } from "@/lib/car-quote";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [tiposVenta, setTiposVenta] = useState<{
    inmediata: { pesos: number; dolares: number };
    consignacion: { pesos: number; dolares: number };
    permuta: { pesos: number; dolares: number };
  } | null>(null);

  const encodedMessage = encodeURIComponent(
    "Hola soy Ramon, tengo un fiat toro 2017 100mil km tal modelo a 17mil usd"
  );
  const whatsappUrl = `https://wa.me/541121596100?text=${encodedMessage}`;

  const {
    dollarBlue,
    loading: dollarLoading,
    error: dollarError,
    formatDollarBlue,
  } = useDollarBlue();

  useEffect(() => {
    const getQuoteData = (): QuoteData => {
      const savedData = localStorage.getItem("quoteData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return parsed;
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

    const data = getQuoteData();
    setQuoteData(data);
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
      alert(
        "No se pudo descargar la imagen en este momento. Por favor, intenta nuevamente."
      );
    }
  };

  // Convertir precio del modelo a precio real en pesos
  // El precio viene de la API sin los últimos 3 ceros (ej: "7600" = 7,600,000 pesos)
  const obtenerPrecioBasePesos = async (): Promise<number> => {
    // 1. Precio del modelo (ej: "7600")
    const precioString = quoteData?.precio || "0";
    const precioRaw = parseFloat(precioString);

    // 2. Si el precio es 0, NaN, o no es un número válido, retornar 0
    if (!precioRaw || precioRaw === 0 || isNaN(precioRaw)) {
      return 0;
    }

    // 3. Aplicar ajuste de precio según marca, modelo y año
    let precioAjustado = precioRaw;
    if (quoteData?.marca && quoteData?.modelo && quoteData?.año) {
      const año = parseInt(quoteData.año);
      if (!isNaN(año)) {
        console.log(`💰 Precio que arroja la API: ${precioRaw} ARS`);

        const adjustment = await getPriceAdjustment(
          quoteData.marca,
          quoteData.modelo,
          año
        );

        if (adjustment !== null) {
          console.log(
            `📈 Porcentaje aplicado: ${adjustment > 0 ? "+" : ""}${adjustment}%`
          );

          const precioConAjuste = applyPriceAdjustment(precioRaw, adjustment);
          if (precioConAjuste !== null) {
            precioAjustado = precioConAjuste;
            console.log(`✅ Precio con el % aplicado: ${precioAjustado} ARS`);
          } else {
            return 0; // Modelo no disponible para ese rango
          }
        }
      }
    }

    // 4. Multiplicar por 1000 para obtener el precio real en pesos
    let precioEnPesos = precioAjustado * 1000;

    // 5. Aplicar ajuste por kilometraje si está disponible
    if (quoteData?.kilometraje && quoteData?.año && precioEnPesos > 0) {
      const precioConAjusteKm = calculatePriceByKilometers(
        precioEnPesos,
        quoteData.kilometraje,
        quoteData.año
      );
      precioEnPesos = precioConAjusteKm;
      console.log(`📏 Ajuste por kilometraje aplicado: ${quoteData.kilometraje} km`);
    }

    return precioEnPesos;
  };

  // Convertir pesos a dólares
  const convertirPesosADolares = (precioEnPesos: number): number => {
    if (!dollarBlue || !dollarBlue.venta) return 0;
    return precioEnPesos / dollarBlue.venta;
  };

  // Mostrar siempre las tres opciones (consignación, permuta, compra inmediata) para todos los años
  const debeMostrarCompraInmediata = (): boolean => {
    return true;
  };

  // Calcular los 3 tipos de venta (en pesos)
  // Inmediata es el precio base directo de la API
  // Consignación es 10% más que Inmediata
  // Permuta es 5% más que Inmediata
  const calcularTiposVenta = async () => {
    const precioBasePesos = await obtenerPrecioBasePesos();

    // Si no hay precio base, retornar valores en 0
    if (!precioBasePesos || precioBasePesos === 0 || isNaN(precioBasePesos)) {
      return {
        inmediata: {
          pesos: 0,
          dolares: 0,
        },
        consignacion: {
          pesos: 0,
          dolares: 0,
        },
        permuta: {
          pesos: 0,
          dolares: 0,
        },
      };
    }

    // Inmediata: precio base directo de la API
    const precioInmediata = precioBasePesos;

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

  // Calcular tipos de venta cuando cambian los datos
  useEffect(() => {
    if (quoteData && dollarBlue) {
      calcularTiposVenta()
        .then(setTiposVenta)
        .catch(() => {
          setTiposVenta(null);
        });
    } else {
      setTiposVenta(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData, dollarBlue]);

  // Enviar email automáticamente cuando los resultados estén listos
  useEffect(() => {
    const enviarEmailAutomatico = async () => {
      // Solo enviar si:
      // 1. Hay datos de cotización
      // 2. Hay email en quoteData
      // 3. Los tipos de venta están calculados
      // 4. Hay cotización del dólar
      // 5. No se ha enviado ya (usar una bandera para evitar múltiples envíos)
      if (
        quoteData &&
        quoteData.email &&
        quoteData.email.includes("@") &&
        tiposVenta &&
        dollarBlue &&
        dollarBlue.venta
      ) {
        // Evitar múltiples envíos usando una bandera en sessionStorage
        const emailEnviadoKey = `email_enviado_${quoteData.marca}_${quoteData.modelo}_${quoteData.año}_${quoteData.kilometraje}`;
        const emailYaEnviado = sessionStorage.getItem(emailEnviadoKey);
        
        if (!emailYaEnviado) {
          // Marcar como enviado ANTES del fetch para evitar doble envío
          // (el useEffect puede ejecutarse dos veces por Strict Mode o por cambios de deps)
          sessionStorage.setItem(emailEnviadoKey, "true");
          console.log("📧 Enviando email automáticamente...");
          
          try {
            const emailBody = {
              email: quoteData.email,
              nombre: quoteData.nombre || "",
              marca: quoteData.marca,
              modelo: quoteData.modelo,
              grupo: quoteData.grupo,
              año: quoteData.año,
              precio: quoteData.precio,
              cotizacionDolar: dollarBlue.venta,
              kilometraje: quoteData.kilometraje || "",
              ubicacion: quoteData.ubicacion || "",
              // Enviar las tres cotizaciones al email también
              precio_inmediata_ars: formatearPrecioPesos(
                tiposVenta.inmediata.pesos
              ),
              precio_inmediata_usd: formatearPrecioDolares(
                tiposVenta.inmediata.dolares
              ),
              precio_consignacion_ars: formatearPrecioPesos(
                tiposVenta.consignacion.pesos
              ),
              precio_consignacion_usd: formatearPrecioDolares(
                tiposVenta.consignacion.dolares
              ),
              precio_permuta_ars: formatearPrecioPesos(tiposVenta.permuta.pesos),
              precio_permuta_usd: formatearPrecioDolares(
                tiposVenta.permuta.dolares
              ),
              dolar_blue: formatDollarBlue(),
            };

            const response = await fetch("/api/send-quote-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(emailBody),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Error al enviar el email");
            }

            // Guardar lead en Supabase con los precios exactos que se muestran en pantalla
            try {
              console.log("💾 Guardando lead en Supabase con precios finales...");
              const leadResponse = await fetch("/api/leads", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  nombre: quoteData.nombre || "",
                  email: quoteData.email,
                  telefono: "", // El teléfono no se captura en la página de resultados
                  ubicacion: quoteData.ubicacion || "",
                  marca: quoteData.marca,
                  modelo: quoteData.modelo,
                  grupo: quoteData.grupo,
                  año: quoteData.año,
                  kilometraje: quoteData.kilometraje || "",
                  precio: quoteData.precio,
                  // Usar los valores numéricos exactos de tiposVenta (los que se muestran en pantalla)
                  // Convertir a strings para Supabase (que espera VARCHAR/TEXT)
                  precio_inmediata_ars: tiposVenta.inmediata.pesos.toFixed(0),
                  precio_inmediata_usd: tiposVenta.inmediata.dolares.toFixed(2),
                  precio_consignacion_ars: tiposVenta.consignacion.pesos.toFixed(0),
                  precio_consignacion_usd: tiposVenta.consignacion.dolares.toFixed(2),
                  precio_permuta_ars: tiposVenta.permuta.pesos.toFixed(0),
                  precio_permuta_usd: tiposVenta.permuta.dolares.toFixed(2),
                  cotizacion_dolar: dollarBlue.venta.toString(),
                }),
              });

              const leadData = await leadResponse.json();

              if (!leadResponse.ok) {
                console.warn(
                  "⚠️ Error al guardar lead en Supabase:",
                  leadData.error || "Error desconocido"
                );
              } else {
                console.log("✅ Lead guardado exitosamente en Supabase");
              }
            } catch (leadError) {
              console.error("❌ Error al guardar lead:", leadError);
            }

            toast.success("¡Cotización enviada a tu email!");
            console.log("✅ Email enviado automáticamente");
          } catch (error) {
            console.error("❌ Error al enviar email automáticamente:", error);
            // Si falla, quitar la marca para permitir reintento al recargar
            sessionStorage.removeItem(emailEnviadoKey);
            // No mostrar error al usuario para no interrumpir la experiencia
          }
        }
      }
    };

    enviarEmailAutomatico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData, tiposVenta, dollarBlue]);

  const formatearPrecio = (precio: number) => {
    return precio.toFixed(0);
  };

  const formatearPrecioPesos = (precio: number) => {
    if (!precio || isNaN(precio) || precio === 0) {
      return "$0 ARS";
    }
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const formatearPrecioDolares = (precio: number) => {
    if (!precio || isNaN(precio) || precio === 0) {
      return "$0 USD";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  // El email se envía automáticamente en el useEffect cuando los resultados están listos

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
                        <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full font-semibold">
                          +10%
                        </span>
                      </div>
                      <div className="mb-1">
                        {tiposVenta ? (
                          dollarBlue && !dollarLoading && !dollarError ? (
                            <>
                              <div className="text-sm font-bold text-white/90">
                                {formatearPrecioPesos(
                                  tiposVenta.consignacion.pesos
                                )}{" "}
                                ARS
                              </div>
                              <div className="text-xl font-black">
                                {formatearPrecioDolares(
                                  tiposVenta.consignacion.dolares
                                )}{" "}
                                USD
                              </div>
                            </>
                          ) : (
                            <div className="text-xl font-black">
                              {formatearPrecioPesos(
                                tiposVenta.consignacion.pesos
                              )}{" "}
                              ARS
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-white/70">
                            Cargando...
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
                        {tiposVenta ? (
                          dollarBlue && !dollarLoading && !dollarError ? (
                            <>
                              <div className="text-sm font-bold text-white/90">
                                {formatearPrecioPesos(tiposVenta.permuta.pesos)}{" "}
                                ARS
                              </div>
                              <div className="text-xl font-black">
                                {formatearPrecioDolares(
                                  tiposVenta.permuta.dolares
                                )}{" "}
                                USD
                              </div>
                            </>
                          ) : (
                            <div className="text-xl font-black">
                              {formatearPrecioPesos(tiposVenta.permuta.pesos)}
                              ARS
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-white/70">
                            Cargando...
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/90">
                        Cambia tu auto por otro
                      </p>
                    </div>

                    {/* Compra Inmediata - Precio de referencia */}
                    {/* Solo mostrar si cumple las condiciones: 2008-2018 o (2019+ y precio < 15000 USD) */}
                    {debeMostrarCompraInmediata() && (
                      <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-lg p-3 text-white shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold">
                            Compra inmediata
                          </h4>
                        </div>
                        <div className="mb-1">
                          {tiposVenta ? (
                            dollarBlue && !dollarLoading && !dollarError ? (
                              <>
                                <div className="text-sm font-bold text-white/90">
                                  {formatearPrecioPesos(
                                    tiposVenta.inmediata.pesos
                                  )}{" "}
                                  ARS
                                </div>
                                <div className="text-xl font-black">
                                  {formatearPrecioDolares(
                                    tiposVenta.inmediata.dolares
                                  )}{" "}
                                  USD
                                </div>
                              </>
                            ) : (
                              <div className="text-xl font-black">
                                {formatearPrecioPesos(
                                  tiposVenta.inmediata.pesos
                                )}{" "}
                                ARS
                              </div>
                            )
                          ) : (
                            <div className="text-sm text-white/70">
                              Cargando...
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/90">
                          Dinero en el momento
                        </p>
                      </div>
                    )}

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

            {/* Mensaje informativo */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-slate-700 text-center leading-relaxed">
                  Este valor es una referencia inicial. Un asesor de KARS te va a contactar para evaluar tu caso y ofrecerte la mejor opción
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
