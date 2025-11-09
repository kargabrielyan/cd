/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убедиться что статические файлы правильно обрабатываются
  output: 'standalone',
  // Отключить минификацию для лучшей отладки (можно включить обратно для продакшена)
  // productionBrowserSourceMaps: true,
}

module.exports = nextConfig





