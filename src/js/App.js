import { changeStyle, updateData, setData, importCSV, addFeinstaubLayer, removeFeinstaubLayer } from './Map.js'
const config = require('./../config.js');

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

    document.getElementById('feinstaub01').addEventListener("click", () => {
      addFeinstaubLayer('band01_02112017')
    });

    document.getElementById('feinstaub12').addEventListener("click", () => {
      addFeinstaubLayer('band12_02112017')
    });

    document.getElementById('feinstaub24').addEventListener("click", () => {
      addFeinstaubLayer('band24_02112017')
    });

    document.getElementById('feinstaub-remove').addEventListener("click", () => {
      removeFeinstaubLayer()
    });




  }
}

export default App
