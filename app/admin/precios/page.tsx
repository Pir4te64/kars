"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  FileSpreadsheet,
  Pencil,
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
   YearRow – una fila por año: muestra % y precio
   ═══════════════════════════════════════════════ */
function YearRow({
  model,
  year,
  onSave,
}: {
  model: Model;
  year: number;
  onSave: (
    modelId: number,
    year: number,
    changes: {
      percent?: number | null;
      customPrice?: CustomPriceEntry | null;
    }
  ) => Promise<void>;
}) {
  const entry = getCustomEntry(model, year);
  const pct = getPercent(model, year);
  const inRange = year >= model.year_from && year <= model.year_to;

  const [editingPct, setEditingPct] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [pctValue, setPctValue] = useState(pct !== null ? String(pct) : "");
  const [priceValue, setPriceValue] = useState(
    entry ? String(Math.round(entry.amount)) : ""
  );
  const [currency, setCurrency] = useState<Currency>(
    entry?.currency ?? "ARS"
  );
  const [saving, setSaving] = useState(false);
  const pctRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPct) pctRef.current?.focus();
  }, [editingPct]);
  useEffect(() => {
    if (editingPrice) priceRef.current?.focus();
  }, [editingPrice]);

  if (!inRange) return null;

  const savePct = async () => {
    const trimmed = pctValue.trim().replace(",", ".");
    const num = trimmed === "" ? null : parseFloat(trimmed);
    if (trimmed !== "" && (isNaN(num!) || num! < -100 || num! > 200)) {
      toast.error("Porcentaje inválido (-100 a 200)");
      return;
    }
    setSaving(true);
    await onSave(model.id, year, { percent: num });
    setSaving(false);
    setEditingPct(false);
  };

  const savePrice = async () => {
    const clean = priceValue.replace(/[^0-9.]/g, "");
    if (clean === "") {
      setSaving(true);
      await onSave(model.id, year, { customPrice: null });
      setSaving(false);
      setEditingPrice(false);
      return;
    }
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) {
      toast.error("Precio inválido");
      return;
    }
    setSaving(true);
    await onSave(model.id, year, {
      customPrice: { amount: num, currency },
    });
    setSaving(false);
    setEditingPrice(false);
  };

  return (
    <div
      className={`grid grid-cols-[50px_1fr_1fr] items-center gap-2 px-4 py-2.5 border-b last:border-0 hover:bg-gray-50/50 transition-colors ${
        entry ? "bg-blue-50/20" : ""
      }`}
    >
      {/* Año */}
      <div className="text-xs font-bold text-gray-500">{year}</div>

      {/* Columna 1: Porcentaje */}
      <div>
        {editingPct ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={pctRef}
              type="text"
              inputMode="decimal"
              className="border rounded-md px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={pctValue}
              onChange={(e) => setPctValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePct();
                if (e.key === "Escape") setEditingPct(false);
              }}
              placeholder="ej: -15"
            />
            <span className="text-xs text-gray-400">%</span>
            <button
              onClick={savePct}
              disabled={saving}
              className="p-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setPctValue(pct !== null ? String(pct) : "");
                setEditingPct(false);
              }}
              className="p-1 rounded border hover:bg-gray-100"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            {pct !== null ? (
              <span
                className={`text-sm font-semibold ${
                  pct > 0
                    ? "text-green-700"
                    : pct < 0
                    ? "text-orange-600"
                    : "text-gray-500"
                }`}
              >
                {pct > 0 ? "+" : ""}
                {pct}%
              </span>
            ) : (
              <span className="text-xs text-gray-300 italic">sin %</span>
            )}
            <button
              onClick={() => setEditingPct(true)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-blue-50 transition-opacity"
              title="Editar porcentaje"
            >
              <Pencil className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Columna 2: Precio fijo */}
      <div>
        {editingPrice ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex border rounded-md overflow-hidden text-[10px]">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCurrency("ARS");
                }}
                className={`px-1.5 py-1 font-medium transition-colors ${
                  currency === "ARS"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500"
                }`}
              >
                ARS
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCurrency("USD");
                }}
                className={`px-1.5 py-1 font-medium transition-colors ${
                  currency === "USD"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-500"
                }`}
              >
                USD
              </button>
            </div>
            <input
              ref={priceRef}
              type="text"
              inputMode="numeric"
              className="border rounded-md px-2 py-1 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePrice();
                if (e.key === "Escape") setEditingPrice(false);
              }}
              placeholder={currency === "ARS" ? "12500000" : "9500"}
            />
            <button
              onClick={savePrice}
              disabled={saving}
              className="p-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setPriceValue(entry ? String(Math.round(entry.amount)) : "");
                setCurrency(entry?.currency ?? "ARS");
                setEditingPrice(false);
              }}
              className="p-1 rounded border hover:bg-gray-100"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            {entry ? (
              <span
                className={`text-sm font-bold ${
                  entry.currency === "USD"
                    ? "text-green-700"
                    : "text-blue-700"
                }`}
              >
                {entry.currency === "USD"
                  ? fmtUSD(entry.amount)
                  : fmtARS(entry.amount)}
              </span>
            ) : (
              <span className="text-xs text-gray-300 italic">
                sin precio fijo
              </span>
            )}
            <button
              onClick={() => setEditingPrice(true)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-blue-50 transition-opacity"
              title="Editar precio fijo"
            >
              <Pencil className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ModelCard – tarjeta con todos los años
   ═══════════════════════════════════════════════ */
function ModelCard({
  model,
  onUpdate,
}: {
  model: Model;
  onUpdate: (updated: Model) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const customCount = Object.keys(model.custom_prices || {}).length;
  const activeYears = YEARS.filter(
    (y) => y >= model.year_from && y <= model.year_to
  );

  const handleSave = async (
    modelId: number,
    year: number,
    changes: {
      percent?: number | null;
      customPrice?: CustomPriceEntry | null;
    }
  ) => {
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
    if (changes.percent !== undefined)
      payload.price_adjustments = updatedAdj;
    if (changes.customPrice !== undefined)
      payload.custom_prices = updatedCustom;

    try {
      const res = await fetch("/api/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${model.name} — ${year} guardado`);
        onUpdate({
          ...model,
          price_adjustments: updatedAdj,
          custom_prices: updatedCustom,
        });
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch {
      toast.error("Error de red al guardar");
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {model.name}
          </p>
          <p className="text-xs text-gray-400">
            {model.year_from}–{model.year_to} · codia {model.codia}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {customCount > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {customCount} fijo{customCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {activeYears.length} años
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          {/* Header columnas */}
          <div className="grid grid-cols-[50px_1fr_1fr] gap-2 px-4 py-1.5 bg-gray-50 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <div>Año</div>
            <div>% Ajuste (InfoAuto)</div>
            <div>Precio Fijo (pisa InfoAuto)</div>
          </div>
          {activeYears.map((year) => (
            <YearRow
              key={year}
              model={model}
              year={year}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ExcelUpload – componente para carga masiva
   ═══════════════════════════════════════════════ */
function ExcelUpload({
  brandName,
  onDone,
}: {
  brandName: string;
  onDone: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<
    { modelo: string; año: number; porcentaje?: number; precio?: number; moneda?: string }[]
  >([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Modelo (nombre exacto)",
        "Año",
        "% Ajuste",
        "Precio Fijo",
        "Moneda (ARS/USD)",
      ],
      ["308 1.6 ALLURE NAV", 2024, -5, "", ""],
      ["308 1.6 ALLURE NAV", 2023, -8, "", ""],
      ["PARTNER 1.6 CONFORT", 2022, "", 9500, "USD"],
      ["PARTNER 1.6 CONFORT", 2021, "", 12500000, "ARS"],
    ]);
    ws["!cols"] = [
      { wch: 35 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 16 },
    ];
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
          const modelo = String(
            r["Modelo (nombre exacto)"] || r["Modelo"] || r["modelo"] || ""
          ).trim();
          const año = parseInt(
            String(r["Año"] || r["año"] || r["AÑO"] || "0")
          );
          const pctRaw = String(r["% Ajuste"] || r["% ajuste"] || r["porcentaje"] || "").replace(",", ".");
          const precioRaw = String(r["Precio Fijo"] || r["Precio fijo"] || r["precio"] || "").replace(/[^0-9.]/g, "");
          const moneda = String(
            r["Moneda (ARS/USD)"] || r["Moneda"] || r["moneda"] || ""
          )
            .trim()
            .toUpperCase();

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
      toast.info(`${parsed.length} filas detectadas`);
    };
    reader.readAsArrayBuffer(file);
  };

  const applyUpload = async () => {
    if (preview.length === 0) return;
    setUploading(true);

    // Agrupar por modelo
    const byModel: Record<
      string,
      { pctChanges: Record<string, number>; priceChanges: Record<string, CustomPriceEntry> }
    > = {};
    for (const row of preview) {
      if (!byModel[row.modelo])
        byModel[row.modelo] = { pctChanges: {}, priceChanges: {} };
      if (row.porcentaje !== undefined)
        byModel[row.modelo].pctChanges[row.año.toString()] = row.porcentaje;
      if (row.precio !== undefined && row.moneda)
        byModel[row.modelo].priceChanges[row.año.toString()] = {
          amount: row.precio,
          currency: row.moneda as Currency,
        };
    }

    // Para cada modelo, buscar por nombre y actualizar
    let ok = 0;
    let errors = 0;
    for (const [modelName, changes] of Object.entries(byModel)) {
      try {
        // Buscar modelo
        const searchRes = await fetch(
          `/api/models?search=${encodeURIComponent(modelName)}&limit=100`
        );
        const searchData = await searchRes.json();
        const match = searchData.models?.find(
          (m: Model) => m.name.toLowerCase() === modelName.toLowerCase()
        );
        if (!match) {
          toast.error(`No encontrado: ${modelName}`);
          errors++;
          continue;
        }

        const updatedAdj = { ...(match.price_adjustments || {}) };
        const updatedCustom = { ...(match.custom_prices || {}) };

        for (const [yr, val] of Object.entries(changes.pctChanges))
          updatedAdj[yr] = val;
        for (const [yr, val] of Object.entries(changes.priceChanges))
          updatedCustom[yr] = val;

        const res = await fetch("/api/models", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: match.id,
            price_adjustments: updatedAdj,
            custom_prices: updatedCustom,
          }),
        });
        const data = await res.json();
        if (data.success) ok++;
        else errors++;
      } catch {
        errors++;
      }
    }

    toast.success(`Listo: ${ok} modelos actualizados${errors > 0 ? `, ${errors} errores` : ""}`);
    setPreview([]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    onDone();
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Carga masiva por Excel
        </h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar template
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors flex-1 text-center justify-center">
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            Arrastrá o hacé click para subir .xlsx
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            Vista previa ({preview.length} filas):
          </p>
          <div className="max-h-48 overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium text-gray-500">
                    Modelo
                  </th>
                  <th className="text-center px-2 py-1.5 font-medium text-gray-500">
                    Año
                  </th>
                  <th className="text-center px-2 py-1.5 font-medium text-gray-500">
                    %
                  </th>
                  <th className="text-right px-2 py-1.5 font-medium text-gray-500">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1 truncate max-w-[200px]">
                      {r.modelo}
                    </td>
                    <td className="px-2 py-1 text-center">{r.año}</td>
                    <td className="px-2 py-1 text-center">
                      {r.porcentaje !== undefined ? `${r.porcentaje}%` : "—"}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {r.precio !== undefined
                        ? `${r.moneda === "USD" ? "U$D" : "$"} ${r.precio.toLocaleString("es-AR")}`
                        : "—"}
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
              onClick={() => {
                setPreview([]);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="px-4 py-2 border rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 leading-relaxed">
        El Excel debe tener las columnas: <strong>Modelo (nombre exacto)</strong>,{" "}
        <strong>Año</strong>, <strong>% Ajuste</strong> (opcional),{" "}
        <strong>Precio Fijo</strong> (opcional), <strong>Moneda (ARS/USD)</strong>.
        Dejá vacío lo que no quieras cambiar.
      </p>
    </div>
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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

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
  }, [selectedBrand, search, page]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleUpdate = (updated: Model) => {
    setModels((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const brandName =
    brands.find((b) => b.id.toString() === selectedBrand)?.name || "";
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Precios por Modelo
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Editá % de ajuste y/o precio fijo (ARS / USD) por modelo y año
            </p>
          </div>
        </header>

        <div className="p-4 space-y-4 max-w-3xl">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Marca
              </label>
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Seleccionar marca...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Buscar modelo
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  className="border rounded-lg pl-8 pr-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 308, Partner, Amarok..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Excel upload */}
          {selectedBrand && (
            <ExcelUpload brandName={brandName} onDone={fetchModels} />
          )}

          {/* Info */}
          {selectedBrand && !loading && (
            <p className="text-xs text-gray-400">
              {total} modelos encontrados
              {totalPages > 1 ? ` — página ${page} de ${totalPages}` : ""}
            </p>
          )}

          {/* Estado vacío */}
          {!selectedBrand && (
            <div className="text-center py-20 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium text-gray-500">
                Seleccioná una marca
              </p>
              <p className="text-sm mt-1">
                Después buscá el modelo y expandilo para editar los precios.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Cargando modelos...
            </div>
          )}

          {/* Lista */}
          {!loading && models.length > 0 && (
            <div className="space-y-2">
              {models.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Nota */}
          {selectedBrand && models.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 space-y-1">
              <p>
                <strong>% Ajuste:</strong> modifica el precio de InfoAuto (ej:
                -15% = 15% menos).
              </p>
              <p>
                <strong>Precio Fijo:</strong> pisa completamente a InfoAuto. En
                U$D se convierte al dólar blue del momento.
              </p>
              <p>
                <strong>Excel:</strong> descargá el template, completá y subilo
                para cargar varios modelos de una.
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
