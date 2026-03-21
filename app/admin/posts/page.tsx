"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Plus,
  Search,
  Car,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  ImageIcon,
} from "lucide-react";

type VehiclePostRow = {
  id: string;
  titulo: string | null;
  slug: string | null;
  marca: string | null;
  modelo: string | null;
  anio: string | null;
  precio: string | null;
  precio_num: number | null;
  estado: string | null;
  disponible: string | null;
  images_urls: string[] | null;
  created_at: string | null;
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
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

export default function PostsListPage() {
  const router = useRouter();
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("all");
  const [marca, setMarca] = useState("all");
  const [rows, setRows] = useState<VehiclePostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, disponibles: 0, vendidos: 0 });
  const LIMIT = 25;

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setLoggedEmail(session?.user?.email ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Brands
  useEffect(() => {
    supabase.from("vehicle_posts").select("marca").not("marca", "is", null).neq("marca", "").order("marca").limit(1000)
      .then(({ data }) => {
        if (data) setBrands(Array.from(new Set(data.map((r) => r.marca as string))));
      });
  }, []);

  // Stats
  useEffect(() => {
    Promise.all([
      supabase.from("vehicle_posts").select("*", { count: "exact", head: true }),
      supabase.from("vehicle_posts").select("*", { count: "exact", head: true }).eq("estado", "published"),
      supabase.from("vehicle_posts").select("*", { count: "exact", head: true }).eq("disponible", "Sí"),
      supabase.from("vehicle_posts").select("*", { count: "exact", head: true }).eq("estado", "vendido"),
    ]).then(([t, p, d, v]) => {
      setStats({ total: t.count ?? 0, published: p.count ?? 0, disponibles: d.count ?? 0, vendidos: v.count ?? 0 });
    });
  }, []);

  // Fetch
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let q = supabase
          .from("vehicle_posts_view")
          .select("id,titulo,slug,marca,modelo,anio,precio,precio_num,estado,disponible,images_urls,created_at", { count: "exact" });
        if (debouncedSearch) {
          q = q.or(`titulo.ilike.%${debouncedSearch}%,marca.ilike.%${debouncedSearch}%,modelo.ilike.%${debouncedSearch}%,slug.ilike.%${debouncedSearch}%`);
        }
        if (estado !== "all") q = q.eq("estado", estado);
        if (marca !== "all") q = q.eq("marca", marca);
        const from = (page - 1) * LIMIT;
        const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, from + LIMIT - 1);
        if (error) throw error;
        setRows(data ?? []);
        setTotal(count ?? 0);
      } catch (e) {
        toast.error(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, estado, marca, page]);

  useEffect(() => { setPage(1); }, [debouncedSearch, estado, marca]);

  const handleDelete = async (id: string, titulo: string | null) => {
    if (!confirm(`Eliminar "${titulo || "post"}"?`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("vehicle_posts").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setStats((s) => ({ ...s, total: Math.max(0, s.total - 1) }));
      toast.success("Post eliminado");
    } catch (e) {
      toast.error(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await fetch("/auth/callback", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ event: "SIGNED_OUT", session: null }) });
    router.replace("/login");
  };

  const estadoBadge = (s: string | null) => {
    const st = (s ?? "").toLowerCase();
    const cls = st === "published" ? "bg-green-100 text-green-700" : st === "vendido" ? "bg-purple-100 text-purple-700" : st === "draft" ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600";
    return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cls}`}>{s || "—"}</span>;
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold text-gray-900">Posts de Vehiculos</h1>

          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            {loggedEmail && <span className="hidden sm:inline truncate max-w-[150px]">{loggedEmail}</span>}
            {loggedEmail && (
              <button onClick={handleSignOut} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Cerrar sesion">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-col h-[calc(100vh-48px)]">
          {/* Stats bar */}
          <div className="flex items-center gap-4 px-4 py-2 border-b text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-gray-900">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-400">Publicados</span>
              <span className="font-bold text-green-700">{stats.published}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-400">Disponibles</span>
              <span className="font-bold text-blue-700">{stats.disponibles}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-gray-400">Vendidos</span>
              <span className="font-bold text-purple-700">{stats.vendidos}</span>
            </div>

            <div className="ml-auto">
              <Link href="/admin/posts/create">
                <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Post
                </button>
              </Link>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50/80 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="all">Estado: Todos</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="vendido">Vendido</option>
              <option value="archived">Archivado</option>
            </select>

            <select
              className="border rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            >
              <option value="all">Marca: Todas</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            {(search || estado !== "all" || marca !== "all") && (
              <button
                onClick={() => { setSearch(""); setEstado("all"); setMarca("all"); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400">{total} resultados</span>
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
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-[60px]">Img</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Vehiculo</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[50px]">Año</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600 w-[90px]">Precio</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[80px]">Estado</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[40px]">Disp</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[40px]">Fotos</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[70px]">Fecha</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-[70px]">Acc.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-12 text-gray-400">No hay resultados</td></tr>
                  )}
                  {rows.map((post, idx) => (
                    <tr key={post.id} className={`border-b hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-3 py-1.5">
                        <div className="relative h-10 w-14 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          {post.images_urls?.[0] ? (
                            <Image src={post.images_urls[0]} alt="" fill className="object-cover" sizes="56px" />
                          ) : (
                            <Car className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="font-medium text-gray-900 truncate max-w-[250px]">{post.titulo || "Sin titulo"}</div>
                        <div className="text-gray-400">{post.marca} {post.modelo}</div>
                      </td>
                      <td className="px-3 py-1.5 text-center text-gray-600">{post.anio || "—"}</td>
                      <td className="px-3 py-1.5 text-right font-semibold text-gray-900">{post.precio || "—"}</td>
                      <td className="px-3 py-1.5 text-center">{estadoBadge(post.estado)}</td>
                      <td className="px-3 py-1.5 text-center">
                        {post.disponible === "Sí" ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Disponible"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" title="No disponible"></span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-center text-gray-500">
                        <span className="flex items-center justify-center gap-0.5">
                          <ImageIcon className="w-3 h-3" />
                          {post.images_urls?.length || 0}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-center text-gray-400">{fmtDate(post.created_at)}</td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Link href={`/admin/posts/edit/${post.id}`}>
                            <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.titulo)}
                            disabled={deletingId === post.id}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30"
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
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
