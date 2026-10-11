website for jstnurmind 😈

## Updating content

All releases, features, radio residencies, live appearances and links live in `data/content.mjs`.
The homepage "Selected Music" picks are set by `featuredReleaseIds` in that file.

After editing, regenerate the pages (`index.html`, `music/`, `live/`, `sitemap.xml`, `llms.txt`) and the CSS:

```sh
npm install   # first time only
npm run build
npm run serve # preview at http://localhost:8080
```

Generated HTML is committed so GitHub Pages can serve it directly. Edit `data/content.mjs`, `scripts/build.mjs` and `styles.scss`, not the generated files.
