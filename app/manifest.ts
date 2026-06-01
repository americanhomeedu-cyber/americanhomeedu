import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'American Home Blueprint with Alla',
    short_name: 'Home Blueprint',
    description: 'Онлайн-курс «Как купить дом в Америке» для русскоязычных иммигрантов',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F1EA',
    theme_color: '#2D4A3E',
    lang: 'ru',
  }
}
