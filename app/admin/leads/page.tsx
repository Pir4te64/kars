"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageCircle,
} from "lucide-react";

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
  precio_consignacion_ars?: string;
  precio_consignacion_usd?: string;
  precio_permuta_ars?: string;
  precio_permuta_usd?: string;
  precio_inmediata_ars?: string;
  precio_inmediata_usd?: string;
  cotizacion_dolar?: string;
  created_at: string;
}

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "nuevo", label: "Nuevos", color: "bg-blue-100 text-blue-700" },
  { value: "contactado", label: "Contactados", color: "bg-yellow-100 text-yellow-700" },
  { value: "calificado", label: "Calificados", color: "bg-green-100 text-green-700" },
  { value: "cerrado", label: "Cerrados", color: "bg-purple-100 text-purple-700" },
  { value: "perdido", label: "Perdidos", color: "bg-red-100 text-red-700" },
];

function getEstadoStyle(estado: string) {
  return ESTADOS.find((e) => e.value === estado)?.color || "bg-gray-100 text-gray-700";
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronsLeft className="w-3.5 h-3.5" /></button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
      {pages.map((p, i) => p === "..." ? <span key={`d${i}`} className="px-1 text-xs text-gray-400">...</span> : (
        <button key={p} onClick={() => onPageChange(p)} className={`min-w-[24px] h-6 rounded text-xs font-medium ${p === page ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronsRight className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllLeads(d.leads); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = allLeads.filter((l) => {
    if (filter !== "todos" && l.estado !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        l.nombre?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.marca?.toLowerCase().includes(s) ||
        l.modelo?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => { setPage(1); }, [filter, search]);

  const updateEstado = async (id: string, nuevoEstado: string) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado: nuevoEstado }),
    });
    const data = await res.json();
    if (data.success) {
      setAllLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado: nuevoEstado } : l)));
      toast.success("Estado actualizado");
    } else {
      toast.error("Error al actualizar");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Eliminar este lead?")) return;
    const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setAllLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead eliminado");
    } else {
      toast.error("Error al eliminar");
    }
  };

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) + " " + dt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  const counts = ESTADOS.filter((e) => e.value !== "todos").reduce(
    (acc, e) => ({ ...acc, [e.value]: allLeads.filter((l) => l.estado === e.value).length }),
    {} as Record<string, number>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold text-gray-900">Leads del Cotizador</h1>
          <span className="text-xs text-gray-400 ml-1">{allLeads.length} total</span>
        </header>

        <div className="flex flex-col h-[calc(100vh-48px)]">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50/80 flex-wrap">
            {/* Stats pills */}
            <div className="flex items-center gap-1">
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setFilter(e.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filter === e.value
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {e.label}
                  {e.value !== "todos" && (
                    <span className="ml-1 opacity-70">{counts[e.value] || 0}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative ml-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400">{filtered.length} resultados</span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              Cargando...
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-100">
                  <tr className="border-b">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-[110px]">Fecha</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Cliente</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Contacto</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Vehiculo</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Precios</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[100px]">Estado</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[90px]">Acc.</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No hay leads</td></tr>
                  )}
                  {paged.map((lead, idx) => (
                    <tr key={lead.id} className={`border-b hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtDate(lead.created_at)}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{lead.nombre || "—"}</div>
                        {lead.ubicacion && (
                          <div className="text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3" />{lead.ubicacion}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-600 truncate max-w-[160px]">{lead.email}</a>
                        </div>
                        {lead.telefono && (
                          <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            {lead.telefono}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <Car className="w-3 h-3 text-gray-400 shrink-0" />
                          {lead.marca} {lead.modelo}
                        </div>
                        <div className="text-gray-400 mt-0.5">
                          {lead.año} &middot; {lead.kilometraje || "?"} km
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {lead.precio_consignacion_usd ? (
                          <div className="space-y-0.5">
                            <div className="text-green-700 font-medium">Cons: {lead.precio_consignacion_usd}</div>
                            {lead.precio_permuta_usd && <div className="text-blue-600">Perm: {lead.precio_permuta_usd}</div>}
                            {lead.precio_inmediata_usd && <div className="text-purple-600">Inm: {lead.precio_inmediata_usd}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <select
                          value={lead.estado}
                          onChange={(e) => updateEstado(lead.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer ${getEstadoStyle(lead.estado)}`}
                        >
                          {ESTADOS.filter((e) => e.value !== "todos").map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {lead.telefono && (
                            <a
                              href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-green-50 text-green-600"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50/80">
              <span className="text-xs text-gray-400">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, filtered.length)} de {filtered.length}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
