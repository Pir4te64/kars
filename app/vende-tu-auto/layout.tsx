import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vende tu Auto | KARS - Cotiza tu vehículo",
  description:
    "Vende tu auto de forma rápida y segura. Obtén una cotización instantánea ingresando los datos de tu vehículo. Proceso simple y confiable.",
  keywords:
    "vender auto, cotizar vehículo, venta de autos usados, tasación de autos, vender carro",
};

export default function VendeTuAutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
