import mapboxgl from 'mapbox-gl';
// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
const config = require('./../config.js');
import 'whatwg-fetch'

var KreiseNRW

var feature_dataset
var current_feature = ''

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiJjajNicW1lM2QwMDR3MzNwOWdyaXAzN282In0.Pci5KvNNLCjjxy9b4p0n7g';
var map = new mapboxgl.Map({
  container: 'map',
  center: [
    7.8, 51.5
  ],
  zoom: 6,
  style: (
    config.theme == 'light'
    ? 'mapbox://styles/mapbox/light-v9'
    : 'mapbox://styles/mapbox/dark-v9')
})

map.on('load', () => {
  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'kreisgrenzen', function(e) {
    if (e.features.length > 0) {
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.Gemeindename).addTo(map);
    }
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', function() {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', function() {
    map.getCanvas().style.cursor = '';
  });

  map.on('mousemove', function(e) {
    var states = map.queryRenderedFeatures(e.point, {layers: ['kreisgrenzen']});
    if (states.length > 0) {
      document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.Gemeindename + '</strong></h3><p><strong><em>' + states[0].properties.population + '</strong> Einwohner</em></p>';
      // document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.GEN + '</strong></h3>';
    } else {
      document.getElementById('pd').innerHTML = '<p>Hover over a state!</p>';
    }
  });
})

map.on('style.load', () => loadData())

function loadData() {
  fetch('http://nrw.ldproxy.net/rest/services/dvg/nw_dvg2_krs/?f=json&count=100')
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      console.log('parsed json', json)
      KreiseNRW = json

      map.addSource('KreiseNRW', {
        'type': 'geojson',
        'data': KreiseNRW
      })
      map.addLayer({
        "id": "kreisgrenzen",
        "type": "fill",
        "source": "KreiseNRW",
        "paint": {
          "fill-opacity": 0.8,
          'fill-color': '#5266B8'
        }
      });
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    })


}

export function setData(data_source, feature) {

  const data = require(`./../data/${data_source}.json`);
  setDataFromCSV(data, feature)

}

export function setDataFromCSV(data, feature) {
  feature_dataset = data
  current_feature = feature

  KreiseNRW.features.map((kreis) => {
    data.forEach((data_feature) => {
      if (kreis.properties.Kreisnummer.slice(0, kreis.properties.Kreisnummer.length - 3) == data_feature.AGS) {
        kreis.properties[feature] = parseInt(data_feature.data[0])
      }
    })
  })

  map.getSource('KreiseNRW').setData(KreiseNRW)
  map.setPaintProperty("kreisgrenzen", 'fill-color', {
    "property": feature,
    "stops": [
      [getMaxFeature(KreiseNRW, feature), '#80BCFF'],
      [getMinFeature(KreiseNRW, feature), '#1A5FAC']
    ]
  });

  document.getElementById('timeslider').removeAttribute('hidden')
  document.getElementById('slider').setAttribute('min', getFirstYearOfDataset())
  document.getElementById('slider').setAttribute('max', getLastYearOfDataset())
  updateData()
}

export function updateData(year = getFirstYearOfDataset()) {
  KreiseNRW.features.map((kreis) => {
    feature_dataset.forEach((kreisPop) => {
      if (kreis.properties.Kreisnummer.slice(0, kreis.properties.Kreisnummer.length - 3) == kreisPop.AGS) {
        kreis.properties[current_feature] = parseInt(kreisPop.data[year])
      }
    })
  })
  map.getSource('KreiseNRW').setData(KreiseNRW)
  map.setPaintProperty("kreisgrenzen", 'fill-color', {
    "property": "population",
    "stops": [
      [getMinFeature(KreiseNRW, current_feature), '#80BCFF'],
      [getMaxFeature(KreiseNRW, current_feature), '#1A5FAC']
    ]
  });
  document.getElementById('year').textContent = year;
}

function getMaxFeature(data, feature) {
  var maxVal = 0;
  data.features.forEach((child) => {
    if (child.properties[feature] > maxVal) {
      maxVal = child.properties[feature]
    }
  })
  return maxVal
}

function getMinFeature(data, feature) {
  var minVal = 999999999999;
  data.features.forEach((child) => {
    if (child.properties[feature] < minVal) {
      minVal = child.properties[feature]
    }
  })
  return minVal
}

function getFirstYearOfDataset() {
  return Object.keys(feature_dataset[0].data)[0]
}

function getLastYearOfDataset() {
  var dataset_data = Object.keys(feature_dataset[0].data)
  return dataset_data[dataset_data.length - 1]
}

export function changeStyle(style) {
  // console.log("changing style")
  map.setStyle('mapbox://styles/mapbox/' + style + '-v9');

}

export function addFeinstaubLayer(name) {
  const band = require(`./../data/${name}.json`)

  try {
    map.addSource('feinstaub_band', {
      'type': 'geojson',
      'data': band
    })
    map.addLayer({
      "id": "feinstaub_band_layer",
      "type": "fill",
      "source": "feinstaub_band",
      'paint': {
        'fill-color': {
          "property": 'DN',
          "stops": [
            [0, '#B89EA7'],
            [45, '#B80845']
          ]
        }
      }
    });
  } catch (e) {
    map.removeSource('feinstaub_band')
    map.removeLayer("feinstaub_band_layer")
    map.addSource('feinstaub_band', {
      'type': 'geojson',
      'data': band
    })
    map.addLayer({
      "id": "feinstaub_band_layer",
      "type": "fill",
      "source": "feinstaub_band",
      'paint': {
        'fill-color': {
          "property": 'DN',
          "stops": [
            [0, '#B89EA7'],
            [45, '#B80845']
          ]
        }
      }
    });
  }
}

export function removeFeinstaubLayer() {
  map.removeSource('feinstaub_band')
  map.removeLayer("feinstaub_band_layer")
}
