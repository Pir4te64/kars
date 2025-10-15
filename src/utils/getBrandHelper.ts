// utils/getBrands.js


export default async function getBrandHelper(token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/`;

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
    if (
      response.message && response.message == 'TOKEN_EXPIRED') {
      throw new Error("TOKEN_EXPIRED");
    }
    return response;
  } catch (error: any) {

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    } else throw new Error("Error al obtener las marcas");
  }
}
