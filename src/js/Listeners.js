import Printer from './Printer';
import GIFExporter from './GIFExporter';

let activeMap = undefined;
let myGIFExporter = undefined;

export default class Listeners {
  constructor(document, map) {
    this.setActiveMap(map);

    document.getElementById('basicMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('basic');
    });

    document.getElementById('darkMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dark');
    });

    document.getElementById('lightMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('light');
    });

    document.getElementById('satelliteMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('satellite');
    });

    document.getElementById('topMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('top');
    });

    document.getElementById('dtkMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dtk');
    });

    document.getElementById('blankMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('empty');
    });

    document.getElementById('tranchotMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('tranchot');
    });

    document.getElementById('uraufnahmeMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('uraufnahme');
    });

    document.getElementById('neuaufnahmeMap').addEventListener('click', () => {
      this.getActiveMap().changeStyle('neuaufnahme');
    });

    document.getElementById('tk25Map').addEventListener('click', () => {
      this.getActiveMap().changeStyle('tk25');
    });

    document.getElementById('dgk5Map').addEventListener('click', () => {
      this.getActiveMap().changeStyle('dgk5');
    });

    document
      .getElementById('csv_modal_launch')
      .addEventListener('click', () => {
        $('#csvModal').modal('toggle');
      });

    document.getElementById('csv_start').addEventListener('click', () => {
      const title = $('#csv_title').val();

      if (title === null || title === '') {
        alert('Bitte geben Sie einen Titel an');
      } else if ($('#custom_csv_input').get(0).files.length === 0) {
        alert('Bitte laden Sie Ihre CSV Datei hoch');
      } else {
        this.getActiveMap().importCSV();
        $('#csvModal').modal('toggle');
      }
    });

    document.getElementById('slider').addEventListener('input', e => {
      const year = parseInt(e.target.value, 10);
      this.slider_currentValue = `${year}`;
      this.getActiveMap().updateData(year);
    });

    document.getElementById('timeslide-play').addEventListener('click', () => {
      $('#timeslide-play').hide();
      $('#timeslide-pause').show();

      const indices = this.getActiveMap()._getYearsOfDataset();

      myGIFExporter = new GIFExporter(this.getActiveMap());

      let i = 0;
      this.sliderLoop = setInterval(() => {
        // If the autoPlay was paused..
        if (this.slider_currentValue !== indices[i] && this.slider_isPaused) {
          i = indices.indexOf(this.slider_currentValue);
          this.slider_isPaused = false;
        }

        $('#slider').val(`${indices[i]}`);
        this.slider_currentValue = $('#slider').val();
        this.getActiveMap().updateData(indices[i]);

        myGIFExporter.addFrame();

        $('#download_gif').show();

        // Reset when iterating finished
        if (i === indices.length - 1) {
          clearInterval(this.sliderLoop);
          $('#timeslide-pause').hide();
          $('#timeslide-play').show();
          $('#slider').val(`${indices[0]}`);
          activeMap.updateData(indices[0]);
        }
        i++;
      }, 500);
    });

    document.getElementById('timeslide-pause').addEventListener('click', () => {
      $('#timeslide-pause').hide();
      $('#timeslide-play').show();
      this.slider_isPaused = true;
      clearInterval(this.sliderLoop);
    });

    document.getElementById('download_gif').addEventListener('click', () => {
      myGIFExporter.downloadGIF(() => {
        myGIFExporter = undefined; // "destroy" object
      });
    });

    document
      .getElementById('transparency-slider')
      .addEventListener('input', e => {
        this.getActiveMap().changeTransparency(e.target.value);
      });

    document.getElementById('population_data').addEventListener('click', () => {
      console.log('pop');
      this.getActiveMap().setData('population_data', 'population');
    });

    document
      .getElementById('Anteil_Arbeitslose_UTF8')
      .addEventListener('click', () => {
        this.getActiveMap().setData('Anteil_Arbeitslose_UTF8', 'arbeitslose');
      });

    document
      .getElementById('Erwerbstaetige_Dienstleistung')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_Dienstleistung_UTF8',
          'Erwerbstaetige_Dienstleistung'
        );
      });

    document
      .getElementById('Erwerbstaetige_Forst')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_Forst_UTF8',
          'Erwerbstaetige_Forst'
        );
      });

    document
      .getElementById('Erwerbstaetige_Gewerbe')
      .addEventListener('click', () => {
        this.getActiveMap().setData(
          'Anteil_Erwerbstaetige_ProduzierendesGewerbe_UTF8',
          'Erwerbstaetige_Gewerbe'
        );
      });

    document.getElementById('lowColor').addEventListener(
      'change',
      e => {
        this.getActiveMap().changeColor('low', e.target.value);
      },
      true
    );

    document.getElementById('highColor').addEventListener(
      'change',
      e => {
        this.getActiveMap().changeColor('high', e.target.value);
      },
      true
    );

    document
      .getElementById('stats_equal_interval')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('EQUAL_INTERVAL');
      });

    document
      .getElementById('stats_std_deviation')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('STD_DEVIATION');
      });

    document
      .getElementById('stats_arithmetic_progression')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('ARITHMETIC_PROGRESSION');
      });

    document
      .getElementById('stats_geometric_progression')
      .addEventListener('click', () => {
        this.getActiveMap().changeStatistics('GEOMETRIC_PROGRESSION');
      });

    document.getElementById('stats_quantile').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('QUANTILE');
    });

    document.getElementById('stats_jenks').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('JENKS');
    });

    document.getElementById('stats_standard').addEventListener('click', () => {
      this.getActiveMap().changeStatistics('STANDARD');
    });

    // https://stackoverflow.com/a/32922725/5660646
    $(document).on('click', '.dropdown-menu', e => {
      e.stopPropagation();
    });

    // rotate the legend collapse button on click
    $('.legend').on('hide.bs.collapse', () => {
      $('#legend_collapse').toggleClass('rotate');
    });

    $('.legend').on('show.bs.collapse', () => {
      $('#legend_collapse').toggleClass('rotate');
    });

    document.getElementById('print').addEventListener('click', () => {
      const mapPrinter = new Printer(activeMap);
      if ($('#export_pdf').is(':checked')) {
        mapPrinter.generatePDF();
      } else if ($('#export_png').is(':checked')) {
        mapPrinter.generatePNG();
      }
    });

    document
      .getElementById('toggleLegalAdvice')
      .addEventListener('click', () => {
        $('#legalAdviceModal').modal('toggle');
      });

    document.getElementById('logo').addEventListener('click', () => {
      location.reload();
    });
    // document.getElementById('Wahl17_SPD').addEventListener('click', () => {
    //     map.setData('Wahlergebnisse_CDU_1976_bis_2013', 'Wahl17_SPD');
    // });

    // document.getElementById('feinstaub01').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band01_02112017');
    // });

    // document.getElementById('feinstaub12').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band12_02112017');
    // });

    // document.getElementById('feinstaub24').addEventListener('click', () => {
    //     map.addFeinstaubLayer('band24_02112017');
    // });

    // document
    //     .getElementById('feinstaub-remove')
    //     .addEventListener('click', () => {
    //         map.removeFeinstaubLayer();
    //     });
  }

  setActiveMap(map) {
    activeMap = map;

    try {
      // update transparency slider
      document.getElementById('transparency-slider').value =
        activeMap.getTransparency() * 100;
    } catch (e) {}
  }

  getActiveMap() {
    return activeMap;
  }
}
