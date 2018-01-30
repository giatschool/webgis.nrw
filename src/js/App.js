import Map from './Map.js';
import Listeners from './Listeners.js';

class App {
  static run() {
    const map = new Map('map', [7.555, 51.478333], 7, success => {
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

    const listeners = new Listeners(document, map, loadDone => {

      console.log('Loaded');

    })

    // Function for splitView

    let splitView = false;
    document.getElementById('splitMap').addEventListener('click', () =>  {
      console.log('splitView triggered');

      console.log(document.getElementsByClassName('webgis-view'));

      if (!splitView) {
        $('.webgis-view').after('<div class="webgis-view split_map" style="float: right;"><div id="split_map" style="height: 100vh"></div></div>')
        $('.webgis-view').css('width', '50vw');
        $('.webgis-view').css('height', '100vh');

        console.log('initialize sec map');

        const split_map = new Map('split_map', [7.555, 51.478333], 7, success => {
          console.log('sec map init');
        })

        splitView = true

      }
      //$('.split_map').hide();
      $('.webgis-view').css('width', '50vw');


    })


  }
}

export default App;