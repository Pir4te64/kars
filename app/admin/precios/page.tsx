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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Eye,
  EyeOff,
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
  price_adjustments: Record<string, number | null> | null;
  custom_prices: Record<string, CustomPriceEntry | number | null> | null;
  hidden?: boolean | null;
}

type Currency = "ARS" | "USD";

const YEARS = Array.from({ length: 19 }, (_, i) => 2026 - i);

/* ───── helpers ───── */
function fmtARS(n: number) {
  return "$ " + Math.round(n).toLocaleString("es-AR");
}
function fmtUSD(n: number) {
  return "U$D " + Math.round(n).toLocaleString("es-AR");
}
function getCustomEntry(
  model: Model,
  year: number
): CustomPriceEntry | null {
  const val = model.custom_prices?.[year.toString()];
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return { amount: val, currency: "ARS" };
  return val as CustomPriceEntry;
}
function getPercent(model: Model, year: number): number | null {
  return model.price_adjustments?.[year.toString()] ?? null;
}

/* ═══════════════════════════════════════════════
   EditableCell – celda editable inline tipo Excel
   ═══════════════════════════════════════════════ */
function EditableCell({
  value,
  onSave,
  placeholder,
  suffix,
  className = "",
  type = "text",
}: {
  value: string;
  onSave: (val: string) => Promise<void>;
  placeholder?: string;
  suffix?: string;
  className?: string;
  type?: "text" | "number";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-0.5">
        <input
          ref={inputRef}
          type={type}
          inputMode="decimal"
          className="w-full border border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
            if (e.key === "Tab") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          disabled={saving}
        />
        {suffix && <span className="text-[10px] text-gray-400 shrink-0">{suffix}</span>}
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer px-1.5 py-0.5 rounded text-xs hover:bg-blue-50 transition-colors min-h-[24px] flex items-center ${className}`}
      onClick={() => setEditing(true)}
      title="Click para editar"
    >
      {value || <span className="text-gray-300 italic">{placeholder || "—"}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PriceCell – celda de precio fijo con moneda
   ═══════════════════════════════════════════════ */
function PriceCell({
  model,
  year,
  onSave,
}: {
  model: Model;
  year: number;
  onSave: (modelId: number, year: number, customPrice: CustomPriceEntry | null) => Promise<void>;
}) {
  const entry = getCustomEntry(model, year);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry ? String(Math.round(entry.amount)) : "");
  const [currency, setCurrency] = useState<Currency>(entry?.currency ?? "ARS");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(entry ? String(Math.round(entry.amount)) : "");
    setCurrency(entry?.currency ?? "ARS");
  }, [entry]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = async () => {
    const clean = draft.replace(/[^0-9.]/g, "");
    if (clean === "") {
      setSaving(true);
      await onSave(model.id, year, null);
      setSaving(false);
      setEditing(false);
      return;
    }
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) {
      toast.error("Precio inválido");
      return;
    }
    setSaving(true);
    await onSave(model.id, year, { amount: num, currency });
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(entry ? String(Math.round(entry.amount)) : "");
    setCurrency(entry?.currency ?? "ARS");
    setEditing(false);
  };

  const inRange = year >= model.year_from && year <= model.year_to;
  if (!inRange) {
    return <div className="text-center text-gray-200 text-[10px]">—</div>;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-0.5">
        <div className="flex border rounded overflow-hidden text-[9px] shrink-0">
          <button
            onMouseDown={(e) => { e.preventDefault(); setCurrency("ARS"); }}
            className={`px-1 py-0.5 font-medium transition-colors ${currency === "ARS" ? "bg-blue-600 text-white" : "bg-white text-gray-400"}`}
          >
            $
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); setCurrency("USD"); }}
            className={`px-1 py-0.5 font-medium transition-colors ${currency === "USD" ? "bg-green-600 text-white" : "bg-white text-gray-400"}`}
          >
            U$D
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="w-full border border-blue-400 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
            if (e.key === "Tab") { e.preventDefault(); commit(); }
          }}
          onBlur={commit}
          placeholder={currency === "ARS" ? "12500000" : "9500"}
          disabled={saving}
        />
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer px-1 py-0.5 rounded text-xs hover:bg-blue-50 transition-colors min-h-[24px] flex items-center justify-center font-medium ${
        entry
          ? entry.currency === "USD"
            ? "text-green-700"
            : "text-blue-700"
          : ""
      }`}
      onClick={() => setEditing(true)}
      title="Click para editar"
    >
      {entry ? (
        entry.currency === "USD" ? fmtUSD(entry.amount) : fmtARS(entry.amount)
      ) : (
        <span className="text-gray-300 italic">—</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ExcelUpload – carga masiva (colapsable)
   ═══════════════════════════════════════════════ */
function ExcelUpload({
  brandName,
  onDone,
}: {
  brandName: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<
    { modelo: string; año: number; porcentaje?: number; precio?: number; moneda?: string }[]
  >([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Modelo (nombre exacto)", "Año", "% Ajuste", "Precio Fijo", "Moneda (ARS/USD)"],
      ["308 1.6 ALLURE NAV", 2024, -5, "", ""],
      ["308 1.6 ALLURE NAV", 2023, -8, "", ""],
      ["PARTNER 1.6 CONFORT", 2022, "", 9500, "USD"],
      ["PARTNER 1.6 CONFORT", 2021, "", 12500000, "ARS"],
    ]);
    ws["!cols"] = [{ wch: 35 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Precios");
    XLSX.writeFile(wb, `template_precios_${brandName || "marca"}.xlsx`);
    toast.success("Template descargado");
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
      const parsed = rows
        .map((r) => {
          const modelo = String(r["Modelo (nombre exacto)"] || r["Modelo"] || r["modelo"] || "").trim();
          const año = parseInt(String(r["Año"] || r["año"] || r["AÑO"] || "0"));
          const pctRaw = String(r["% Ajuste"] || r["% ajuste"] || r["porcentaje"] || "").replace(",", ".");
          const precioRaw = String(r["Precio Fijo"] || r["Precio fijo"] || r["precio"] || "").replace(/[^0-9.]/g, "");
          const moneda = String(r["Moneda (ARS/USD)"] || r["Moneda"] || r["moneda"] || "").trim().toUpperCase();
          if (!modelo || !año || año < 2008 || año > 2026) return null;
          return {
            modelo,
            año,
            porcentaje: pctRaw !== "" ? parseFloat(pctRaw) : undefined,
            precio: precioRaw !== "" ? parseFloat(precioRaw) : undefined,
            moneda: moneda === "USD" ? "USD" : moneda === "ARS" ? "ARS" : undefined,
          };
        })
        .filter(Boolean) as typeof preview;
      setPreview(parsed);
      setOpen(true);
      toast.info(`${parsed.length} filas detectadas`);
    };
    reader.readAsArrayBuffer(file);
  };

  const applyUpload = async () => {
    if (preview.length === 0) return;
    setUploading(true);
    const byModel: Record<string, { pctChanges: Record<string, number>; priceChanges: Record<string, CustomPriceEntry> }> = {};
    for (const row of preview) {
      if (!byModel[row.modelo]) byModel[row.modelo] = { pctChanges: {}, priceChanges: {} };
      if (row.porcentaje !== undefined) byModel[row.modelo].pctChanges[row.año.toString()] = row.porcentaje;
      if (row.precio !== undefined && row.moneda)
        byModel[row.modelo].priceChanges[row.año.toString()] = { amount: row.precio, currency: row.moneda as Currency };
    }
    let ok = 0;
    let errors = 0;
    for (const [modelName, changes] of Object.entries(byModel)) {
      try {
        const searchRes = await fetch(`/api/models?search=${encodeURIComponent(modelName)}&limit=100`);
        const searchData = await searchRes.json();
        const match = searchData.models?.find((m: Model) => m.name.toLowerCase() === modelName.toLowerCase());
        if (!match) { toast.error(`No encontrado: ${modelName}`); errors++; continue; }
        const updatedAdj = { ...(match.price_adjustments || {}) };
        const updatedCustom = { ...(match.custom_prices || {}) };
        for (const [yr, val] of Object.entries(changes.pctChanges)) updatedAdj[yr] = val;
        for (const [yr, val] of Object.entries(changes.priceChanges)) updatedCustom[yr] = val;
        const res = await fetch("/api/models", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: match.id, price_adjustments: updatedAdj, custom_prices: updatedCustom }),
        });
        const data = await res.json();
        if (data.success) ok++;
        else errors++;
      } catch { errors++; }
    }
    toast.success(`Listo: ${ok} modelos actualizados${errors > 0 ? `, ${errors} errores` : ""}`);
    setPreview([]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    onDone();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border rounded-lg px-3 py-1.5 hover:bg-gray-50"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Excel
      </button>
      <button
        onClick={downloadTemplate}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        <Download className="w-3 h-3" />
        Template
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Carga masiva por Excel
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-4 hover:bg-gray-50 transition-colors text-center justify-center">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Arrastrá o hacé click para subir .xlsx</span>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            </label>

            {preview.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">Vista previa ({preview.length} filas):</p>
                <div className="max-h-48 overflow-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-2 py-1.5 font-medium text-gray-500">Modelo</th>
                        <th className="text-center px-2 py-1.5 font-medium text-gray-500">Año</th>
                        <th className="text-center px-2 py-1.5 font-medium text-gray-500">%</th>
                        <th className="text-right px-2 py-1.5 font-medium text-gray-500">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1 truncate max-w-[200px]">{r.modelo}</td>
                          <td className="px-2 py-1 text-center">{r.año}</td>
                          <td className="px-2 py-1 text-center">{r.porcentaje !== undefined ? `${r.porcentaje}%` : "—"}</td>
                          <td className="px-2 py-1 text-right">
                            {r.precio !== undefined ? `${r.moneda === "USD" ? "U$D" : "$"} ${r.precio.toLocaleString("es-AR")}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={applyUpload}
                    disabled={uploading}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Aplicar {preview.length} cambios
                  </button>
                  <button
                    onClick={() => { setPreview([]); if (fileRef.current) fileRef.current.value = ""; }}
                    className="px-4 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Pagination – paginador ágil con números
   ═══════════════════════════════════════════════ */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Primera página"
      >
        <ChevronsLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Anterior"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[28px] h-7 rounded text-xs font-medium transition-colors ${
              p === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Siguiente"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Última página"
      >
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Página principal – layout Excel
   ═══════════════════════════════════════════════ */
export default function PreciosPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showHidden, setShowHidden] = useState(false);
  const LIMIT = 400;

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBrands(d.brands);
      });
  }, []);

  const fetchModels = useCallback(async () => {
    if (!selectedBrand) {
      setModels([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        brand_id: selectedBrand,
        page: page.toString(),
        limit: LIMIT.toString(),
      });
      if (search) params.set("search", search);
      if (showHidden) params.set("show_hidden", "true");
      const res = await fetch(`/api/models?${params}`);
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error("Error al cargar modelos");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, search, page, showHidden]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleSave = async (
    modelId: number,
    year: number,
    changes: {
      percent?: number | null;
      customPrice?: CustomPriceEntry | null;
    }
  ) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    const updatedAdj = { ...(model.price_adjustments || {}) };
    const updatedCustom = { ...(model.custom_prices || {}) };

    if (changes.percent !== undefined) {
      if (changes.percent === null) delete updatedAdj[year.toString()];
      else updatedAdj[year.toString()] = changes.percent;
    }
    if (changes.customPrice !== undefined) {
      if (changes.customPrice === null) delete updatedCustom[year.toString()];
      else updatedCustom[year.toString()] = changes.customPrice;
    }

    const payload: Record<string, unknown> = { id: modelId };
    if (changes.percent !== undefined) payload.price_adjustments = updatedAdj;
    if (changes.customPrice !== undefined) payload.custom_prices = updatedCustom;

    try {
      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} — ${year} guardado`);
        setModels((prev) =>
          prev.map((m) =>
            m.id === modelId
              ? { ...m, price_adjustments: updatedAdj, custom_prices: updatedCustom }
              : m
          )
        );
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch {
      toast.error("Error de red al guardar");
    }
  };

  const handlePctSave = async (model: Model, year: number, val: string) => {
    const trimmed = val.trim().replace(",", ".");
    const num = trimmed === "" ? null : parseFloat(trimmed);
    if (trimmed !== "" && (isNaN(num!) || num! < -100 || num! > 200)) {
      toast.error("Porcentaje inválido (-100 a 200)");
      return;
    }
    await handleSave(model.id, year, { percent: num });
  };

  const handlePriceSave = async (modelId: number, year: number, customPrice: CustomPriceEntry | null) => {
    await handleSave(modelId, year, { customPrice });
  };

  const toggleHidden = async (model: Model) => {
    const newHidden = !model.hidden;
    try {
      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: model.id, hidden: newHidden }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} ${newHidden ? "oculto" : "visible"}`);
        if (!showHidden && newHidden) {
          setModels((prev) => prev.filter((m) => m.id !== model.id));
          setTotal((t) => t - 1);
        } else {
          setModels((prev) =>
            prev.map((m) => (m.id === model.id ? { ...m, hidden: newHidden } : m))
          );
        }
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch {
      toast.error("Error de red");
    }
  };

  const deleteModel = async (model: Model) => {
    if (!confirm(`Eliminar "${model.name}" permanentemente?`)) return;
    try {
      const res = await fetch(`/api/models?id=${model.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} eliminado`);
        setModels((prev) => prev.filter((m) => m.id !== model.id));
        setTotal((t) => t - 1);
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch {
      toast.error("Error de red");
    }
  };

  const brandName = brands.find((b) => b.id.toString() === selectedBrand)?.name || "";
  const totalPages = Math.ceil(total / LIMIT);

  // Show only years that are relevant to current models
  const visibleYears = YEARS.filter((y) =>
    models.some((m) => y >= m.year_from && y <= m.year_to)
  );
  const displayYears = visibleYears.length > 0 ? visibleYears : YEARS.slice(0, 10);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold text-gray-900">Precios por Modelo</h1>
          <span className="text-xs text-gray-400 hidden sm:inline">
            — Click en celda para editar
          </span>
        </header>

        <div className="flex flex-col h-[calc(100vh-48px)]">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b bg-gray-50/80 flex-wrap">
            <select
              className="border rounded-lg px-2.5 py-1.5 text-sm bg-white min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Marca...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar modelo..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {selectedBrand && (
              <ExcelUpload brandName={brandName} onDone={fetchModels} />
            )}

            {selectedBrand && (
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => {
                    setShowHidden(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300"
                />
                <EyeOff className="w-3 h-3" />
                Ver ocultos
              </label>
            )}

            <div className="ml-auto flex items-center gap-3">
              {selectedBrand && !loading && (
                <span className="text-xs text-gray-400">
                  {total} modelos
                </span>
              )}
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>

          {/* Empty state */}
          {!selectedBrand && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-base font-medium text-gray-500">Seleccioná una marca</p>
                <p className="text-sm mt-1">para ver y editar los precios</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              Cargando...
            </div>
          )}

          {/* Spreadsheet table */}
          {!loading && selectedBrand && models.length > 0 && (
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100 border-b">
                    <th className="sticky left-0 z-20 bg-gray-100 text-center px-1 py-2 font-semibold text-gray-600 border-r w-[70px] min-w-[70px]">
                      Acc.
                    </th>
                    <th className="sticky left-[70px] z-20 bg-gray-100 text-left px-3 py-2 font-semibold text-gray-600 border-r min-w-[250px] whitespace-nowrap">
                      Modelo
                    </th>
                    <th className="sticky left-[320px] z-20 bg-gray-100 text-center px-2 py-2 font-semibold text-gray-600 border-r min-w-[60px]">
                      Codia
                    </th>
                    <th className="sticky left-[380px] z-20 bg-gray-100 text-center px-2 py-2 font-semibold text-gray-600 border-r min-w-[70px]">
                      Años
                    </th>
                    {displayYears.map((year) => (
                      <th key={year} colSpan={2} className="text-center px-1 py-1 font-bold text-gray-700 border-r min-w-[200px]">
                        {year}
                        <div className="flex text-[9px] font-medium text-gray-400 mt-0.5">
                          <span className="flex-1 text-center">% Ajuste</span>
                          <span className="flex-1 text-center">Precio Fijo</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, idx) => (
                    <tr
                      key={model.id}
                      className={`border-b hover:bg-blue-50/30 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Actions - sticky */}
                      <td className={`sticky left-0 z-10 px-1 py-1 border-r text-center ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}>
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => toggleHidden(model)}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                              model.hidden ? "text-orange-500" : "text-gray-400"
                            }`}
                            title={model.hidden ? "Mostrar modelo" : "Ocultar modelo"}
                          >
                            {model.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteModel(model)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar modelo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      {/* Model name - sticky */}
                      <td className={`sticky left-[70px] z-10 px-3 py-1.5 font-medium border-r whitespace-nowrap ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${model.hidden ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        <span className="truncate block max-w-[230px]" title={model.name}>
                          {model.name}
                        </span>
                      </td>
                      {/* Codia - sticky */}
                      <td className={`sticky left-[320px] z-10 px-2 py-1.5 text-center text-gray-500 border-r ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}>
                        {model.codia}
                      </td>
                      {/* Year range - sticky */}
                      <td className={`sticky left-[380px] z-10 px-2 py-1.5 text-center text-gray-400 border-r text-[10px] ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}>
                        {model.year_from}–{model.year_to}
                      </td>
                      {/* Year cells - % and price side by side per year */}
                      {displayYears.map((year) => {
                        const inRange = year >= model.year_from && year <= model.year_to;
                        const pct = getPercent(model, year);
                        return (
                          <React.Fragment key={year}>
                            <td className={`border-r border-dashed px-0.5 py-0.5 min-w-[100px] ${
                              !inRange ? "bg-gray-100/50" : ""
                            }`}>
                              {inRange ? (
                                <EditableCell
                                  value={pct !== null ? String(pct) : ""}
                                  onSave={async (val) => handlePctSave(model, year, val)}
                                  placeholder="—"
                                  suffix="%"
                                  className={
                                    pct !== null
                                      ? pct > 0
                                        ? "text-green-700 font-semibold"
                                        : pct < 0
                                        ? "text-orange-600 font-semibold"
                                        : "text-gray-500"
                                      : ""
                                  }
                                />
                              ) : (
                                <div className="text-center text-gray-200 text-[10px]">—</div>
                              )}
                            </td>
                            <td className={`border-r px-0.5 py-0.5 min-w-[100px] ${
                              !inRange ? "bg-gray-100/50" : ""
                            }`}>
                              <PriceCell
                                model={model}
                                year={year}
                                onSave={handlePriceSave}
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No results */}
          {!loading && selectedBrand && models.length === 0 && total === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p className="text-sm">No se encontraron modelos</p>
            </div>
          )}

          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50/80">
              <span className="text-xs text-gray-400">
                Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
