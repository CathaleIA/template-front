/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Encontrar la regla existente para archivos
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reutilizar la regla existente para SVGs importados con ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convertir todos los otros SVGs a componentes React
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      }
    );

    // Modificar la regla de archivo para ignorar SVGs
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;