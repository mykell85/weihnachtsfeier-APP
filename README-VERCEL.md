# MOB-Weihnachtsfeier 2026 – Brettspiel V1

Diese Version ist für Vercel gebaut und ersetzt die bisherige Netlify-Spielmechanik durch ein gemeinsames Weihnachts-Brettspiel.

## Enthalten

- 33 Felder: Start, freie Felder, Mission, Wichtelpost, Chaos, Lieder-Rad und Ziel
- Shared Würfel: nur ein Mitglied des Teams am Zug kann würfeln
- serverseitiger W6 (1–6), keine clientseitige Manipulation
- animierte Teamfiguren, die Feld für Feld laufen
- gemeinsamer, geräteübergreifender Spielstand
- zufällige Teams zu Spielbeginn
- 24 Missions-Lose
- 12 geheime Wichtelpost-Aufgaben
- 13 Chaos-Karten
- 12 Weihnachtslieder
- keine Wiederholung eines Inhalts, solange der jeweilige Pool nicht leer ist
- wenn ein Pool leer wird, wird er neu geöffnet; die zuletzt gezogenen Inhalte werden zunächst ausgespart
- beim ersten Draw einer neuen Partie wird der erste Draw der vorherigen Partie vermieden
- Finalrunde: erreicht das erste Team Feld 33, bekommen die beiden anderen Teams noch je einen letzten Zug; danach entscheiden die Punkte
- Admin-Reset mit Standardcode `2026`

## Vercel-Deployment

1. Den Inhalt dieses Ordners in ein neues GitHub-Repository legen oder direkt als Projekt zu Vercel hochladen.
2. In Vercel das Projekt anlegen/importieren. Es ist kein Framework und kein Build-Command nötig.
3. Für den gemeinsamen Spielstand eine Upstash-Redis-Datenbank mit dem Vercel-Projekt verbinden.
4. Folgende Environment Variables müssen im Vercel-Projekt vorhanden sein:

   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

5. Empfehlenswert zusätzlich:

   - `SESSION_SECRET` = ein langer zufälliger String
   - `ADMIN_PIN` = eigener Admin-Code, falls `2026` ersetzt werden soll

6. Danach einmal neu deployen.

Ohne Redis läuft die statische Oberfläche, aber die App zeigt beim Laden einen Hinweis, dass der gemeinsame Vercel-Speicher noch nicht verbunden ist. Der Shared-Würfel und der gemeinsame Spielstand benötigen Redis zwingend.

## Wichtelcodes

Siehe `WICHTELCODES.txt`.

## Technische Struktur

- `index.html`, `styles.css`, `app.js`: Haupt-App
- `assets/board-world.png`: illustrierter Weihnachtsmarkt-Hintergrund
- `avatars/`: Wichtelbilder
- `api/login.mjs`: Login
- `api/status.mjs`: gemeinsamer Status
- `api/action.mjs`: Start, Würfeln, Aktionen, Reset
- `api/inbox.mjs`: persönliche Wichtelpost
- `api/_lib/`: Spielregeln, Auth und Redis-Storage

Build-Marker: `BOARD-V1-VERCEL`
