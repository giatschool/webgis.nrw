import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import App from './js/App.js';

App.run();

$(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $('#launchModal').modal('toggle');
});
