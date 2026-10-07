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
Christian, Bene, Felix, Simon, Giovanni, Cornelius, Marco, Daniel, Michael.
