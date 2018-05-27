# webgis.nrw
The webgis.nrw is an open platform for modern teaching in NRW.

## Getting Started
To run the webgis.nrw on your local machine, do the following steps:

### Install
`yarn install`

### Run Webpack and its server
- `yarn dev`
- `yarn start`

The application is now running at [localhost:8080](localhost:8080)

## Deployment
Run `yarn prod` to create a production version of the webgis.nrw
The output is in the `dist` folder. 
You can serve the files by e.g. using serve: `serve dist`

## Built with
- [MapboxGL](https://github.com/mapbox/mapbox-gl-js) Map
- [Bootstrap](https://getbootstrap.com/) Styling
- [Webpack](https://webpack.js.org/) Module Bundler
- multiple, smaller (but very useful) dependencies
- and - of course - ❤️

## Authors
The project is currently maintained by [@nstef](https://github.com/nsteffens), [@felixerdy](https://github.com/felixerdy), [@robarto](https://github.com/robarto) and [@bgunt](https://github.com/bgunt)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

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
