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
  Check,
  X,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

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
}

/* ───── helpers ───── */
function getPrice(model: Model, year: number): number | null {
  const val = model.custom_prices?.[year.toString()];
  if (!val) return null;
  if (typeof val === "number") return val;
  if (typeof val === "object" && val.amount) return val.amount;
  return null;
}

function getCurrency(model: Model, year: number): "ARS" | "USD" {
  const val = model.custom_prices?.[year.toString()];
  if (typeof val === "object" && val?.currency === "USD") return "USD";
  return "ARS";
}

function fmtPrice(n: number | null, currency: "ARS" | "USD" = "ARS"): string {
  if (n === null) return "";
  if (currency === "USD") return "U$D " + Math.round(n).toLocaleString("es-AR");
  return "$ " + Math.round(n).toLocaleString("es-AR");
}

const VISIBLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008];

/* ═══════════════════════════════════════════════
   EditableCell — celda de precio editable
   ═══════════════════════════════════════════════ */
function EditableCell({
  model,
  year,
  onSave,
}: {
  model: Model;
  year: number;
  onSave: (modelId: number, year: number, amount: number | null, currency: "ARS" | "USD") => Promise<void>;
}) {
  const price = getPrice(model, year);
  const currency = getCurrency(model, year);
  const inRange = year >= model.year_from && year <= model.year_to;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [cur, setCur] = useState<"ARS" | "USD">(currency);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setValue(price !== null ? String(Math.round(price)) : "");
      setCur(currency);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, price, currency]);

  if (!inRange) return <td className="bg-gray-100 border-r border-b" />;

  const handleSave = async () => {
    const clean = value.replace(/[^0-9]/g, "");
    const num = clean ? parseInt(clean) : null;
    if (clean && (!num || num <= 0)) {
      toast.error("Número inválido");
      return;
    }
    setSaving(true);
    await onSave(model.id, year, num, cur);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <td className="border-r border-b p-0 bg-blue-50">
        <div className="flex items-center gap-0.5 px-1">
          <button
            onMouseDown={(e) => { e.preventDefault(); setCur(cur === "ARS" ? "USD" : "ARS"); }}
            className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${cur === "USD" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}
            title="Click para cambiar moneda"
          >
            {cur === "USD" ? "U$D" : "$"}
          </button>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className="w-full border-0 bg-transparent text-xs text-right py-1 px-1 focus:outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
              if (e.key === "Tab") { e.preventDefault(); handleSave(); }
            }}
            onBlur={handleSave}
          />
          {saving && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
        </div>
      </td>
    );
  }

  return (
    <td
      className={`border-r border-b px-1.5 py-1 text-right text-xs cursor-pointer hover:bg-blue-50 transition-colors ${
        price !== null
          ? currency === "USD"
            ? "text-green-700 font-medium"
            : "text-gray-900"
          : "text-gray-300 italic"
      }`}
      onClick={() => setEditing(true)}
      title="Click para editar"
    >
      {price !== null ? fmtPrice(price, currency) : "—"}
    </td>
  );
}

/* ═══════════════════════════════════════════════
   ExcelUpload
   ═══════════════════════════════════════════════ */
