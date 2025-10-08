# KARS - Plataforma de Compra y Venta de Autos

Proyecto migrado exitosamente de Vite/React a **Next.js 14 (App Router)** con TypeScript, optimizado para SSR/ISR, SEO y performance.

## 🚀 Tecnologías

- **Next.js 14** - App Router con TypeScript
- **React 18** - Server & Client Components
- **Tailwind CSS** - Estilos y diseño responsive
- **TypeScript** - Tipado estricto
- **ISR** - Revalidación incremental (60s)

## 📁 Estructura del Proyecto

```
kars/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout raíz con Poppins font
│   ├── page.tsx             # Home page (SSR)
│   ├── globals.css          # Estilos globales
│   ├── sitemap.ts           # Sitemap dinámico
│   ├── robots.ts            # Robots.txt
│   ├── not-found.tsx        # Página 404
│   ├── error.tsx            # Error boundary
│   ├── autos/[id]/page.tsx  # Detalle de auto (ISR)
│   ├── cotizar/             # Cotización
│   ├── vende-tu-auto/       # Vender auto
│   └── api/                 # API Routes
├── components/              # Componentes
├── lib/                     # Server utilities
├── hooks/                   # React Hooks
├── types/                   # TypeScript types
└── public/                  # Assets estáticos
```

## 🛠️ Instalación y Desarrollo

### Instalación

```bash
npm install
```

### Variables de Entorno

Crea `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Build de Producción

```bash
npm run build
npm start
```

## 📍 Rutas Principales

- `/` - Home (SSR + ISR)
- `/autos/[id]` - Detalle (ISR 60s)
- `/cotizar` - Cotización
- `/vende-tu-auto` - Vender auto
- `/api/vehicles` - API vehículos

## 🚢 Deploy en Vercel

```bash
vercel --prod
```

Configura `NEXT_PUBLIC_APP_URL` en Vercel Dashboard.

## 📝 Decisiones Técnicas

**Server Components:** Benefits, Footer, AboutSection  
**Client Components:** Navbar, Hero, StockSection, Forms  
**ISR:** 60s revalidation para stock y detalle  
**SEO:** Sitemap dinámico, metadata, robots.txt

## 📄 Licencia

Privado
