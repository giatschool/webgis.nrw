import mapboxgl from 'mapbox-gl';
import 'whatwg-fetch';

import colorLerp from 'color-lerp';

import Statistics from './Statistics.js';

// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
import { mapboxToken, wmsLayerUrls } from './../config.js';
import CSVParser from './CSVParser.js';

let KreiseNRW;
let feature_dataset;
let current_feature;
let current_year;
let current_legend = $('.scale-legend')[0];

// min and max colors
let lowColor = '#80BCFF';
let highColor = '#1A5FAC';

const statistics_state = {
  enabled: false,
  type: '',
  colorStops: []
};

const map = undefined;

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
    this.map = new mapboxgl.Map({
      container: container,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/light-v9',
      preserveDrawingBuffer: true // to print map
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Add home button (Small hack since Mapbox is not supporting this..)
    const zoomOutBtn = $('.mapboxgl-ctrl-zoom-out');
    const homeButton = $('.mapboxgl-ctrl-zoom-out').clone();
    homeButton.on('click', () => {
      this.map.flyTo({ center: center, zoom: zoom });
    });
    homeButton.removeClass('mapboxgl-ctrl-zoom-out');
    homeButton.append('<span class="material-icons">home</span>');
    homeButton.removeAttr('aria-label');
    zoomOutBtn.after(homeButton);

    // map.on('load', () => {
    //   this.map.fitBounds(
    //     // Boundary of NRW
    //     new mapboxgl.LngLatBounds([5.8664, 50.3276], [9.4623, 52.5325]),
    //     {
    //       padding: 20
    //     }
    //   );

    this.map.on('load', () => {
      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'kreisgrenzen', e => {
        if (e.features.length > 0) {
          console.log(e.features[0].properties);
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.Gemeindename)
            .addTo(this.map);
        }
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mouseenter', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', function() {
        map.getCanvas().style.cursor = '';
      });
    });

    this.map.on('style.load', () => {
      // load initial NRW data and callback when load is done
      this.loadData(loadDone);

      // show current Kreis on legend overlay
      this.map.on('mousemove', e => {
        if (this.map.getLayer('kreisgrenzen')) {
          const states = this.map.queryRenderedFeatures(e.point, {
            layers: ['kreisgrenzen']
          });

          if (states.length > 0) {
            let myString = '';
            if (states[0].properties[current_feature]) {
              myString =
                `<h4><strong>${
                  states[0].properties.Gemeindename
                }</strong></h4>` +
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
        }
      });
    });
    // map.on('mouseleave', 'kreisgrenzen', function() {
    //   map.setFilter('kreis-border-hover', ['==', 'Gemeindename', '']);
    // });
  }

  getMap() {
    return this.map;
  }

  getTitle() {
    return current_feature;
  }

  getYear() {
    return current_year;
  }

  /**
   * @description Loads data in the map
   * @param {function} loadDone called when data was fetched successful
   */
  loadData(loadDone) {
    // fetch('/assets/data/nw_dvg2_krs.json')
    //   .then(function(response) {
    //     response.json().then(function(data) {
    //       KreiseNRW = data;
    //     });
    //   })
    //   .catch(function(ex) {
    //     console.log('parsing failed', ex);
    //   });

    /* eslint-disable global-require */
    KreiseNRW = require('./../data/nw_dvg2_krs.json');

    this.map.addSource('KreiseNRW', {
      type: 'geojson',
      data: KreiseNRW
    });
    this.map.addLayer({
      id: 'kreisgrenzen',
      type: 'fill',
      source: 'KreiseNRW',
      paint: {
        'fill-opacity': 0.8,
        'fill-color': '#5266B8'
      }
    });
    loadDone(true);
  }

  /**
   * @description centers the the map around NRW to fit the viewport
   */
  center() {
    this.map.resize();
    this.map.fitBounds(
      // Fit around the center of Northrhine-Westphalia
      new mapboxgl.LngLatBounds([5.8664, 50.3276], [9.4623, 52.5325], {
        padding: 20
      })
    );
  }

  /**
   * @description changes the map style
   * TODO: choosen feature gets lost on style change
   * @param {String} style style to be applied to the map
   */
  changeStyle(style) {
    const layers = Object.keys(wmsLayerUrls);
    if (layers.includes(style)) {
      if (!this.map.getLayer(style)) {
        this.map.addLayer(
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
        this.map.setLayoutProperty(style, 'visibility', 'visible');
      }
      layers.splice(layers.findIndex(l => l === style), 1);
    } else if (style === 'empty') {
      this.map.setStyle('mapbox://styles/felixaetem/cjdncto7a081u2qsbfwe2750v');
    } else {
      this.map.setStyle(`mapbox://styles/mapbox/${style}-v9`);
    }

    for (const l of layers) {
      if (this.map.getLayer(l)) {
        this.map.setLayoutProperty(l, 'visibility', 'none');
      }
    }
  }

  /**
   * @description changes transparency of overlay
   * @param {Number} transparency transparency value between 0 and 100
   */
  changeTransparency(transparency) {
    this.map.setPaintProperty(
      'kreisgrenzen',
      'fill-opacity',
      transparency / 100
    );
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
      if (this.map.getLayer('kreisgrenzen')) {
        this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
          property: current_feature,
          stops: [
            [this._getMinFeature(KreiseNRW, current_feature), lowColor],
            [this._getMaxFeature(KreiseNRW, current_feature), highColor]
          ]
        });
      }
    }
    if (this.map.getLayer('feinstaub_band_layer')) {
      this.map.setPaintProperty('feinstaub_band_layer', 'fill-color', {
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
    // const url = `./../data/${data_source}.json`;

    /* eslint-disable global-require */
    const _data = require(`./../data/${data_source}.json`);

    this._setDataFromJSON(_data, feature);

    // fetch(url)
    //   .then(response => {
    //     response.json().then(_data => {
    //       /* eslint-enable global-require */
    //       return this._setDataFromJSON(_data, feature);
    //     });
    //   })
    //   .catch(ex => {
    //     console.log('parsing failed', ex);
    //   });
  }

  /**
   * @description changes the current year and applies changes to layer
   * @param {String} year
   */
  updateData(year = this._getFirstYearOfDataset()) {
    current_year = year;
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

    if (statistics_state.enabled) {
      this.changeStatistics(statistics_state.type);
      this.map.setPaintProperty(
        'kreisgrenzen',
        'fill-color',
        statistics_state.colorStops
      );
    } else {
      this.map.getSource('KreiseNRW').setData(KreiseNRW);
      this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
        property: current_feature,
        stops: [
          [this._getMinFeature(KreiseNRW, current_feature), lowColor],
          [this._getMaxFeature(KreiseNRW, current_feature), highColor]
        ]
      });
    }

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

    if (!this.map.getLayer('feinstaub_band_layer')) {
      this.map.addSource('feinstaub_band', {
        type: 'geojson',
        data: band
      });
      this.map.addLayer({
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
      this.map.getSource('feinstaub_band').setData(band);
    }
  }

  /**
   * @description removes fine dust layer
   */
  removeFeinstaubLayer() {
    this.map.removeSource('feinstaub_band');
    this.map.removeLayer('feinstaub_band_layer');
  }

  resize() {
    this.map.resize();
  }

  changeStatistics(type) {
    statistics_state.type = type;

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
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: current_feature,
      stops: [
        [this._getMinFeature(KreiseNRW, current_feature), lowColor],
        [this._getMaxFeature(KreiseNRW, current_feature), highColor]
      ]
    });
    this._hideLegend();
    statistics_state.enabled = false;
  }

  _hideLegend() {
    $('.discrete-legend').hide();
    $('.scale-legend').show();

    current_legend = $('.scale-legend')[0];
  }

  getLegend() {
    return current_legend;
  }

  _applyStatistic(classes) {
    const colors = colorLerp(
      lowColor,
      highColor,
      Number(document.getElementById('stats_classes').value),
      'hex'
    );

    const stops = ['step', ['get', current_feature]];

    $('.legend-labels').empty();

    colors.forEach((e, i) => {
      if (i !== 0) {
        stops.push(classes[i]);
      }
      stops.push(e);

      const liFlex =
        (classes[i + 1] - classes[i]) /
        (classes[classes.length - 1] - classes[0]);

      /**
       * TODO: show amount of elements in class
       * add the following snippet to the li tag and uncomment the const count line:
       * data-toggle="tooltip" data-placement="top" data-html="true" title="${count}"
       */
      // const count = this._getCountInRange(classes[i], classes[i + 1]);
      const lowerBound = Math.round(classes[i] * 10) / 10;
      const upperBound = Math.round(classes[i + 1] * 10) / 10;

      $('.legend-labels').append(
        `<li style="flex: ${liFlex}">
          <span style="background:${e};">
          </span><br/>${lowerBound}<br />-<br />${upperBound}</li>`
      );
    });

    $('[data-toggle="tooltip"]').tooltip(); // initialize new poppers

    this.map.setPaintProperty('kreisgrenzen', 'fill-color', stops);

    statistics_state.enabled = true;
    statistics_state.colorStops = stops;

    $('.discrete-legend').show();
    $('.scale-legend').hide();

    current_legend = $('.discrete-legend')[0];
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

    // apply styling
    this.map.getSource('KreiseNRW').setData(KreiseNRW);
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
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

    if (statistics_state.enabled) {
      statistics_state.enabled = false;
      this._hideLegend();
    }
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
   * @description years of  current dataset
   * @returns years of current dataset
   */
  _getYearsOfDataset() {
    return Object.keys(feature_dataset[0].data);
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

  // TODO consider number that are exactly on min / max
  _getCountInRange(min, max) {
    let counter = 0;
    this._getData().forEach(e => {
      if (e >= min && e <= max) {
        counter++;
      }
    });

    return counter;
  }
}
