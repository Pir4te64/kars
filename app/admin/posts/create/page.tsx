"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2, Loader2, Check, AlertTriangle } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// ----------------- Zod schema (todos TEXT, SIN imágenes) -----------------
const schema = z.object({
  titulo: z.string().min(2, "Requerido"),
  slug: z.string().min(2, "Requerido"),
  marca: z.string().min(1, "Requerido"),
  modelo: z.string().min(1, "Requerido"),
  version: z.string().optional().or(z.literal("")),
  anio: z.string().min(2, "Requerido"),
  kilometraje: z.string().optional().or(z.literal("")),
  carroceria: z.string().optional().or(z.literal("")),
  descripcion: z.string().optional().or(z.literal("")),
  condicion: z.string().optional().or(z.literal("")),
  combustible: z.string().optional().or(z.literal("")),
  transmision: z.string().optional().or(z.literal("")),
  traccion: z.string().optional().or(z.literal("")),
  color_exterior: z.string().optional().or(z.literal("")),
  color_interior: z.string().optional().or(z.literal("")),
  puertas: z.string().optional().or(z.literal("")),
  asientos: z.string().optional().or(z.literal("")),
  cilindrada: z.string().optional().or(z.literal("")),
  potencia_hp: z.string().optional().or(z.literal("")),
  moneda: z.string().optional().or(z.literal("")),
  precio: z.string().min(1, "Requerido"),
  precio_negociable: z.string().optional().or(z.literal("")),
  cuota_mensual: z.string().optional().or(z.literal("")),
  enganche: z.string().optional().or(z.literal("")),
  pais: z.string().optional().or(z.literal("")),
  estado_provincia: z.string().optional().or(z.literal("")),
  ciudad: z.string().optional().or(z.literal("")),
  vendedor_nombre: z.string().optional().or(z.literal("")),
  vendedor_calificacion: z.string().optional().or(z.literal("")),
  concesionaria_nombre: z.string().optional().or(z.literal("")),
  disponible: z.string().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

// ----------------- helpers -----------------
const STORAGE_BUCKET = "vehicles";

const sanitizePath = (s: string) =>
  (s || "listing")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

function formatKB(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function idFor(file: File) {
  return `${file.name}__${file.size}__${Date.now()}`;
}

type ImgItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  status: "uploading" | "done" | "error";
  url?: string;
  error?: string;
};

export default function Page() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Imágenes con preview y estado
  const [imgItems, setImgItems] = useState<ImgItem[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      titulo: "",
      slug: "",
      marca: "",
      modelo: "",
      version: "",
      anio: "",
      kilometraje: "",
      carroceria: "",
      descripcion: "",
      condicion: "",
      combustible: "",
      transmision: "",
      traccion: "",
      color_exterior: "",
      color_interior: "",
      puertas: "",
      asientos: "",
      cilindrada: "",
      potencia_hp: "",
      moneda: "",
      precio: "",
      precio_negociable: "",
      cuota_mensual: "",
      enganche: "",
      pais: "",
      estado_provincia: "",
      ciudad: "",
      vendedor_nombre: "",
      vendedor_calificacion: "",
      concesionaria_nombre: "",
      disponible: "",
    },
  });

  // ---------- Obtener usuario autenticado ----------
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
      })
      .finally(() => {
        if (active) setAuthLoading(false);
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

  // Limpiar objectURLs al desmontar
  useEffect(() => {
    return () => {
      imgItems.forEach((it) => URL.revokeObjectURL(it.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadedUrls = useMemo(
    () =>
      imgItems.filter((i) => i.status === "done" && i.url).map((i) => i.url!),
    [imgItems]
  );

  function currentFolderSlug() {
    const slugInput = document.getElementById(
      "slug"
    ) as HTMLInputElement | null;
    const tituloInput = document.getElementById(
      "titulo"
    ) as HTMLInputElement | null;
    return sanitizePath(slugInput?.value || tituloInput?.value || "listing");
  }

  // ---- Subir UNA imagen y devolver URL pública ----
  async function uploadAndGetUrl(file: File, folderSlug: string) {
    const folder = sanitizePath(folderSlug);
    const name = sanitizePath(file.name);
    const path = `${folder}/${Date.now()}-${name}`;
    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    return pub.publicUrl;
  }

  // ---- Agregar archivos + subir automáticamente con loader ----
  async function handleNewFiles(files: File[]) {
    if (!files.length) return;

    // 1) Crear items con preview y estado "uploading"
    const dedupeKey = (f: File) => `${f.name}__${f.size}`;
    const existingKeys = new Set(imgItems.map((i) => dedupeKey(i.file)));
    const incoming = files.filter((f) => f.type.startsWith("image/"));
    const freshFiles = incoming.filter((f) => !existingKeys.has(dedupeKey(f)));

    if (!freshFiles.length) return;

    const newItems: ImgItem[] = freshFiles.map((f) => ({
      id: idFor(f),
      file: f,
      name: f.name,
      size: f.size,
      preview: URL.createObjectURL(f),
      status: "uploading",
    }));

    setImgItems((prev) => [...prev, ...newItems]);

    // 2) Subir cada una (secuencial para UI clara)
    try {
      const folder = currentFolderSlug();

      for (const it of newItems) {
        try {
          const url = await uploadAndGetUrl(it.file, folder);
          setImgItems((prev) =>
            prev.map((p) =>
              p.id === it.id ? { ...p, status: "done", url } : p
            )
          );
        } catch (e: Error | unknown) {
          setImgItems((prev) =>
            prev.map((p) =>
              p.id === it.id
                ? {
                    ...p,
                    status: "error",
                    error: e instanceof Error ? e.message : "Fallo de subida",
                  }
                : p
            )
          );
        }
      }
    } catch (e: Error | unknown) {
      // Error inesperado al preparar las subidas
      setImgItems((prev) =>
        prev.map((p) =>
          newItems.some((n) => n.id === p.id)
            ? {
                ...p,
                status: "error",
                error: e instanceof Error ? e.message : "Fallo al preparar la subida",
              }
            : p
        )
      );
    }
  }

  const removeItem = (id: string) => {
    setImgItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((p) => p.id !== id);
    });
    // Nota: no borramos del bucket; si quieres, aquí podemos llamar a storage.remove(...)
  };

  // ---- onSubmit: requiere URLs ya subidas ----
  const onSubmit = async (values: FormValues) => {
    try {
      if (!uploadedUrls.length) {
        return alert(
          "Agrega imágenes (se suben automáticamente) antes de crear el post."
        );
      }
      setUploading(true);

      const payload = {
        titulo: values.titulo,
        slug: values.slug,
        marca: values.marca,
        modelo: values.modelo,
        version: values.version,
        anio: values.anio,
        kilometraje: values.kilometraje,
        carroceria: values.carroceria,
        condicion: values.condicion,
        color_exterior: values.color_exterior,
        color_interior: values.color_interior,
        puertas: values.puertas,
        asientos: values.asientos,
        transmision: values.transmision,
        traccion: values.traccion,
        cilindrada: values.cilindrada,
        combustible: values.combustible,
        potencia_hp: values.potencia_hp,
        moneda: values.moneda,
        precio: values.precio,
        precio_negociable: values.precio_negociable,
        estado: "published",
        disponible: values.disponible,
        pais: values.pais,
        estado_provincia: values.estado_provincia,
        ciudad: values.ciudad,
        vendedor_nombre: values.vendedor_nombre,
        vendedor_calificacion: values.vendedor_calificacion,
        concesionaria_nombre: values.concesionaria_nombre,
        cuota_mensual: values.cuota_mensual,
        enganche: values.enganche,
        descripcion: values.descripcion,
        images_urls: uploadedUrls, // URLs finalizadas
      };

      const { error } = await supabase.from("vehicle_posts").insert([payload]);
      if (error) throw error;

      alert("✅ Post creado con éxito");
      // limpiar
      reset();
      imgItems.forEach((it) => URL.revokeObjectURL(it.preview));
      setImgItems([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: Error | unknown) {
      console.error(e);
      alert(
        `❌ Error: ${e instanceof Error ? e.message : "Fallo al crear el post"}`
      );
    } finally {
      setUploading(false);
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
      router.replace("/login");
      router.refresh();
    } catch (e: Error | unknown) {
      console.error("Sign out error:", e);
      alert("❌ Error al cerrar sesión");
    } finally {
      setSigningOut(false);
    }
  };

  // ---------- UI ----------
  return (
    <SidebarProvider>
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
        </header>

        <div className="w-full mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Crear POST de Vehículo</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {authLoading
                  ? "Autenticando…"
                  : loggedEmail
                  ? `Sesión: ${loggedEmail}`
                  : "No autenticado"}
              </span>
              {loggedEmail ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2"
                >
                  {signingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>Cerrar sesión</span>
                </Button>
              ) : null}
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    placeholder=""
                    {...register("titulo")}
                  />
                  {errors.titulo && (
                    <p className="text-red-500 text-sm">
                      {errors.titulo.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder=""
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Marca</Label>
                    <Input placeholder="" {...register("marca")} />
                    {errors.marca && (
                      <p className="text-red-500 text-sm">
                        {errors.marca.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Input placeholder="" {...register("modelo")} />
                    {errors.modelo && (
                      <p className="text-red-500 text-sm">
                        {errors.modelo.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Año</Label>
                    <Input placeholder="" {...register("anio")} />
                    {errors.anio && (
                      <p className="text-red-500 text-sm">
                        {errors.anio.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Kilometraje</Label>
                    <Input
                      placeholder=""
                      {...register("kilometraje")}
                    />
                  </div>
                </div>
                <div>
                  <Label>Transmisión</Label>
                  <Input
                    placeholder=""
                    {...register("transmision")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Motor */}
            <Card>
              <CardHeader>
                <CardTitle>Motor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Cilindrada</Label>
                    <Input placeholder="" {...register("cilindrada")} />
                  </div>
                  <div>
                    <Label>Combustible</Label>
                    <Input placeholder="" {...register("combustible")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Potencia</Label>
                    <Input placeholder="" {...register("potencia_hp")} />
                  </div>
                  <div>
                    <Label>Tracción</Label>
                    <Input placeholder="" {...register("traccion")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imágenes (auto-upload con preview y loader) */}
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleNewFiles(files);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                />

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files || []);
                    handleNewFiles(files);
                  }}
                  onClick={() => fileRef.current?.click()}>
                  <Upload className="mx-auto h-12 w-12 opacity-60 mb-3" />
                  <p className="font-medium">
                    Arrastra y suelta, o haz clic para elegir —{" "}
                    <span className="opacity-70">se suben automáticamente</span>
                  </p>
                </div>

                {/* Lista de imágenes con preview, nombre/tamaño y estado */}
                {!!imgItems.length && (
                  <ul className="space-y-3">
                    {imgItems.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center gap-3 border rounded-lg p-3">
                        {/* Preview */}
                        <img
                          src={it.preview}
                          alt={it.name}
                          className="w-16 h-16 rounded-md object-cover bg-muted"
                        />

                        {/* Nombre y tamaño */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{it.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatKB(it.size)}
                          </p>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center gap-2">
                          {it.status === "uploading" && (
                            <span className="inline-flex items-center text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Subiendo…
                            </span>
                          )}
                          {it.status === "done" && (
                            <span className="inline-flex items-center text-sm text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              Listo
                            </span>
                          )}
                          {it.status === "error" && (
                            <span className="inline-flex items-center text-sm text-red-600">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Error
                            </span>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Quitar de la lista"
                            onClick={() => removeItem(it.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Precio & Financiamiento */}
            <Card>
              <CardHeader>
                <CardTitle>Precio & Financiamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Precio</Label>
                  <Input placeholder="" {...register("precio")} />
                  {errors.precio && (
                    <p className="text-red-500 text-sm">
                      {errors.precio.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Cuota Mensual</Label>
                    <Input
                      placeholder=""
                      {...register("cuota_mensual")}
                    />
                  </div>
                  <div>
                    <Label>Enganche</Label>
                    <Input
                      placeholder=""
                      {...register("enganche")}
                    />
                  </div>
                </div>
                <div>
                  <Label>¿Disponible?</Label>
                  <Controller
                    control={control}
                    name="disponible"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sí">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendedor */}
            <Card>
              <CardHeader>
                <CardTitle>Vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre del Vendedor</Label>
                    <Input
                      placeholder=""
                      {...register("vendedor_nombre")}
                    />
                  </div>
                  <div>
                    <Label>Calificación</Label>
                    <Input
                      placeholder=""
                      {...register("vendedor_calificacion")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || uploading || authLoading}>
                {uploading ? "Guardando…" : "Crear POST"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
