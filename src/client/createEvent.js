import moment from 'moment';
import remindersFactory from './reminders';
import repetitionFactory from './repetition';
import validateEvent from '../lib/validateEvent';
import 'eonasdan-bootstrap-datetimepicker';

const defaultEvent = {
  name: '',
  allday: false,
  startDate: Date.now(),
  endDate: Date.now() + (1000 * 60 * 60),
  reminders: [],
  location: '',
  description: '',
  mandatory: false,
  repeats: null,
};

const formats = {
  timeDate: 'L LT',
  date: 'L',
};

const createEventFactory = () => {
  const modal = $('#plugin-calendar-event-editor').modal({
    backdrop: false,
    show: false,
  });
  const inputs = {
    name: modal.find('#plugin-calendar-event-editor-name'),
    allday: modal.find('#plugin-calendar-event-editor-allday'),
    startDate: modal.find('#plugin-calendar-event-editor-startDate'),
    endDate: modal.find('#plugin-calendar-event-editor-endDate'),
    reminders: modal.find('#plugin-calendar-event-editor-reminders'),
    location: modal.find('#plugin-calendar-event-editor-location'),
    description: modal.find('#plugin-calendar-event-editor-description'),
    mandatory: modal.find('#plugin-calendar-event-editor-mandatory'),
    repetition: modal.find('#plugin-calendar-event-editor-repetition'),
    repeatEndDate: modal.find('#plugin-calendar-event-editor-repetition-endDate'),
  };
  const reminders = remindersFactory(inputs.reminders);
  const repetition = repetitionFactory(inputs.repetition);

  inputs.allday.on('change', () => {
    const format = inputs.allday.prop('checked') ? formats.date : formats.timeDate;
    inputs.startDate.data('DateTimePicker').format(format);
    inputs.endDate.data('DateTimePicker').format(format);
  });

  const setInputs = (event) => {
    inputs.name.val(event.name);
    inputs.allday.prop('checked', event.allday);
    inputs.startDate.data('DateTimePicker').date(moment(event.startDate));
    inputs.endDate.data('DateTimePicker').date(moment(event.endDate));
    reminders.setReminders(event.reminders);
    repetition.setRepeat(event.repeats);
    inputs.location.val(event.location);
    inputs.description.val(event.description);
    inputs.mandatory.prop('checked', event.mandatory);

    const format = event.allday ? formats.date : formats.timeDate;
    inputs.startDate.data('DateTimePicker').format(format);
    inputs.endDate.data('DateTimePicker').format(format);
  };
  const getInputs = () => {
    const event = {
      name: inputs.name.val().trim(),
      allday: inputs.allday.prop('checked'),
      startDate: inputs.startDate.data('DateTimePicker').date().valueOf(),
      endDate: inputs.endDate.data('DateTimePicker').date().valueOf(),
      reminders: reminders.getReminders(),
      repeats: repetition.getRepeat(),
      location: inputs.location.val().trim(),
      description: inputs.description.val().trim(),
      mandatory: inputs.mandatory.prop('checked'),
    };

    if (event.allday) {
      const s = new Date(event.startDate);
      const e = new Date(event.endDate);

      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);

      event.startDate = s.valueOf();
      event.endDate = e.valueOf();
    }

    return event;
  };

  const alertFailure = (input) => {
    input.closest('.form-group').addClass('has-error');
  };

  const createEvent = (data, callback) => {
    const event = { ...defaultEvent, ...data };
    setInputs(event);
    modal.find('.form-group').removeClass('has-error');
    modal.modal('show');

    const submit = modal.find('#plugin-calendar-event-editor-submit');
    const del = modal.find('#plugin-calendar-event-editor-delete');

    const onClick = () => {
      const newEvent = getInputs();
      modal.find('.form-group').removeClass('has-error');

      const [failed, failures] = validateEvent(newEvent);
      if (failed) {
        failures.map((failure) => inputs[failure]).forEach(alertFailure);
        return;
      }

      modal.modal('hide');
      submit.off('click', onClick);
      callback(newEvent);
    };

    submit.on('click', onClick);

    del.one('click', () => {
      modal.modal('hide');
      submit.off('click', onClick);
      callback(null);
    });

    const onChange = () => {
      const newEvent = getInputs();
      modal.find('.form-group').removeClass('has-error');

      const [failed, failures] = validateEvent(newEvent);
      if (failed) {
        failures.map((failure) => inputs[failure]).forEach(alertFailure);
      }
    };
    modal.on('change dp.change', onChange);
  };

  return createEvent;
};

export default createEventFactory;
