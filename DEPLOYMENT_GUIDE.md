# Guía de Despliegue - KARS Next.js

## ✅ Migración Completada Exitosamente

El proyecto ha sido migrado de Vite/React a Next.js 14 con App Router.

### Build Status
- ✅ TypeScript compilation: PASSED
- ✅ Next.js build: SUCCESS
- ✅ ESLint: PASSED (warnings only)
- ✅ Rutas generadas: 11 páginas
- ✅ Listo para producción

## 📦 Pasos para Desplegar

### 1. Instalación Local

```bash
npm install
```

### 2. Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

### 3. Build Local

```bash
npm run build
npm start
```

### 4. Deploy en Vercel (Recomendado)

#### Opción A: Deploy Automático (GitHub)

1. Conecta tu repositorio con Vercel
2. Vercel detectará Next.js automáticamente
3. Configura variables de entorno:
   - `NEXT_PUBLIC_APP_URL` → URL de producción
4. Deploy automático en cada push

#### Opción B: Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### 5. Variables de Entorno en Vercel

Configurar en Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

## 🔍 Verificación Post-Deploy

Checklist de verificación:

- [ ] Página home carga correctamente
- [ ] Navegación funciona (Navbar)
- [ ] Stock de autos se muestra
- [ ] Detalle de auto funciona (/autos/[id])
- [ ] Formulario de cotización funciona
- [ ] Formulario "Vende tu auto" funciona
- [ ] Imágenes cargan con next/image
- [ ] SEO metadata presente
- [ ] Sitemap accesible (/sitemap.xml)
- [ ] Robots.txt accesible (/robots.txt)

## 📊 Estructura de Build

```
Build Output:
┌ ○ /                    → Home (SSR + ISR)
├ ƒ /autos/[id]          → Detalle (ISR 60s)
├ ○ /cotizar             → Cotización
├ ○ /cotizar/resultado   → Resultados
├ ○ /vende-tu-auto       → Vender auto
├ ƒ /api/vehicles        → API proxy
├ ƒ /api/vehicles/[id]   → API proxy detalle
├ ○ /sitemap.xml         → Sitemap dinámico
└ ○ /robots.txt          → Robots

Total First Load JS: ~87-105 kB
```

## 🚨 Notas Importantes

### API Externa
- El backend usa: `https://kars-backend-y4w9.vercel.app/api`
- Durante build, si API no responde, Next.js continúa (expected behavior)
- En runtime, la app manejará errores correctamente

### ISR (Incremental Static Regeneration)
- Home y detalle de autos: revalidan cada 60s
- Stock siempre actualizado sin rebuild

### Imágenes
- Todas optimizadas con next/image
- Lazy loading automático
- Responsive automático

## 🔧 Troubleshooting

### Build Errors

**Error: Cannot find module**
```bash
rm -rf node_modules .next
npm install
```

**TypeScript errors**
```bash
npm run type-check
```

**ESLint errors**
```bash
npm run lint
```

### Runtime Errors

**404 en /api/vehicles**
- Verificar que backend esté disponible
- Verificar CORS si es necesario

**Imágenes no cargan**
- Verificar rutas en /public
- Verificar remotePatterns en next.config.mjs

**Forms no funcionan**
- Verificar localStorage está disponible
- Verificar console para errores

## 📈 Performance

Optimizaciones implementadas:
- ✅ Server Components por defecto
- ✅ ISR para cache inteligente
- ✅ Image optimization
- ✅ Font optimization (Poppins)
- ✅ Code splitting automático
- ✅ Prefetching de links

## 🎯 Próximos Pasos

Post-deployment:
1. Configurar analytics (opcional)
2. Configurar monitoring (opcional)
3. Setup de dominio custom
4. Configurar redirects si es necesario

## 📝 Comandos Útiles

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Production server
npm start

# Deploy Vercel
vercel --prod
```

## ✅ Checklist Final

- [x] Migración completa
- [x] TypeScript 100%
- [x] Build exitoso
- [x] ESLint configurado
- [x] SEO implementado
- [x] Performance optimizado
- [x] Listo para deploy
