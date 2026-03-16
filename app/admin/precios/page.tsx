"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Percent, DollarSign, Save, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Brand {
  id: number;
  name: string;
}

interface CustomPriceEntry {
  amount: number;
  currency: "ARS" | "USD";
}

interface Model {
  id: number;
  name: string;
  brand_id: number;
  codia: string;
  year_from: number;
  year_to: number;
  price_adjustments: Record<string, number | null> | null;
  custom_prices: Record<string, CustomPriceEntry | number | null> | null;
}

type EditMode = "percent" | "price";
type PriceCurrency = "ARS" | "USD";

const YEARS = Array.from({ length: 19 }, (_, i) => (2008 + i).toString());

function formatAmount(entry: CustomPriceEntry | number | null | undefined): string {
  if (entry === null || entry === undefined) return "—";
  if (typeof entry === "number") return "$" + Math.round(entry).toLocaleString("es-AR");
  const symbol = entry.currency === "USD" ? "U$D " : "$";
  return symbol + Math.round(entry.amount).toLocaleString("es-AR");
}

function parseAmount(raw: string): number | null {
  const clean = raw.replace(/[$.U]/g, "").replace(/D/g, "").replace(",", ".").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export default function PreciosPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ modelId: number; year: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCurrency, setEditCurrency] = useState<PriceCurrency>("ARS");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modifiedModels, setModifiedModels] = useState<Set<number>>(new Set());
  const [editMode, setEditMode] = useState<EditMode>("percent");
  const [defaultCurrency, setDefaultCurrency] = useState<PriceCurrency>("ARS");
  const LIMIT = 30;

  useEffect(() => { fetchBrands(); }, []);

  const fetchModels = useCallback(async () => {
    if (!selectedBrand) { setModels([]); setTotal(0); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ brand_id: selectedBrand, page: page.toString(), limit: LIMIT.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/models?${params}`);
      const data = await res.json();
      if (data.success) { setModels(data.models); setTotal(data.total || 0); }
    } catch {
      toast.error("Error al cargar modelos");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, search, page]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (data.success) setBrands(data.brands);
    } catch { console.error("Error fetching brands"); }
  };

  const getCustomEntry = (model: Model, year: string): CustomPriceEntry | null => {
    const val = model.custom_prices?.[year];
    if (val === null || val === undefined) return null;
    if (typeof val === "number") return { amount: val, currency: "ARS" };
    return val as CustomPriceEntry;
  };

  const handleCellClick = (modelId: number, year: string, model: Model) => {
    if (editMode === "percent") {
      const pct = model.price_adjustments?.[year] ?? null;
      setEditValue(pct !== null ? pct.toString() : "");
      setEditCurrency("ARS");
    } else {
      const entry = getCustomEntry(model, year);
      setEditValue(entry ? Math.round(entry.amount).toString() : "");
      setEditCurrency(entry?.currency ?? defaultCurrency);
    }
    setEditingCell({ modelId, year });
  };

  const handleCellSave = (modelId: number, year: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    if (editMode === "percent") {
      const newValue = editValue.trim() === "" ? null : parseFloat(editValue.replace(",", "."));
      if (editValue.trim() !== "" && (newValue === null || isNaN(newValue))) {
        toast.error("Valor inválido (ej: -15.5)");
        return;
      }
      const updated = { ...(model.price_adjustments || {}) };
      if (newValue === null) delete updated[year];
      else updated[year] = newValue;
      setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, price_adjustments: updated } : m));
    } else {
      const amount = editValue.trim() === "" ? null : parseAmount(editValue);
      if (editValue.trim() !== "" && (amount === null || isNaN(amount as number))) {
        toast.error("Valor inválido (ej: 12500000 o 9500)");
        return;
      }
      const updated = { ...(model.custom_prices || {}) };
      if (amount === null) {
        delete updated[year];
      } else {
        updated[year] = { amount, currency: editCurrency };
      }
      setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, custom_prices: updated } : m));
    }

    setModifiedModels((prev) => new Set(prev).add(modelId));
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, modelId: number, year: string) => {
    if (e.key === "Enter") handleCellSave(modelId, year);
    else if (e.key === "Escape") setEditingCell(null);
  };

  const saveModel = async (modelId: number) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;
    setSaving(modelId);
    try {
      const body: Record<string, unknown> = { id: modelId };
      if (editMode === "percent") body.price_adjustments = model.price_adjustments || {};
      else body.custom_prices = model.custom_prices || {};

      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} guardado`);
        setModifiedModels((prev) => { const next = new Set(prev); next.delete(modelId); return next; });
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(null);
    }
  };

  const saveAll = async () => {
    for (const id of Array.from(modifiedModels)) await saveModel(id);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const getCellStyle = (model: Model, year: string) => {
    if (editMode === "price") {
      const entry = getCustomEntry(model, year);
      if (entry) {
        return entry.currency === "USD"
          ? "bg-green-50 text-green-800 font-semibold"
          : "bg-purple-50 text-purple-800 font-semibold";
      }
      return getPercentColor(model.price_adjustments?.[year] ?? null) + " opacity-50";
    }
    return getPercentColor(model.price_adjustments?.[year] ?? null);
  };

  const getPercentColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "bg-gray-100 text-gray-400";
    if (value > 5) return "bg-green-100 text-green-800";
    if (value > 0) return "bg-green-50 text-green-700";
    if (value === 0) return "bg-blue-50 text-blue-700";
    if (value > -15) return "bg-yellow-50 text-yellow-700";
    if (value > -30) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getCellDisplay = (model: Model, year: string) => {
    if (editMode === "price") {
      const entry = getCustomEntry(model, year);
      if (entry) return formatAmount(entry);
      const pct = model.price_adjustments?.[year] ?? null;
      return pct !== null ? `${pct > 0 ? "+" : ""}${pct}%` : "—";
    }
    const pct = model.price_adjustments?.[year] ?? null;
    return pct !== null ? `${pct > 0 ? "+" : ""}${pct}%` : "—";
  };

  const customPricesCount = models.reduce(
    (acc, m) => acc + Object.keys(m.custom_prices || {}).length, 0
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Precios por Modelo</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Editá ajustes % o precios fijos en $ o U$D</p>
            </div>
            {modifiedModels.size > 0 && (
              <button
                onClick={saveAll}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar todo ({modifiedModels.size})
              </button>
            )}
          </div>
        </header>

        <div className="p-4 space-y-3">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBrand}
                onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); setModifiedModels(new Set()); }}
              >
                <option value="">Seleccionar marca...</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buscar modelo</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  className="border rounded-lg pl-8 pr-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 308, Partner..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Toggle modo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modo edición</label>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => { setEditMode("percent"); setEditingCell(null); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${editMode === "percent" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <Percent className="w-3.5 h-3.5" /> Porcentaje
                </button>
                <button
                  onClick={() => { setEditMode("price"); setEditingCell(null); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${editMode === "price" ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Precio fijo
                </button>
              </div>
            </div>

            {/* Moneda por defecto (solo en modo precio) */}
            {editMode === "price" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Moneda por defecto</label>
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setDefaultCurrency("ARS")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${defaultCurrency === "ARS" ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    $ ARS
                  </button>
                  <button
                    onClick={() => setDefaultCurrency("USD")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${defaultCurrency === "USD" ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    U$D
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          {selectedBrand && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{total} modelos</span>
              {totalPages > 1 && <span>Página {page} de {totalPages}</span>}
              {editMode === "price" && customPricesCount > 0 && (
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-purple-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Precio fijo ARS
                  </span>
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Precio fijo USD
                  </span>
                  <span>— {customPricesCount} configurados</span>
                </span>
              )}
            </div>
          )}

          {!selectedBrand && (
            <div className="text-center py-24 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">Seleccioná una marca</p>
              <p className="text-sm mt-1">
                Modo <strong>%</strong>: ajuste sobre InfoAuto · Modo <strong>$ fijo</strong>: precio final en ARS o U$D
              </p>
            </div>
          )}

          {/* Tabla */}
          {selectedBrand && (
            <div className="border rounded-xl overflow-auto max-h-[calc(100vh-290px)] shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-700 sticky left-0 bg-gray-50 min-w-[260px] border-r">Modelo</th>
                    <th className="text-center px-2 py-2.5 font-medium text-gray-700 min-w-[60px] border-r text-xs">Años</th>
                    {YEARS.map((year) => (
                      <th key={year} className="text-center px-1 py-2.5 font-medium text-gray-700 min-w-[75px] text-xs">{year}</th>
                    ))}
                    <th className="text-center px-2 py-2.5 font-medium text-gray-700 min-w-[80px] sticky right-0 bg-gray-50 border-l">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={YEARS.length + 3} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Cargando...
                        </div>
                      </td>
                    </tr>
                  ) : models.length === 0 ? (
                    <tr>
                      <td colSpan={YEARS.length + 3} className="text-center py-16 text-gray-400">No se encontraron modelos</td>
                    </tr>
                  ) : (
                    models.map((model) => (
                      <tr key={model.id} className={`border-t hover:bg-gray-50/50 transition-colors ${modifiedModels.has(model.id) ? "bg-amber-50/40" : ""}`}>
                        <td className="px-3 py-1.5 sticky left-0 bg-white border-r">
                          <div className="font-medium text-gray-900 text-xs leading-tight">{model.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">codia: {model.codia}</div>
                        </td>
                        <td className="text-center px-1 py-1.5 text-[10px] text-gray-500 border-r">
                          {model.year_from}–{model.year_to}
                        </td>
                        {YEARS.map((year) => {
                          const yearNum = parseInt(year);
                          const inRange = yearNum >= model.year_from && yearNum <= model.year_to;
                          const isEditing = editingCell?.modelId === model.id && editingCell?.year === year;

                          if (!inRange) {
                            return <td key={year} className="text-center px-1 py-1.5 bg-gray-100/60"><span className="text-gray-300 text-xs">·</span></td>;
                          }

                          return (
                            <td
                              key={year}
                              className={`text-center px-1 py-1.5 cursor-pointer transition-all ${getCellStyle(model, year)} hover:ring-2 hover:ring-blue-400 hover:ring-inset`}
                              onClick={() => !isEditing && handleCellClick(model.id, year, model)}
                            >
                              {isEditing ? (
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="text"
                                    className="w-full text-center text-xs border rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCellSave(model.id, year)}
                                    onKeyDown={(e) => handleKeyDown(e, model.id, year)}
                                    autoFocus
                                    placeholder={editMode === "price" ? "monto" : "ej: -15"}
                                  />
                                  {editMode === "price" && (
                                    <div className="flex gap-0.5 justify-center">
                                      <button
                                        onMouseDown={(e) => { e.preventDefault(); setEditCurrency("ARS"); }}
                                        className={`text-[9px] px-1 rounded font-medium ${editCurrency === "ARS" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"}`}
                                      >ARS</button>
                                      <button
                                        onMouseDown={(e) => { e.preventDefault(); setEditCurrency("USD"); }}
                                        className={`text-[9px] px-1 rounded font-medium ${editCurrency === "USD" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}
                                      >USD</button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs font-mono whitespace-nowrap">{getCellDisplay(model, year)}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center px-2 py-1.5 sticky right-0 bg-white border-l">
                          {modifiedModels.has(model.id) && (
                            <button
                              onClick={() => saveModel(model.id)}
                              disabled={saving === model.id}
                              className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1 mx-auto"
                            >
                              {saving === model.id
                                ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                : <Save className="w-3 h-3" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors">
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Leyenda */}
          {selectedBrand && models.length > 0 && (
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
              {editMode === "percent" ? (
                <>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> +%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-300" /> 0%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300" /> hasta -15%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-300" /> hasta -30%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> más de -30%</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-50 border border-purple-300" /> Precio fijo ARS</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-300" /> Precio fijo USD (se convierte al blue)</span>
                  <span className="text-gray-400">Celdas tenues = solo tiene % de referencia</span>
                </>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
