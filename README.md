# 🚗 KARS - Sitio Web de Venta de Automóviles

Un sitio web moderno y responsive para un concesionario de automóviles, construido con React, Vite y TailwindCSS.

## ✨ Características

- **Diseño Responsive**: Optimizado para todos los dispositivos
- **Componentes Modulares**: Arquitectura limpia y mantenible
- **TailwindCSS**: Estilos modernos y consistentes
- **Navegación Suave**: Experiencia de usuario fluida
- **SEO Optimizado**: Meta tags y estructura semántica

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **TailwindCSS** - Framework de CSS utilitario
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Compatibilidad entre navegadores

## 📁 Estructura del Proyecto

```
car-dealer-website/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navegación principal
│   │   ├── Hero.jsx            # Sección principal
│   │   ├── Benefits.jsx        # Módulo de beneficios
│   │   ├── StockSection.jsx    # Vehículos disponibles
│   │   ├── WhyChooseUs.jsx     # Razones para elegirnos
│   │   ├── Testimonials.jsx    # Testimonios de clientes
│   │   ├── CallToAction.jsx    # Llamadas a la acción
│   │   └── Footer.jsx          # Pie de página
│   ├── pages/                  # Páginas adicionales (futuro)
│   ├── assets/                 # Imágenes y recursos
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales
├── public/                     # Archivos estáticos
├── index.html                  # HTML principal
├── package.json                # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind
├── postcss.config.js           # Configuración de PostCSS
└── README.md                   # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd car-dealer-website
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   - El proyecto se abrirá automáticamente en `http://localhost:5173`
   - O navega manualmente a esa URL

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter de código

## 🎨 Personalización

### Colores

Los colores principales se pueden modificar en `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Fuentes

La fuente principal (Inter) se puede cambiar en `tailwind.config.js` y `index.html`.

### Imágenes

Reemplaza los placeholders de `https://via.placeholder.com/` con tus propias imágenes en la carpeta `src/assets/`.

## 📱 Responsive Design

El sitio está optimizado para:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔧 Configuración de TailwindCSS

El proyecto incluye:
- **TailwindCSS 3.3+** con configuración personalizada
- **PostCSS** con autoprefixer
- **Componentes personalizados** en `index.css`
- **Colores personalizados** para la marca

## 📦 Construcción para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🌐 Despliegue

El proyecto se puede desplegar en:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Cualquier servidor web estático**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda:
- 📧 Email: info@kars.com
- 📱 Teléfono: +1 (555) 123-4567
- 🌐 Sitio web: www.kars.com

## 🙏 Agradecimientos

- **TailwindCSS** por el increíble framework de CSS
- **Vite** por la herramienta de construcción rápida
- **React** por la biblioteca de interfaz de usuario
- **Heroicons** por los iconos SVG utilizados

---

**¡Disfruta construyendo tu sitio web de concesionario de automóviles! 🚗✨**
