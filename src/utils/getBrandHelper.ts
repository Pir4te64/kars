// utils/getBrands.js


export default async function getBrandHelper(token: string) {
  const url = "https://kars-backend.vercel.app/api/brands/";
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }).then((data) => {
      return data.json();
    });

    return response;
  } catch (error: any) {
    console.log("error.response", error.response);

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    } else throw new Error("Error al obtener las marcas");
  }
}
