MOB-Weihnachtsfeier – NETLIFY LIVE VERSION

Diese Version benötigt Netlify Functions und Netlify Blobs.
Darum reicht der alte reine Drag-&-Drop-Upload der einzelnen HTML-Datei nicht mehr.

EMPFOHLENER DEPLOY:
1. ZIP entpacken.
2. Den kompletten Ordner in ein Git-Repository laden (privates Repository empfohlen).
3. In Netlify: Add new project / Import an existing project.
4. Repository auswählen.
5. Netlify erkennt netlify.toml automatisch.
6. Deploy starten.

Danach funktionieren:
- persönlicher Login mit Wichtelcode
- geheime Wichtelpost
- gemeinsamer Team-Spielstand
- zufällige Team-Auslosung
- zentrale Missions-Lostrommel
- stündliche öffentliche Chaos-Karte
- Web-Push für Chaos-Karten
- Team-Ranking mit animierten Balken

PUSH:
Die App enthält bereits ein eigenes VAPID-Schlüsselpaar als Fallback, damit Push nach dem Deploy direkt
funktionieren kann. Für ein dauerhaftes/öffentliches Projekt sollten die Schlüssel später als Netlify-
Umgebungsvariablen gesetzt und die Fallback-Schlüssel ersetzt werden:
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
SESSION_SECRET

IPHONE/IPAD:
Für Web-Push die Website zuerst 'Zum Home-Bildschirm' hinzufügen und die App von dort öffnen.
Danach in der App auf 'Chaos-Alarm aktivieren' tippen.

CHAOS:
Nach der Team-Auslosung 'Chaos starten' drücken. Ab dann zieht die Netlify Scheduled Function
zu jeder vollen Stunde eine noch nicht verwendete Chaos-Karte und verschickt dieselbe Karte an
alle angemeldeten Push-Abonnements.

WICHTELPOST:
Geheimmissionen liegen serverseitig in einer Netlify Function/Blob und werden nicht an andere
Spieler ausgeliefert. Beim Erledigen gibt es +5 Punkte für das aktuelle Team.

WICHTIG:
Die aktuell hinterlegten 9 Spieler sind:
Christian, Bene, Felix, Sven, Giovanni, Cornelius, Marco, Daniel, Michael.

ADMIN-RESET:
Im Ranking-Bereich gibt es einen Admin-Reset. Standardcode: 2026. Für Produktion kann ADMIN_PIN als Netlify-Umgebungsvariable gesetzt werden.

DESIGN-UPDATE MOCKUP-STIL:
- neue atmosphaerische Bereichs-Hintergruende fuer Start, Missionen, Wichtelpost, Lieder und Rangliste
- Giovanni und Marco als neue Wichtelbilder integriert
- Simon vollstaendig durch Sven ersetzt (Sven uebernimmt den bisherigen Code 1937)
- Lieder-Rad mit Lichtanimation, Dreh-Sound, Glocken-Finale und Lyrics unter dem gezogenen Lied
- Team-Rangliste bleibt erhalten und ist als animiertes Balkendiagramm umgesetzt
- Admin-Komplettreset im Ranking; Standardcode 2026

HINWEIS ZU BESTEHENDEN TESTDATEN:
Nach diesem Update einmal den Admin-Komplettreset benutzen, damit alte Simon-/Team-/Mission-Daten aus Netlify Blobs geloescht werden.


UPDATE FINAL:
- Missionsdeck auf 24 kuratierte Missionen reduziert; Punkte 2–5 nach Aufwand.
- Teamwechsel durch Chaos-Karten werden serverseitig sofort ausgeführt.
- Die aktive Chaos-Karte zeigt die betroffenen Wichtel mit vorherigem/neuem Team und Animation an.
