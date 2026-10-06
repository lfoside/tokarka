import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content Collections: будущие фото работ добавляются новым .md-файлом
 * в src/content/works — без правки компонентов. Строгая zod-валидация:
 * ошибка в frontmatter валит сборку (правило 1.6).
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    imageAlt: z.string().optional(),
    badge: z.string(),
    batch: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { works };
