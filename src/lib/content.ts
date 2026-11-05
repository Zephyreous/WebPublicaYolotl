import { getCollection, type CollectionEntry } from 'astro:content';

export type Caso = CollectionEntry<'casos'>;

/**
 * Casos publicados, del más reciente al más antiguo.
 * Los que tienen `draft: true` en el frontmatter no se listan en ninguna página.
 */
export async function getCasosPublicados(): Promise<Caso[]> {
  const casos = await getCollection('casos', ({ data }) => !data.draft);
  return casos.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
