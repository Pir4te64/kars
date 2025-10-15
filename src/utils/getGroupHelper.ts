// utils/getBrands.js

export default async function getGroupHelper(token: string, brandId: string) {
  const url = `https://kars-backend.vercel.app/api/brands/${brandId}/groups`;
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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    }
    return [];
  }
}
