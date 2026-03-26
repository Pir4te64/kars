"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  DollarSign,
  RefreshCw,
} from "lucide-react";

/* ───── types ───── */
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
  custom_prices: Record<string, CustomPriceEntry | number | null> | null;
  price_adjustments: Record<string, number | null> | null;
  infoauto_prices: Record<string, number | null> | null;
  km_depreciation: number | null;
}

/* ───── helpers ───── */
function getBasePrice(model: Model, year: number): number | null {
  // Primero intentar infoauto_prices, si no hay usar custom_prices como base
  const iaVal = model.infoauto_prices?.[year.toString()];
  if (typeof iaVal === "number" && iaVal > 0) return iaVal;

  const cpVal = model.custom_prices?.[year.toString()];
  if (!cpVal) return null;
  if (typeof cpVal === "number" && cpVal > 0) return cpVal;
  if (typeof cpVal === "object" && cpVal.amount > 0) return cpVal.amount;
  return null;
}

function getAdjustment(model: Model, year: number): number | null {
  const val = model.price_adjustments?.[year.toString()];
  if (typeof val === "number") return val;
  return null;
}

function calcFinalPrice(basePrice: number | null, adjustment: number | null): number | null {
  if (basePrice === null) return null;
  if (adjustment === null) return basePrice;
  return Math.round(basePrice * (1 + adjustment / 100));
}

function fmtPrice(n: number | null): string {
  if (n === null) return "—";
  return "$ " + Math.round(n).toLocaleString("es-AR");
}

const VISIBLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];

/* ═══════════════════════════════════════════════
   PriceCell — celda de precio (solo lectura)
   ═══════════════════════════════════════════════ */
function PriceCell({ model, year }: { model: Model; year: number }) {
  const inRange = year >= model.year_from && year <= model.year_to;
  if (!inRange) return <td className="bg-gray-100 border-r border-b" />;

  const basePrice = getBasePrice(model, year);
  const adjustment = getAdjustment(model, year);
  const finalPrice = calcFinalPrice(basePrice, adjustment);

  return (
    <td className="border-r border-b px-1.5 py-1 text-right text-xs">
      {finalPrice !== null ? (
        <span className="text-gray-900 font-medium">{fmtPrice(finalPrice)}</span>
      ) : (
        <span className="text-gray-300 italic">—</span>
      )}
    </td>
  );
}

/* ═══════════════════════════════════════════════
   AdjustmentCell — celda de % editable
   ═══════════════════════════════════════════════ */
function AdjustmentCell({
  model,
  year,
  onSave,
}: {
  model: Model;
  year: number;
  onSave: (modelId: number, year: number, percentage: number | null) => Promise<void>;
}) {
  const inRange = year >= model.year_from && year <= model.year_to;
  const adjustment = getAdjustment(model, year);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(adjustment !== null ? String(adjustment) : "");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, adjustment]);

  if (!inRange) return <td className="bg-gray-100 border-r border-b" />;

  const handleSave = async () => {
    const clean = value.trim();
    let num: number | null = null;
    if (clean !== "") {
      num = parseFloat(clean.replace(",", "."));
      if (isNaN(num)) {
        toast.error("Porcentaje inválido");
        return;
      }
    }
    setSaving(true);
    await onSave(model.id, year, num);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <td className="border-r border-b p-0 bg-blue-50">
        <div className="flex items-center gap-0.5 px-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="w-full border-0 bg-transparent text-xs text-right py-1 px-1 focus:outline-none"
            value={value}
            placeholder="0"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
              if (e.key === "Tab") { e.preventDefault(); handleSave(); }
            }}
            onBlur={handleSave}
          />
          <span className="text-[10px] text-gray-400 shrink-0">%</span>
          {saving && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
        </div>
      </td>
    );
  }

  return (
    <td
      className={`border-r border-b px-1.5 py-1 text-right text-xs cursor-pointer hover:bg-blue-50 transition-colors ${
        adjustment !== null
          ? adjustment > 0 ? "text-red-600 font-semibold" : adjustment < 0 ? "text-green-600 font-semibold" : "text-gray-500"
          : "text-gray-300 italic"
      }`}
      onClick={() => setEditing(true)}
      title="Click para editar %"
    >
      {adjustment !== null ? `${adjustment > 0 ? "+" : ""}${adjustment}%` : "—"}
    </td>
  );
}

/* ═══════════════════════════════════════════════
   KmDepCell — depreciación por km (por modelo)
   ═══════════════════════════════════════════════ */
function KmDepCell({
  model,
  onSave,
}: {
  model: Model;
  onSave: (modelId: number, value: number | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(model.km_depreciation !== null ? String(model.km_depreciation) : "");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, model.km_depreciation]);

  const handleSave = async () => {
    const clean = value.trim();
    let num: number | null = null;
    if (clean !== "") {
      num = parseFloat(clean.replace(",", "."));
      if (isNaN(num)) {
        toast.error("Valor inválido");
        return;
      }
    }
    setSaving(true);
    await onSave(model.id, num);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <td className="border-r border-b p-0 bg-purple-50">
        <div className="flex items-center gap-0.5 px-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="w-full border-0 bg-transparent text-xs text-right py-1 px-1 focus:outline-none"
            value={value}
            placeholder="ej: 2"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
              if (e.key === "Tab") { e.preventDefault(); handleSave(); }
            }}
            onBlur={handleSave}
          />
          {saving && <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />}
        </div>
      </td>
    );
  }

  return (
    <td
      className={`border-r border-b px-1.5 py-1 text-right text-xs cursor-pointer hover:bg-purple-50 transition-colors ${
        model.km_depreciation !== null ? "text-purple-700 font-medium" : "text-gray-300 italic"
      }`}
      onClick={() => setEditing(true)}
      title="Click para editar depreciación por km"
    >
      {model.km_depreciation !== null ? `${model.km_depreciation}%` : "—"}
    </td>
  );
}

