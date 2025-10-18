"use client";

import { useState, useEffect } from "react";
import {
  DOLLAR_API_CONFIG,
  formatPesos,
  formatDate,
  convertUsdToArs,
  type DollarApiResponse,
} from "@/lib/dollar-api";

type DollarBlueData = DollarApiResponse;

export function useDollarBlue() {
  const [dollarBlue, setDollarBlue] = useState<DollarBlueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDollarBlue = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${DOLLAR_API_CONFIG.baseUrl}${DOLLAR_API_CONFIG.endpoints.blue}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDollarBlue(data);
    } catch (err) {
      console.error("Error fetching dollar blue:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const convertToPesos = (usdAmount: string | number): string => {
    if (!dollarBlue) return "0";

    const amount =
      typeof usdAmount === "string"
        ? parseFloat(usdAmount.replace(/[^0-9.-]/g, ""))
        : usdAmount;

    if (isNaN(amount)) return "0";

    // Usar el precio de venta del dólar blue para la conversión
    const pesosAmount = convertUsdToArs(amount, dollarBlue.venta);

    return formatPesos(pesosAmount);
  };

  const formatDollarBlue = (): string => {
    if (!dollarBlue) return "No disponible";

    return formatPesos(dollarBlue.venta);
  };

  const getLastUpdate = (): string => {
    if (!dollarBlue) return "";

    return formatDate(dollarBlue.fechaActualizacion);
  };

  useEffect(() => {
    fetchDollarBlue();
  }, []);

  return {
    dollarBlue,
    loading,
    error,
    convertToPesos,
    formatDollarBlue,
    getLastUpdate,
    refetch: fetchDollarBlue,
  };
}
