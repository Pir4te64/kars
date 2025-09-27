import axios from "axios";
import { Datum, listVehiclePostsFetchResponse } from "../types/CarInfo";

export async function listVehiclePosts(limit = 25): Promise<Datum[]> {
  try {
    const url = `https://kars-backend-y4w9.vercel.app/api/vehicle-posts?limit=${1000}`;
    const response: listVehiclePostsFetchResponse = (await axios.get(url)).data
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
