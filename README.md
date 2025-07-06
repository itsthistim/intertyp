# Intertyp – Webseite mit auf REST-API basierendem CMS

Dies ist das Matura-Projekt zur Erstellung einer neuen Website für die Firma InterTyp.
Ziel ist es, eine moderne Landing Page mit einem individuell entwickelten Headless CMS bereitzustellen, das es dem Kunden ermöglicht, Inhalte wie Bilder, Texte und Produkte selbstständig zu verwalten.

## Technologien

- **[Astro](https://astro.build/)** – Frontend-Framework für schnelle und suchmaschinenfreundliche Seiten
- **MariaDB** – Datenbank zur Speicherung von Inhalten
- **REST API** – Für das erstellen und abrufen von Daten
- **JavaScript** – Für dynamische Funktionen und API-Logik
- **CSS** – Eigene Gestaltung ohne CSS-Framework
- **[PhotoSwipe](https://photoswipe.com/)** – Für Lightbox-Galerien auf Projekt- und Produktseiten

---

## Features

- Webseite mit **View Transitions**
- Eigenes **CMS** via einer **REST API**
- Einfache **Verwaltung von Produkten, Projekten und Öffnungszeiten**
- **Moderne Lightbox-Galerien** mit PhotoSwipe
- Mobile- und performanceoptimiert

---

## Installation

### Ohne Docker

```sh
# 1. Repo klonen
git clone https://github.com/itsthistim/intertyp.git
cd intertyp

# 2. Dependencies installieren
npm install

# 3. Project starten
npm run dev
```

Unter http://localhost:4321/ kann die Seite nun aufgerufen werden.

---

### Mit Docker & Docker Compose

#### Voraussetzungen

- [Docker](https://www.docker.com/get-started) und [Docker Compose](https://docs.docker.com/compose/) installiert

#### Schnellstart

1.  Docker-Image bauen

    ```sh
    docker build -t intertyp .
    ```

2.  Mit Docker Compose starten (App + Datenbank)

    ```sh
    docker compose up --build
    ```

    - Die App ist erreichbar unter http://localhost:4321
    - Die Datenbank wird beim ersten Start mit dem Schema aus `src/lib/without_data.sql` initialisiert

3.  Umgebungsvariablen

    - Passe `.env.docker` für Datenbank, API und andere Secrets an
    - Diese Datei wird für App und Datenbank verwendet

4.  Datenbank zurücksetzen

    ```sh
    docker compose down
    docker volume rm intertyp_db_data
    docker compose up --build
    ```

5.  Stoppen und Aufräumen

    ```sh
    docker compose down
    ```

#### Hinweise

- Wenn du DB-Credentials oder das Schema änderst, entferne das DB-Volume wie oben gezeigt, um die Initialisierung erneut auszuführen.
- Wenn Bilder oder statische Dateien fehlen, stelle sicher, dass das `public/`-Verzeichnis im finalen Image enthalten ist (siehe Dockerfile).

---

Weitere Details findest du in der `Dockerfile` und `docker-compose.yml` im Repository.
