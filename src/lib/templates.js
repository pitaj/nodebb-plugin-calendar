/* globals window */
const render = require.main.require ? require('util').promisify((name, data, cb) => require.main.require('./src/routes/authentication').app.render(name, data, cb)) : window.requirejs('benchpress').render;

export default function eventTemplate({ event, isEmail, uid }) {
  const response = (uid && event.responses && event.responses[uid]) ? event.responses[uid] : 'no';
  const active = {
    no: '',
    maybe: '',
    yes: '',
    [response]: 'active',
  };
  const repeatsEveryUnit = event.repeats && ['day', 'week', 'month', 'year'].find(x => event.repeats.every[x]);
  const repeatsEndDateFinite = Number.isFinite(event.repeats && event.repeats.endDate);
  const reminders = event.reminders.sort((a, b) => a - b);

  return render('partials/calendar/event/post', {
    event,
    isEmail,
    uid,
    response,
    active,
    repeatsEveryUnit,
    repeatsEndDateFinite,
    reminders,
  });
}
