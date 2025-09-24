// utils/getBrands.js

import axios from "axios";

export default async function getPriceHelper(codia: string, isNew: boolean, isOld: boolean, token: string) {
  const url = `https://kars-backend-y4w9.vercel.app/api/brands/${codia}/price?isNew=${isNew}&isOld=${isOld}`; 
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
      console.log("codia ", codia, " data ", response.data);
      
      return response.data;
    } catch (error:any) {
      console.log(error);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        throw new Error('TOKEN_EXPIRED');
      }else throw new Error('Error al obtener las marcas');
    }
}
