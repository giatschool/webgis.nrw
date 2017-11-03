// import mongoose from 'mongoose';
import mapboxgl from 'mapbox-gl';
const KreiseNRW = require('./KreiseNRW.json');

mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiJjajNicW1lM2QwMDR3MzNwOWdyaXAzN282In0.Pci5KvNNLCjjxy9b4p0n7g';
var map = new mapboxgl.Map({
  container: 'map',
  center: [
    7.8, 51.5
  ],
  zoom: 6,
  style: 'mapbox://styles/mapbox/light-v9'
})

map.on('load', () => {
  // console.log(mongoose)
  KreiseNRW.features.map((kreis) => {
    console.log(kreis);
    map.addLayer({
      id: kreis.properties.GEN,
      type: 'fill',
      paint: {
        "fill-outline-color": "#484896",
        'fill-color': getColorValue(kreis.properties.destatis.population),
        'fill-opacity': 0.8
      },
      source: {
        type: 'geojson',
        data: kreis
      }
    });
  })
})

// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', function(e) {
  console.log(e)
  new mapboxgl.Popup().setHTML("Hallo Welt").addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', function() {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', function() {
  map.getCanvas().style.cursor = '';
});

function getMaxPop() {
  var maxPop = 0;
  KreiseNRW.features.forEach((kreis) => {
    if(kreis.properties.destatis.population > maxPop) {
      maxPop = kreis.properties.destatis.population
    }
  })
  return maxPop
}

function getColorValue(val) {
  var normColor = val / getMaxPop();
  console.log(val, normColor)
  return `rgb(${normColor * 255}, ${normColor * 100}, ${normColor * 255})`
}
