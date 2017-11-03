// import mongoose from 'mongoose';
import mapboxgl from 'mapbox-gl';
import MapboxCompare from 'mapbox-gl-compare';
const KreiseNRW = require('./../data/landkreise_simplify0.json');
const config = require('./../config.js');

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiJjajNicW1lM2QwMDR3MzNwOWdyaXAzN282In0.Pci5KvNNLCjjxy9b4p0n7g';
var map = new mapboxgl.Map({
  container: 'map',
  center: [
    7.8, 51.5
  ],
  zoom: 6,
  style: (config.theme == 'light' ? 'mapbox://styles/mapbox/light-v9' : 'mapbox://styles/mapbox/dark-v9')
})

map.on('load', () => {
  console.log(KreiseNRW)
  // loadData()

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'kreisgrenzen', function(e) {
    if (e.features.length > 0) {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.GEN)
        .addTo(map);
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
    console.log(states[0])

    if (states.length > 0) {
      // document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.GEN + '</strong></h3><p><strong><em>' + JSON.parse(states[0].properties.destatis).population + '</strong> Einwohner</em></p>';
      document.getElementById('pd').innerHTML = '<h3><strong>' + states[0].properties.GEN + '</strong></h3>';
    } else {
      document.getElementById('pd').innerHTML = '<p>Hover over a state!</p>';
    }
  });
})

map.on('style.load', () => loadData())


function loadData() {
  map.addSource('KreiseNRW', {
    'type': 'geojson',
    'data': KreiseNRW
  })
  map.addLayer({
    "id": "kreisgrenzen",
    "type": "fill",
    "source": "KreiseNRW",
    "paint": {
      "fill-opacity": 0.8
    }
  });
}

function getMaxPop() {
  var maxPop = 0;
  KreiseNRW.features.forEach((kreis) => {
    if (kreis.properties.destatis.population > maxPop) {
      maxPop = kreis.properties.destatis.population
    }
  })
  return maxPop
}

function getColorValue(val) {
  var normColor = val / getMaxPop();
  return `rgb(${normColor * 255}, ${normColor * 100}, ${normColor * 255})`
}

export function changeStyle() {
  console.log("changing style")
  map.setStyle('mapbox://styles/mapbox/' + config.theme + '-v9');


}
