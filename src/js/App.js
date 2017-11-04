import { changeStyle, updateData, setData } from './Map.js'
const config = require('./../config.js');
import initCkan from './Ckan';

class App {
  static run() {
    document.getElementById('basicMap').addEventListener("click", () => {
      changeStyle('basic')
    });

    document.getElementById('darkMap').addEventListener("click", () => {
      changeStyle('dark')
    });

    document.getElementById('lightMap').addEventListener("click", () => {
      changeStyle('light')
    });

    document.getElementById('satelliteMap').addEventListener("click", () => {
      changeStyle('satellite')
    });

    document.getElementById('custom_csv_input').addEventListener("change", () => {
      importCSV()
    })

    document.getElementById('slider').addEventListener('input', function(e) {
        var year = parseInt(e.target.value, 10);
        console.log(year)
        updateData(year)
    });

    document.getElementsByName('population_data')[0].addEventListener("click", () => {
      setData('population_data', 'population')
    });

    initCkan();

  }
}

export default App
