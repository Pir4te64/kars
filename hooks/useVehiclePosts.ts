import { useState, useEffect } from "react";
import { listVehiclePosts } from "../src/utils/listVehiclePostsHelper";
import { getVehiclePostById } from "../src/utils/getVehiclePostByIdHelper";
import { Datum, listVehiclePostsFetchResponse } from "../src/types/CarInfo";

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