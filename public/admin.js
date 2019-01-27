/* global $, app, define */
/* eslint no-var: 0, prefer-arrow-callback: 0, func-names: 0 */

define('admin/plugins/calendar', [], function () {
  $('#save').on('click', function () {
    var settings = {
      checkingInterval: parseInt($('#checkingInterval').val(), 10),
      mainPostOnly: !!$('#mainPostOnly')[0].checked,
      respondIfCanReply: !!$('#respondIfCanReply')[0].checked,
      calendarViews: $('#calendarViews').val(),
    };
    $.get('/api/admin/plugins/calendar/save', { settings: JSON.stringify(settings) }, function () {
      app.alertSuccess();
    });
  });
});
