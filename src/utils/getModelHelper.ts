export default async function getModelHelper(
  token: string,
  brandId: string,
  groupId: string
): Promise<any[]> {
  // SIEMPRE mapear IDs de JEEP (-1) y DODGE (-2) al ID de CHRYSLER (13)
  // El backend NO acepta -1 o -2, solo acepta 13 para estas marcas
  const normalizedBrandId = String(brandId).trim();
  let actualBrandId = normalizedBrandId;
  
  if (normalizedBrandId === "-1" || normalizedBrandId === "-2") {
    actualBrandId = "13"; // ID de CHRYSLER - OBLIGATORIO usar 13 para JEEP y DODGE
    console.log(`🔄 getModelHelper: Mapeando ${normalizedBrandId} (${normalizedBrandId === "-1" ? "JEEP" : "DODGE"}) → 13 (CHRYSLER)`);
  }
  
  const url = `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/brands/${actualBrandId}/groups/${groupId}/models`;
  
  console.log("getModelHelper called with:", { 
    url, 
    token: !!token, 
    brandId: brandId,
    actualBrandId: actualBrandId,
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
