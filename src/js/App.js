import { changeStyle, updateData } from './Map.js'
const config = require('./../config.js');

class App {
  static run() {
    document.getElementById('themeToggle').addEventListener("click", () => {
      config.theme = (config.theme == 'light' ? 'dark' : 'light')
      changeStyle()
      document.getElementById('themeToggle').innerHTML = (config.theme == 'light' ? 'Dark Mode' : 'Light Mode')
      document.getElementById('themeToggle').classList.remove((config.theme == 'light' ? 'btn-light' : 'btn-dark'))
      document.getElementById('themeToggle').classList.add((config.theme == 'light' ? 'btn-dark' : 'btn-light'))
    });

    document.getElementById('slider').addEventListener('input', function(e) {
        var year = parseInt(e.target.value, 10);
        console.log(year)
        updateData(year)
    });


  }
}

export default App
