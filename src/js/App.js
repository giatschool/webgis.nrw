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

    document.getElementById('splitMap').addEventListener('click', () => {
      console.log('splitView triggered');
      if (!splitView) {
        $('.webgis-view').after(
          '<div class="webgis-view split_map" style="float: right;"><div id="split_map" style="height: 100vh"></div></div>'
        );
        $('.webgis-view').css('width', '50vw');
        $('.webgis-view').css('height', '100vh');

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


  }
}

export default App;
