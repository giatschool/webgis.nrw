# webgis.nrw

# Install
`yarn install`

# Run Dev
- `yarn run dev`
- `sudo yarn start`

The application is now running at [localhost](localhost)

----

# Ergebnisse Hackathon

## Titel
WebGIS für Schulen

## Ziele
* Einfache webGIS-Anwendung für Unterrichtsfächer und -themen
* Einbindung von Open Data Daten zu verschiedenen Themen
* vorkonfigurierte Karten mit aktuellen, offenen Daten

### Zielgruppe
* Lehrer
* (Schüler)

## Eingesetzte Technologien
* Mapbox
* ldproxy für Geometriedaten (Gemeinden)

## Datengrundlage
* Open Data NRW - Themantische Daten
* Amtliche Geobasisdaten für Gemeindegeometrien
* Copernicus

## Arbeitsschritte und -pakete

### GUI
* Timeslider
* Basemaps dynamisch (Zoomlevel)
* Eigenen Datensatz integrieren

### Datenaufbereitung
* Aufbereitung der CSV-Dateien
** Reduzierung des Attributumfang
** Ergänzung der Jahreszahlen
* Datenumfang:
** ...
* Datentransformierung nach JSON

# Todo (nach Hackathon)

* Duale Map für Vergleiche
