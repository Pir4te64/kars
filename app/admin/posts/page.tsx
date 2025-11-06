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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Plus,
  Loader2,
  Search,
  Filter,
  Car,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

/* ---------------- Helpers de auth/error/fecha ---------------- */
type MaybeWithMessage = { message?: unknown };
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as MaybeWithMessage).message;
    if (typeof m === "string") return m;
  }
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}
function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
}

/* ---------------- Tipado del row de la vista ---------------- */
type VehiclePostRow = {
  id: string;
  titulo: string | null;
  slug: string | null;
  marca: string | null;
  modelo: string | null;
  anio: string | null;
  precio: string | null;
  precio_num: number | null; // <- de la vista
  estado: string | null; // e.g. "published", "draft", "vendido"
  disponible: string | null; // "Sí" | "No"
  images_urls: string[] | null;
  created_at: string | null;
};

export default function PostsListPage() {
  const router = useRouter();
  /* --------- sesión --------- */
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  /* --------- filtros --------- */
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<
    "all" | "published" | "draft" | "vendido" | "archived"
  >("all");
  const [disponible, setDisponible] = useState<"all" | "Sí" | "No">("all");
  const [marca, setMarca] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>(""); // texto del input
  const [maxPrice, setMaxPrice] = useState<string>("");

  const minP = useMemo(
    () => (minPrice ? Number(minPrice) : undefined),
    [minPrice]
  );
  const maxP = useMemo(
    () => (maxPrice ? Number(maxPrice) : undefined),
    [maxPrice]
  );

  /* --------- datos/paginación --------- */
  const [rows, setRows] = useState<VehiclePostRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ id: string; titulo: string | null } | null>(null);

  /* --------- estadísticas/KPIs --------- */
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    disponibles: 0,
    vendidos: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  /* --------- opciones de marcas (cargadas) --------- */
  const [brands, setBrands] = useState<string[]>([]);

  // Debounce de búsqueda (300ms)
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Obtener email de usuario autenticado y escuchar cambios de sesión
  useEffect(() => {
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        setLoggedEmail(data.user?.email ?? null);
      })
      .catch((error) => {
        console.error("Auth error:", error);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Cargar marcas (dedupe cliente)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("vehicle_posts")
          .select("marca")
          .not("marca", "is", null)
          .neq("marca", "")
          .order("marca", { ascending: true })
          .limit(1000);
        if (error) throw error;
        const uniq = Array.from(
          new Set((data ?? []).map((r) => r.marca as string))
        );
        setBrands(uniq);
      } catch (e: unknown) {
        console.error("Brands error:", e);
      }
    })();
  }, []);

  // Cargar estadísticas/KPIs
  useEffect(() => {
    (async () => {
      setLoadingStats(true);
      try {
        const { count: totalCount } = await supabase
          .from("vehicle_posts")
          .select("*", { count: "exact", head: true });

        const { count: publishedCount } = await supabase
          .from("vehicle_posts")
          .select("*", { count: "exact", head: true })
          .eq("estado", "published");

        const { count: disponiblesCount } = await supabase
          .from("vehicle_posts")
          .select("*", { count: "exact", head: true })
          .eq("disponible", "Sí");

        const { count: vendidosCount } = await supabase
          .from("vehicle_posts")
          .select("*", { count: "exact", head: true })
          .eq("estado", "vendido");

        setStats({
          total: totalCount ?? 0,
          published: publishedCount ?? 0,
          disponibles: disponiblesCount ?? 0,
          vendidos: vendidosCount ?? 0,
        });
      } catch (e: unknown) {
        console.error("Stats error:", e);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  // Fetch con filtros + paginación desde la VISTA
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let q = supabase
          .from("vehicle_posts_view")
          .select(
            "id,titulo,slug,marca,modelo,anio,precio,precio_num,estado,disponible,images_urls,created_at",
            {
              count: "exact",
            }
          );

        // búsqueda (titulo/marca/modelo/version/slug)
        if (debouncedSearch) {
          const term = debouncedSearch.replace(/,/g, " "); // evitar romper OR
          q = q.or(
            `titulo.ilike.%${term}%,marca.ilike.%${term}%,modelo.ilike.%${term}%,slug.ilike.%${term}%`
          );
        }

        if (estado !== "all") q = q.eq("estado", estado);
        if (disponible !== "all") q = q.eq("disponible", disponible);
        if (marca !== "all") q = q.eq("marca", marca);

        // rango de precio (usa precio_num de la vista)
        if (typeof minP === "number" && !Number.isNaN(minP))
          q = q.gte("precio_num", minP);
        if (typeof maxP === "number" && !Number.isNaN(maxP))
          q = q.lte("precio_num", maxP);

        // paginación
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await q
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        setRows(data ?? []);
        setTotal(count ?? 0);
      } catch (e: unknown) {
        console.error("Fetch error:", e);
        toast.error(`Error cargando posts: ${getErrorMessage(e)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, estado, disponible, marca, minP, maxP, page, pageSize]);

  // Resetear a página 1 cuando cambian filtros (excepto paginación)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estado, disponible, marca, minP, maxP]);

  /* --------- acciones --------- */
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setPage(1);
  };

  const handleDeleteClick = (id: string, titulo: string | null) => {
    setPostToDelete({ id, titulo });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      setDeletingId(postToDelete.id);
      const { error } = await supabase
        .from("vehicle_posts")
        .delete()
        .eq("id", postToDelete.id);
      if (error) throw error;
      
      // refrescar clientemente
      setRows((prev) => prev.filter((r) => r.id !== postToDelete.id));
      setTotal((t) => Math.max(0, t - 1));
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);

      // Actualizar stats
      setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

      toast.success("Post eliminado correctamente");
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (e: unknown) {
      console.error("Delete error:", e);
      toast.error(`Error eliminando: ${getErrorMessage(e)}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      const callbackResponse = await fetch("/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ event: "SIGNED_OUT", session: null }),
      });

      if (!callbackResponse.ok) {
        throw new Error("No fue posible limpiar la sesión");
      }

      setLoggedEmail(null);
      toast.success("Sesión cerrada correctamente");
      router.replace("/login");
      router.refresh();
    } catch (e: unknown) {
      console.error("Sign out error:", e);
      toast.error("Error al cerrar sesión");
    } finally {
      setSigningOut(false);
    }
  };

  /* --------- UI --------- */
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Listado de Posts de Vehículos
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
            <span>{loggedEmail ? `Sesión: ${loggedEmail}` : "—"}</span>
            {loggedEmail ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2">
                {signingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                <span>Cerrar sesión</span>
              </Button>
            ) : null}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Posts de Vehículos</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tu inventario de vehículos
              </p>
            </div>
            <Link href="/admin/posts/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear Nuevo POST
              </Button>
            </Link>
          </div>

          {/* Dashboard KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loadingStats ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[60px] mb-1" />
                      <Skeleton className="h-3 w-[140px]" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Vehículos
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      En toda la base de datos
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Publicados
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.published}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Visibles en el sitio web
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Disponibles
                    </CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.disponibles}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Listos para la venta
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendidos</CardTitle>
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {stats.vendidos}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vehículos vendidos
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* --------- Filtros --------- */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Filtros de búsqueda</CardTitle>
                  {(search || estado !== "all" || disponible !== "all" || marca !== "all" || minPrice || maxPrice) && (
                    <Badge variant="secondary" className="ml-2">
                      {[search, estado !== "all", disponible !== "all", marca !== "all", minPrice, maxPrice].filter(Boolean).length} activos
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setEstado("all");
                    setDisponible("all");
                    setMarca("all");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="h-8 px-2">
                  Limpiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Título, marca, modelo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={estado}
                  onValueChange={(v) => setEstado(v as typeof estado)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Disponibilidad</label>
                <Select
                  value={disponible}
                  onValueChange={(v) => setDisponible(v as typeof disponible)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Sí">Disponible</SelectItem>
                    <SelectItem value="No">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Marca</label>
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-2 block">Precio mín</label>
                <Input
                  inputMode="numeric"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-2 block">Precio máx</label>
                <Input
                  inputMode="numeric"
                  placeholder="$1,000,000"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* --------- Tabla + paginación --------- */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Lista de Vehículos ({total})</CardTitle>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {loading
                      ? "Cargando…"
                      : `${rows.length ? (page - 1) * pageSize + 1 : 0}–${(page - 1) * pageSize + rows.length} de ${total}`}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={loading || page <= 1}>
                      Anterior
                    </Button>
                    <div className="text-sm w-20 text-center whitespace-nowrap">
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={loading || page >= totalPages}>
                      Siguiente
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Filas:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => handlePageSizeChange(v)}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm rounded-md">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando posts…
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagen</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Fotos</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!rows.length && !loading && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">
                              No hay resultados
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Intenta ajustar los filtros de búsqueda
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {rows.map((post) => {
                      const imagesCount = post.images_urls?.length ?? 0;
                      const firstImage = post.images_urls?.[0];
                      const status = (post.estado ?? "").toLowerCase();
                      const badgeVariant =
                        status === "published"
                          ? "default"
                          : status === "vendido"
                          ? "secondary"
                          : status === "draft"
                          ? "outline"
                          : "secondary";

                      const disponibleIcon = post.disponible === "Sí"
                        ? <CheckCircle2 className="inline h-3.5 w-3.5 text-green-600 mr-1" />
                        : <XCircle className="inline h-3.5 w-3.5 text-red-600 mr-1" />;

                      return (
                        <TableRow key={post.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="relative h-14 w-20 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  alt={post.titulo ?? "Vehicle"}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              ) : (
                                <Car className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm leading-none">
                                {post.titulo ?? "Sin título"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {post.marca ?? "—"} {post.modelo ?? ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{post.anio ?? "—"}</TableCell>
                          <TableCell className="font-semibold text-sm">
                            {post.precio ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5">
                              <Badge variant={badgeVariant} className="w-fit">
                                {post.estado ?? "—"}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center">
                                {disponibleIcon}
                                {post.disponible}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono text-xs">
                              {imagesCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {fmtDate(post.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                          
                        
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(post.id, post.titulo)}
                                disabled={deletingId === post.id}
                                title="Eliminar post">
                                {deletingId === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

            </CardContent>
          </Card>

          {/* Dialog de confirmación de eliminación */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar este post?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el post
                  {postToDelete?.titulo && (
                    <span className="font-semibold"> &quot;{postToDelete.titulo}&quot;</span>
                  )}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setPostToDelete(null);
                  }}
                  disabled={deletingId !== null}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}>
                  {deletingId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