function ExcelUpload({ brandName, onDone }: { brandName: string; onDone: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ modelo: string; año: number; precio: number; moneda: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const header = ["Modelo (nombre exacto)", ...VISIBLE_YEARS.map(String)];
    const example = ["308 1.6 ALLURE NAV", "", "", "18500000", "17000000", "15500000"];
    const ws = XLSX.utils.aoa_to_sheet([header, example]);
    ws["!cols"] = [{ wch: 35 }, ...VISIBLE_YEARS.map(() => ({ wch: 14 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Precios");
    XLSX.writeFile(wb, `precios_${brandName || "marca"}.xlsx`);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const parsed: typeof preview = [];
      for (const r of rows) {
        const modelo = String(r["Modelo (nombre exacto)"] || r["Modelo"] || "").trim();
        if (!modelo) continue;
        for (const year of VISIBLE_YEARS) {
          const val = r[String(year)];
          if (!val) continue;
          const num = parseInt(String(val).replace(/[^0-9]/g, ""));
          if (num > 0) parsed.push({ modelo, año: year, precio: num, moneda: "ARS" });
        }
      }
      setPreview(parsed);
      toast.info(`${parsed.length} precios detectados`);
    };
    reader.readAsArrayBuffer(file);
  };

  const applyUpload = async () => {
    if (!preview.length) return;
    setUploading(true);
    const byModel: Record<string, Record<string, CustomPriceEntry>> = {};
    for (const row of preview) {
      if (!byModel[row.modelo]) byModel[row.modelo] = {};
      byModel[row.modelo][row.año.toString()] = { amount: row.precio, currency: row.moneda as "ARS" | "USD" };
    }
    let ok = 0, errors = 0;
    for (const [modelName, prices] of Object.entries(byModel)) {
      try {
        const sr = await fetch(`/api/models?search=${encodeURIComponent(modelName)}&limit=100`);
        const sd = await sr.json();
        const match = sd.models?.find((m: Model) => m.name.toLowerCase() === modelName.toLowerCase());
        if (!match) { errors++; continue; }
        const updated = { ...(match.custom_prices || {}), ...prices };
        const res = await fetch("/api/models", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: match.id, custom_prices: updated }) });
        if ((await res.json()).success) ok++; else errors++;
      } catch { errors++; }
    }
    toast.success(`${ok} modelos actualizados${errors ? `, ${errors} errores` : ""}`);
    setPreview([]); setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    onDone();
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Carga masiva por Excel</h3>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"><Download className="w-3.5 h-3.5" /> Template</button>
      </div>
      <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 hover:bg-gray-50 justify-center">
        <Upload className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Subir .xlsx</span>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
      </label>
      {preview.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{preview.length} precios</span>
          <button onClick={applyUpload} disabled={uploading} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
            {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />} Aplicar
          </button>
          <button onClick={() => { setPreview([]); if (fileRef.current) fileRef.current.value = ""; }} className="px-3 py-1.5 border rounded-lg text-xs"><X className="w-3 h-3 inline" /></button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Página principal — tabla tipo Excel
   ═══════════════════════════════════════════════ */
export default function PreciosPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSave = async (modelId: number, year: number, amount: number | null, currency: "ARS" | "USD") => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;
    const updated = { ...(model.custom_prices || {}) };
    if (amount === null) delete updated[year.toString()];
    else updated[year.toString()] = { amount, currency };

    try {
      const res = await fetch("/api/models", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: modelId, custom_prices: updated }) });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} ${year} guardado`);
        setModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, custom_prices: updated } : m)));
      } else toast.error(`Error: ${data.error}`);
    } catch { toast.error("Error de red"); }
  };

  const brandName = brands.find((b) => b.id.toString() === selectedBrand)?.name || "";
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
            <p className="text-xs text-gray-500 hidden sm:block">Click en cualquier celda para editar el precio</p>
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
            {selectedBrand && !loading && <span className="text-xs text-gray-400 pb-2">{total} modelos</span>}
          </div>

          {selectedBrand && <ExcelUpload brandName={brandName} onDone={fetchModels} />}

          {!selectedBrand && (
            <div className="text-center py-20 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium text-gray-500">Seleccioná una marca</p>
              <p className="text-sm mt-1">Aparece la tabla con todos los precios por modelo y año.</p>
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
                    <th className="text-left px-3 py-2 border-r border-b font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 min-w-[250px]">Modelo</th>
                    {yearsInUse.map((y) => (
                      <th key={y} className="text-center px-2 py-2 border-r border-b font-semibold text-gray-600 min-w-[110px]">{y}</th>
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
                      {yearsInUse.map((y) => (
                        <EditableCell key={y} model={model} year={y} onSave={handleSave} />
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
