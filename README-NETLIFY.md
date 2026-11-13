# MOB-Weihnachtsfeier – Netlify Brettspiel v1.1

## Deployment
1. Den Inhalt dieses Ordners in den Root deines GitHub-Repositories kopieren.
2. Alte Root-Dateien aus früheren Versionen entfernen, insbesondere alte `index.html`, `api/`, `vercel.json` und doppelte Functions.
3. Commit + Push auf den Production-Branch.
4. Netlify liest `netlify.toml` automatisch:
   - Build command: `npm run build`
   - Publish: `public`
   - Functions: `netlify/functions`
5. In Netlify unter Environment variables setzen:
   - `SESSION_SECRET` = langer zufälliger Wert
   - optional `ADMIN_PIN` (Standard im Code: 2026)
6. Danach `Clear cache and deploy site` ausführen.

## Gemeinsamer Spielstand
Der shared Spielstand liegt in Netlify Blobs mit Strong Consistency. Es ist keine Upstash-/Vercel-Konfiguration nötig.

## API
Die App ruft weiterhin `/api/login`, `/api/status`, `/api/action`, `/api/inbox` auf. Netlify leitet diese URLs über Redirects auf die Functions um.

## Build-Marker
`public/BUILD.txt` enthält den Versionshinweis. Diese Datei ist nach Deployment unter `/BUILD.txt` erreichbar.
