# MOB-Weihnachtsfeier – Netlify Brettspiel v1.6

## Wichtige Änderung in v1.6
- neue festlichere Gesamtoptik
- neue Typografie für die gesamte App
- eigene Team-Figuren: **Rentier**, **Glühweinbecher**, **Tannenbaum**
- eigene Feld-Icons statt Standard-Emojis
- überarbeitete cosy Navigation
- Startseite mit **konsistenten Namensschildern** unter den Avataren
- weicherer Crew-Slider
- langsamere Spielfiguren-Bewegung und entschleunigter Ablauf
- aktualisierte Service-Worker-Cache-Version gegen alte Darstellungen
- 3D-Zahlenwürfel bleibt enthalten

## Upload auf Netlify / Git-Repo
Ganz wichtig: **Nicht nur einzelne Dateien hinzufügen.**
Du musst den **kompletten Inhalt dieses ZIPs** in dein Repo übernehmen bzw. den bisherigen Repo-Inhalt damit überschreiben.

Im Repo-Root müssen danach direkt diese Dinge liegen:
- `public/`
- `netlify/`
- `netlify.toml`
- `package.json`
- `README-NETLIFY.md`
- `WICHTELCODES.txt`

## Prüfen nach dem Deploy
Rufe danach auf:
- `/BUILD.txt`

Dort muss stehen:
- `BOARD-V1.6-NETLIFY`

## Wenn alte Optik sichtbar bleibt
Dann bitte nach dem Deploy zusätzlich einmal:
1. Seite hart neu laden
2. falls nötig PWA/Startbildschirm-Version schließen
3. Seite neu öffnen

Die Cache-Version wurde in v1.6 bereits angehoben.
