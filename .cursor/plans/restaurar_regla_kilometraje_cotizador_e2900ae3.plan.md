---
name: Restaurar regla kilometraje cotizador
overview: Restaurar la aplicación de reducción de precio por kilometraje en el cotizador y mejorar la fórmula para que sea realista para el mercado argentino, considerando que autos viejos no pueden tener 0km.
todos:
  - id: improve-km-function
    content: Mejorar calculatePriceByKilometers en lib/car-quote.ts para considerar kilometraje base esperado según antigüedad del vehículo
    status: completed
  - id: apply-km-carquotesection
    content: Aplicar ajuste por kilometraje en components/CarQuoteSection.tsx después de calcular precioBasePesos
    status: completed
    dependencies:
      - improve-km-function
  - id: apply-km-resultado
    content: Aplicar ajuste por kilometraje en app/cotizar/resultado/page.tsx después de calcular precioEnPesos
    status: completed
    dependencies:
      - improve-km-function
---

# Restaurar y Mejorar Regla de Reducción por Kilometraje

## Problema Identificado

La función `calculatePriceByKilometers` existe en `lib/car-quote.ts` y está importada en `components/CarQuoteSection.tsx`, pero **NO se está aplicando** en el flujo de cotización actual. El precio se calcula sin considerar el kilometraje del vehículo.

## Solución Propuesta

### 1. Aplicar reducción por kilometraje en el flujo de cotización

**Archivos a modificar:**

- `components/CarQuoteSection.tsx` - Aplicar ajuste por km después de obtener precio base
- `app/cotizar/resultado/page.tsx` - Aplicar ajuste por km en el cálculo de precio final

### 2. Mejorar la fórmula para mercado argentino

La fórmula actual `Precio = precioBase × e^(-0.00000289 × km)` asume que el precio base es a 0km, pero para autos viejos (ej: 2008) esto no es realista.

**Mejora propuesta:**

- Calcular kilometraje base esperado según antigüedad: `kmBase = (añoActual - añoVehiculo) × 15000`
- Aplicar reducción solo sobre el exceso de kilómetros: `kmExceso = max(0, kmReal - kmBase)`
- Fórmula ajustada: `Precio = precioBase × e^(-0.00000289 × kmExceso)`

Esto significa:

- Un auto de 2008 (16 años) tiene km base esperado de ~240,000 km
- Si tiene 250,000 km, solo se descuenta por los 10,000 km excedentes
- Si tiene 200,000 km (menos del esperado), no hay descuento adicional

### 3. Implementación

**En `lib/car-quote.ts`:**

- Mejorar `calculatePriceByKilometers` para aceptar año del vehículo
- Calcular km base esperado según antigüedad
- Aplicar reducción solo sobre exceso de kilómetros

**En `components/CarQuoteSection.tsx`:**

- Línea ~388: Después de calcular `precioBasePesos`, aplicar ajuste por km
- Usar `formData.kilometraje` y `formData.año` para el cálculo

**En `app/cotizar/resultado/page.tsx`:**

- Línea ~148: Después de calcular `precioEnPesos`, aplicar ajuste por km
- Usar `quoteData.kilometraje` y `quoteData.año` para el cálculo

### 4. Validaciones

- Si kilometraje es 0, vacío o inválido: no aplicar descuento
- Si año es inválido: usar km base de 0 (comportamiento actual)
- Si km real < km base esperado: no aplicar descuento adicional

## Archivos a Modificar

1. `lib/car-quote.ts` - Mejorar función de cálculo
2. `components/CarQuoteSection.tsx` - Aplicar ajuste en handleCompleteQuote
3. `app/cotizar/resultado/page.tsx` - Aplicar ajuste en obtenerPrecioBasePesos