/* ═══════════════════════════════════════════════
   Página principal
   ═══════════════════════════════════════════════ */
export default function PreciosPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 30;

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then((d) => { if (d.success) setBrands(d.brands); });
  }, []);

  const fetchModels = useCallback(async () => {
    if (!selectedBrand) { setModels([]); setTotal(0); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ brand_id: selectedBrand, page: page.toString(), limit: LIMIT.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/models?${params}`);
      const data = await res.json();
      if (data.success) { setModels(data.models); setTotal(data.total || 0); }
    } catch { toast.error("Error al cargar modelos"); }
    finally { setLoading(false); }
  }, [selectedBrand, search, page]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const handleSave = async (modelId: number, year: number, percentage: number | null) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    const updatedAdj = { ...(model.price_adjustments || {}) };
    if (percentage === null) delete updatedAdj[year.toString()];
    else updatedAdj[year.toString()] = percentage;

    // Recalcular custom_prices para TODOS los años (no solo el editado)
    const updatedPrices: Record<string, CustomPriceEntry> = {};
    for (const y of VISIBLE_YEARS) {
      const base = getBasePrice(model, y);
      if (base === null) continue;
      const adj = y === year ? percentage : getAdjustment(model, y);
      const final_ = calcFinalPrice(base, adj);
      if (final_ !== null) {
        updatedPrices[y.toString()] = { amount: final_, currency: "ARS" };
      }
    }

    try {
      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modelId, price_adjustments: updatedAdj, custom_prices: updatedPrices }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} ${year} → ${percentage !== null ? percentage + "%" : "sin ajuste"}`);
        setModels((prev) => prev.map((m) =>
          m.id === modelId ? { ...m, price_adjustments: updatedAdj, custom_prices: updatedPrices } : m
        ));
      } else toast.error(`Error: ${data.error}`);
    } catch { toast.error("Error de red"); }
  };

  const handleSaveKmDep = async (modelId: number, value: number | null) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;
    try {
      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modelId, km_depreciation: value }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} → Dep. km: ${value !== null ? value : "default"}`);
        setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, km_depreciation: value } : m));
      } else toast.error(`Error: ${data.error}`);
    } catch { toast.error("Error de red"); }
  };

  const handleSyncPrices = async () => {
    if (!selectedBrand) return;
    const bName = brands.find((b) => b.id.toString() === selectedBrand)?.name || "";
    if (!confirm(`Sincronizar precios de InfoAuto para ${bName}?\nEsto actualizará los precios base y recalculará con los porcentajes actuales.`)) return;

    setSyncing(true);
    try {
      const res = await fetch("/api/cron/sync-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id: parseInt(selectedBrand) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.updated} modelos actualizados, ${data.skipped} sin precio en InfoAuto`);
        fetchModels();
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch { toast.error("Error al sincronizar"); }
    finally { setSyncing(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const yearsInUse = VISIBLE_YEARS.filter((y) => models.some((m) => y >= m.year_from && y <= m.year_to));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Precios por Modelo</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Precio (solo lectura) + Porcentaje de ajuste (editable)</p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
              <select className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[180px]" value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}>
                <option value="">Seleccionar marca...</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" className="border rounded-lg pl-8 pr-3 py-2 text-sm min-w-[200px]" placeholder="308, Partner, Amarok..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
            </div>
            {selectedBrand && (
              <button
                onClick={handleSyncPrices}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando..." : "Sync InfoAuto"}
              </button>
            )}
            {selectedBrand && !loading && <span className="text-xs text-gray-400 pb-2">{total} modelos</span>}
          </div>

          {!selectedBrand && (
            <div className="text-center py-20 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium text-gray-500">Seleccioná una marca</p>
              <p className="text-sm mt-1">Aparece la tabla con precios y porcentajes de ajuste por modelo y año.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Cargando...
            </div>
          )}

          {!loading && models.length > 0 && (
            <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th rowSpan={2} className="text-left px-3 py-2 border-r border-b font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[250px]">Modelo</th>
                    <th rowSpan={2} className="text-center px-1 py-2 border-r border-b font-semibold text-purple-600 min-w-[75px]" title="Porcentaje de depreciación cada 1,000 km (desde 50k km base)">% / 1k km</th>
                    {yearsInUse.map((y) => (
                      <th key={y} colSpan={2} className="text-center px-1 py-1 border-r border-b font-semibold text-gray-600">{y}</th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    {yearsInUse.map((y) => (
                      <React.Fragment key={y}>
                        <th className="text-center px-1 py-1 border-r border-b text-[10px] font-medium text-gray-400 min-w-[90px]">Precio</th>
                        <th className="text-center px-1 py-1 border-r border-b text-[10px] font-medium text-gray-400 min-w-[55px]">%</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-1.5 border-r border-b font-medium text-gray-800 sticky left-0 bg-white z-10 max-w-[250px]" title={model.name}>
                        <div className="truncate text-xs">{model.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{model.year_from}–{model.year_to}</div>
                      </td>
                      <KmDepCell model={model} onSave={handleSaveKmDep} />
                      {yearsInUse.map((y) => (
                        <React.Fragment key={y}>
                          <PriceCell model={model} year={y} />
                          <AdjustmentCell model={model} year={y} onSave={handleSave} />
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50">Anterior</button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50">Siguiente</button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
