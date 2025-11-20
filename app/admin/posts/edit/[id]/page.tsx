"use client";
/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
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

// ----------------- Zod schema según tabla vehicle_posts -----------------
const schema = z.object({
  // Información básica
  type_post: z.string().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      // Información básica
      type_post: "",
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
          // Información básica
          type_post: toStr(data.type_post),
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
          color_exterior: toStr(data.color_exterior),
          color_interior: toStr(data.color_interior),
          puertas: toStr(data.puertas),
          asientos: toStr(data.asientos),
          // Motor básico
          combustible: toStr(data.combustible),
          cilindrada: toStr(data.cilindrada),
          potencia_hp: toStr(data.potencia_hp),
          transmision: toStr(data.transmision),
          traccion: toStr(data.traccion),
          // Motor (detalles)
          alimentacion: toStr(data.alimentacion),
          cilindros: toStr(data.cilindros),
          valvulas: toStr(data.valvulas),
          // Transmisión y chasis
          velocidades: toStr(data.velocidades),
          neumaticos: toStr(data.neumaticos),
          frenos_delanteros: toStr(data.frenos_delanteros),
          frenos_traseros: toStr(data.frenos_traseros),
          direccion_asistida: toStr(data.direccion_asistida),
          freno_mano: toStr(data.freno_mano),
          // Confort
          aire_acondicionado: toStr(data.aire_acondicionado),
          asiento_delantero_ajuste_altura: toStr(data.asiento_delantero_ajuste_altura),
          volante_regulable: toStr(data.volante_regulable),
          asientos_traseros: toStr(data.asientos_traseros),
          tapizados: toStr(data.tapizados),
          cierre_puertas: toStr(data.cierre_puertas),
          vidrios_delanteros: toStr(data.vidrios_delanteros),
          vidrios_traseros: toStr(data.vidrios_traseros),
          espejos_exteriores: toStr(data.espejos_exteriores),
          espejo_interior_antideslumbrante: toStr(data.espejo_interior_antideslumbrante),
          faros_delanteros: toStr(data.faros_delanteros),
          faros_antiniebla: toStr(data.faros_antiniebla),
          faros_tipo: toStr(data.faros_tipo),
          computadora_abordo: toStr(data.computadora_abordo),
          control_velocidad_crucero: toStr(data.control_velocidad_crucero),
          limitador_velocidad: toStr(data.limitador_velocidad),
          llantas_aleacion: toStr(data.llantas_aleacion),
          techo_solar: toStr(data.techo_solar),
          sensores_estacionamiento: toStr(data.sensores_estacionamiento),
          camara_estacionamiento: toStr(data.camara_estacionamiento),
          asistencia_arranque_pendientes: toStr(data.asistencia_arranque_pendientes),
          // Seguridad
          abs: toStr(data.abs),
          distribucion_electronica_frenado: toStr(data.distribucion_electronica_frenado),
          asistencia_frenada_emergencia: toStr(data.asistencia_frenada_emergencia),
          airbags_delanteros: toStr(data.airbags_delanteros),
          airbags_cortina: toStr(data.airbags_cortina),
          airbag_rodilla_conductor: toStr(data.airbag_rodilla_conductor),
          airbags_laterales: toStr(data.airbags_laterales),
          cantidad_airbags: toStr(data.cantidad_airbags),
          alarma: toStr(data.alarma),
          inmovilizador_motor: toStr(data.inmovilizador_motor),
          anclaje_asientos_infantiles: toStr(data.anclaje_asientos_infantiles),
          sensor_lluvia: toStr(data.sensor_lluvia),
          sensor_luz: toStr(data.sensor_luz),
          autobloqueo_puertas_velocidad: toStr(data.autobloqueo_puertas_velocidad),
          control_estabilidad: toStr(data.control_estabilidad),
          control_traccion: toStr(data.control_traccion),
          control_descenso: toStr(data.control_descenso),
          sensor_presion_neumaticos: toStr(data.sensor_presion_neumaticos),
          // Comunicación y entretenimiento
          equipo_musica: toStr(data.equipo_musica),
          comandos_volante: toStr(data.comandos_volante),
          conexion_auxiliar: toStr(data.conexion_auxiliar),
          conexion_usb: toStr(data.conexion_usb),
          bluetooth: toStr(data.bluetooth),
          control_voz: toStr(data.control_voz),
          pantalla: toStr(data.pantalla),
          navegacion_gps: toStr(data.navegacion_gps),
          apple_carplay: toStr(data.apple_carplay),
          android_auto: toStr(data.android_auto),
          // Precio
          moneda: toStr(data.moneda),
          precio: toStr(data.precio),
          precio_negociable: toStr(data.precio_negociable),
          // Ubicación y vendedor
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
        // Información básica
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
        asiento_delantero_ajuste_altura: toStr(values.asiento_delantero_ajuste_altura),
        volante_regulable: toStr(values.volante_regulable),
        asientos_traseros: toStr(values.asientos_traseros),
        tapizados: toStr(values.tapizados),
        cierre_puertas: toStr(values.cierre_puertas),
        vidrios_delanteros: toStr(values.vidrios_delanteros),
        vidrios_traseros: toStr(values.vidrios_traseros),
        espejos_exteriores: toStr(values.espejos_exteriores),
        espejo_interior_antideslumbrante: toStr(values.espejo_interior_antideslumbrante),
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
        asistencia_arranque_pendientes: toStr(values.asistencia_arranque_pendientes),
        // Seguridad
        abs: toStr(values.abs),
        distribucion_electronica_frenado: toStr(values.distribucion_electronica_frenado),
        asistencia_frenada_emergencia: toStr(values.asistencia_frenada_emergencia),
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
        autobloqueo_puertas_velocidad: toStr(values.autobloqueo_puertas_velocidad),
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
        precio: toStr(precioValue), // Ya validado manualmente
        precio_negociable: toStr(values.precio_negociable),
        // Ubicación y vendedor
        pais: toStr(values.pais),
        estado_provincia: toStr(values.estado_provincia),
        ciudad: toStr(values.ciudad),
        vendedor_nombre: toStr(values.vendedor_nombre),
        vendedor_calificacion: toStr(values.vendedor_calificacion),
        concesionaria_nombre: toStr(values.concesionaria_nombre),
        disponible: toStr(values.disponible),
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* MARCA - Autocompletado con datos de InfoAuto */}
                    <FormField
                      control={form.control}
                      name="marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: Ford, Toyota, etc."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* GRUPO/MODELO - Campo editable */}
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo/Modelo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: Focus, Corolla, etc."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* VERSIÓN - Campo editable */}
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versión</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: SE, XLT, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* AÑO - Campo editable */}
                    <FormField
                      control={form.control}
                      name="anio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: 2020, 2021, etc."
                              type="text"
                            />
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
                            <Input placeholder="Ej: 50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD (Dólares)</SelectItem>
                              <SelectItem value="ARS">ARS (Pesos)</SelectItem>
                            </SelectContent>
                          </Select>
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
          </Form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

