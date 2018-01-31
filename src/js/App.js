import Map from './Map.js';

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

    $('.map-overlay').collapse('show');

    document.getElementById('basicMap').addEventListener('click', () => {
      map.changeStyle('basic');
    });

    document.getElementById('darkMap').addEventListener('click', () => {
      map.changeStyle('dark');
    });

    document.getElementById('lightMap').addEventListener('click', () => {
      map.changeStyle('light');
    });

    document.getElementById('satelliteMap').addEventListener('click', () => {
      map.changeStyle('satellite');
    });

    document.getElementById('topMap').addEventListener('click', () => {
      map.changeStyle('top');
    });

    document.getElementById('dtkMap').addEventListener('click', () => {
      map.changeStyle('dtk');
    });

    document.getElementById('dopMap').addEventListener('click', () => {
      map.changeStyle('dop');
    });

    document
      .getElementById('custom_csv_input')
      .addEventListener('change', () => {
        map.importCSV();
      });

    document.getElementById('slider').addEventListener('input', function(e) {
      const year = parseInt(e.target.value, 10);
      map.updateData(year);
    });

    document
      .getElementById('transparency-slider')
      .addEventListener('input', function(e) {
        const transparency = e.target.value;
        map.changeTransparency(transparency);
      });

    document
      .getElementsByName('population_data')[0]
      .addEventListener('click', () => {
        map.setData('population_data', 'population');
      });

    document
      .getElementById('Anteil_Arbeitslose_UTF8')
      .addEventListener('click', () => {
        map.setData('Anteil_Arbeitslose_UTF8', 'arbeitslose');
      });

    document
      .getElementById('Erwerbstaetige_Dienstleistung')
      .addEventListener('click', () => {
        map.setData(
          'Anteil_Erwerbstaetige_Dienstleistung_UTF8',
          'Erwerbstaetige_Dienstleistung'
        );
      });

    document
      .getElementById('Erwerbstaetige_Forst')
      .addEventListener('click', () => {
        map.setData('Anteil_Erwerbstaetige_Forst_UTF8', 'Erwerbstaetige_Forst');
      });

    document
      .getElementById('Erwerbstaetige_Gewerbe')
      .addEventListener('click', () => {
        map.setData(
          'Anteil_Erwerbstaetige_ProduzierendesGewerbe_UTF8',
          'Erwerbstaetige_Gewerbe'
        );
      });

    document.getElementById('Wahl17_CDU').addEventListener('click', () => {
      map.setData('Wahlergebnisse_CDU_1976_bis_2013', 'Wahl17_CDU');
    });

    document.getElementById('Wahl17_SPD').addEventListener('click', () => {
      map.setData('Wahlergebnisse_CDU_1976_bis_2013', 'Wahl17_SPD');
    });

    // document.getElementById('feinstaub01').addEventListener('click', () => {
    //   map.addFeinstaubLayer('band01_02112017');
    // });

    // document.getElementById('feinstaub12').addEventListener('click', () => {
    //   map.addFeinstaubLayer('band12_02112017');
    // });

    // document.getElementById('feinstaub24').addEventListener('click', () => {
    //   map.addFeinstaubLayer('band24_02112017');
    // });

    // document
    //   .getElementById('feinstaub-remove')
    //   .addEventListener('click', () => {
    //     map.removeFeinstaubLayer();
    //   });

    document.getElementById('lowColor').addEventListener(
      'change',
      e => {
        map.changeColor('low', e.target.value);
      },
      true
    );

    document.getElementById('highColor').addEventListener(
      'change',
      e => {
        map.changeColor('high', e.target.value);
      },
      true
    );

    document
      .getElementById('stats_equal_interval')
      .addEventListener('click', () => {
        map.changeStatistics('EQUAL_INTERVAL');
      });

    document
      .getElementById('stats_std_deviation')
      .addEventListener('click', () => {
        map.changeStatistics('STD_DEVIATION');
      });

    document
      .getElementById('stats_arithmetic_progression')
      .addEventListener('click', () => {
        map.changeStatistics('ARITHMETIC_PROGRESSION');
      });

    document
      .getElementById('stats_geometric_progression')
      .addEventListener('click', () => {
        map.changeStatistics('GEOMETRIC_PROGRESSION');
      });

    document.getElementById('stats_quantile').addEventListener('click', () => {
      map.changeStatistics('QUANTILE');
    });

    document.getElementById('stats_jenks').addEventListener('click', () => {
      map.changeStatistics('JENKS');
    });

    document.getElementById('stats_standard').addEventListener('click', () => {
      map.changeStatistics('STANDARD');
    });

    // https://stackoverflow.com/a/32922725/5660646
    $(document).on('click', '.dropdown-menu', e => {
      e.stopPropagation();
    });
  }
}

export default App;
