// utils/getBrands.js


export default async function getPriceHelper(
  codia: string,
  isNew: boolean,
  isOld: boolean,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${codia}/price?isNew=${isNew}&isOld=${isOld}`;
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
    console.log("price", response);
    
    return response;
  } catch (error: any) {
    console.log(error.message);

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    } else throw new Error("Error al obtener las marcas");
  }
}
