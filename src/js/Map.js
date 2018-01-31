import mapboxgl from 'mapbox-gl';
import 'whatwg-fetch';

import colorLerp from 'color-lerp';

import Statistics from './Statistics.js';

// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
import { mapboxToken, wmsLayerUrls, kreiseNRWUrl } from './../config.js';
import CSVParser from './CSVParser.js';

let KreiseNRW;
let feature_dataset;
let current_feature;

// min and max colors
let lowColor = '#80BCFF';
let highColor = '#1A5FAC';

let map = undefined;

export default class Map {
  /**
   *
   * @param {String} container HTML div for the map
   * @param {Array} center [lat, lon] center of map
   * @param {Number} zoom initial zoom level
   * @param {function} loadDone callback function when load was successful
   */
  constructor(container, center, zoom, loadDone) {
    mapboxgl.accessToken = mapboxToken;
    map = new mapboxgl.Map({
      container: container,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/light-v9'
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    map.on('load', () => {
      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      // map.on('click', 'kreisgrenzen', function (e) {
      //   if (e.features.length > 0) {
      //     new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.Gemeindename).addTo(map);
      //   }
      // });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', function() {
        map.getCanvas().style.cursor = '';
      });
    });

    map.on('style.load', () => {
      // load initial NRW data and callback when load is done
      this.loadData(loadDone);

      // show current Kreis on legend overlay
      map.on('mousemove', 'kreisgrenzen', function(e) {
        const states = map.queryRenderedFeatures(e.point, {
          layers: ['kreisgrenzen']
        });

        // console.log(states)

        if (states.length > 0) {
          // map.setFilter('kreis-border-hover', [
          //   '==',
          //   'Gemeindename',
          //   states[0].properties.Gemeindename
          // ]);

          let myString = '';
          if (states[0].properties[current_feature]) {
            myString =
              `<h3><strong>${states[0].properties.Gemeindename}</strong></h3>` +
              `<p><strong><em>${
                states[0].properties[current_feature]
              }</strong> ${current_feature}</em></p>`;
          } else {
            myString = `<h3><strong>${
              states[0].properties.Gemeindename
            }</strong></h3>`;
          }
          document.getElementById('pd').innerHTML = myString;
        } else {
          document.getElementById('pd').innerHTML =
            '<p>Bewege die Maus über die Kreise</p>';
        }
      });
    });

    // map.on('mouseleave', 'kreisgrenzen', function() {
    //   map.setFilter('kreis-border-hover', ['==', 'Gemeindename', '']);
    // });
  }

