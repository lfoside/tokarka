// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Деплой: папка dist заливается по FTP на обычный хостинг (reg.ru).
// site — под будущий домен; base корневой, пути к активам не слетают.
// GitHub Pages-демо: CI задаёт GH_PAGES_SITE/GH_PAGES_BASE (см. DEMO-DEPLOY.md);
// локальная сборка без переменных не меняется (FTP-режим).
export default defineConfig({
  site: process.env.GH_PAGES_SITE || 'https://tokarka.pro',
  base: process.env.GH_PAGES_BASE || '/',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    // @ts-expect-error — tailwindcss() возвращает массив плагинов; vite-типы Astro пессимистичны
    plugins: [...tailwindcss()],
  },
});
