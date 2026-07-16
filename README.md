# Bootswechsel

Fairer Bootsrotations-Planer für Regatten der Segelschule der TU München. Berechnet, welches Team in
welcher Wettfahrt welches Boot bekommt, sodass jedes Team nach jeder Wettfahrt ein anderes Boot
erhält und der Wechsel auf dem Wasser als paarweiser Tausch (bzw. bei ungerader Boots-/Teamzahl als
ein Dreier-Tausch) durchführbar ist. Erzeugt Druckansichten für die Losurne und für die
Wettfahrtleitung.

Läuft vollständig im Browser, ohne Server und ohne Installation — siehe [Deployment](#deployment).

## Entwicklung

Voraussetzung: Node.js 20+.

```bash
npm install
npm run dev        # Entwicklungsserver, http://localhost:5173
npm run test       # Vitest (insbesondere die Property-Tests des Rotationsalgorithmus)
npm run typecheck
npm run lint
npm run build       # Produktions-Build nach dist/
npm run preview     # dist/ lokal ausliefern, um den Produktions-Build zu prüfen
```

## Architektur

- `src/core/schedule/` — der eigentliche Rotationsalgorithmus, framework-frei und mit eigener
  Property-Test-Suite (`buildSchedule.test.ts`). Gerade Boots-/Teamzahlen nutzen eine bewiesen
  korrekte geschlossene Konstruktion (`evenConstruction.ts`), ungerade Zahlen eine
  Backtracking-Suche (`oddSearch.ts`) mit einem Fallback für den Fall, dass eine Wiederholung
  mathematisch unvermeidbar wird (`relaxedFallback.ts`) — das kann auch bei `Wettfahrten <= Boote`
  passieren (bekanntes Beispiel: 5 Boote schaffen nur 3 wiederholungsfreie Wettfahrten), daher wird
  die Warnung generisch aus einem Konstruktions-Fehlschlag abgeleitet, nicht aus einem festen
  Schwellenwert.
- `src/core/validation/`, `src/core/boatLabels/` — Eingabevalidierung (zod) und das Parsen
  frei eingegebener Bootslisten.
- `src/state/useScheduleStore.ts` — Zustand-Store mit `localStorage`-Persistenz, damit die
  Druckansichten auch nach einem Neuladen der Seite den zuletzt erzeugten Plan zeigen.
- `src/components/`, `src/pages/` — Konfigurationsformular, Live-Vorschau, Los-Zettel- und
  Wettfahrtleitungs-Druckansicht.

## Deployment

Deployment erfolgt automatisch über `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages)
bei jedem Push auf `main`. **Einmalig manuell einzurichten:** Repo-Settings → *Pages* →
*Build and deployment* → *Source* auf **„GitHub Actions"** stellen (nicht „Deploy from a branch"),
sonst bleibt die Seite trotz erfolgreichem Workflow-Lauf leer.

## Manuelle Druck-Prüfung

Automatisiert (Vitest) wird die Korrektheit des Rotationsalgorithmus, der Validierung und des
State-Managements geprüft. Folgendes lässt sich nur manuell im Browser-Druckdialog verifizieren und
sollte nach größeren Änderungen an den Druckansichten erneut geprüft werden:

- Randfälle: 2 Boote/1 Wettfahrt (Minimum), 30 Boote/6 Wettfahrten (Maximum), ein ungerader Wert wie
  5 Boote/4 Wettfahrten (Warnung muss erscheinen und mitgedruckt werden).
- Los-Zettel: sauber schneidbar entlang der gestrichelten Ränder, keine Zettel werden über eine
  Seitengrenze hinweg zerschnitten.
- Wettfahrtleitungs-Übersicht bei 30 Losen: Kopfzeile wiederholt sich auf jeder Folgeseite.
- Graustufendruck/Fotokopie: Übersichtstabelle bleibt ohne Farbe lesbar (fette Rahmen, keine
  Bedeutung, die nur über Farbe transportiert wird).
- Browser-Kopf-/Fußzeilen im Druckdialog deaktivieren (siehe Hinweistext auf den Druckseiten) für
  ein sauberes Ergebnis.
