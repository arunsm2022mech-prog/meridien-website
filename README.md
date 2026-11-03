# Méridien Brand Society website

Live at https://www.meridienbrandsociety.com (French) and https://www.meridienbrandsociety.com/en/ (English).
Every push to `main` is built and published by Netlify automatically.

## Where things live

| What | File |
| --- | --- |
| Page structure (shared by both languages) | `src/page.html` |
| French text | `src/i18n/fr.js` |
| English text | `src/i18n/en.js` |
| Styles | `src/style.css` |
| Animations, menu, language switch, forms | `src/main.js` |
| Hero liquid-glass animation (WebGL) | `src/liquid.js` |
| Images, logos, language redirects | `public/` (`public/_redirects`) |

`scripts/pages.mjs` turns the template and the two dictionaries into `index.html` (French) and `en/index.html` (English) before every build. It stops the build if a text exists in one language but not the other.

## Change some text

1. Edit the same key in `src/i18n/fr.js` and `src/i18n/en.js`.
2. Commit and push to `main`. Netlify publishes within about a minute.

## Run it locally

```
npm install
npm run dev      # http://localhost:5173 (French) and /en/ (English)
npm run build    # production build in dist/
```

## Language routing

`public/_redirects` sends visitors whose browser is not in French from `/` to `/en/`.
The FR/EN switch stores the visitor's choice in the `nf_lang` cookie, which Netlify uses instead of the browser language.

## Forms

The membership and partner forms are Netlify Forms. Submissions appear in Netlify under Forms, with a `language` field (fr or en).
