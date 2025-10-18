export default async function getGroupHelper(token: string, brandId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/groups`;
  console.log("getGroupHelper called with:", { url, token: !!token, brandId });
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data (full):", data);
    
    // Inspeccionar el primer grupo para ver su estructura
    const groups = data.data || data;
    if (groups && groups.length > 0) {
      console.log("Primer grupo estructura:", groups[0]);
      console.log("Campos: id =", groups[0].id, ", name =", groups[0].name);
    }

    return groups;
  } catch (error: any) {
    console.error("Error in getGroupHelper:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    }
    return [];
  }
}
