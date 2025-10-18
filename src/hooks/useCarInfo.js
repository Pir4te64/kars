import { useState, useEffect, useCallback } from "react";
import getBrandHelper from "../utils/getBrandHelper";
import getModelHelper from "../utils/getModelHelper";
import getGroupHelper from "../utils/getGroupHelper";
import { useAuth } from "./useAuth";
import getPriceHelper from "../utils/getPriceHelper";

export function useCarInfo() {
  const { accessToken, refresh } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [years, setYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    if (brands.length <= 0 && accessToken) {
      getBrands();
    }
  }, [accessToken]);

  const getBrands = useCallback(async () => {
    if (!accessToken) return;
    setLoadingBrands(true);
    try {
      const data = await getBrandHelper(accessToken);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading brands:", err);
      if (err.message === "TOKEN_EXPIRED") {
        await refresh();
      }
    } finally {
      setLoadingBrands(false);
    }
  }, [accessToken, refresh]);

  // Obtener grupos según la marca seleccionada
  const getGroup = useCallback(
    async (brandId) => {
      if (!accessToken || !brandId) {
        console.log("getGroup: Missing parameters", { accessToken: !!accessToken, brandId });
        return;
      }
      
      console.log("getGroup called with brandId:", brandId);
      
      setLoadingGroups(true);
      // Limpiar modelos cuando cambia la marca
      setModels([]);

      try {
        const data = await getGroupHelper(accessToken, brandId);
        console.log("Groups data received:", data);
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error in getGroup:", err);
        if (err.message === "TOKEN_EXPIRED") {
          await refresh();
        }
      } finally {
        setLoadingGroups(false);
      }
    },
    [accessToken, refresh]
  );

  // Obtener modelos según la marca y grupo seleccionados
  // IMPORTANTE: groupId debe ser el campo "id" del grupo, NO el "name"
  const getModel = useCallback(
    async (brandId, groupId) => {
      console.log("=== getModel LLAMADO ===");
      console.log("brandId:", brandId);
      console.log("groupId (debe ser el ID, no el name):", groupId);
      console.log("accessToken existe:", !!accessToken);

      if (!accessToken || !brandId || !groupId) {
        console.log("getModel: Faltan parámetros, retornando");
        return;
      }

      setLoadingModels(true);
      console.log("getModel: Iniciando fetch de modelos...");

      try {
        const data = await getModelHelper(accessToken, brandId, groupId);
        console.log("getModel: Datos recibidos:", data);
        console.log("getModel: Cantidad de modelos:", data?.length);

        setModels(Array.isArray(data) ? data : []);
        console.log("getModel: Modelos seteados exitosamente");
      } catch (err) {
        console.error("getModel: Error al obtener modelos:", err);
        if (err.message === "TOKEN_EXPIRED") {
          await refresh();
        }
      } finally {
        setLoadingModels(false);
        console.log("getModel: Finalizado (loadingModels = false)");
      }
    },
    [accessToken, refresh]
  );

  const getPrice = useCallback(async (codia) => {
    if (!accessToken || !codia) return;
    
    setLoadingYears(true);
    try {
      const car = models.find((item) => item.codia === codia);
      
      if (!car) {
        console.error("Car not found with codia:", codia);
        return;
      }

      const data = await getPriceHelper(
        car.codia,
        car.list_price || false,
        car.prices || false,
        accessToken
      );
      
      setYears(data?.data?.price || []);
      return data;
    } catch (err) {
      console.error("Error loading price:", err);
      if (err.message === "TOKEN_EXPIRED") {
        await refresh();
      }
    } finally {
      setLoadingYears(false);
    }
  }, [accessToken, models, refresh]);

  return {
    getPrice,
    brands,
    models,
    groups,
    years,
    loadingBrands,
    loadingGroups,
    loadingModels,
    loadingYears,
    getModel,
    getGroup,
  };
}
