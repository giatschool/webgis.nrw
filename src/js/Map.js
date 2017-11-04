import mapboxgl from 'mapbox-gl';
// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
const config = require('./../config.js');
import 'whatwg-fetch'
import csv from 'csvtojson';

var KreiseNRW

var feature_dataset
var current_feature = ''

var lowColor = '#80BCFF';
var highColor = '#1A5FAC';

export function colorChanged(type, value) {
  if(type == 'low') {
    lowColor = value
  } else if(type == 'high') {
    highColor = value
  }
  map.setPaintProperty("kreisgrenzen", 'fill-color', {
    "property": current_feature,
    "stops": [
      [getMinFeature(KreiseNRW, current_feature), lowColor],
      [getMaxFeature(KreiseNRW, current_feature), highColor]
    ]
  });

  document.getElementById('legend-min').innerHTML = getMinFeature(KreiseNRW, current_feature)
  document.getElementById('legend-max').innerHTML = getMaxFeature(KreiseNRW, current_feature)
  document.getElementById("legend-bar").style.background = `linear-gradient(to right, ${lowColor}, ${highColor})`;
  // document.getElementById("legend-bar").style.display = 'none'
}

export function changeTransparency(transparency) {
  map.setPaintProperty("kreisgrenzen",
    "fill-opacity", transparency / 100,
  );
}


mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiJjajNicW1lM2QwMDR3MzNwOWdyaXAzN282In0.Pci5KvNNLCjjxy9b4p0n7g';
var map = new mapboxgl.Map({
  container: 'map',
  center: [
   6.555,51.478333
  ],
  zoom: 7,
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
})

map.on('style.load', () => {
  loadData()

  map.on('mousemove', function (e) {
    var states = map.queryRenderedFeatures(e.point, {
      layers: ['kreisgrenzen']
    });

    if (states.length > 0) {
      var myString = ''
      if(states[0].properties[current_feature]) {
        myString = '<h3><strong>' + states[0].properties.Gemeindename + '</strong></h3>' +
        '<p><strong><em>' + states[0].properties[current_feature] + '</strong> ' + current_feature + '</em></p>';
      } else {
        myString = '<h3><strong>' + states[0].properties.Gemeindename + '</strong></h3>';
      }
      document.getElementById('pd').innerHTML = myString
    } else {
      document.getElementById('pd').innerHTML = '<p>Hover over a state!</p>';
    }
  });

})

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

  document.getElementById('legend-heading').innerHTML = feature

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
      [getMaxFeature(KreiseNRW, feature), lowColor],
      [getMinFeature(KreiseNRW, feature), highColor]
    ]
  });

  document.getElementById('legend-min').innerHTML = getMinFeature(KreiseNRW, current_feature)
  document.getElementById('legend-max').innerHTML = getMaxFeature(KreiseNRW, current_feature)
  document.getElementById('timeslider').removeAttribute('hidden')
  document.getElementById('timeslide-min').innerHTML = getFirstYearOfDataset()
  document.getElementById('timeslide-max').innerHTML = getLastYearOfDataset()
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
      [getMinFeature(KreiseNRW, current_feature), lowColor],
      [getMaxFeature(KreiseNRW, current_feature), highColor]
    ]
  });
  document.getElementById('year').textContent = year;
  document.getElementById('legend-min').innerHTML = getMinFeature(KreiseNRW, current_feature)
  document.getElementById('legend-max').innerHTML = getMaxFeature(KreiseNRW, current_feature)
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

const wmsLayerUrls = {
  top: ['http://sgx.geodatenzentrum.de/wms_topplus_web_open?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=web_grau&styles=default&format=image/png'],
  dop: [
    'https://www.wms.nrw.de/geobasis/wms_nw_dop20?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=nw_dop20&styles=default&format=image/png',
  ],
  dop_overlay: [
    'https://www.wms.nrw.de/geobasis/wms_nw_dop_overlay?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=WMS_NW_DOP_OVERLAY&styles=default&format=image/png',
  ],
  dtk: ['https://www.wms.nrw.de/geobasis/wms_nw_dtk?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=nw_dtk_col,nw_dtk_pan&styles=default&format=image/png']
};

export function changeStyle(style) {
  const layers = Object.keys(wmsLayerUrls);
  if (layers.includes(style)) {

    if (!map.getLayer(style)) {
      map.addLayer({
        id: style,
        paint: {},
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          tiles: wmsLayerUrls[style]
        }
      }, 'kreisgrenzen');
      // sonderfall dop
      // if (style === 'dop') {
      //   if (!map.getLayer('dop_overlay')) {
      //     map.addLayer({
      //       id: 'dop_overlay',
      //       paint: {},
      //       type: 'raster',
      //       source: {
      //         type: 'raster',
      //         tileSize: 256,
      //         tiles: wmsLayerUrls['dop_overlay']
      //       }
      //     });
      //   } else {
      //     map.setLayoutProperty('dop_overlay', 'visibility', 'visible');
      //   }
      //   layers.splice(layers.findIndex(l => l === 'dop_overlay'), 1);
      // }
    } else {
      map.setLayoutProperty(style, 'visibility', 'visible');
    }
    layers.splice(layers.findIndex(l => l === style), 1);
  } else {
    map.setStyle('mapbox://styles/mapbox/' + style + '-v9');
  }

  for (const l of layers) {
    if (map.getLayer(l)) {
      map.setLayoutProperty(l, 'visibility', 'none');
    }
  }
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
          cityObject.data[`${element}`] = csvRow[idx].replace(',', '.')
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
