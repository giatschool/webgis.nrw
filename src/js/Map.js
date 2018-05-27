import mapboxgl from 'mapbox-gl';
import 'whatwg-fetch';

import colorLerp from 'color-lerp';

import Statistics from './Statistics.js';

import { mapboxToken, wmsLayerUrls } from './../config.js';
import CSVParser from './CSVParser.js';

let KreiseNRW;
//let feature_dataset;
//let current_year;
//let current_legend = $('.scale-legend')[0];
/*
const statistics_state = {
  enabled: false,
  type: '',
  colorStops: []
};
*/
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

    // A few class variables

    this.feature_dataset = undefined;

    this.statistics_state = {
      enabled: false,
      type: '',
      colorStops: []
    };

    // min and max colors
    this.lowColor = '#80BCFF';
    this.highColor = '#1A5FAC';

    // Set legend to the according one when dualMode is activated
    if ($('.secLegend').length !== 0) {
      this.legend = $('.secLegend')[0];
      this.state_text = $('.secLegend #pd')[0];
    } else {
      this.legend = $('.legend-wrapper')[0];
      this.state_text = $('#pd')[0];
    }

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    this.map.on('load', () => {
      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'kreisgrenzen', e => {
        if (e.features.length > 0) {
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
            if (
              this.feature_dataset &&
              states[0].properties[this.feature_dataset.title]
            ) {
              myString =
                `<h4><strong>${
                  states[0].properties.Gemeindename
                }</strong></h4>` +
                `<p><strong><em>${
                  states[0].properties[this.feature_dataset.title]
                }</strong> ${this.feature_dataset.unit}</em></p>`;
            } else {
              myString = `<h4><strong>${
                states[0].properties.Gemeindename
              }</strong></h4>`;
            }
            this.state_text.innerHTML = myString;
          } else {
            this.state_text.innerHTML =
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
    return this.feature_dataset.title;
  }

  getYear() {
    return this.current_year;
  }

  /**
   * @description Loads data in the map
   * @param {function} loadDone called when data was fetched successful
   */
  loadData(loadDone) {
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
   * @description returns the overlay transperency
   */
  getTransparency() {
    return this.map.getPaintProperty('kreisgrenzen', 'fill-opacity');
  }

  /**
   * @description changes low or high color value
   * @param {string} type "low" or "high"
   * @param {string} value hexadecimal value
   */
  changeColor(type, value) {
    if (type === 'low') {
      this.lowColor = value;
    } else if (type === 'high') {
      this.highColor = value;
    }

    if (this.feature_dataset.title) {
      if (this.map.getLayer('kreisgrenzen')) {
        this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
          property: this.feature_dataset.title,
          stops: [
            [
              this._getMinFeature(KreiseNRW, this.feature_dataset.title),
              this.lowColor
            ],
            [
              this._getMaxFeature(KreiseNRW, this.feature_dataset.title),
              this.highColor
            ]
          ]
        });
      }
    }
    if (this.map.getLayer('feinstaub_band_layer')) {
      this.map.setPaintProperty('feinstaub_band_layer', 'fill-color', {
        property: 'DN',
        stops: [[0, this.lowColor], [45, this.highColor]]
      });
    }

    $('.activeLegend #legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title
    );
    $('.activeLegend #legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title
    );
    $(
      '.activeLegend #legend-bar'
    ).style.background = `linear-gradient(to right, ${this.lowColor}, ${
      this.highColor
    })`;
  }

  /**
   * @description gets data from data folder and sets styling
   * @param {string} data_source file name of json data source inside of the data folder
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  setData(data_source) {
    // const url = `./../data/${data_source}.json`;

    /* eslint-disable global-require */
    const _data = require(`./../data/${data_source}.json`);

    this._setDataFromJSON(_data);
  }

  /**
   * @description changes the current year and applies changes to layer
   * @param {String} year
   */
  updateData(year = this._getFirstYearOfDataset()) {
    this.current_year = year;
    KreiseNRW.features.map(kreis => {
      this.feature_dataset.data.forEach(kreisPop => {
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === kreisPop.AGS
        ) {
          kreis.properties[this.feature_dataset.title] = Number(
            kreisPop.data[year]
          );
        }
      });
    });

    if (this.statistics_state.enabled) {
      this.changeStatistics(this.statistics_state.type);
      this.map.setPaintProperty(
        'kreisgrenzen',
        'fill-color',
        this.statistics_state.colorStops
      );
    } else {
      this.map.getSource('KreiseNRW').setData(KreiseNRW);
      this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
        property: this.feature_dataset.title,
        stops: [
          [
            this._getMinFeature(KreiseNRW, this.feature_dataset.title),
            this.lowColor
          ],
          [
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title),
            this.highColor
          ]
        ]
      });
    }

    $('.activeLegend #year')[0].textContent = year;
    $('.activeLegend #legend-min')[0].innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title
    );
    $('.activeLegend #legend-max')[0].innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title
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
            stops: [[0, this.lowColor], [45, this.highColor]]
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
    this.statistics_state.type = type;

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
      property: this.feature_dataset.title,
      stops: [
        [
          this._getMinFeature(KreiseNRW, this.feature_dataset.title),
          this.lowColor
        ],
        [
          this._getMaxFeature(KreiseNRW, this.feature_dataset.title),
          this.highColor
        ]
      ]
    });
    this._hideLegend();
    this.statistics_state.enabled = false;
  }

  _hideLegend() {
    $('.discrete-legend').hide();
    $('.scale-legend').show();
  }

  getLegend() {
    return this.legend;
  }

  _applyStatistic(classes) {
    const colors = colorLerp(
      this.lowColor,
      this.highColor,
      Number(document.getElementById('stats_classes').value),
      'hex'
    );

    const stops = ['step', ['get', this.feature_dataset.title]];

    $('.activeLegend .legend-labels').empty();

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

      $('.activeLegend .legend-labels').append(
        `<li style="flex: ${liFlex}">
          <span style="background:${e};">
          </span><br/>${lowerBound}<br />-<br />${upperBound}</li>`
      );
    });

    $('[data-toggle="tooltip"]').tooltip(); // initialize new poppers

    this.map.setPaintProperty('kreisgrenzen', 'fill-color', stops);

    this.statistics_state.enabled = true;
    this.statistics_state.colorStops = stops;

    $('.activeLegend .discrete-legend').show();
    $('.activeLegend .scale-legend').hide();

    //current_legend = $('.discrete-legend')[0];
  }

  /**
   * @description styles layer according to data
   * @param {json object} data data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setDataFromJSON(data) {
    this.feature_dataset = data;

    $('.activeLegend #legend-heading')[0].innerHTML = data.title;

    // map feature to layer
    KreiseNRW.features.map(kreis => {
      this.feature_dataset.data.forEach(data_feature => {
        if (!String(data_feature.AGS).startsWith('0')) {
          data_feature.AGS = `0${data_feature.AGS}`;
        }
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === data_feature.AGS
        ) {
          kreis.properties[data.title] = Number(data_feature.data[0]);
        }
      });
    });

    // apply styling
    this.map.getSource('KreiseNRW').setData(KreiseNRW);
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: data.title,
      stops: [
        [this._getMaxFeature(KreiseNRW, data.title), this.lowColor],
        [this._getMinFeature(KreiseNRW, data.title), this.highColor]
      ]
    });

    // update ui elements
    $('.activeLegend #legend-min')[0].innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title
    );
    $('.activeLegend #legend-max')[0].innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title
    );

    $('.activeLegend #timeslider')[0].removeAttribute('hidden');
    $(
      '.activeLegend #timeslide-min'
    )[0].innerHTML = this._getFirstYearOfDataset();
    $(
      '.activeLegend #timeslide-max'
    )[0].innerHTML = this._getLastYearOfDataset();

    $('.activeLegend #slider')[0].setAttribute(
      'min',
      this._getFirstYearOfDataset()
    );

    $('.activeLegend #slider')[0].setAttribute(
      'max',
      this._getLastYearOfDataset()
    );

    if (this.statistics_state.enabled) {
      this.statistics_state.enabled = false;
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
    return Object.keys(this.feature_dataset.data[0].data);
  }

  /**
   * @description first year of current dataset
   * @returns first year of current dataset
   */
  _getFirstYearOfDataset() {
    return Object.keys(this.feature_dataset.data[0].data)[0];
  }

  /**
   * @description last year of current dataset
   * @returns last year of current dataset
   */
  _getLastYearOfDataset() {
    const dataset_data = Object.keys(this.feature_dataset.data[0].data);

    return dataset_data[dataset_data.length - 1];
  }

  _getData() {
    const temp = [];
    KreiseNRW.features.forEach(e => {
      const val = e.properties[this.feature_dataset.title];
      if (val) {
        temp.push(e.properties[this.feature_dataset.title]);
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

  _addHomeButton() {
    const currentMaps = $('.mapboxgl-ctrl-zoom-out').parents('.map').length;
    // save the zoomOutBtn and create a homeButton
    let zoomOutBtn;
    let homeButton;

    switch (currentMaps) {
      case 1:
        zoomOutBtn = $('#map .mapboxgl-ctrl-zoom-out');
        homeButton = $('#map .mapboxgl-ctrl-zoom-out').clone();
        break;
      case 2:
        zoomOutBtn = $('#dual_map .mapboxgl-ctrl-zoom-out');
        homeButton = $('#dual_map .mapboxgl-ctrl-zoom-out').clone();
        break;
      default:
        console.log(
          'You are trying to add a button to a map that is not planned to exist!'
        );
        break;
    }

    homeButton.on('click', () => {
      this.getMap().flyTo({
        center: [7.555, 51.478333],
        zoom: 7
      });
    });
    homeButton.removeClass('mapboxgl-ctrl-zoom-out');
    homeButton.append('<span class="material-icons">home</span>');
    homeButton.removeAttr('aria-label');
    zoomOutBtn.after(homeButton);
  }
}
