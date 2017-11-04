import mapboxgl from 'mapbox-gl';
// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
const config = require('./../config.js');
import 'whatwg-fetch'
import csv from 'csvtojson';

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
    config.theme == 'light' ?
    'mapbox://styles/mapbox/light-v9' :
    'mapbox://styles/mapbox/dark-v9')
})

map.on('load', () => {
  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'kreisgrenzen', function (e) {
    if (e.features.length > 0) {
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.Gemeindename).addTo(map);
    }
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', function () {
    map.getCanvas().style.cursor = '';
  });

  map.on('mousemove', function (e) {
    var states = map.queryRenderedFeatures(e.point, {
      layers: ['kreisgrenzen']
    });

    console.log(states);
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
      if(!String(data_feature.AGS).startsWith('0')) {
        data_feature.AGS = '0' + data_feature.AGS
      }
      if (kreis.properties.Kreisnummer.slice(0, kreis.properties.Kreisnummer.length - 3) == data_feature.AGS) {
        // if(data_feature.data[0] && data_feature.data[0].contains(',')) {
        //   var tempNumber = data_feature.data[0].replace(',', '.')
        //   kreis.properties[feature] = Number(tempNumber)
        // } else {
          kreis.properties[feature] = Number(data_feature.data[0])
        // }
      }
    })
  })

  console.log(KreiseNRW);

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
        kreis.properties[current_feature] = Number(kreisPop.data[year])
      }
    })
  })

  console.log(current_feature);

  map.getSource('KreiseNRW').setData(KreiseNRW)
  map.setPaintProperty("kreisgrenzen", 'fill-color', {
    "property": current_feature,
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
  map.setStyle('mapbox://styles/mapbox/' + style + '-v9');

}

export function importCSV() {
  const file = document.getElementById('custom_csv_input').files[0];
  if (file.type == "text/csv") {

    let ownData = getAsText(file);
  } else {
    $('#csv_info').text('Die gewählte Datei ist keine .csv Datei!');
  }
}

// CSV handler functions

function getAsText(fileToRead) {
  var reader = new FileReader();
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  var csvString = event.target.result;
  processData(csvString, (dataset) => {
    console.log(dataset);
    setDataFromCSV(dataset, 'arbeitslos')
  })
}

function processData(csvString, callback) {
  let header;
  let customDataset = [];

  csv({
    delimiter: ';'
  })
  .fromString(csvString, {
    encoding: 'utf8'
  })
  .on('header', (parsedHeader) => {
    console.log(parsedHeader);
    header = parsedHeader;
  })
  .on('csv', (csvRow) => {
    // Wenn die Row mit einer Zahl beginnt..
    if(!isNaN(Number(csvRow[0]))){

      var cityObject = {
        RS: csvRow[0],
        AGS: csvRow[0],
        GEN: csvRow[1],
        data: {}
      }

      header.forEach((element, idx) => {
        if(!isNaN(Number(element)) && element != ''){
          cityObject.data[`${element}`] = csvRow[idx]
        }
      }, this)

      customDataset.push(cityObject);
    }
  }).on('done', () => {
    callback(customDataset)
  })

}

function errorHandler(evt) {
  if (evt.target.error.name == "NotReadableError") {
    alert("Canno't read file !");
  }
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
        },
        "fill-opacity": 0.8,
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
        },
        "fill-opacity": 0.8,
      }
    });
  }
}

export function removeFeinstaubLayer() {
  map.removeSource('feinstaub_band')
  map.removeLayer("feinstaub_band_layer")
}
