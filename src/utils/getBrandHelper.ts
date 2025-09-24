// utils/getBrands.js

import axios from "axios";

export default async function getBrandHelper(token: string) {
  const url = 'https://kars-backend-y4w9.vercel.app/api/brands/';
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
      console.log("response.data", response.data);
      
      return response.data;
    } catch (error: any) {
      console.log("error.response", error.response);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        throw new Error('TOKEN_EXPIRED');
      }else throw new Error('Error al obtener las marcas');
    }
}
