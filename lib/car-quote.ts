const API_BASE_URL = "https://kars-backend-y4w9.vercel.app/api";

interface Brand {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Group {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Model {
  id: number;
  name: string;
  description: string;
  codia: string;
  list_price?: boolean;
  prices?: boolean;
  [key: string]: unknown;
}

interface PriceResponse {
  price: number;
  [key: string]: unknown;
}

export async function getBrands(token: string): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("Error al obtener las marcas");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
}

export async function getGroups(
  token: string,
  brandId: string
): Promise<Group[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export async function getModels(
  token: string,
  brandId: string,
  group: string
): Promise<Model[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/brands/${brandId}/models?query_string=${group}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function getPrice(
  codia: string,
  isNew: boolean,
  isOld: boolean,
  token: string
): Promise<PriceResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/brands/${codia}/price?isNew=${isNew}&isOld=${isOld}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("Error al obtener el precio");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching price:", error);
    throw error;
  }
}
