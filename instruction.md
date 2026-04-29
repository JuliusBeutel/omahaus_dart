**Projekt: Webbasierter Dart-Zähler mit Tablet-Display und Handy-Controller**

Erstelle eine erste funktionsfähige Version einer Web-App für einen Dart-Zähler mit folgender Architektur und Funktionalität:

---

# 🧠 Grundkonzept

- Die App besteht aus zwei Rollen:
  1. **Tablet (Display)** → zeigt Scores und Spielstatus
  2. **Handy (Controller)** → Eingabe der Würfe

- Beide Geräte sind über eine gemeinsame **Session-ID** verbunden

- Kommunikation erfolgt über **WebSockets (z. B. Socket.io)**

---

# 🔗 Session-System

- Beim Start erstellt das Tablet eine **Session-ID (z. B. ABC123)**
- Das Tablet zeigt einen **QR-Code**, der auf folgende URL zeigt:

  ```
  /session/ABC123
  ```

- Handys scannen den QR-Code und treten der Session bei

---

# ⚙️ Technischer Stack

- Frontend: React (oder Next.js)
- Backend: Node.js mit WebSockets (Socket.io)
- State wird **nur auf dem Server verwaltet** (Single Source of Truth)

---

# 🎯 Spielregeln

- Spielmodi: 301 und 501
- Bis zu 4 Spieler
- **Double-Out Pflicht**
- Jeder Spieler hat maximal **3 Würfe pro Runde**

---

# 🧱 Game State Struktur

Der zentrale State soll ungefähr so aussehen:

- Spieler (Name, aktueller Score)
- aktueller Spielerindex
- aktueller Turn:
  - Start-Score der Runde
  - aktuelle Würfe (max. 3)
  - Anzahl geworfener Darts

---

# 🎮 Spiellogik

Bei jedem Wurf:

1. Punkte berechnen:

   ```
   Punkte = Feldwert * Multiplikator (1x, 2x, 3x)
   ```

2. Temporär vom Score abziehen

3. Regeln prüfen:

### Bust (ungültiger Wurf)

- Score < 0
- Score == 1
- Score == 0 ohne Double

→ Ergebnis:

- Score wird auf Turn-Start zurückgesetzt
- Runde endet sofort
- nächster Spieler

---

### Gültiger Wurf

- Score wird aktualisiert
- Wurf wird gespeichert

---

### Gewinn

- Score == 0 und letzter Wurf ist Double

→ Spiel endet

---

# 🔄 Turn-Logik

- Maximal 3 Würfe pro Spieler
- Nach 3 Würfen → nächster Spieler
- Bei Bust → sofortiger Spielerwechsel

---

# 📡 WebSocket Events

### Client → Server

- `JOIN_SESSION`
- `THROW` (value, multiplier)
- `UNDO`
- `RESET_GAME`

---

### Server → Clients

- `STATE_UPDATE` (kompletter Game State)
- `GAME_FINISHED`

---

# 🖥️ Tablet UI (Display)

- Große Anzeige des aktuellen Scores
- Darunter:
  - aktuelle 3 Würfe (z. B. "60 | 20 | -")

- Anzeige des aktuellen Spielers (hervorgehoben)
- QR-Code für Session-Beitritt

### Bei Spielende:

- Große Anzeige:
  - "Spieler X gewinnt"
  - Average des Gewinners

---

# 📱 Handy UI (Controller)

- Eingabefeld:
  - Zahlen 1–20
  - Bull

- Toggle:
  - Single / Double / Triple

- Kein Submit-Button → jeder Klick sendet sofort

---

# 🔙 Zusatzfunktionen

### Undo

- macht den letzten Wurf rückgängig
- stellt vorherigen Score wieder her

---

### Reset

- setzt das gesamte Spiel zurück
- neue Runde mit Startscore

---

# 📊 Average Berechnung

- Nur am Ende anzeigen (nicht live)
- Formel:

  ```
  Average = (geworfene Punkte / Anzahl Darts) * 3
  ```

---

# ⚠️ Wichtige Anforderungen

- Server berechnet alle Spielzustände
- Clients sind nur Anzeige / Eingabe
- State wird bei jeder Änderung komplett an alle Clients gesendet
- Echtzeit-Updates ohne Reload

---

# 🚀 Ziel

Erstelle eine einfache, funktionierende erste Version mit:

- WebSocket-Verbindung
- Session-System
- einfacher UI für Tablet & Handy
- funktionierender Dart-Logik (inkl. Bust und Double-Out)
- Undo und Reset

Fokus liegt auf Funktion, nicht auf Design.
