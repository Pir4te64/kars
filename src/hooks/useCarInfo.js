import { useState, useEffect, useCallback } from "react";
import getBrandHelper from "../utils/getBrandHelper";
// Nuevo helper para modelos
import getModelHelper from "../utils/getModelHelper";
import getGroupHelper from "../utils/getGroupHelper";
import { useAuth } from "./useAuth";
import getPriceHelper from "../utils/getPriceHelper";

export function useCarInfo() {
  const { accessToken, refresh } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroup] = useState(false);
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [years, setYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    brands.length <= 0 && getBrands();
  }, [accessToken]);

  const getBrands = useCallback(async () => {
    if (!accessToken) return;
    setLoadingBrands(true);
    try {
      const data = await getBrandHelper(accessToken);

      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message == "TOKEN_EXPIRED") {
        const response = await refresh();
        console.log("response", response);
        
      }
    } finally {
      setLoadingBrands(false);
    }
  }, [accessToken]);

  // Obtener modelos según la marca seleccionada
  const getGroup = useCallback(
    async (brandName) => {
      if (!accessToken || !brandName) return;
      setLoadingGroup(true);

      try {
        const data = await getGroupHelper(accessToken, brandName);
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message == "TOKEN_EXPIRED") {
          const response = await refresh();
          console.log("response", response);
        }
      } finally {
        setLoadingGroup(false);
      }
    },
    [accessToken]
  );

  const getModel = useCallback(
    async (brandName, group) => {
      if (!accessToken || !brandName || !group) return;
      setLoadingModels(true);
      try {
        const data = await getModelHelper(accessToken, brandName, group);
        console.log(data);

        setModels(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message == "TOKEN_EXPIRED") {
          const response = await refresh();
          console.log("response", response);
        }
      } finally {
        setLoadingModels(false);
      }
    },
    [accessToken]
  );

  // Nueva función para obtener modelos directamente por marca
  const getModelsByBrand = useCallback(
    async (brandId) => {
      if (!accessToken || !brandId) return;
      setLoadingModels(true);
      try {
        // Obtener todos los grupos primero
        const groupsData = await getGroupHelper(accessToken, brandId);
        if (Array.isArray(groupsData) && groupsData.length > 0) {
          // Obtener modelos del primer grupo como fallback
          const firstGroup = groupsData[0];
          const data = await getModelHelper(accessToken, brandId, firstGroup.name || firstGroup.id);
          console.log("Models data:", data);
          setModels(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading models:", err);
        if (err.message == "TOKEN_EXPIRED") {
          const response = await refresh();
          console.log("response", response);
        }
      } finally {
        setLoadingModels(false);
      }
    },
    [accessToken]
  );

  const getPrice = async (codia) => {
    if (!accessToken) return;
    setLoadingYears(true);
    try {
      const car = models.filter((item) => item.codia == codia)[0];

      const data = await getPriceHelper(
        car.codia,
        car.list_price,
        car.prices,
        accessToken
      );
      setYears(data.data.price);
      return data;
    } catch (err) {
      if(err.message == "TOKEN_EXPIRED"){
        const response = await refresh()
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
    loadingGroups,
    loadingModels,
    getModel,
    getGroup,
    getModelsByBrand,
  };
}