  /**
   * @description Loads data in the map
   * @param {function} loadDone called when data was fetched successful
   */
  loadData(loadDone) {
    console.log('fetching data');
    fetch(kreiseNRWUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        console.log('parsed json', json);
        KreiseNRW = json;

        map.addSource('KreiseNRW', {
          type: 'geojson',
          data: KreiseNRW
        });
        map.addLayer({
          id: 'kreisgrenzen',
          type: 'fill',
          source: 'KreiseNRW',
          paint: {
            'fill-opacity': 0.8,
            'fill-color': '#5266B8'
          }
        });
        // gemeinde border
        // map.addLayer({
        //   id: 'kreis-border-hover',
        //   type: 'line',
        //   source: 'KreiseNRW',
        //   layout: {},
        //   paint: {
        //     'line-color': '#627BC1',
        //     'line-width': 5
        //   },
        //   filter: ['==', 'Gemeindename', '']
        // });

        loadDone(true);
      })
      .catch(function(ex) {
        loadDone(false);
        console.log('parsing failed', ex);
      });
  }

  /**
   * @description changes the map style
   * TODO: choosen feature gets lost on style change
   * @param {String} style style to be applied to the map
   */
  changeStyle(style) {
    const layers = Object.keys(wmsLayerUrls);
    if (layers.includes(style)) {
      if (!map.getLayer(style)) {
        map.addLayer(
          {
            id: style,
            paint: {},
            type: 'raster',
            source: {
              type: 'raster',
              tileSize: 256,
              tiles: wmsLayerUrls[style]
            }
          },
          'kreisgrenzen'
        );
      } else {
        map.setLayoutProperty(style, 'visibility', 'visible');
      }
      layers.splice(layers.findIndex(l => l === style), 1);
    } else {
      map.setStyle(`mapbox://styles/mapbox/${style}-v9`);
    }

    for (const l of layers) {
      if (map.getLayer(l)) {
        map.setLayoutProperty(l, 'visibility', 'none');
      }
    }
  }

  /**
   * @description changes transparency of overlay
   * @param {Number} transparency transparency value between 0 and 100
   */
  changeTransparency(transparency) {
    map.setPaintProperty('kreisgrenzen', 'fill-opacity', transparency / 100);
  }

  /**
   * @description changes low or high color value
   * @param {string} type "low" or "high"
   * @param {string} value hexadecimal value
   */
  changeColor(type, value) {
    if (type === 'low') {
      lowColor = value;
    } else if (type === 'high') {
      highColor = value;
    }

    if (current_feature) {
      if (map.getLayer('kreisgrenzen')) {
        map.setPaintProperty('kreisgrenzen', 'fill-color', {
          property: current_feature,
          stops: [
            [this._getMinFeature(KreiseNRW, current_feature), lowColor],
            [this._getMaxFeature(KreiseNRW, current_feature), highColor]
          ]
        });
      }
    }
    if (map.getLayer('feinstaub_band_layer')) {
      map.setPaintProperty('feinstaub_band_layer', 'fill-color', {
        property: 'DN',
        stops: [[0, lowColor], [45, highColor]]
      });
    }

    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      current_feature
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      current_feature
    );
    document.getElementById(
      'legend-bar'
    ).style.background = `linear-gradient(to right, ${lowColor}, ${highColor})`;
  }

  /**
   * @description gets data from data folder and sets styling
   * @param {string} data_source file name of json data source inside of the data folder
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  setData(data_source, feature) {
    /* eslint-disable global-require */
    const data = require(`./../data/${data_source}.json`);
    /* eslint-enable global-require */
    this._setDataFromJSON(data, feature);
  }

  /**
   * @description changes the current year and applies changes to layer
   * @param {String} year
   */
  updateData(year = this._getFirstYearOfDataset()) {
    KreiseNRW.features.map(kreis => {
      feature_dataset.forEach(kreisPop => {
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === kreisPop.AGS
        ) {
          kreis.properties[current_feature] = Number(kreisPop.data[year]);
        }
      });
    });
    console.log(current_feature);

    map.getSource('KreiseNRW').setData(KreiseNRW);
    map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: current_feature,
      stops: [
        [this._getMinFeature(KreiseNRW, current_feature), lowColor],
        [this._getMaxFeature(KreiseNRW, current_feature), highColor]
      ]
    });
    document.getElementById('year').textContent = year;
    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      current_feature
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      current_feature
    );
  }

  /**
   * import CSV file
   */
  importCSV() {
    const file = document.getElementById('custom_csv_input').files[0];
    if (file.type === 'text/csv') {
      const parser = new CSVParser();

      parser.getAsText(file, data => {
        console.log(data);
        this._setDataFromJSON(data, file.name);
      });
    } else {
      $('#csv_info').text('Die gewählte Datei ist keine .csv Datei!');
    }
  }

  /**
   * @description adds a layer of fine dust data to the map
   * @param {string} name file name of file e.b. band12_02112017
   */
  addFeinstaubLayer(name) {
    /* eslint-disable global-require */
    const band = require(`./../data/${name}.json`);
    /* eslint-enable global-require */

    if (!map.getLayer('feinstaub_band_layer')) {
      map.addSource('feinstaub_band', {
        type: 'geojson',
        data: band
      });
      map.addLayer({
        id: 'feinstaub_band_layer',
        type: 'fill',
        source: 'feinstaub_band',
        paint: {
          'fill-color': {
            property: 'DN',
            stops: [[0, lowColor], [45, highColor]]
          },
          'fill-opacity': 0.8
        }
      });
    } else {
      map.getSource('feinstaub_band').setData(band);
    }
  }

  /**
   * @description removes fine dust layer
   */
  removeFeinstaubLayer() {
    map.removeSource('feinstaub_band');
    map.removeLayer('feinstaub_band_layer');
  }

  changeStatistics(type) {
    switch (type) {
      case 'STANDARD':
        this._applyStandard();
        break;
      case 'EQUAL_INTERVAL':
        this._applyStatistic(
          Statistics.getEqualInterval(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'STD_DEVIATION':
        this._applyStatistic(
          Statistics.getClassStdDeviation(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'ARITHMETIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassArithmeticProgression(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'GEOMETRIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassGeometricProgression(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'QUANTILE':
        this._applyStatistic(
          Statistics.getClassQuantile(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'JENKS':
        this._applyStatistic(
          Statistics.getClassJenks(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
    }
  }

  _applyStandard() {
    map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: current_feature,
      stops: [
        [this._getMinFeature(KreiseNRW, current_feature), lowColor],
        [this._getMaxFeature(KreiseNRW, current_feature), highColor]
      ]
    });
  }

  _applyStatistic(classes) {
    const colors = colorLerp(
      lowColor,
      highColor,
      Number(document.getElementById('stats_classes').value) + 1,
      'hex'
    );

    const stops = ['step', ['get', current_feature], '#BABABA'];

    classes.forEach((e, i) => {
      stops.push(e);
      stops.push(colors[i]);
    });

    console.log(stops);
    map.setPaintProperty('kreisgrenzen', 'fill-color', stops);
  }

  /**
   * @description styles layer according to data
   * @param {json object} data data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setDataFromJSON(data, feature) {
    feature_dataset = data;
    current_feature = feature;

    document.getElementById('legend-heading').innerHTML = feature;

    // map feature to layer
    KreiseNRW.features.map(kreis => {
      data.forEach(data_feature => {
        if (!String(data_feature.AGS).startsWith('0')) {
          data_feature.AGS = `0${data_feature.AGS}`;
        }
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === data_feature.AGS
        ) {
          kreis.properties[feature] = Number(data_feature.data[0]);
        }
      });
    });

    console.log(KreiseNRW);

    // apply styling
    map.getSource('KreiseNRW').setData(KreiseNRW);
    map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: feature,
      stops: [
        [this._getMaxFeature(KreiseNRW, feature), lowColor],
        [this._getMinFeature(KreiseNRW, feature), highColor]
      ]
    });

    // update ui elements
    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      current_feature
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      current_feature
    );
    document.getElementById('timeslider').removeAttribute('hidden');
    document.getElementById(
      'timeslide-min'
    ).innerHTML = this._getFirstYearOfDataset();
    document.getElementById(
      'timeslide-max'
    ).innerHTML = this._getLastYearOfDataset();
    document
      .getElementById('slider')
      .setAttribute('min', this._getFirstYearOfDataset());
    document
      .getElementById('slider')
      .setAttribute('max', this._getLastYearOfDataset());
    this.updateData();
  }

  /**
   * @description returns the max value according to data and feature
   * @param {json object} data data where you want to get the max value
   * @param {string} feature
   * @returns max value
   */
  _getMaxFeature(data, feature) {
    let maxVal = 0;
    data.features.forEach(child => {
      if (child.properties[feature] > maxVal) {
        maxVal = child.properties[feature];
      }
    });

    return maxVal;
  }

  /**
   * @description returns the min value according to data and feature
   * @param {json object} data data where you want to get the min value
   * @param {string} feature
   * @returns min value
   */
  _getMinFeature(data, feature) {
    let minVal = 999999999999;
    data.features.forEach(child => {
      if (child.properties[feature] < minVal) {
        minVal = child.properties[feature];
      }
    });

    return minVal;
  }

  /**
   * @description first year of current dataset
   * @returns first year of current dataset
   */
  _getFirstYearOfDataset() {
    return Object.keys(feature_dataset[0].data)[0];
  }

  /**
   * @description last year of current dataset
   * @returns last year of current dataset
   */
  _getLastYearOfDataset() {
    const dataset_data = Object.keys(feature_dataset[0].data);

    return dataset_data[dataset_data.length - 1];
  }

  _getData() {
    const temp = [];
    KreiseNRW.features.forEach(e => {
      const val = e.properties[current_feature];
      if (val) {
        temp.push(e.properties[current_feature]);
      }
    });

    return temp;
  }
}
