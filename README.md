# Bootswechsel

Fairer Bootsrotations-Planer für Regatten der Segelschule der TU München. Berechnet, welches Team in
welcher Wettfahrt welches Boot bekommt, sodass jedes Team nach jeder Wettfahrt ein anderes Boot
erhält und der Wechsel auf dem Wasser als paarweiser Tausch (bzw. bei ungerader Boots-/Teamzahl als
ein Dreier-Tausch) durchführbar ist. Zeigt die Übersicht für die Wettfahrtleitung direkt auf der
Startseite (druckbar und als .xlsx herunterladbar) und erzeugt eine separate Druckansicht für die
Los-Zettel zum Ausschneiden und blinden Ziehen aus der Urne.

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
  frei eingegebener Bootslisten. Die Konfiguration kennt intern weiterhin einen `mode: 'count' |
  'list'`; im Formular (`ConfigForm.tsx`) wird das über eine Checkbox „Boote sind nicht durchgehend
  nummeriert" gesteuert, die das Freitextfeld inline ein-/ausblendet, statt auf eine andere
  Ansicht zu wechseln.
- `src/core/export/committeeOverviewXlsx.ts` — baut die Wettfahrtleitungs-Übersicht als
  Zeilen-Array (getestet) und löst darüber den `.xlsx`-Download aus. Das `xlsx`-Paket (SheetJS) wird
  dabei per dynamischem `import()` erst beim Klick auf „Als Excel herunterladen" nachgeladen, damit
  es nicht das Haupt-Bundle aufbläht, das jeder Nutzer beim ersten Laden herunterlädt. Installiert ist
  bewusst SheetJS' eigene, gepatchte CDN-Distribution (`xlsx@https://cdn.sheetjs.com/...`) statt der
  veralteten `xlsx`-Version im npm-Registry, die zwei ungepatchte Sicherheitslücken hat.
- `src/state/useScheduleStore.ts` — Zustand-Store mit `localStorage`-Persistenz (Plan-Ergebnis und
  Regattaname), damit auch die separate Los-Zettel-Seite nach einem Neuladen den zuletzt erzeugten
  Plan zeigt.
- `src/components/`, `src/pages/` — Konfigurationsformular (inkl. optionalem Regattanamen, der als
  Überschrift auf beiden Druckansichten und im xlsx-Export erscheint) und Live-Vorschau auf der
  Startseite, die zugleich die druckbare Wettfahrtleitungs-Übersicht ist (kein eigener Menüpunkt,
  kein „Zurück zur Konfiguration" nötig — Drucken blendet Formular und Buttons einfach per
  `@media print` aus). Nur die Los-Zettel haben noch eine eigene Route (`/lottery-slips`), weil ihr
  Seitenlayout fürs Ausschneiden von der Bildschirmansicht abweicht.

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
- Wettfahrtleitungs-Übersicht (Startseite, „Übersicht drucken") bei 30 Losen: Kopfzeile wiederholt
  sich auf jeder Folgeseite; Konfigurationsformular und Buttons dürfen beim Drucken nicht erscheinen.
- Graustufendruck/Fotokopie: Übersichtstabelle bleibt ohne Farbe lesbar (fette Rahmen, keine
  Bedeutung, die nur über Farbe transportiert wird).
- Browser-Kopf-/Fußzeilen im Druckdialog deaktivieren (siehe Hinweistext auf den Druckseiten) für
  ein sauberes Ergebnis.
- xlsx-Export: heruntergeladene Datei öffnet in Excel/LibreOffice/Numbers, Dateiname enthält den
  Regattanamen (sofern gesetzt), Tabelleninhalt stimmt mit der Bildschirmansicht überein.
