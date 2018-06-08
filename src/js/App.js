import Map from './Map.js';
import Listeners from './Listeners.js';
import syncMove from '@mapbox/mapbox-gl-sync-move';
import MapboxCompare from 'mapbox-gl-compare';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';

class App {
  static run() {
    let listeners;
    const primary_map = new Map('map', [7.555, 51.478333], 7, success => {
      if (success) {
        document.body.style.visibility = 'visible';

        // Add Home Button
        primary_map._addHomeButton();

        // finished loading
        document.getElementById('start').removeAttribute('disabled');
        document.getElementById('start').innerHTML = 'Los geht&#39;s!';
        document.getElementById('start').setAttribute('data-dismiss', 'modal');
      } else {
        document.getElementById('start').innerHTML =
          'Daten konnten nicht geladen werden :(';
        document.getElementById('start').classList.remove('btn-primary');
        document.getElementById('start').classList.add('btn-danger');
      }
      listeners = new Listeners(document, primary_map);
    });

    let secondary_map;

    let dualView = false;
    let splitView = false;

    // dual mode triggered
    $('#mode-dual').on('change', () => {
      if (!dualView && $('#mode-dual').is(':checked')) {
        if (splitView) {
          $('#split_map').remove();
          $('.mapboxgl-compare').remove();
          splitView = false;
        }
        $('.webgis-view').after(
          '<div class="webgis-view-split" style="float: right; width:50vw;"><div id="dual_map" class="map"></div></div>'
        );
        $('.webgis-view, #map').css('width', '50vw');

        secondary_map = new Map('dual_map', [7.555, 51.478333], 7, success => {
          if (success) {
            secondary_map.center();
            primary_map.center();
            secondary_map._addHomeButton();
          }
        });

        syncMove(primary_map.getMap(), secondary_map.getMap());

        listeners.setActiveMap(primary_map);

        dualView = true;
      }
    });

    // split mode triggered
    $('#mode-split').on('change', () => {
      if (!splitView && $('#mode-split').is(':checked')) {
        if (dualView) {
          $('.webgis-view-split').remove();
          $('.webgis-view, #map').css('width', '100vw');
          dualView = false;
        }
        $('#map').after('<div id="split_map" class="map"></div>');

        secondary_map = new Map('split_map', [7.555, 51.478333], 7, success => {
          if (success) {
            secondary_map.center();
            primary_map.center();
          }
        });

        /*eslint-disable no-new*/
        new MapboxCompare(primary_map.getMap(), secondary_map.getMap());

        listeners.setActiveMap(primary_map);

        splitView = true;
      }
    });

    // standard mode triggered
    $('#mode-standard').on('change', () => {
      if ($('#mode-standard').is(':checked')) {
        if (dualView) {
          $('.webgis-view-split').remove();
          $('.webgis-view, #map').css('width', '100vw');
          dualView = false;
        }
        if (splitView) {
          $('#split_map').remove();
          $('.mapboxgl-compare').remove();
          splitView = false;
        }

        primary_map.resize();

        secondary_map = undefined;

        listeners.setActiveMap(primary_map);
      }
    });

    $('.legend').collapse('hide');

    $('#mode-dual, #mode-split').on('change', () => {
      $('#map-select').collapse('show');
    });

    $('#mode-standard').on('change', () => {
      $('#map-select').collapse('hide');
    });

    $('#edit-map-one, #edit-map-two').on('change', () => {
      if ($('#edit-map-one').is(':checked')) {
        listeners.setActiveMap(primary_map);
        console.log('checked map 1');
      } else {
        listeners.setActiveMap(secondary_map);
        console.log('checked map 2');
      }
    });
  }
}

export default App;
