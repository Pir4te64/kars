// utils/getBrands.js

export default async function getGroupHelper(token: string, brandId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/groups`;
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
    console.log(response.data);
    
    return response.data;
  } catch (error: any) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    }
    return [];
  }
}
