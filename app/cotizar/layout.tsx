import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizar Auto | KARS - Cotización Rápida de Vehículos",
  description:
    "Cotiza tu auto en poco tiempo. Ingresa los datos de tu vehículo y obtén una estimación de valor al instante. Proceso rápido y sin compromiso.",
  keywords:
    "cotizar auto, cotización de vehículos, valor de auto usado, precio de auto, tasación vehicular",
};

export default function CotizarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
