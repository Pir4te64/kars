markdown# Integración de API InfoAuto en Cotizador de Autos

## Contexto
Tengo un formulario cotizador en la sección hero con 5 campos que necesitan conectarse a la API de InfoAuto.

## Campos del Formulario

El cotizador tiene estos campos en orden:
1. **Marca** - Dropdown para seleccionar marca del vehículo
2. **Modelo** - Dropdown para seleccionar modelo (depende de Marca)
3. **Año** - Dropdown para seleccionar año del vehículo (depende de Modelo)
4. **Versión** - Dropdown para seleccionar versión específica (depende de Año)
5. **Kilometraje** - Dropdown para ingresar/seleccionar kilometraje
6. **Botón "Comenzar cotización"** - Ejecuta la cotización final

## Mapeo API → Campos del Formulario

### Campo 1: MARCA
- **Endpoint:** `GET /brands/`
- **Acción:** Poblar el dropdown con todas las marcas disponibles
- **Datos a mostrar:** Nombre de la marca
- **Datos a guardar:** `brand_id` para usar en siguiente paso

### Campo 2: MODELO
- **Endpoint:** `GET /brands/{brand_id}/models/`
- **Trigger:** Se activa cuando se selecciona una Marca
- **Acción:** Poblar dropdown con modelos de esa marca
- **Datos a mostrar:** Nombre del modelo
- **Datos a guardar:** `codia` (identificador único del modelo)

### Campo 3: AÑO
- **Endpoint:** `GET /models/{codia}/prices/`
- **Trigger:** Se activa cuando se selecciona un Modelo
- **Acción:** Extraer los años disponibles de los precios usados
- **Datos a mostrar:** Años disponibles (ordenados descendente)
- **Nota:** Si el modelo es 0km, mostrar solo el año actual

### Campo 4: VERSIÓN
- **Endpoint:** `GET /models/{codia}` o `GET /models/{codia}/features/`
- **Trigger:** Se activa cuando se selecciona Año
- **Acción:** Mostrar las versiones/variantes disponibles del modelo
- **Alternativa:** Si no hay versiones múltiples, este campo podría auto-completarse o mostrarse deshabilitado

### Campo 5: KILOMETRAJE
- **Tipo:** Input numérico o dropdown con rangos
- **Opciones sugeridas:**
  - 0 km (nuevo)
  - 0 - 20,000 km
  - 20,000 - 50,000 km
  - 50,000 - 100,000 km
  - 100,000 - 150,000 km
  - Más de 150,000 km
- **Nota:** Este campo no depende de la API, es input del usuario

### Botón "Comenzar cotización"
- **Endpoints a consultar al hacer clic:**
  1. `GET /models/{codia}/list_price` - Para precio 0km
  2. `GET /models/{codia}/prices/` - Para precio usado según año
  3. `GET /models/{codia}/photos/` - Para mostrar fotos (opcional)
  4. `GET /models/{codia}/features/` - Para características (opcional)

## API Configuration

**Base URL:** https://api.infoauto.com.ar/cars/pub

**Credenciales:**
- Usuario: vicmor601@gmail.com
- Contraseña: XhqOsuVIK1MeXpAB

**Documentación:** https://api.infoauto.com.ar/cars/openapi/spec.yaml

## Lógica de Dependencias (Importante)
Marca (siempre activo)
↓
Modelo (se activa al seleccionar Marca, se resetea si cambia Marca)
↓
Año (se activa al seleccionar Modelo, se resetea si cambia Modelo)
↓
Versión (se activa al seleccionar Año, se resetea si cambia Año)
↓
Kilometraje (siempre activo, independiente)
↓
Botón habilitado solo cuando todos los campos estén completos

## Requisitos de UX

1. **Estados de Loading:** Mostrar spinner o "Cargando..." en cada dropdown mientras se cargan datos
2. **Campos deshabilitados:** Los campos dependientes deben estar deshabilitados hasta que se complete el campo anterior
3. **Reset en cascada:** Si el usuario cambia la Marca, limpiar Modelo, Año y Versión
4. **Validación:** El botón "Comenzar cotización" solo debe estar habilitado cuando todos los campos estén completos
5. **Mensajes de error:** Si falla alguna petición, mostrar mensaje claro al usuario
6. **Estado vacío:** Placeholder apropiado en cada campo (ej: "Seleccione una marca")

## Requisitos Técnicos

1. **Autenticación segura:** Crear endpoint proxy en el backend para no exponer credenciales
2. **Caché (opcional):** Cachear lista de marcas ya que no cambia frecuentemente
3. **Debounce:** Si hay búsqueda por texto en algún campo
4. **Error handling:** Try-catch en todas las llamadas API
5. **TypeScript (si aplica):** Tipar las respuestas de la API

## Tareas para Claude Code

Por favor:
1. Localiza el componente del formulario cotizador en el hero
2. Identifica el framework/librería usado (React, Vue, etc.)
3. Implementa la lógica de llamadas a la API según el mapeo arriba
4. Implementa la lógica de dependencias entre campos
5. Agrega estados de loading y error
6. Crea un endpoint proxy si es necesario (recomendado)
7. Prueba el flujo completo: Marca → Modelo → Año → Versión → Cotizar

## Output Esperado

Cuando el usuario hace clic en "Comenzar cotización", debe:
- Tener guardados todos los datos: brand_id, codia, año, versión, kilometraje
- Obtener el precio correspondiente (0km o usado según el año)
- Mostrar resultado de cotización (puede ser modal, nueva sección, o redirección)

## Pregunta para Claude Code

¿Qué acción debería ejecutarse al hacer clic en "Comenzar cotización"? ¿Mostrar precio en modal, redireccionar a otra página, o expandir sección con resultados?

---

Empieza explorando el código actual del formulario y proponme un plan de implementación.

Este prompt ahora está mucho más específico y alineado con tu formulario. Claude Code podrá:

✅ Mapear cada campo exactamente con su endpoint
✅ Implementar la lógica de dependencias en cascada
✅ Manejar los estados de cada dropdown
✅ Validar antes de habilitar el botón