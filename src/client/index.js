/* global $, config */

import 'eonasdan-bootstrap-datetimepicker';
import { eventTemplate, modalTemplate } from './templates';
import setupComposerButton from './setupComposerButton';

const defaultEvent = {
  name: '',
  allday: false,
  startDate: Date.now(),
  endDate: Date.now() + 1000 * 60 * 60,
  notifications: [],
  location: '',
  description: '',
};

const lang = config.userLang || config.defaultLang;
window.requirejs([
  'composer',
  'composer/formatting',
  'translator',
], (composer, formatting, translator) =>
$(document).ready(() => {
  translator.translate(modalTemplate(), lang, html => {
    $('body').append(html);
  });

  setupComposerButton(composer);

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
      inputs.allday.prop('checked', event.allday);
      inputs.startDate.data('DateTimePicker').date(event.startDate);
      inputs.endDate.data('DateTimePicker').date(event.endDate);
      inputs.notifications.data('value', event.notifications);
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

  $(window).on('action:composer.enhanced', prepareFormattingTools);
}));
