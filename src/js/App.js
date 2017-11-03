import { changeStyle } from './Map.js'
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


  }
}

export default App
