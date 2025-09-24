import axios from "axios";


export async function getVehiclePostById(id: string) {
  try {
    const url = `https://kars-backend-y4w9.vercel.app/api/vehicle-posts/${id}`;
    const response = await axios.get(url);
    console.log(response.data);
    
    return response.data.data || null;
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        message: "Error al obtener vehicle_post por id",
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
    );
  }
}
