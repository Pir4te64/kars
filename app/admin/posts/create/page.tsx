"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { toast } from "sonner";

// ----------------- Zod schema según tabla vehicle_posts -----------------
const schema = z.object({
  // Información básica
  titulo: z.string().optional(),
  slug: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  version: z.string().optional(),
  anio: z.string().optional(),
  kilometraje: z.string().optional(),
  carroceria: z.string().optional(),
  descripcion: z.string().optional(),
  condicion: z.string().optional(),
  color_exterior: z.string().optional(),
  color_interior: z.string().optional(),
  puertas: z.string().optional(),
  asientos: z.string().optional(),

  // Motor básico
  combustible: z.string().optional(),
  cilindrada: z.string().optional(),
  potencia_hp: z.string().optional(),
  transmision: z.string().optional(),
  traccion: z.string().optional(),

  // Motor (detalles adicionales)
  alimentacion: z.string().optional(),
  cilindros: z.string().optional(),
  valvulas: z.string().optional(),

  // Transmisión y chasis
  velocidades: z.string().optional(),
  neumaticos: z.string().optional(),
  frenos_delanteros: z.string().optional(),
  frenos_traseros: z.string().optional(),
  direccion_asistida: z.string().optional(),
  freno_mano: z.string().optional(),

  // Confort
  aire_acondicionado: z.string().optional(),
  asiento_delantero_ajuste_altura: z.string().optional(),
  volante_regulable: z.string().optional(),
  asientos_traseros: z.string().optional(),
  tapizados: z.string().optional(),
  cierre_puertas: z.string().optional(),
  vidrios_delanteros: z.string().optional(),
  vidrios_traseros: z.string().optional(),
  espejos_exteriores: z.string().optional(),
  espejo_interior_antideslumbrante: z.string().optional(),
  faros_delanteros: z.string().optional(),
  faros_antiniebla: z.string().optional(),
  faros_tipo: z.string().optional(),
  computadora_abordo: z.string().optional(),
  control_velocidad_crucero: z.string().optional(),
  limitador_velocidad: z.string().optional(),
  llantas_aleacion: z.string().optional(),
  techo_solar: z.string().optional(),
  sensores_estacionamiento: z.string().optional(),
  camara_estacionamiento: z.string().optional(),
  asistencia_arranque_pendientes: z.string().optional(),

  // Seguridad
  abs: z.string().optional(),
  distribucion_electronica_frenado: z.string().optional(),
  asistencia_frenada_emergencia: z.string().optional(),
  airbags_delanteros: z.string().optional(),
  airbags_cortina: z.string().optional(),
  airbag_rodilla_conductor: z.string().optional(),
  airbags_laterales: z.string().optional(),
  cantidad_airbags: z.string().optional(),
  alarma: z.string().optional(),
  inmovilizador_motor: z.string().optional(),
  anclaje_asientos_infantiles: z.string().optional(),
  sensor_lluvia: z.string().optional(),
  sensor_luz: z.string().optional(),
  autobloqueo_puertas_velocidad: z.string().optional(),
  control_estabilidad: z.string().optional(),
  control_traccion: z.string().optional(),
  control_descenso: z.string().optional(),
  sensor_presion_neumaticos: z.string().optional(),

  // Comunicación y entretenimiento
  equipo_musica: z.string().optional(),
  comandos_volante: z.string().optional(),
  conexion_auxiliar: z.string().optional(),
  conexion_usb: z.string().optional(),
  bluetooth: z.string().optional(),
  control_voz: z.string().optional(),
  pantalla: z.string().optional(),
  navegacion_gps: z.string().optional(),
  apple_carplay: z.string().optional(),
  android_auto: z.string().optional(),

  // Precio
  moneda: z.string().optional(),
  precio: z.string().optional(),
  precio_negociable: z.string().optional(),

  // Ubicación y vendedor
  pais: z.string().optional(),
  estado_provincia: z.string().optional(),
  ciudad: z.string().optional(),
  vendedor_nombre: z.string().optional(),
  vendedor_calificacion: z.string().optional(),
  concesionaria_nombre: z.string().optional(),
  disponible: z.string().optional(),
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
  const [userId, setUserId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Imágenes con preview y estado
  const [imgItems, setImgItems] = useState<ImgItem[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      // Información básica
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
      color_exterior: "",
      color_interior: "",
      puertas: "",
      asientos: "",
      // Motor básico
      combustible: "",
      cilindrada: "",
      potencia_hp: "",
      transmision: "",
      traccion: "",
      // Motor (detalles)
      alimentacion: "",
      cilindros: "",
      valvulas: "",
      // Transmisión y chasis
      velocidades: "",
      neumaticos: "",
      frenos_delanteros: "",
      frenos_traseros: "",
      direccion_asistida: "",
      freno_mano: "",
      // Confort
      aire_acondicionado: "",
      asiento_delantero_ajuste_altura: "",
      volante_regulable: "",
      asientos_traseros: "",
      tapizados: "",
      cierre_puertas: "",
      vidrios_delanteros: "",
      vidrios_traseros: "",
      espejos_exteriores: "",
      espejo_interior_antideslumbrante: "",
      faros_delanteros: "",
      faros_antiniebla: "",
      faros_tipo: "",
      computadora_abordo: "",
      control_velocidad_crucero: "",
      limitador_velocidad: "",
      llantas_aleacion: "",
      techo_solar: "",
      sensores_estacionamiento: "",
      camara_estacionamiento: "",
      asistencia_arranque_pendientes: "",
      // Seguridad
      abs: "",
      distribucion_electronica_frenado: "",
      asistencia_frenada_emergencia: "",
      airbags_delanteros: "",
      airbags_cortina: "",
      airbag_rodilla_conductor: "",
      airbags_laterales: "",
      cantidad_airbags: "",
      alarma: "",
      inmovilizador_motor: "",
      anclaje_asientos_infantiles: "",
      sensor_lluvia: "",
      sensor_luz: "",
      autobloqueo_puertas_velocidad: "",
      control_estabilidad: "",
      control_traccion: "",
      control_descenso: "",
      sensor_presion_neumaticos: "",
      // Comunicación y entretenimiento
      equipo_musica: "",
      comandos_volante: "",
      conexion_auxiliar: "",
      conexion_usb: "",
      bluetooth: "",
      control_voz: "",
      pantalla: "",
      navegacion_gps: "",
      apple_carplay: "",
      android_auto: "",
      // Precio
      moneda: "",
      precio: "",
      precio_negociable: "",
      // Ubicación y vendedor
      pais: "",
      estado_provincia: "",
      ciudad: "",
      vendedor_nombre: "",
      vendedor_calificacion: "",
      concesionaria_nombre: "",
      disponible: "",
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Watchers para campos condicionales
  const airbagsDelanteros = watch("airbags_delanteros");
  const pantalla = watch("pantalla");

  // ---------- Obtener usuario autenticado ----------
  useEffect(() => {
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data.user) {
          setLoggedEmail(data.user.email ?? null);
          setUserId(data.user.id ?? null);
        } else {
          setLoggedEmail(null);
          setUserId(null);
        }
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
      setUserId(session?.user?.id ?? null);
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

  // Generar slug automáticamente UNA SOLA VEZ desde el título
  const titulo = watch("titulo");
  const slugGenOnceRef = useRef(false);
  useEffect(() => {
    if (!slugGenOnceRef.current && titulo && titulo.length >= 2) {
      const shortId = Date.now().toString(36).substring(0, 8);
      const generatedSlug = `${sanitizePath(titulo)}-${shortId}`;
      setValue("slug", generatedSlug, { shouldValidate: false });
      slugGenOnceRef.current = true;
    }
  }, [titulo, setValue]);

  const watchSlug = watch("slug");

  const uploadedUrls = useMemo(
    () =>
      imgItems.filter((i) => i.status === "done" && i.url).map((i) => i.url!),
    [imgItems]
  );

  function currentFolderSlug() {
    return sanitizePath(watchSlug || titulo || "listing");
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
        } catch (e: any) {
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
    } catch (e: any) {
      setImgItems((prev) =>
        prev.map((p) =>
          newItems.some((n) => n.id === p.id)
            ? {
                ...p,
                status: "error",
                error:
                  e instanceof Error
                    ? e.message
                    : "Fallo al preparar la subida",
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
  };

  // Helper para convertir valores a string
  const toStr = (val: string | undefined | null): string => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  // ---- onSubmit ----
  const onSubmit = async (values: FormValues) => {
    try {
      if (!uploadedUrls.length) {
        toast.error("Imágenes requeridas", {
          description:
            "Agrega imágenes (se suben automáticamente) antes de crear el post.",
        });
        form.setError("root", {
          type: "manual",
          message: "Las imágenes son obligatorias",
        });
        return;
      }

      // Validaciones mínimas
      const tituloValue = String(values.titulo ?? "").trim();
      if (!tituloValue || tituloValue.length < 2) {
        toast.error("Título inválido", {
          description: "El título es requerido (mínimo 2 caracteres)",
        });
        form.setError("titulo", {
          type: "manual",
          message: "El título es requerido (mínimo 2 caracteres)",
        });
        return;
      }
      const marcaValue = String(values.marca ?? "").trim();
      if (!marcaValue) {
        toast.error("Marca requerida", {
          description: "La marca es un campo obligatorio",
        });
        form.setError("marca", {
          type: "manual",
          message: "La marca es requerida",
        });
        return;
      }
      const modeloValue = String(values.modelo ?? "").trim();
      if (!modeloValue) {
        toast.error("Modelo requerido", {
          description: "El modelo es un campo obligatorio",
        });
        form.setError("modelo", {
          type: "manual",
          message: "El modelo es requerido",
        });
        return;
      }
      const anioValue = String(values.anio ?? "").trim();
      if (!anioValue) {
        toast.error("Año requerido", {
          description: "El año es un campo obligatorio",
        });
        form.setError("anio", {
          type: "manual",
          message: "El año es requerido",
        });
        return;
      }
      const precioValue = String(values.precio ?? "").trim();
      if (!precioValue) {
        toast.error("Precio requerido", {
          description: "El precio es un campo obligatorio",
        });
        form.setError("precio", {
          type: "manual",
          message: "El precio es requerido",
        });
        return;
      }

      setUploading(true);

      // Slug final
      const finalSlug =
        values.slug && values.slug.trim()
          ? toStr(values.slug)
          : `${sanitizePath(tituloValue)}-${Date.now()
              .toString(36)
              .substring(0, 8)}`;

      const payload = {
        // Información básica
        titulo: toStr(tituloValue),
        slug: finalSlug,
        marca: toStr(marcaValue),
        modelo: toStr(modeloValue),
        version: toStr(values.version),
        anio: toStr(anioValue),
        kilometraje: toStr(values.kilometraje),
        carroceria: toStr(values.carroceria),
        condicion: toStr(values.condicion),
        color_exterior: toStr(values.color_exterior),
        color_interior: toStr(values.color_interior),
        puertas: toStr(values.puertas),
        asientos: toStr(values.asientos),
        descripcion: toStr(values.descripcion),
        // Motor básico
        combustible: toStr(values.combustible),
        cilindrada: toStr(values.cilindrada),
        potencia_hp: toStr(values.potencia_hp),
        transmision: toStr(values.transmision),
        traccion: toStr(values.traccion),
        // Motor (detalles)
        alimentacion: toStr(values.alimentacion),
        cilindros: toStr(values.cilindros),
        valvulas: toStr(values.valvulas),
        // Transmisión y chasis
        velocidades: toStr(values.velocidades),
        neumaticos: toStr(values.neumaticos),
        frenos_delanteros: toStr(values.frenos_delanteros),
        frenos_traseros: toStr(values.frenos_traseros),
        direccion_asistida: toStr(values.direccion_asistida),
        freno_mano: toStr(values.freno_mano),
        // Confort
        aire_acondicionado: toStr(values.aire_acondicionado),
        asiento_delantero_ajuste_altura: toStr(
          values.asiento_delantero_ajuste_altura
        ),
        volante_regulable: toStr(values.volante_regulable),
        asientos_traseros: toStr(values.asientos_traseros),
        tapizados: toStr(values.tapizados),
        cierre_puertas: toStr(values.cierre_puertas),
        vidrios_delanteros: toStr(values.vidrios_delanteros),
        vidrios_traseros: toStr(values.vidrios_traseros),
        espejos_exteriores: toStr(values.espejos_exteriores),
        espejo_interior_antideslumbrante: toStr(
          values.espejo_interior_antideslumbrante
        ),
        faros_delanteros: toStr(values.faros_delanteros),
        faros_antiniebla: toStr(values.faros_antiniebla),
        faros_tipo: toStr(values.faros_tipo),
        computadora_abordo: toStr(values.computadora_abordo),
        control_velocidad_crucero: toStr(values.control_velocidad_crucero),
        limitador_velocidad: toStr(values.limitador_velocidad),
        llantas_aleacion: toStr(values.llantas_aleacion),
        techo_solar: toStr(values.techo_solar),
        sensores_estacionamiento: toStr(values.sensores_estacionamiento),
        camara_estacionamiento: toStr(values.camara_estacionamiento),
        asistencia_arranque_pendientes: toStr(
          values.asistencia_arranque_pendientes
        ),
        // Seguridad
        abs: toStr(values.abs),
        distribucion_electronica_frenado: toStr(
          values.distribucion_electronica_frenado
        ),
        asistencia_frenada_emergencia: toStr(
          values.asistencia_frenada_emergencia
        ),
        airbags_delanteros: toStr(values.airbags_delanteros),
        airbags_cortina: toStr(values.airbags_cortina),
        airbag_rodilla_conductor: toStr(values.airbag_rodilla_conductor),
        airbags_laterales: toStr(values.airbags_laterales),
        cantidad_airbags: toStr(values.cantidad_airbags),
        alarma: toStr(values.alarma),
        inmovilizador_motor: toStr(values.inmovilizador_motor),
        anclaje_asientos_infantiles: toStr(values.anclaje_asientos_infantiles),
        sensor_lluvia: toStr(values.sensor_lluvia),
        sensor_luz: toStr(values.sensor_luz),
        autobloqueo_puertas_velocidad: toStr(
          values.autobloqueo_puertas_velocidad
        ),
        control_estabilidad: toStr(values.control_estabilidad),
        control_traccion: toStr(values.control_traccion),
        control_descenso: toStr(values.control_descenso),
        sensor_presion_neumaticos: toStr(values.sensor_presion_neumaticos),
        // Comunicación y entretenimiento
        equipo_musica: toStr(values.equipo_musica),
        comandos_volante: toStr(values.comandos_volante),
        conexion_auxiliar: toStr(values.conexion_auxiliar),
        conexion_usb: toStr(values.conexion_usb),
        bluetooth: toStr(values.bluetooth),
        control_voz: toStr(values.control_voz),
        pantalla: toStr(values.pantalla),
        navegacion_gps: toStr(values.navegacion_gps),
        apple_carplay: toStr(values.apple_carplay),
        android_auto: toStr(values.android_auto),
        // Precio
        moneda: toStr(values.moneda),
        precio: toStr(precioValue),
        precio_negociable: toStr(values.precio_negociable),
        // Ubicación y vendedor
        pais: toStr(values.pais),
        estado_provincia: toStr(values.estado_provincia),
        ciudad: toStr(values.ciudad),
        vendedor_nombre: toStr(values.vendedor_nombre),
        vendedor_calificacion: toStr(values.vendedor_calificacion),
        concesionaria_nombre: toStr(values.concesionaria_nombre),
        disponible: toStr(values.disponible),
        // Estado
        estado: "published",
        images_urls: uploadedUrls,
        created_by: userId ?? null,
      };

      // console.log("Submit values:", values);
      // console.log("Payload to Supabase:", payload);

      const { error } = await supabase.from("vehicle_posts").insert([payload]);
      if (error) throw error;

      // Mostrar toast de éxito
      toast.success("Post creado exitosamente", {
        description: "El vehículo ha sido publicado correctamente",
        duration: 3000,
      });

      // Limpiar formulario
      reset();
      slugGenOnceRef.current = false;
      imgItems.forEach((it) => URL.revokeObjectURL(it.preview));
      setImgItems([]);
      if (fileRef.current) fileRef.current.value = "";

      // Redirigir al listado después de un breve delay
      setTimeout(() => {
        router.push("/admin/posts");
      }, 1500);
    } catch (e: any) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "Fallo al crear el post";
      toast.error("Error al crear el post", {
        description: errorMessage,
        duration: 5000,
      });
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
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
      setUserId(null);
      router.replace("/login");
      router.refresh();
    } catch (e: any) {
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
                  className="flex items-center gap-2">
                  {signingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>Cerrar sesión</span>
                </Button>
              ) : null}
            </div>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormLabel className="sr-only">
                          Slug (generado automáticamente)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Se genera automáticamente desde el título"
                            {...field}
                            readOnly
                            className="bg-muted"
                            type="hidden"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="anio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kilometraje"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometraje</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versión</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="carroceria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carrocería</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condicion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condición</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color_exterior"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Exterior</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color_interior"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Interior</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="puertas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puertas</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asientos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asientos</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 🔧 MOTOR */}
              <Card>
                <CardHeader>
                  <CardTitle>Motor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="combustible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combustible</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cilindrada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cilindrada</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="potencia_hp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potencia (HP)</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alimentacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alimentación</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Turbo">Turbo</SelectItem>
                              <SelectItem value="Aspirado">Aspirado</SelectItem>
                              <SelectItem value="Híbrido">Híbrido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="cilindros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cilindros</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 4, 6, 8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valvulas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Válvulas</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 16, 24, 32" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="traccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tracción</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 🚗 TRANSMISIÓN Y CHASIS */}
              <Card>
                <CardHeader>
                  <CardTitle>Transmisión y Chasis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="transmision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmisión</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="Automática">
                                Automática
                              </SelectItem>
                              <SelectItem value="CVT">CVT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="velocidades"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Velocidades</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: 5 velocidades, Caja de Novena"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neumaticos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Neumáticos</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: R17, R18, R19" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="direccion_asistida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección Asistida</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Hidráulica">
                                Hidráulica
                              </SelectItem>
                              <SelectItem value="Eléctrica">
                                Eléctrica
                              </SelectItem>
                              <SelectItem value="Electro-hidráulica">
                                Electro-hidráulica
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="frenos_delanteros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frenos Delanteros</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Discos ventilados, Discos"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="frenos_traseros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frenos Traseros</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Discos, Tambor"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="freno_mano"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freno de Mano</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mecánico">Mecánico</SelectItem>
                              <SelectItem value="Eléctronico">
                                Eléctronico
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 🎛️ CONFORT */}
              <Card>
                <CardHeader>
                  <CardTitle>Confort</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="aire_acondicionado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aire Acondicionado</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Climatizador">
                                Climatizador
                              </SelectItem>
                              <SelectItem value="Aire acondicionado">
                                Aire acondicionado
                              </SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tapizados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tapizados</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cuero">Cuero</SelectItem>
                              <SelectItem value="Tela">Tela</SelectItem>
                              <SelectItem value="Alcantara">
                                Alcantara
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asiento_delantero_ajuste_altura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asiento Delantero Ajuste Altura</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="volante_regulable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Volante Regulable</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="asientos_traseros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asientos Traseros</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Abatibles 60/40, Fijos"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cierre_puertas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cierre de Puertas</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Centralizado con mando, Manual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vidrios_delanteros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vidrios Delanteros</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Eléctricos">
                                Eléctricos
                              </SelectItem>
                              <SelectItem value="Manuales">Manuales</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vidrios_traseros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vidrios Traseros</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Eléctricos">
                                Eléctricos
                              </SelectItem>
                              <SelectItem value="Manuales">Manuales</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="espejos_exteriores"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espejos Exteriores</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Eléctricos">
                                Eléctricos
                              </SelectItem>
                              <SelectItem value="Manuales">Manuales</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="espejo_interior_antideslumbrante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Espejo Interior Antideslumbrante
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Automático">
                                Automático
                              </SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="faros_delanteros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faros Delanteros</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Automáticos con regulación, Manuales"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="faros_antiniebla"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faros Antiniebla</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="faros_tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Faros</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Xenón">Xenón</SelectItem>
                              <SelectItem value="LED">LED</SelectItem>
                              <SelectItem value="Halógenos">
                                Halógenos
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="computadora_abordo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Computadora de a Bordo</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="control_velocidad_crucero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control de Velocidad Crucero</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="limitador_velocidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limitador de Velocidad</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="llantas_aleacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Llantas de Aleación</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="techo_solar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Techo Solar</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Doble - Eléctrico">
                                Doble - Eléctrico
                              </SelectItem>
                              <SelectItem value="Simple">Simple</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sensores_estacionamiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sensores de Estacionamiento</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Delanteros">
                                Delanteros
                              </SelectItem>
                              <SelectItem value="Traseros">Traseros</SelectItem>
                              <SelectItem value="Delanteros y traseros">
                                Delanteros y traseros
                              </SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="camara_estacionamiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cámara de Estacionamiento</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asistencia_arranque_pendientes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3 lg:col-span-4">
                          <FormLabel>
                            Asistencia al Arranque en Pendientes
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 🛡️ SEGURIDAD */}
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="abs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ABS</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="distribucion_electronica_frenado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Distribución Electrónica de Frenado
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asistencia_frenada_emergencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Asistencia en Frenada de Emergencia
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="airbags_delanteros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airbags Delanteros</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {airbagsDelanteros === "Sí" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name="cantidad_airbags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad de Airbags</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 7, 6, 4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="airbags_cortina"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Airbags Cortina</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Delanteros">
                                  Delanteros
                                </SelectItem>
                                <SelectItem value="Delanteros y traseros">
                                  Delanteros y traseros
                                </SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="airbag_rodilla_conductor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airbag de Rodilla Conductor</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="airbags_laterales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airbags Laterales</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Delanteros">
                                Delanteros
                              </SelectItem>
                              <SelectItem value="Delanteros y traseros">
                                Delanteros y traseros
                              </SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alarma"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alarma</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inmovilizador_motor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inmovilizador de Motor</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="anclaje_asientos_infantiles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Anclaje para Asientos Infantiles
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sensor_lluvia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sensor de Lluvia</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sensor_luz"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sensor de Luz</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="autobloqueo_puertas_velocidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Autobloqueo de Puertas con Velocidad
                          </FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="control_estabilidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control de Estabilidad</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="control_traccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control de Tracción</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="control_descenso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control de Descenso</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sensor_presion_neumaticos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sensor de Presión de Neumáticos</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 📻 COMUNICACIÓN Y ENTRETENIMIENTO */}
              <Card>
                <CardHeader>
                  <CardTitle>Comunicación y Entretenimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="equipo_musica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipo de Música</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: AM - FM, AM/FM/CD"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="comandos_volante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comandos al Volante</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="conexion_auxiliar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conexión Auxiliar</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="conexion_usb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conexión USB</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="bluetooth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bluetooth</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="control_voz"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control por Voz</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pantalla"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pantalla</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Touchscreen 7 pulgadas">
                                Touchscreen 7 pulgadas
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {pantalla === "Sí" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name="navegacion_gps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Navegación GPS</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sí">Sí</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apple_carplay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apple CarPlay</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sí">Sí</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="android_auto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Android Auto</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sí">Sí</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 💰 PRECIO */}
              <Card>
                <CardHeader>
                  <CardTitle>Precio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="moneda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: USD, ARS, EUR" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="precio_negociable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Negociable</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="disponible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Disponible?</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 👤 VENDEDOR */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="vendedor_nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Vendedor</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vendedor_calificacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="concesionaria_nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concesionaria</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pais"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="estado_provincia"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1 lg:col-span-2">
                          <FormLabel>Estado/Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ciudad"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1 lg:col-span-2">
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 📸 IMÁGENES (OBLIGATORIO) */}
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes del Vehículo *</CardTitle>
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
                      <span className="opacity-70">
                        se suben automáticamente
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      * Las imágenes son obligatorias para crear el post
                    </p>
                  </div>

                  {!!imgItems.length && (
                    <ul className="space-y-3">
                      {imgItems.map((it) => (
                        <li
                          key={it.id}
                          className="flex items-center gap-3 border rounded-lg p-3">
                          <img
                            src={it.preview}
                            alt={it.name}
                            className="w-16 h-16 rounded-md object-cover bg-muted"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{it.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatKB(it.size)}
                            </p>
                            {it.url ? (
                              <p className="text-xs text-muted-foreground truncate">
                                {it.url}
                              </p>
                            ) : null}
                          </div>

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

              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || uploading || authLoading}>
                  {uploading ? "Guardando…" : "Crear POST"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
