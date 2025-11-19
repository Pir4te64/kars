"use client";
/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCarInfo } from "@/src/hooks/useCarInfo";

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
import { Upload, Trash2, Loader2, Check, AlertTriangle, ArrowLeft } from "lucide-react";
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
import Link from "next/link";

// ----------------- Zod schema (todos TEXT, SIN imágenes) -----------------
const schema = z.object({
  titulo: z.string().optional(),
  slug: z.string().optional().or(z.literal("")), // Se genera automáticamente
  marca: z.string().optional(),
  modelo: z.string().optional(),
  version: z.string().optional().or(z.literal("")),
  anio: z.string().optional(),
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
  precio: z.string().optional(),
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
  file?: File;
  name: string;
  size?: number;
  preview: string;
  status: "uploading" | "done" | "error";
  url?: string;
  error?: string;
  isExisting?: boolean; // Para distinguir imágenes existentes de nuevas
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [uploading, setUploading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postData, setPostData] = useState<any>(null);

  // Imágenes con preview y estado
  const [imgItems, setImgItems] = useState<ImgItem[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Hook para datos de InfoAuto (marcas, modelos, años)
  const {
    brands,
    groups,
    models,
    years,
    loadingBrands,
    loadingGroups,
    loadingModels,
    loadingYears,
    getGroup,
    getModel,
    getPrice,
  } = useCarInfo();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
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

  // Helper para convertir valores a string (evita problemas con tipos)
  const toStr = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

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

  // ---------- Cargar datos del post ----------
  useEffect(() => {
    if (!postId) return;

    (async () => {
      try {
        setLoadingPost(true);
        const { data, error } = await supabase
          .from("vehicle_posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error("Post no encontrado");
          router.push("/admin/posts");
          return;
        }

        setPostData(data);

        // Prellenar formulario - convertir todos los valores a string
        reset({
          titulo: toStr(data.titulo),
          slug: toStr(data.slug),
          marca: toStr(data.marca),
          modelo: toStr(data.modelo),
          version: toStr(data.version),
          anio: toStr(data.anio),
          kilometraje: toStr(data.kilometraje),
          carroceria: toStr(data.carroceria),
          descripcion: toStr(data.descripcion),
          condicion: toStr(data.condicion),
          combustible: toStr(data.combustible),
          transmision: toStr(data.transmision),
          traccion: toStr(data.traccion),
          color_exterior: toStr(data.color_exterior),
          color_interior: toStr(data.color_interior),
          puertas: toStr(data.puertas),
          asientos: toStr(data.asientos),
          cilindrada: toStr(data.cilindrada),
          potencia_hp: toStr(data.potencia_hp),
          moneda: toStr(data.moneda),
          precio: toStr(data.precio),
          precio_negociable: toStr(data.precio_negociable),
          cuota_mensual: toStr(data.cuota_mensual),
          enganche: toStr(data.enganche),
          pais: toStr(data.pais),
          estado_provincia: toStr(data.estado_provincia),
          ciudad: toStr(data.ciudad),
          vendedor_nombre: toStr(data.vendedor_nombre),
          vendedor_calificacion: toStr(data.vendedor_calificacion),
          concesionaria_nombre: toStr(data.concesionaria_nombre),
          disponible: toStr(data.disponible),
        });

        // Cargar imágenes existentes
        if (data.images_urls && Array.isArray(data.images_urls) && data.images_urls.length > 0) {
          const existingImages: ImgItem[] = data.images_urls.map((url: string, index: number) => ({
            id: `existing-${index}-${Date.now()}`,
            name: `Imagen ${index + 1}`,
            preview: url,
            status: "done" as const,
            url: url,
            isExisting: true,
          }));
          setImgItems(existingImages);
        }
      } catch (error: any) {
        console.error("Error loading post:", error);
        toast.error(`Error cargando post: ${error.message}`);
        router.push("/admin/posts");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [postId, reset, router]);

  // Cargar datos de InfoAuto cuando se cargan los datos del vehículo
  useEffect(() => {
    if (!postData || !brands.length) return;

    const marca = toStr(postData.marca);
    const modelo = toStr(postData.modelo);

    // Si hay marca, cargar grupos/modelos
    if (marca) {
      const brand = brands.find((b) => b.name === marca);
      if (brand) {
        getGroup(brand.id.toString());
      }
    }
  }, [postData, brands, getGroup]);

  // Cuando se cargan los grupos, cargar modelos si ya hay modelo seleccionado
  useEffect(() => {
    if (!postData || !groups.length || !brands.length) return;

    const marca = toStr(postData.marca);
    const modelo = toStr(postData.modelo);

    if (marca && modelo) {
      const brand = brands.find((b) => b.name === marca);
      const group = groups.find((g) => g.name === modelo);
      if (brand && group) {
        getModel(brand.id.toString(), group.id.toString());
      }
    }
  }, [postData, groups, brands, getModel]);

  // Cuando se cargan los modelos, cargar precios si ya hay versión seleccionada
  useEffect(() => {
    if (!postData || !models.length) return;

    const version = toStr(postData.version);

    if (version) {
      const model = models.find((m) => m.description === version);
      if (model) {
        getPrice(model.codia);
      }
    }
  }, [postData, models, getPrice]);

  // Limpiar objectURLs al desmontar
  useEffect(() => {
    return () => {
      imgItems.forEach((it) => {
        if (it.file && it.preview.startsWith("blob:")) {
          URL.revokeObjectURL(it.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generar slug automáticamente desde el título (solo si el usuario cambia el título)
  const titulo = watch("titulo");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Marcar que la carga inicial terminó después de que se carguen los datos
    if (postData && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [postData, isInitialLoad]);
  
  useEffect(() => {
    // Solo generar slug automáticamente si:
    // - No fue editado manualmente
    // - No es la carga inicial (para no sobrescribir el slug existente)
    // - Hay un título válido
    if (!isInitialLoad && !isSlugManuallyEdited && titulo && titulo.length >= 2) {
      // Generar UUID corto (primeros 8 caracteres de timestamp en base36)
      const shortId = Date.now().toString(36).substring(0, 8);
      const generatedSlug = `${sanitizePath(titulo)}-${shortId}`;
      setValue("slug", generatedSlug, { shouldValidate: false });
    }
  }, [titulo, setValue, isSlugManuallyEdited, isInitialLoad]);

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
    const existingKeys = new Set(imgItems.map((i) => i.file ? dedupeKey(i.file) : ""));
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
          const url = await uploadAndGetUrl(it.file!, folder);
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
      if (found && found.file && found.preview.startsWith("blob:")) {
        URL.revokeObjectURL(found.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // ---- onSubmit: actualizar post ----
  const onSubmit = async (values: FormValues) => {
    try {
      if (!uploadedUrls.length) {
        return toast.error(
          "Agrega al menos una imagen antes de guardar."
        );
      }
      
      // Validar campos requeridos manualmente (pueden venir como undefined)
      const tituloValue = values.titulo ?? "";
      if (!tituloValue || tituloValue.trim().length < 2) {
        return toast.error("El título es requerido (mínimo 2 caracteres)");
      }
      
      const marcaValue = values.marca ?? "";
      if (!marcaValue || marcaValue.trim().length < 1) {
        return toast.error("La marca es requerida");
      }
      
      const modeloValue = values.modelo ?? "";
      if (!modeloValue || modeloValue.trim().length < 1) {
        return toast.error("El modelo es requerido");
      }
      
      const anioValue = values.anio ?? "";
      if (!anioValue || anioValue.trim().length < 2) {
        return toast.error("El año es requerido (mínimo 2 caracteres)");
      }
      
      const precioValue = values.precio ?? "";
      if (!precioValue || precioValue.trim().length < 1) {
        return toast.error("El precio es requerido");
      }
      
      setUploading(true);

      // Generar slug si no existe o está vacío
      const finalSlug = values.slug && values.slug.trim() 
        ? toStr(values.slug) 
        : `${sanitizePath(tituloValue)}-${Date.now().toString(36).substring(0, 8)}`;

      // Convertir todos los valores a string para asegurar compatibilidad con SQL TEXT
      const payload = {
        titulo: toStr(tituloValue), // Ya validado manualmente
        slug: finalSlug,
        marca: toStr(marcaValue), // Ya validado manualmente
        modelo: toStr(modeloValue), // Ya validado manualmente
        version: toStr(values.version),
        anio: toStr(anioValue), // Ya validado manualmente
        kilometraje: toStr(values.kilometraje),
        carroceria: toStr(values.carroceria),
        condicion: toStr(values.condicion),
        color_exterior: toStr(values.color_exterior),
        color_interior: toStr(values.color_interior),
        puertas: toStr(values.puertas),
        asientos: toStr(values.asientos),
        transmision: toStr(values.transmision),
        traccion: toStr(values.traccion),
        cilindrada: toStr(values.cilindrada),
        combustible: toStr(values.combustible),
        potencia_hp: toStr(values.potencia_hp),
        moneda: toStr(values.moneda),
        precio: toStr(precioValue), // Ya validado manualmente
        precio_negociable: toStr(values.precio_negociable),
        disponible: toStr(values.disponible),
        pais: toStr(values.pais),
        estado_provincia: toStr(values.estado_provincia),
        ciudad: toStr(values.ciudad),
        vendedor_nombre: toStr(values.vendedor_nombre),
        vendedor_calificacion: toStr(values.vendedor_calificacion),
        concesionaria_nombre: toStr(values.concesionaria_nombre),
        cuota_mensual: toStr(values.cuota_mensual),
        enganche: toStr(values.enganche),
        descripcion: toStr(values.descripcion),
        images_urls: uploadedUrls, // Array de strings, no necesita conversión
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("vehicle_posts")
        .update(payload)
        .eq("id", postId);

      if (error) throw error;

      toast.success("✅ Post actualizado con éxito");
      router.push("/admin/posts");
    } catch (e: Error | unknown) {
      console.error(e);
      toast.error(
        `❌ Error: ${e instanceof Error ? e.message : "Fallo al actualizar el post"}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
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
      toast.error("❌ Error al cerrar sesión");
    }
  };

  // ---------- UI ----------
  if (loadingPost || authLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-2 px-2 sm:px-3 min-w-0">
            <SidebarTrigger className="flex-shrink-0" />
            <Separator
              orientation="vertical"
              className="mr-1 sm:mr-2 data-[orientation=vertical]:h-4 hidden sm:block"
            />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Editar Post de Vehículo</span>
                    <span className="sm:hidden">Editar</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Volver</span>
                  <span className="sm:hidden">Atrás</span>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Editar POST de Vehículo</h1>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                {loggedEmail ? `Sesión: ${loggedEmail}` : "No autenticado"}
              </span>
              {loggedEmail ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
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
                {/* TÍTULO - COMENTADO: Se genera automáticamente desde marca + modelo + versión + año
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
                */}
                <div>
                  <Label htmlFor="slug">Slug (generado automáticamente)</Label>
                  <Input
                    id="slug"
                    placeholder="Se genera automáticamente desde el título"
                    {...register("slug", {
                      onChange: () => setIsSlugManuallyEdited(true)
                    })}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    El slug se genera automáticamente, pero puedes editarlo si lo necesitas
                  </p>
                </div>
                {/* MARCA - Desplegable con datos de InfoAuto */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label>Marca</Label>
                    <Controller
                      control={control}
                      name="marca"
                      render={({ field }) => (
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Obtener grupos/modelos de esta marca
                            const brand = brands.find((b) => b.name === value);
                            if (brand) {
                              getGroup(brand.id.toString());
                              // Limpiar campos dependientes
                              setValue("modelo", "");
                              setValue("version", "");
                              setValue("anio", "");
                            }
                          }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingBrands ? "Cargando..." : "Seleccionar marca"} />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.marca && (
                      <p className="text-red-500 text-sm">
                        {errors.marca.message}
                      </p>
                    )}
                  </div>

                  {/* GRUPO/MODELO - Desplegable con datos de InfoAuto */}
                  <div>
                    <Label>Grupo/Modelo</Label>
                    <Controller
                      control={control}
                      name="modelo"
                      render={({ field }) => (
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Obtener versiones de este modelo
                            const marcaValue = watch("marca");
                            const brand = brands.find((b) => b.name === marcaValue);
                            const group = groups.find((g) => g.name === value);
                            if (brand && group) {
                              getModel(brand.id.toString(), group.id.toString());
                              // Limpiar campos dependientes
                              setValue("version", "");
                              setValue("anio", "");
                            }
                          }}
                          disabled={!watch("marca") || loadingGroups}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingGroups ? "Cargando..." : "Seleccionar modelo"} />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.modelo && (
                      <p className="text-red-500 text-sm">
                        {errors.modelo.message}
                      </p>
                    )}
                  </div>

                  {/* VERSIÓN - Desplegable con datos de InfoAuto */}
                  <div>
                    <Label>Versión</Label>
                    <Controller
                      control={control}
                      name="version"
                      render={({ field }) => (
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Obtener precios/años de esta versión
                            const model = models.find((m) => m.description === value);
                            if (model) {
                              getPrice(model.codia);
                            }
                          }}
                          disabled={!watch("modelo") || loadingModels}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingModels ? "Cargando..." : "Seleccionar versión"} />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.codia} value={model.description}>
                                {model.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* AÑO - Desplegable con datos de InfoAuto */}
                  <div>
                    <Label>Año</Label>
                    <Controller
                      control={control}
                      name="anio"
                      render={({ field }) => (
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Actualizar precio automáticamente
                            const yearData = years.find((y) => y.year.toString() === value);
                            if (yearData) {
                              setValue("precio", yearData.price.toString());
                            }
                          }}
                          disabled={!watch("version") || loadingYears}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={loadingYears ? "Cargando..." : "Seleccionar año"} />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((yearData) => (
                              <SelectItem key={yearData.year} value={yearData.year.toString()}>
                                {yearData.year} - ${yearData.price?.toLocaleString("es-AR") || "N/A"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.anio && (
                      <p className="text-red-500 text-sm">
                        {errors.anio.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Kilometraje</Label>
                    <Input
                      placeholder="Ej: 50000"
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
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder=""
                    {...register("descripcion")}
                    rows={4}
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
                    Arrastra y suelta, o haz clic para agregar más imágenes —{" "}
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
                          {it.size && (
                            <p className="text-xs text-muted-foreground">
                              {formatKB(it.size)}
                            </p>
                          )}
                          {it.isExisting && (
                            <p className="text-xs text-muted-foreground italic">
                              Imagen existente
                            </p>
                          )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Precio</Label>
                    <Input
                      placeholder=""
                      {...register("precio", {
                        setValueAs: (value) => value === undefined || value === null ? "" : String(value)
                      })}
                    />
                    {errors.precio && (
                      <p className="text-red-500 text-sm">
                        {errors.precio.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Moneda</Label>
                    <Controller
                      control={control}
                      name="moneda"
                      render={({ field }) => (
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD (Dólares)</SelectItem>
                            <SelectItem value="ARS">ARS (Pesos)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
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
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/posts")}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploading || authLoading}>
                {uploading ? "Guardando…" : "Actualizar POST"}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

