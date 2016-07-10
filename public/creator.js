/* global $, config */

window.require.config({
  paths: {
    datetimepicker:
      '/plugins/nodebb-plugin-calendar/datetimepicker/bootstrap-datetimepicker.min',
    moment:
      '/plugins/nodebb-plugin-calendar/moment/moment-with-locales.min',
    // jquery: '/plugins/nodebb-plugin-calendar/jquery/jquery.min',
  },
});

$(document).ready(() =>
window.require([
  'composer/formatting',
  'moment',
  'datetimepicker',
], (formatting, moment) => {
  moment.locale(config.userLang);
  const eventTemplate = (event) => (
    `[event]
      [name]${event.name}[/name]
      [allday]${event.allday}[/allday]
      [startDate]${event.startDate}[/startDate]
      [endDate]${event.endDate}[/endDate]
      [notifications]${JSON.stringify(event.notifications)}[/notifications]
      [location]${event.location}[/location]
      [description]
        ${event.description}
      [/description]
    [/event]`
  );

  const defaultEvent = {
    name: '',
    allday: false,
    startDate: Date.now(),
    endDate: Date.now() + 1000 * 60 * 60,
    notifications: [],
    location: '',
    description: '',
  };

  const createEvent = (data, callback) => {
    const modal = $('#plugin-calendar-event-editor');
    const inputs = {
      name: modal.find('#plugin-calendar-event-editor-name'),
      allday: modal.find('#plugin-calendar-event-editor-allday'),
      startDate: modal.find('#plugin-calendar-event-editor-startDate'),
      endDate: modal.find('#plugin-calendar-event-editor-endDate'),
      notifications: modal.find('#plugin-calendar-event-editor-notifications'),
      location: modal.find('#plugin-calendar-event-editor-location'),
      description: modal.find('#plugin-calendar-event-editor-description'),
    };
    const setInputs = event => {
      inputs.name.val(event.name);
      inputs.allday[0].checked = event.allday;
      inputs.startDate[0].dataset.value = event.startDate;
    };
    const getInputs = () => ({
      name: inputs.name.val(),
      allday: inputs.allday.prop('checked'),
      startDate: inputs.startDate.data('DateTimePicker').date().valueOf(),
      endDate: inputs.endDate.data('DateTimePicker').date().valueOf(),
      notifications: inputs.notifications.data('value'),
      location: inputs.location.val(),
      description: inputs.description.val(),
    });

    const event = Object.assign({}, defaultEvent, data);
    setInputs(event);
    modal.show();

    const submit = modal.find('#plugin-calendar-event-editor-submit');
    const onClick = e => {
      if (e.target.disabled) {
        return;
      }
      const newEvent = getInputs();

      modal.hide();
      submit.off('click', onClick);
      callback(newEvent);
    };
    submit.on('click', onClick);
  };

  const getSelectionInTextarea = textarea => {
    $(textarea).val().slice(textarea.selectionStart, textarea.selectionEnd);
  };

  const replaceSelectionInTextareaWith = (textarea, value) => {
    const $textarea = $(textarea);
    const currentVal = $textarea.val();

    $textarea.val(
      currentVal.slice(0, textarea.selectionStart) +
      value +
      currentVal.slice(textarea.selectionEnd)
    );
  };

  const prepareFormattingTools = () => {
    if (!formatting) {
      return;
    }
    formatting.addButtonDispatch('plugin-calendar-event', textarea =>
      createEvent({ name: getSelectionInTextarea(textarea) }, event =>
        replaceSelectionInTextareaWith(textarea, eventTemplate(event))
      )
    );
  };

  $(window).on('action:composer.enhanced', () => {
    prepareFormattingTools();
  });
}));
