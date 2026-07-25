import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ipl-web-site.vercel.app';

  const routes = [
    '',
    '/players',
    '/teams',
    '/squads',
    '/seasons',
    '/records',
    '/compare',
    '/trending',
    '/stats',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
