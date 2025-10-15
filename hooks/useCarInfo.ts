"use client";

import { useState, useEffect, useCallback } from "react";

interface Brand {
  id: number;
  name: string;
  brand_id?: number;
}

interface Model {
  id?: number;
  name?: string;
  description: string;
  codia: string;
  brand_id?: number;
}

interface YearPrice {
  year: number;
  price: string;
}

interface ModelFeature {
  codia: number;
  version: string;
  year: number;
}

interface UseCarInfoReturn {
  brands: Brand[];
  models: Model[];
  years: YearPrice[];
  versions: ModelFeature[];
  loadingBrands: boolean;
  loadingModels: boolean;
  loadingYears: boolean;
  loadingVersions: boolean;
  getModelsByBrand: (brandId: string) => Promise<void>;
  getPrice: (codia: string) => Promise<void>;
  getVersions: (codia: string) => Promise<void>;
}

export function useCarInfo(): UseCarInfoReturn {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [years, setYears] = useState<YearPrice[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [versions, setVersions] = useState<ModelFeature[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Cargar marcas al iniciar
  useEffect(() => {
    if (brands.length === 0) {
      getBrandsData();
    }
  }, []);

  const getBrandsData = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const response = await fetch(`/api/infoauto?path=/brands/&page_size=100`);

      if (!response.ok) throw new Error('Error al cargar marcas');
      const data = await response.json();

      // Mapear los datos de InfoAuto al formato esperado
      const mappedBrands = data.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        brand_id: brand.id,
      }));

      setBrands(mappedBrands.sort((a: Brand, b: Brand) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error loading brands:', err);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  const getModelsByBrand = useCallback(async (brandId: string) => {
    if (!brandId) return;
    setLoadingModels(true);
    try {
      const response = await fetch(`/api/infoauto?path=/brands/${brandId}/models/`);
      if (!response.ok) throw new Error('Error al cargar modelos');
      const data = await response.json();

      // Mapear los datos de InfoAuto al formato esperado
      const mappedModels = data.map((model: any) => ({
        id: model.codia,
        description: model.name,
        codia: model.codia.toString(),
        name: model.name,
        brand_id: model.brand_id,
      }));

      setModels(mappedModels.sort((a: Model, b: Model) => a.description.localeCompare(b.description)));
    } catch (err) {
      console.error('Error loading models:', err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const getPrice = useCallback(async (codia: string) => {
    if (!codia) return;
    setLoadingYears(true);
    try {
      const response = await fetch(`/api/infoauto?path=/models/${codia}/prices/`);
      if (!response.ok) throw new Error('Error al cargar precios');
      const data = await response.json();

      // Mapear los datos de InfoAuto al formato esperado
      const mappedYears = data.map((item: any) => ({
        year: item.year,
        price: item.price ? `$${item.price.toLocaleString()}` : 'Consultar',
      }));

      // Ordenar por año descendente y eliminar duplicados
      const yearMap = new Map(mappedYears.map((item: YearPrice) => [item.year, item]));
      const uniqueYears = Array.from(yearMap.values()) as YearPrice[];
      const sortedYears = uniqueYears.sort((a, b) => b.year - a.year);

      setYears(sortedYears);
    } catch (err) {
      console.error('Error loading prices:', err);
      setYears([]);
    } finally {
      setLoadingYears(false);
    }
  }, []);

  const getVersions = useCallback(async (codia: string) => {
    if (!codia) return;
    setLoadingVersions(true);
    try {
      const response = await fetch(`/api/infoauto?path=/models/${codia}/features/`);
      if (!response.ok) throw new Error('Error al cargar versiones');
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      console.error('Error loading versions:', err);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  return {
    brands,
    models,
    years,
    versions,
    loadingBrands,
    loadingModels,
    loadingYears,
    loadingVersions,
    getModelsByBrand,
    getPrice,
    getVersions,
  };
}
