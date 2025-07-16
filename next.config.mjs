/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n: {
  //   locales: ["en", "pt"],
  //   defaultLocale: "en",
  // },
  // Configuración correcta para Turbopack (estable en versiones recientes)
  turbopack: {
    // Opciones de Turbopack aquí
  },
  // Si necesitas desactivar lightningcss (solución para el error original)
  experimental: {
    optimizeCss: false
  }
};

export default nextConfig;