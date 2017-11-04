import mapboxgl from 'mapbox-gl';
const KreiseNRW = require('./../data/landkreise_simplify0.json');
const population = require('./../data/population_data.json');
const config = require('./../config.js');
import 'whatwg-fetch'
import csv from 'csvtojson';

fetch('https://www.ldproxy.nrw.de/kataster/VerwaltungsEinheit?f=json&art=Gemeinde')
  .then(function (response) {
    return response.json()
  }).then(function (json) {
    console.log('parsed json', json)
  }).catch(function (ex) {
    console.log('parsing failed', ex)
  })

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
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(e.features[0].properties.GEN).addTo(map);
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

    if (states.length > 0) {
      document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.GEN + '</strong></h3><p><strong><em>' + states[0].properties.population + '</strong> Einwohner</em></p>';
      // document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.GEN + '</strong></h3>';
    } else {
      document.getElementById('pd').innerHTML = '<p>Hover over a state!</p>';
    }
  });
})

map.on('style.load', () => loadData())

function loadData() {
  KreiseNRW.features.map((kreis) => {
    population.forEach((kreisPop) => {
      if (kreis.properties.AGS === kreisPop.AGS) {
        kreis.properties.population = parseInt(kreisPop.data['1962'])
      }
    })
  })

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
      'fill-color': {
        "property": "population",
        "stops": [
          [getMinPop(), '#80BCFF'],
          [getMaxPop(), '#1A5FAC']
        ]
      }
    }
  });
}

export function updateData(year = '1962') {
  KreiseNRW.features.map((kreis) => {
    population.forEach((kreisPop) => {
      if (kreis.properties.AGS === kreisPop.AGS) {
        kreis.properties.population = parseInt(kreisPop.data[String(year)])
      }
    })
  })
  map.getSource('KreiseNRW').setData(KreiseNRW)
  document.getElementById('year').textContent = year;

}

function getMaxPop() {
  var maxPop = 0;
  KreiseNRW.features.forEach((kreis) => {
    if (kreis.properties.population > maxPop) {
      maxPop = kreis.properties.population
    }
  })
  return maxPop
}

function getMinPop() {
  var minPop = 999999999999;
  KreiseNRW.features.forEach((kreis) => {
    if (kreis.properties.population < minPop) {
      minPop = kreis.properties.population
    }
  })
  return minPop
}

function getColorValue(val) {
  var normColor = val / getMaxPop();
  return `rgb(${normColor * 255}, ${normColor * 100}, ${normColor * 255})`
}

export function changeStyle(style) {
  // console.log("changing style")
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
  processData(csvString);
}

function processData(csvString) {
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
    return customDataset;
  })

}

function errorHandler(evt) {
  if (evt.target.error.name == "NotReadableError") {
    alert("Canno't read file !");
  }
}