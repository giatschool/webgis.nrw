import App from './js/App.js'

App.run()

$(function () {
  $('[data-toggle="tooltip"]').tooltip()

  $('#launchModal').modal('toggle');
})


