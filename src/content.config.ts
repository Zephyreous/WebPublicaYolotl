import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int(),
    features: z.array(z.string()).default([]),
  }),
});

const casos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/casos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      industry: z.string(),
      summary: z.string(),
      cover: image(),
      coverAlt: z.string(),
      date: z.coerce.date(),
      results: z.array(z.string()).default([]),
    }),
});

export const collections = { servicios, casos };
