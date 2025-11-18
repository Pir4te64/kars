"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Brand,
  Model,
  YearPrice,
  ModelFeature,
  UseCarInfoReturn,
} from "@/types/car";
import {
  isBrandAllowed,
  isModelAllowed,
  ALLOWED_CARS,
  likeMatch,
} from "@/constants/allowedCars";

// El filtrado de grupos para JEEP y DODGE ahora se hace en el backend
// El frontend simplemente llama al backend con -1 (JEEP) o -2 (DODGE)
// y recibe los grupos ya filtrados

export function useCarInfo(): UseCarInfoReturn {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [years, setYears] = useState<YearPrice[]>([]);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [versions, setVersions] = useState<ModelFeature[]>([]);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);

  // Cargar marcas al iniciar
  useEffect(() => {
    if (brands.length === 0) {
      getBrandsData();
    }
  }, []);

  const getBrandsData = useCallback(async () => {
    setLoadingBrands(true);
    try {
      // Usar el backend optimizado en lugar del frontend API route
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands`
      );

      if (!response.ok) throw new Error("Error al cargar marcas");
      const data = await response.json();

      // Mapear los datos de InfoAuto al formato esperado
      const mappedBrands = data.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        brand_id: brand.id,
        logo_url: brand.logo_url || null,
      }));

      // Filtrar solo las marcas permitidas
      const allowedBrands = mappedBrands.filter((brand: Brand) =>
        isBrandAllowed(brand.name)
      );

      setBrands(
        allowedBrands.sort((a: Brand, b: Brand) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("Error loading brands:", err);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  // Usar useRef para rastrear el brandId anterior
  const previousBrandIdRef = useRef<string | null>(null);

  const getGroup = useCallback(
    async (brandId: string) => {
      if (!brandId) return;

      // Normalizar brandId a string
      const normalizedBrandId = brandId.toString();
      console.log("🟡 getGroup llamado con brandId:", normalizedBrandId);

      // Si cambió la marca, limpiar grupos y modelos inmediatamente
      if (
        previousBrandIdRef.current !== null &&
        previousBrandIdRef.current !== normalizedBrandId
      ) {
        console.log(
          "🟠 Limpiando grupos y modelos - marca cambió de",
          previousBrandIdRef.current,
          "a",
          normalizedBrandId
        );
        setGroups([]);
        setModels([]);
      }

      // Actualizar el brandId anterior
      previousBrandIdRef.current = normalizedBrandId;

      setLoadingGroups(true);
      try {
        const url = `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands/${normalizedBrandId}/groups`;
        console.log("🔴 Llamando al backend:", url);

        // Llamar al backend - el backend maneja el filtrado para JEEP (-1) y DODGE (-2)
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar grupos");
        const data = await response.json();
        console.log(
          "🟣 Respuesta del backend - grupos recibidos:",
          data.length,
          "grupos"
        );

        // Mapear los datos al formato esperado
        // El backend retorna grupos con 'codia' como ID, así que lo usamos para ambos 'id' y 'codia'
        const mappedGroups = data.map((group: any) => {
          // El backend retorna 'codia' con el ID del grupo
          const groupId = group.codia ?? group.id;
          console.log(
            "🟡 Mapeando grupo:",
            group.name,
            "codia:",
            group.codia,
            "id:",
            group.id,
            "groupId resultante:",
            groupId
          );
          return {
            id: groupId, // Asegurar que id siempre tenga un valor (usar codia del backend)
            name: group.name,
            codia: groupId ? String(groupId) : undefined, // Asegurar que codia siempre sea string
          };
        });
        console.log(
          "🟡 Grupos mapeados (primeros 3):",
          mappedGroups.slice(0, 3)
        );

        // Obtener el nombre de la marca actual para filtrar grupos según ALLOWED_CARS
        // (solo para marcas que no sean JEEP o DODGE, ya que el backend ya filtró esas)
        const currentBrand = brands.find(
          (b: Brand) => b.id.toString() === normalizedBrandId
        );

        // Filtrar grupos según las marcas y modelos permitidos (solo para otras marcas)
        let filteredGroups = mappedGroups;
        if (
          currentBrand &&
          normalizedBrandId !== "-1" &&
          normalizedBrandId !== "-2"
        ) {
          // Buscar la marca correcta en ALLOWED_CARS usando LIKE
          const brandKey = Object.keys(ALLOWED_CARS).find((key) =>
            likeMatch(key, currentBrand.name)
          ) as keyof typeof ALLOWED_CARS | undefined;

          if (brandKey) {
            const allowedModels = ALLOWED_CARS[brandKey] || [];

            filteredGroups = mappedGroups.filter((group: any) => {
              return allowedModels.some((allowedModel) =>
                likeMatch(allowedModel, group.name)
              );
            });
          }
        }

        setGroups(
          filteredGroups.sort((a: any, b: any) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        console.error("Error loading groups:", err);
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    },
    [brands]
  );

  const getModelsByBrand = useCallback(
    async (brandId: string, groupId: string) => {
      console.log(
        "🔵 getModelsByBrand llamado con brandId:",
        brandId,
        "groupId:",
        groupId
      );
      if (!brandId || !groupId) {
        console.log("❌ getModelsByBrand: faltan parámetros");
        return;
      }
      setLoadingModels(true);
      try {
        // SIEMPRE mapear IDs de JEEP (-1) y DODGE (-2) al ID de CHRYSLER (13)
        // El backend NO acepta -1 o -2, solo acepta 13 para estas marcas
        // Normalizar brandId a string para comparaciones consistentes
        const normalizedBrandId = String(brandId).trim();
        const originalBrandId = brandId;

        // Determinar el actualBrandId - SIEMPRE usar 13 para JEEP y DODGE
        let actualBrandId: string;
        if (normalizedBrandId === "-1" || normalizedBrandId === "-2") {
          actualBrandId = "13"; // ID de CHRYSLER - OBLIGATORIO usar 13 para JEEP y DODGE
          console.log(
            `🔄 Mapeando ${originalBrandId} (${
              normalizedBrandId === "-1" ? "JEEP" : "DODGE"
            }) → 13 (CHRYSLER) para buscar modelos`
          );
        } else {
          actualBrandId = normalizedBrandId;
          console.log(`ℹ️ Usando brandId original: ${brandId}`);
        }

        // IMPORTANTE: Usar actualBrandId (que será 13 para JEEP/DODGE) en la URL
        // NUNCA usar -1 o -2 en la URL, siempre usar 13
        const url = `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands/${actualBrandId}/groups/${groupId}/models`;
        console.log("🔴 Llamando al backend para obtener modelos:", url);
        console.log(
          "🔴 BrandId usado en URL:",
          actualBrandId,
          "(original era:",
          originalBrandId,
          ")"
        );
        console.log(
          "🔴 Verificación: URL contiene -1 o -2?",
          url.includes("/-1/") || url.includes("/-2/") ? "❌ ERROR" : "✅ OK"
        );
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar modelos");
        const data = await response.json();

        console.log("Datos de modelos recibidos:", data);

        // Mapear los datos de InfoAuto al formato esperado
        const mappedModels = data.map((model: any) => ({
          id: model.codia,
          description: model.name,
          codia: model.codia.toString(),
          name: model.name,
          brand_id: model.brand_id,
        }));

        // Obtener el nombre de la marca actual para filtrar los modelos permitidos
        // Si brandId es -1 o -2, buscar por nombre en lugar de ID
        let currentBrand: Brand | undefined;
        if (brandId === "-1") {
          currentBrand = { id: -1, name: "JEEP", brand_id: -1 } as Brand;
        } else if (brandId === "-2") {
          currentBrand = { id: -2, name: "DODGE", brand_id: -2 } as Brand;
        } else {
          currentBrand = brands.find((b: Brand) => b.id.toString() === brandId);
        }

        // Filtrar modelos según las marcas y modelos permitidos
        let filteredModels = mappedModels;
        if (currentBrand) {
          // Buscar la marca correcta en ALLOWED_CARS usando LIKE
          const brandKey = Object.keys(ALLOWED_CARS).find((key) =>
            likeMatch(key, currentBrand.name)
          ) as keyof typeof ALLOWED_CARS | undefined;

          if (brandKey) {
            const allowedModels = ALLOWED_CARS[brandKey] || [];

            filteredModels = mappedModels.filter((model: Model) => {
              const modelName = model.description || model.name || "";
              return allowedModels.some((allowedModel) =>
                likeMatch(allowedModel, modelName)
              );
            });
          }
        }

        console.log("Modelos mapeados:", filteredModels);
        setModels(
          filteredModels.sort((a: Model, b: Model) =>
            (a.description || "").localeCompare(b.description || "")
          )
        );
      } catch (err) {
        console.error("Error loading models:", err);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    },
    [brands]
  );

  const getPrice = useCallback(async (codia: string) => {
    if (!codia) return;
    setLoadingYears(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands/${codia}/price?isNew=true&isOld=true`
      );
      if (!response.ok) throw new Error("Error al cargar precios");
      const data = await response.json();

      // Procesar la respuesta del backend optimizado
      const priceData = data.data;
      const allPrices = [
        ...(priceData.listPrice || []),
        ...(priceData.price || []),
      ];

      // Mapear los datos al formato esperado
      const mappedYears = allPrices.map((item: any) => ({
        year: item.year,
        price: item.price ? `$${item.price.toLocaleString()}` : "Consultar",
      }));

      // Ordenar por año descendente y eliminar duplicados
      const yearMap = new Map(
        mappedYears.map((item: YearPrice) => [item.year, item])
      );
      const uniqueYears = Array.from(yearMap.values()) as YearPrice[];
      const sortedYears = uniqueYears.sort((a, b) => b.year - a.year);

      setYears(sortedYears);
    } catch (err) {
      console.error("Error loading prices:", err);
      setYears([]);
    } finally {
      setLoadingYears(false);
    }
  }, []);

  const getVersions = useCallback(async (codia: string) => {
    if (!codia) return;
    setLoadingVersions(true);
    try {
      const response = await fetch(
        `/api/infoauto?path=/models/${codia}/features/`
      );
      if (!response.ok) throw new Error("Error al cargar versiones");
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      console.error("Error loading versions:", err);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  // Alias para compatibilidad con el componente
  const getModel = useCallback(
    async (brandId: string, groupId: string) => {
      console.log("getModel llamado con:", brandId, groupId);
      return getModelsByBrand(brandId, groupId);
    },
    [getModelsByBrand]
  );

  return {
    brands,
    groups,
    models,
    years,
    versions,
    loadingBrands,
    loadingGroups,
    loadingModels,
    loadingYears,
    loadingVersions,
    getGroup,
    getModelsByBrand,
    getModel,
    getPrice,
    getVersions,
  };
}
