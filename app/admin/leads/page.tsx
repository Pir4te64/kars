"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  marca: string;
  modelo: string;
  grupo: string;
  año: string;
  kilometraje: string;
  precio: string;
  estado: string;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // Para los contadores
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    // Filtrar localmente cuando cambia el filtro
    if (filter === "todos") {
      setLeads(allLeads);
    } else {
      setLeads(allLeads.filter((lead) => lead.estado === filter));
    }
  }, [filter, allLeads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leads");
      const data = await response.json();

      if (data.success) {
        setAllLeads(data.leads);
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar ambas listas
        const updateFn = (lead: Lead) =>
          lead.id === id ? { ...lead, estado: nuevoEstado } : lead;

        setAllLeads((prev) => prev.map(updateFn));
        setLeads((prev) => prev.map(updateFn));
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Error al actualizar el estado");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este lead?")) {
      return;
    }

    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remover de ambas listas
        setAllLeads((prev) => prev.filter((lead) => lead.id !== id));
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      } else {
        alert("Error al eliminar el lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Error al eliminar el lead");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculatePrices = (precioUSD: string) => {
    const precioRaw = parseFloat(precioUSD);
    if (isNaN(precioRaw) || precioRaw <= 0) {
      return {
        consignacion: "Consultar",
        permuta: "Consultar",
        inmediata: "Consultar",
      };
    }

    // Aplicar misma lógica que en el cotizador y email (aumentar 10%)
    const precioBasePesos = precioRaw * 1.10 * 1000;
    const precioConsignacion = precioBasePesos;
    const precioPermuta = precioBasePesos * 0.95;
    const precioInmediata = precioBasePesos * 0.90;

    return {
      consignacion: `$${precioConsignacion.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      permuta: `$${precioPermuta.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      inmediata: `$${precioInmediata.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
    };
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      nuevo: "bg-blue-100 text-blue-800",
      contactado: "bg-yellow-100 text-yellow-800",
      calificado: "bg-green-100 text-green-800",
      cerrado: "bg-purple-100 text-purple-800",
      perdido: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Leads del Cotizador</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Leads del Cotizador
              </h1>
              <p className="text-gray-600">
                Personas que completaron el cotizador y dejaron sus datos de contacto
              </p>
            </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("todos")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "todos"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({allLeads.length})
            </button>
            <button
              onClick={() => setFilter("nuevo")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "nuevo"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Nuevos ({allLeads.filter((l) => l.estado === "nuevo").length})
            </button>
            <button
              onClick={() => setFilter("contactado")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "contactado"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Contactados ({allLeads.filter((l) => l.estado === "contactado").length})
            </button>
            <button
              onClick={() => setFilter("calificado")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "calificado"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Calificados ({allLeads.filter((l) => l.estado === "calificado").length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Cotizaciones</p>
            <p className="text-2xl font-bold text-gray-900">{allLeads.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Sin Contactar</p>
            <p className="text-2xl font-bold text-blue-600">
              {allLeads.filter((l) => l.estado === "nuevo").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Ya Contactados</p>
            <p className="text-2xl font-bold text-yellow-600">
              {allLeads.filter((l) => l.estado === "contactado").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Con Interés</p>
            <p className="text-2xl font-bold text-green-600">
              {allLeads.filter((l) => l.estado === "calificado").length}
            </p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Cargando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No hay cotizaciones aún. Los datos aparecerán cuando alguien complete el cotizador.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precios ARS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.ubicacion}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lead.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.telefono}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.marca} {lead.modelo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.año} - {lead.kilometraje} km
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(() => {
                          const precios = calculatePrices(lead.precio);
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-green-700 text-xs">
                                Consignación: {precios.consignacion}
                              </div>
                              <div className="text-blue-600 text-xs">
                                Permuta -5%: {precios.permuta}
                              </div>
                              <div className="text-purple-600 text-xs">
                                Inmediata -10%: {precios.inmediata}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                            lead.estado
                          )}`}
                        >
                          {lead.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-2">
                          {/* Botones de contacto */}
                          <div className="flex gap-2">
                            <a
                              href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                            >
                              WhatsApp
                            </a>
                            <span className="text-gray-300">|</span>
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Email
                            </a>
                          </div>

                          {/* Botones de cambio de estado */}
                          <div className="flex flex-col gap-1">
                            {lead.estado === "nuevo" && (
                              <button
                                onClick={() => updateEstado(lead.id, "contactado")}
                                className="text-left text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                              >
                                ✓ Marcar contactado
                              </button>
                            )}

                            {lead.estado === "contactado" && (
                              <>
                                <button
                                  onClick={() => updateEstado(lead.id, "calificado")}
                                  className="text-left text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                >
                                  ✓ Marcar calificado
                                </button>
                                <button
                                  onClick={() => updateEstado(lead.id, "nuevo")}
                                  className="text-left text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                  ← Volver a nuevo
                                </button>
                              </>
                            )}

                            {lead.estado === "calificado" && (
                              <>
                                <button
                                  onClick={() => updateEstado(lead.id, "contactado")}
                                  className="text-left text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                  ← Volver a contactado
                                </button>
                                <button
                                  onClick={() => deleteLead(lead.id)}
                                  className="text-left text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                >
                                  🗑️ Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
