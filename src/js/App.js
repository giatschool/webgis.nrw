import Map from './Map.js';
import Listeners from './Listeners.js';

class App {
  static run() {
    const primary_map = new Map('map', [7.555, 51.478333], 7, success => {
      if (success) {
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
    });
    
    let secondary_map;

    let listeners = new Listeners(
      document,
      primary_map,
      secondary_map,
      loadDone => {
        console.log('Loaded');
      }
    );

    // Function for splitView
    let splitView = false;

    $('#mode-dual').on('change', () => {
      console.log('splitView triggered', $('#mode-dual').is(':checked'));
      if (!splitView && $('#mode-dual').is(':checked')) {
        $('.webgis-view').after(
          '<div class="webgis-view-split" style="float: right; width:50vw; height: 100vh;"><div id="split_map" style="height: 100vh"></div></div>'
        );
        $('.webgis-view, #map').css('width', '50vw');
        $('.webgis-view, #map').css('height', '100vh');

        secondary_map = new Map('split_map', [7.555, 51.478333], 7, success => {
          secondary_map.center();
          primary_map.center();
        });

        listeners = new Listeners(
          document,
          primary_map,
          secondary_map,
          loadDone => {
            console.log('Loaded');
          }
        );

        splitView = true;
      }
    });

    $('#mode-standard').on('change', () => {
      if (splitView && $('#mode-standard').is(':checked')) {
        $('.webgis-view-split').remove();
        $('.webgis-view, #map').css('width', '100vw');
        primary_map.resize();

        secondary_map = undefined;

        listeners = new Listeners(
          document,
          primary_map,
          secondary_map,
          loadDone => {
            console.log('Loaded');
          }
        );

        splitView = false;
      }
    });

    $('#mode-dual, #mode-split').on('change', () => {
      console.log('clicked');
      $('#map-select').collapse('show');
    });

    $('#mode-standard').on('change', () => {
      console.log('clicked');
      $('#map-select').collapse('hide');
    });
  }
}

export default App;
