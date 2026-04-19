# Nico's geheugensteun

A Dutch de/het word tracker — a tiny PWA Anna can install on her phone's home screen, add words to, and use offline.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (manifest + service worker, offline-capable)
- localStorage for data (no backend)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build into ./dist
npm run preview  # serve ./dist locally to sanity-check the build
npm run lint
```

> Note: installs use `--legacy-peer-deps` if you re-install, because `vite-plugin-pwa` hasn't widened its peer range to Vite 8 yet. It works fine at runtime.

## Deploy

This project is wired up for **GitHub Pages** via a GitHub Actions workflow (`.github/workflows/deploy.yml`). Every push to `main` builds the app and publishes it.

### One-time setup

1. Create an empty repo on github.com named `geheugensteun` (the name must match `base` in `vite.config.ts` — if you want a different name, update both).
2. Push the code:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/geheugensteun.git
   git push -u origin main
   ```

3. On GitHub: repo → *Settings* → *Pages* → *Build and deployment* → **Source: GitHub Actions**.
4. Wait ~1 minute for the first deploy. The URL is `https://<your-username>.github.io/Geheugensteun/`.
5. Share that URL with Anna.

### Updates

Make changes locally, then:

```bash
git add .
git commit -m "..."
git push
```

That's it — GitHub Actions rebuilds and redeploys.

### Alternatives

- **Netlify** — free, HTTPS out of the box. Requires a Netlify account (you can sign in with GitHub, no new password needed). *Add new site → Import from Git* → pick this repo. Auto-deploys on push. Anonymous drag-and-drop also works but the link expires unless you claim it by signing in.
- **Vercel** — same story. `npm i -g vercel`, then `vercel --prod`. Or connect the GitHub repo via <https://vercel.com/new>.

Both alternatives do not need the `base: '/Geheugensteun/'` setting — they serve from root. If you switch hosts, remove or change that line in `vite.config.ts`.

## PWA / iOS install

Once deployed over HTTPS (Netlify and Vercel both give you this by default):

1. Open the site in **Safari** on iPhone (Chrome on iOS can't install PWAs).
2. Tap the **Share** button → **Add to Home Screen**.
3. The app opens fullscreen from the home screen icon. Words are stored in the browser's localStorage, so they survive restarts and work offline.

## Project layout

```
src/
  App.tsx               main screen
  types.ts              Word / Article / FilterValue
  hooks/
    useLocalStorage.ts  tiny generic hook
  components/
    WordForm.tsx        word + translation inputs, add buttons
    SearchFilter.tsx    search bar + article filter
    Stats.tsx           total / de / het counters
    WordItem.tsx        single colored row
    WordList.tsx        list + empty states
  index.css             Tailwind import + @theme custom colors
public/
  icon.svg              source icon (PNGs auto-generated at build)
reference/
  prototype.html        original single-file prototype
```

## Where data lives

All data is in the browser under the localStorage key `nicos-geheugensteun-words`. Clearing Safari's data for the site wipes the word list. No sync across devices — that would need a backend.
