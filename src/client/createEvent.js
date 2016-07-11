/* global $ */

import notificationsFactory from './notifications';

const defaultEvent = {
  name: '',
  allday: false,
  startDate: Date.now(),
  endDate: Date.now() + 1000 * 60 * 60,
  notifications: [],
  location: '',
  description: '',
};

const createEventFactory = () => {
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
  const notifications = notificationsFactory(inputs.notifications);

  const setInputs = event => {
    inputs.name.val(event.name);
    inputs.allday.prop('checked', event.allday);
    inputs.startDate.data('DateTimePicker').date(new Date(event.startDate));
    inputs.endDate.data('DateTimePicker').date(new Date(event.endDate));
    notifications.setNotifications(event.notifications);
    inputs.location.val(event.location);
    inputs.description.val(event.description);
  };
  const getInputs = () => ({
    name: inputs.name.val(),
    allday: inputs.allday.prop('checked'),
    startDate: inputs.startDate.data('DateTimePicker').date().valueOf(),
    endDate: inputs.endDate.data('DateTimePicker').date().valueOf(),
    notifications: notifications.getNotifications(),
    location: inputs.location.val(),
    description: inputs.description.val(),
  });

  const createEvent = (data, callback) => {
    const event = Object.assign({}, defaultEvent, data);
    setInputs(event);
    modal.modal('show');

    const submit = modal.find('#plugin-calendar-event-editor-submit');
    const onClick = e => {
      if (e.target.disabled) {
        return;
      }
      const newEvent = getInputs();

      modal.modal('hide');
      submit.off('click', onClick);
      callback(newEvent);
    };
    submit.on('click', onClick);
  };

  return createEvent;
};

export default createEventFactory;
