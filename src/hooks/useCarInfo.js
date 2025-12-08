import { useState, useEffect, useCallback } from "react";
import getBrandHelper from "../utils/getBrandHelper";
import getModelHelper from "../utils/getModelHelper";
import getGroupHelper from "../utils/getGroupHelper";
import { useAuth } from "./useAuth";
import getPriceHelper from "../utils/getPriceHelper";
import { isBrandAllowed, isModelAllowed, ALLOWED_CARS, likeMatch, normalizeForComparison } from "../../constants/allowedCars";

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
      const allBrands = Array.isArray(data) ? data : [];
      // Filtrar solo las marcas permitidas
      const allowedBrands = allBrands.filter((brand) =>
        isBrandAllowed(brand.name)
      );
      setBrands(allowedBrands);
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
        const allGroups = Array.isArray(data) ? data : [];
        
        // Obtener el nombre de la marca actual para filtrar los modelos permitidos
        const currentBrand = brands.find((b) => b.id.toString() === brandId);
        
        // Filtrar grupos/modelos según las marcas y modelos permitidos
        let filteredGroups = allGroups;
        if (currentBrand) {
          // Buscar la marca correcta en ALLOWED_CARS usando LIKE
          const brandKey = Object.keys(ALLOWED_CARS).find(
            (key) => likeMatch(key, currentBrand.name)
          );
          
          if (brandKey) {
            const allowedModels = ALLOWED_CARS[brandKey] || [];
            
            filteredGroups = allGroups.filter((group) => {
              return allowedModels.some((allowedModel) => 
                likeMatch(allowedModel, group.name)
              );
            });
          }
        }
        
        setGroups(filteredGroups);
      } catch (err) {
        console.error("Error in getGroup:", err);
        if (err.message === "TOKEN_EXPIRED") {
          await refresh();
        }
      } finally {
        setLoadingGroups(false);
      }
    },
    [accessToken, refresh, brands]
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

        const allModels = Array.isArray(data) ? data : [];
        
        // Obtener el nombre de la marca actual para filtrar los modelos permitidos
        const currentBrand = brands.find((b) => b.id.toString() === brandId);
        
        // Filtrar modelos según las marcas y modelos permitidos
        let filteredModels = allModels;
        if (currentBrand) {
          // Buscar la marca correcta en ALLOWED_CARS usando LIKE
          const brandKey = Object.keys(ALLOWED_CARS).find(
            (key) => likeMatch(key, currentBrand.name)
          );
          
          if (brandKey) {
            const allowedModels = ALLOWED_CARS[brandKey] || [];
            
            filteredModels = allModels.filter((model) => {
              const modelName = model.description || model.name || "";
              return allowedModels.some((allowedModel) => 
                likeMatch(allowedModel, modelName)
              );
            });
          }

          // Filtro adicional para excluir modelos específicos de Volkswagen
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Volkswagen", currentBrand.name)) {
            const excludedKeywords = [
              "Passat",
              "Scirocco",
              "Beetle",
              "Touareg",
              "Virtus",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Chevrolet
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Chevrolet", currentBrand.name)) {
            const excludedKeywords = [
              "Blazer",
              "Captiva",
              "Cobalt",
              "Equinox",
              "S10",
              "Sonic",
              "Spark",
              "Trailblazer",
              "Vectra",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Renault
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Renault", currentBrand.name)) {
            const excludedKeywords = [
              "Latitude",
              "Megane III",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Citroën
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Citroen", currentBrand.name) || likeMatch("Citroën", currentBrand.name)) {
            const excludedKeywords = [
              "C3 Aircross",
              "C3 Picasso",
              "C4 Aircross",
              "C4 Cactus",
              "C4 Picasso",
              "C4 Spacetourer",
              "C-Elysée",
              "Grand C4 Picasso",
              "Grand C4 Spacetourer",
              "Xsara Picasso",
              "DS3",
              "DS4",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Peugeot
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Peugeot", currentBrand.name)) {
            const excludedKeywords = [
              "301",
              "407",
              "508",
              "607",
              "4008",
              "5008",
              "Hoggar",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Fiat
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Fiat", currentBrand.name)) {
            const excludedKeywords = [
              "500L",
              "500X",
              "Doblo",
              "Stilo",
              "Tipo",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Ford
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Ford", currentBrand.name)) {
            const excludedKeywords = [
              "Courier",
              "F-100",
              "Kuga",
              "Mondeo",
              "S-Max",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Nissan
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Nissan", currentBrand.name)) {
            const excludedKeywords = [
              "Murano",
              "NP300",
              "Pathfinder",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Toyota
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Toyota", currentBrand.name)) {
            const excludedKeywords = [
              "Camry",
              "Innova",
              "Land Cruiser",
              "Prius",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }

          // Filtro adicional para excluir modelos específicos de Suzuki
          // Excluir modelos que contengan palabras clave prohibidas
          if (likeMatch("Suzuki", currentBrand.name)) {
            const excludedKeywords = [
              "Baleno",
            ];

            filteredModels = filteredModels.filter((model) => {
              const modelName = normalizeForComparison(
                model.description || model.name || ""
              );
              return !excludedKeywords.some((keyword) => {
                const normalizedKeyword = normalizeForComparison(keyword);
                return modelName.includes(normalizedKeyword);
              });
            });
          }
        }

        setModels(filteredModels);
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
    [accessToken, refresh, brands]
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
