// Script para probar el API de leads
// Ejecutar con: node test-leads-api.js

const testLead = {
  nombre: "Test Usuario",
  email: "test@example.com",
  telefono: "+54 9 11 1234-5678",
  ubicacion: "Buenos Aires",
  marca: "Toyota",
  modelo: "Corolla",
  grupo: "Sedan",
  año: "2020",
  kilometraje: "50000",
  precio: "15000",
};

fetch("http://localhost:3000/api/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testLead),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Respuesta del API:", data);
    if (data.success) {
      console.log("🎉 Lead guardado exitosamente!");
      console.log("Lead ID:", data.lead?.id);
    } else {
      console.error("❌ Error:", data.error);
    }
  })
  .catch((error) => {
    console.error("❌ Error al conectar con el API:", error);
  });
