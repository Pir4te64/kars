"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Brand,
  Model,
  YearPrice,
  ModelFeature,
  UseCarInfoReturn,
} from "@/types/car";
import { isBrandAllowed, isModelAllowed, ALLOWED_CARS, likeMatch } from "@/constants/allowedCars";

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

  const getGroup = useCallback(async (brandId: string) => {
    if (!brandId) return;
    setLoadingGroups(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands/${brandId}/groups`
      );
      if (!response.ok) throw new Error("Error al cargar grupos");
      const data = await response.json();

      // Mapear los datos de InfoAuto al formato esperado
      const mappedGroups = data.map((group: any) => ({
        id: group.codia,
        name: group.name,
        codia: group.codia.toString(),
      }));

      // Obtener el nombre de la marca actual para filtrar los modelos permitidos
      const currentBrand = brands.find((b: Brand) => b.id.toString() === brandId);
      
      // Filtrar grupos/modelos según las marcas y modelos permitidos
      let filteredGroups = mappedGroups;
      if (currentBrand) {
        // Buscar la marca correcta en ALLOWED_CARS usando LIKE
        const brandKey = Object.keys(ALLOWED_CARS).find(
          key => likeMatch(key, currentBrand.name)
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
  }, [brands]);

  const getModelsByBrand = useCallback(
    async (brandId: string, groupId: string) => {
      console.log("getModelsByBrand llamado con:", brandId, groupId);
      if (!brandId || !groupId) {
        console.log("getModelsByBrand: faltan parámetros");
        return;
      }
      setLoadingModels(true);
      try {
        const url = `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        }/api/brands/${brandId}/groups/${groupId}/models`;
        console.log("Fetching models from:", url);
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
        const currentBrand = brands.find((b: Brand) => b.id.toString() === brandId);
        
        // Filtrar modelos según las marcas y modelos permitidos
        let filteredModels = mappedModels;
        if (currentBrand) {
          // Buscar la marca correcta en ALLOWED_CARS usando LIKE
          const brandKey = Object.keys(ALLOWED_CARS).find(
            key => likeMatch(key, currentBrand.name)
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
