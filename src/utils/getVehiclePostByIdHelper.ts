export async function getVehiclePostById(id: string) {
  try {
    const url = `https://kars-backend.vercel.app/api/vehicle-posts/${id}`;
    const response = await fetch(url).then((data)=>{
      return data.json()
    })
    
    console.log(response);
    
    return response.data || null;
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
