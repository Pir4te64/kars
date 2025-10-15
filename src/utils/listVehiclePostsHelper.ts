import { log } from "console";
import { Datum, listVehiclePostsFetchResponse } from "../types/CarInfo";

export async function listVehiclePosts(limit = 25): Promise<Datum[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle-posts?limit=${1000}`;
    const response: listVehiclePostsFetchResponse = await fetch(url).then(
      (data) => {
        return data.json();
      }
    );
    console.log(response);
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        message: "Error al listar vehicle_posts",
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
    );
  }
}
