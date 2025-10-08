"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrands, getGroups, getModels } from "@/lib/car-quote";
import { useAuth } from "./useAuth";

interface Brand {
  id: number;
  name: string;
  [key: string]: any;
}

interface Group {
  id: number;
  name: string;
  [key: string]: any;
}

interface Model {
  id: number;
  name: string;
  description: string;
  codia: string;
  list_price?: boolean;
  prices?: boolean;
  [key: string]: any;
}

interface YearPrice {
  year: number;
  price: string;
  [key: string]: any;
}

export function useCarInfo() {
  const { tokens, refreshAccessToken } = useAuth();
  const accessToken = tokens?.accessToken;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [years, setYears] = useState<YearPrice[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    if (brands.length <= 0 && accessToken) {
      getBrandsData();
    }
  }, [accessToken]);

  const getBrandsData = useCallback(async () => {
    if (!accessToken) return;
    setLoadingBrands(true);
    try {
      const data = await getBrands(accessToken);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.message === "TOKEN_EXPIRED") {
        const response = await refreshAccessToken();
        console.log("response", response);
      }
    } finally {
      setLoadingBrands(false);
    }
  }, [accessToken]);

  const getGroup = useCallback(
    async (brandId: string) => {
      if (!accessToken || !brandId) return;
      setLoadingGroups(true);

      try {
        const data = await getGroups(accessToken, brandId);
        setGroups(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err.message === "TOKEN_EXPIRED") {
          const response = await refreshAccessToken();
          console.log("response", response);
        }
      } finally {
        setLoadingGroups(false);
      }
    },
    [accessToken]
  );

  const getModel = useCallback(
    async (brandId: string, group: string) => {
      if (!accessToken || !brandId || !group) return;
      setLoadingModels(true);
      try {
        const data = await getModels(accessToken, brandId, group);
        console.log(data);

        setModels(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err.message === "TOKEN_EXPIRED") {
          const response = await refreshAccessToken();
          console.log("response", response);
        }
      } finally {
        setLoadingModels(false);
      }
    },
    [accessToken]
  );

  const getModelsByBrand = useCallback(
    async (brandId: string) => {
      if (!accessToken || !brandId) return;
      setLoadingModels(true);
      try {
        const groupsData = await getGroups(accessToken, brandId);
        if (Array.isArray(groupsData) && groupsData.length > 0) {
          const firstGroup = groupsData[0];
          const data = await getModels(
            accessToken,
            brandId,
            firstGroup.name || String(firstGroup.id)
          );
          console.log("Models data:", data);
          setModels(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        console.error("Error loading models:", err);
        if (err.message === "TOKEN_EXPIRED") {
          const response = await refreshAccessToken();
          console.log("response", response);
        }
      } finally {
        setLoadingModels(false);
      }
    },
    [accessToken]
  );

  const getPrice = async (codia: string) => {
    if (!accessToken) return;
    setLoadingYears(true);
    try {
      const car = models.filter((item) => item.codia === codia)[0];

      // Call the API helper from lib/car-quote.ts
      const API_BASE_URL = "https://kars-backend-y4w9.vercel.app/api";
      const res = await fetch(
        `${API_BASE_URL}/brands/${car.codia}/price?isNew=${car.list_price}&isOld=${car.prices}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("TOKEN_EXPIRED");
        }
        throw new Error("Error al obtener el precio");
      }

      const data = await res.json();
      setYears(data.data.price);
      return data;
    } catch (err: any) {
      if (err.message === "TOKEN_EXPIRED") {
        const response = await refreshAccessToken();
        console.log("response", response);
      }
    } finally {
      setLoadingYears(false);
    }
  };

  return {
    getPrice,
    brands,
    models,
    groups,
    years,
    loadingBrands,
    loadingModels,
    loadingGroups,
    getModel,
    getGroup,
    getModelsByBrand,
  };
}
