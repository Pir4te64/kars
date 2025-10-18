export default async function getModelHelper(
  token: string,
  brandId: string,
  groupId: string
): Promise<any[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/groups/${groupId}/models`;
  
  console.log("getModelHelper called with:", { 
    url, 
    token: !!token, 
    brandId, 
    groupId 
  });

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    
    // La API puede devolver data directamente o dentro de un objeto
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error: any) {
    console.error("Error in getModelHelper:", error);
    
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      throw new Error("TOKEN_EXPIRED");
    }
    
    // Devolver array vacío en caso de error
    return [];
  }
}
