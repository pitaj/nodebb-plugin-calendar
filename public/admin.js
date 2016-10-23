define('admin/plugins/calendar', [], function () {
  $('#save').on('click', function () {
    var settings = {
      checkingInterval: parseInt($('#checkingInterval').val(), 10),
      mainPostOnly: !!$('#mainPostOnly')[0].checked,
    };
    $.get('/api/admin/plugins/calendar/save', { settings: JSON.stringify(settings) }, function () {
      app.alertSuccess();
    });
  });
});