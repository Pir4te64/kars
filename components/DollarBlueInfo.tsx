"use client";

import { useDollarBlue } from "@/hooks/useDollarBlue";

interface DollarBlueInfoProps {
  className?: string;
}

export default function DollarBlueInfo({
  className = "",
}: DollarBlueInfoProps) {
  const {
    dollarBlue,
    loading,
    error,
    formatDollarBlue,
    getLastUpdate,
    refetch,
  } = useDollarBlue();

  if (loading) {
    return (
      <div
        className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-600">
            Cargando cotización del dólar...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">
              Error al cargar cotización
            </p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="text-red-600 hover:text-red-700 text-sm underline">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dollarBlue) {
    return null;
  }

  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-green-800">
          Cotización Dólar Blue
        </h4>
        <button
          onClick={refetch}
          className="text-green-600 hover:text-green-700 text-xs underline">
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-green-700">Compra:</span>
          <span className="font-medium text-green-800 ml-1">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(dollarBlue.compra)}
          </span>
        </div>
        <div>
          <span className="text-green-700">Venta:</span>
          <span className="font-medium text-green-800 ml-1">
            {formatDollarBlue()}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-green-600">
        <div>Fuente: {dollarBlue.casa}</div>
        <div>Actualizado: {getLastUpdate()}</div>
      </div>
    </div>
  );
}
