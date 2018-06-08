import introJs from 'intro.js';
import 'intro.js/introjs.css';

export default class Tutorial {
  static startTutorial() {
    $('#launchModal').modal('hide');
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#dropdown_map_settings',
          intro:
            'Hier können Sie zwischen verschiedenen Hintergrundkarten und Kartenmodi wechseln'
        },
        {
          element: '#dropdown_stat_data',
          intro: 'Hier können Sie verschiedene Datensätze auswählen'
        },
        {
          element: '#dropdown_stats',
          intro:
            'Hier können Sie die Daten mit verschiedenen Möglichkeiten Klassifizieren'
        },
        {
          element: '#dropdown_export',
          intro: 'Hier können Sie die Karte als PNG oder PDF Exportieren'
        },
        {
          element: '#legendWrapper',
          intro: `Die Legende zeigt Informationen über den aktuellen Datensatz, 
            eine Farbskala passend zur klassifizierung 
            und einen Slider um temporale Änderungen anzuzeigen`
        },
        {
          element: '.mapboxgl-ctrl-icon',
          intro:
            'Hier können Sie auf NRW zoomen falls Sie die Orientierung verloren haben'
        }
      ]
    });
    intro.onchange(targetElement => {
      console.log(targetElement);
      switch (targetElement.id) {
        case 'legendWrapper':
          $('.legend-info-wrapper').show();
          $('.legend').collapse('show');
          break;
      }
    });
    intro.start();

    intro.onexit(() => {
      $('.legend-info-wrapper').hide();
      $('.legend').collapse('hide');
    });
  }
}
