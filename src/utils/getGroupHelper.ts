// utils/getBrands.js

import axios from "axios";

export default async function getGroupHelper(token: string, brandId: string) {
  const url = `https://kars-backend-y4w9.vercel.app/api/brands/${brandId}/groups`;
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        throw new Error('TOKEN_EXPIRED');
      }
      return [];
  }
}
