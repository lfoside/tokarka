# Демо на GitHub Pages — сборка, публикация, снятие демо-режима

Временный показ коллегам. Оба варианта живут в **одном репозитории**:

```
<repo>/
├── index.html          ← переключатель (gh-pages/index.html, кладётся в корень сайта)
├── robots.txt          ← корневой (gh-pages/robots.txt)
├── original/           ← сборка исходного варианта (dist/)
├── redesign/           ← сборка текущего варианта (redesign/dist/)
```

Сайт: `https://<user>.github.io/<repo>/` → переключатель → `./original/`, `./redesign/`.

## Ожидаемые URL (репозиторий называется `tokarka`)

Workflow берёт имя репозитория из `github.event.repository.name`, поэтому при
репозитории **`tokarka`** пути подставятся сами:

```
https://lfoside.github.io/tokarka/            ← переключатель
https://lfoside.github.io/tokarka/original/   ← исходный вариант
https://lfoside.github.io/tokarka/redesign/   ← «Цеховой трафарет»
```

Существующий сайт в корне (`lfoside.github.io/`, репозиторий `lfoside.github.io`)
и демо в подпапке — разные репозитории и разные артефакты Pages: пути не
пересекаются, ничего из существующего сайта не затрагивается.

**О корневом robots.txt:** поисковики читают `robots.txt` только с корня домена
(`lfoside.github.io/robots.txt` — он от существующего сайта и разрешает `Allow: /`),
поэтому файл `/tokarka/robots.txt` поисковиками не запрашивается. Реальную защиту
демо держит meta `noindex` (он виден при краулинге — а корневой robots его не
блокирует). Наш robots.txt оставлен как документация режима для людей и
инструментов; корневой файл существующего сайта не изменять.

## Как это работает

- `astro.config.mjs` обоих вариантов читает `GH_PAGES_SITE` / `GH_PAGES_BASE`.
  Без переменных — обычная локальная сборка под FTP на **tokarka.pro** (ничего не меняется).
- CI при сборке ставит `GH_PAGES_BASE=/<repo>/original` и `/<repo>/redesign` —
  все пути к активам (шрифты, `_astro/`) получают префикс подпапки.
- **Индексация закрыта** метатегом `<meta name="robots" content="noindex, nofollow">`
  в `<head>` каждой страницы (оба Layout + переключатель).
  `robots.txt` намеренно **не блокирует краулинг**: запрет не даёт поисковику увидеть
  noindex, из-за чего URL может остаться в индексе пустой ссылкой.

## Публикация (первый раз)

```bash
cd fromScratch
git init -b main
git add .
git commit -m "Demo: два варианта + закрытая от индексации сборка GitHub Pages"
# создать пустой репозиторий на github.com (без README) и:
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Затем в репозитории: **Settings → Pages → Source: GitHub Actions**.
Push в `main` (или вкладка Actions → Run workflow) = новая публикация.
`node_modules/`, `dist/`, `.astro/` уже в `.gitignore`.

Локальная проверка Pages-сборки без git:

```bash
# Windows/Git Bash: MSYS2_ENV_CONV_EXCL защищает значение GH_PAGES_BASE
# от превращения в C:/Program Files/Git/... (в CI на Linux не нужен)
MSYS2_ENV_CONV_EXCL='GH_PAGES_BASE' \
  GH_PAGES_BASE=/<repo>/original GH_PAGES_SITE=https://<user>.github.io npx astro build
MSYS2_ENV_CONV_EXCL='GH_PAGES_BASE' \
  GH_PAGES_BASE=/<repo>/redesign GH_PAGES_SITE=https://<user>.github.io npx astro build \
  --root redesign   # либо cd redesign
```

## ⚠️ Чек-лист: снять демо-режим перед деплоем на tokarka.pro

Перед SEO-запуском на своём хостинге:

1. **Удалить noindex** — строку `<meta name="robots" content="noindex, nofollow" />`
   (с комментарием «ВРЕМЕННО») в обоих Layout:
   - `src/layouts/Layout.astro`
   - `redesign/src/layouts/Layout.astro`
   - и в `gh-pages/index.html` (или не деплоить переключатель вообще).
2. **Заменить robots.txt** в `public/robots.txt` и `redesign/public/robots.txt`
   на продакшен-вариант:

   ```
   User-agent: *
   Allow: /

   Sitemap: https://tokarka.pro/sitemap-index.xml
   ```

3. **Собрать без переменных** `GH_PAGES_*` — базовый путь и canonical уже на tokarka.pro.
4. **SEO-задачи** (отдельным заходом, как договаривались):
   - заменить заглушку `og-default.png` (сейчас og:image ссылается на несуществующий файл);
   - добавить сайт в Яндекс.Вебмастер и Google Search Console;
   - проверить canonical/OG/sitemap на реальном домене;
   - убрать из репозитория `gh-pages/` и workflow, если Pages больше не нужен.
