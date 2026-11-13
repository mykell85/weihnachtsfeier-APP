# MOB-Weihnachtsfeier 2026 – Netlify Brettspiel v1.3

- Login-Maske erscheint direkt.
- Startseite mit Wichtel-Crew und Agenda ist wieder da.
- Brettspiel ist ein eigener Menüpunkt.
- Spielleiter-Testlogin: `Spielleiter` / `2026`.
- Spielleiter darf unabhängig vom aktiven Team würfeln und Aktionen bestätigen.
- Spieler: Christian, Bene, Felix, Sven, Giovanni, Cornelius, Marco, Michael, Simon, Peter.
- Daniel ist entfernt.
- Simon und Peter liegen unter `public/avatars/`.

Beim GitHub-Upload bitte alte Legacy-Dateien löschen, insbesondere `chaos-hourly.mjs`, `subscribe.mjs`, alte Root-Functions und alte Root-`index.html`.

Build-Marker: `/BUILD.txt` → `BOARD-V1.3-NETLIFY`.


## v1.3 Fixes
- Login ist ein echtes vorgeschaltetes Auth-Gate und kann nicht mehr vom Status-Polling geschlossen werden.
- Login wird erst nach serverseitig bestätigter Session geschlossen.
- Wichtel-Slider nutzt direkte Event-Listener für Pfeile, Dots und Swipe.
- Portrait- und Namenspositionen im Crew-Panel wurden neu ausgerichtet.
