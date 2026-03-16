// Consultar precios de InfoAuto via backend
const API = 'https://kars-backend-y4w9.vercel.app/api';
const rate = 0.00000394;
const ref = 50000;

function kmPrice(base, km) {
  return Math.round(base * Math.exp(-rate * (km - ref)));
}

async function getPrice(codia, name) {
  const res = await fetch(`${API}/models/${codia}/prices?isNew=false&isOld=false`);
  const data = await res.json();
  return { codia, name, data };
}

async function main() {
  // 308 1.6 ALLURE NAV (2011-2020) y PARTNER 1.6 CONFORT (2017-2023) como representativos
  const models = [
    { codia: '320640', name: '308 1.6 ALLURE NAV', adj2018: -4 },
    { codia: '320723', name: 'PARTNER 1.6 CONFORT', adj2018: -10 },
  ];

  for (const m of models) {
    const { data } = await getPrice(m.codia, m.name);
    console.log('\n---', m.name, '---');
    console.log('Respuesta API:', JSON.stringify(data).substring(0, 300));
    
    // Intentar extraer precio
    const precio = data?.price || data?.precio || data?.value || data?.average;
    if (precio) {
      const precio2018 = Math.round(precio * (1 + m.adj2018/100));
      console.log('Precio InfoAuto:', precio.toLocaleString());
      console.log('Precio 2018 (adj ' + m.adj2018 + '%):', precio2018.toLocaleString());
      console.log('  40k km →', kmPrice(precio2018, 40000).toLocaleString());
      console.log(' 120k km →', kmPrice(precio2018, 120000).toLocaleString());
    }
  }
}
main().catch(console.error);
