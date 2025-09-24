import { useState, useEffect } from "react";
import { listVehiclePosts } from "../utils/listVehiclePostsHelper";
import { getVehiclePostById } from "../utils/getVehiclePostByIdHelper";
import { Datum, listVehiclePostsFetchResponse } from "../types/CarInfo";

export function useVehiclePosts(limit = 8) {
  const [cars, setCars] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listVehiclePosts(limit)
      .then((data: Datum[]) => {
        setCars(data);
        console.log(data);
        
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCars([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return { cars, loading, error };
}

export function useVehiclePostById(id: string) {
  const [carData, setCarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getVehiclePostById(id)
      .then((data) => {
        setCarData(data);
        console.log(data);
        
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCarData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { carData, loading, error };
}
