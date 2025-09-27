const user = "vicmor601@gmail.com"
const password = "kars.API2025"

export async function login() {
  const url = "http://localhost:3001/api/cars/auth/login";

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin" : "*"
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Error en login: " + response.statusText);
  }
  
  const data = await response.json();
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  const url = "http://localhost:3001/api/cars/auth/refresh";
  console.log(refreshToken);
  
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin" : "*",
      "refreshToken": refreshToken
    },
  };
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error("Error en login: " + response.statusText);
  }
  
  const data = await response.json();
  console.log("data", data);
  return data;
}
