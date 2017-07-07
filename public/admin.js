/* global $, app, define */
/* eslint no-var: 0, prefer-arrow-callback: 0, func-names: 0 */

define('admin/plugins/calendar', [], function() {
  $('#save').on('click', function() {
    var settings = {
      checkingInterval: parseInt($('#checkingInterval').val(), 10),
      mainPostOnly: !!$('#mainPostOnly')[0].checked,
      respondIfCanReply: !!$('#respondIfCanReply')[0].checked,
    };
    $.get('/api/admin/plugins/calendar/save', { settings: JSON.stringify(settings) }, function() {
      app.alertSuccess();
    });
  });

  $('#addICal').on('click', function() {
    templates.parse('partials/calendar/add-ical', {}, function(html) {
      var modal = bootbox.dialog({
        title: 'Add ICal',
        message: html,
        buttons: {
          create: {
            label: 'Save Response',
            callback: function(e) {
              var modal = $(e.target).parents('.modal'),
                formEl = modal.find('form'),
                payload = formEl.serializeObject();

              $.ajax({
                type: 'POST',
                url: '/api/admin/plugins/calendar/add',
                data: payload,
                headers: {
                  'x-csrf-token': config.csrf_token
                }
              }).done(function() {
                ajaxify.refresh();
                modal.modal('hide');
              }).fail(function() {
                app.alertError('Could not save ical');
              });

              return false;	// I normally use stopPropagation, but for bootbox that doesn't work...
            }
          }
        }
      });

      modal.on('shown.bs.modal', function () {
        modal.find('form').on('submit', function () {
          return false;
        });
      });
    });
  });
});
