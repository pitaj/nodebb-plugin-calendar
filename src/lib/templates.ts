import { EventInfo } from './event';
import render from './render';

export default async function eventTemplate({
  event,
  isEmail,
  uid,
  canRespond,
}: {
  event: EventInfo,
  isEmail?: boolean,
  uid?: number,
  canRespond?: boolean,
}): Promise<string> {
  const response = (uid && event.responses && event.responses[uid]) ? event.responses[uid] : 'no';
  const active = {
    no: '',
    maybe: '',
    yes: '',
    [response]: 'active',
  };
  const repeatsEveryUnit = event.repeats && ['day', 'week', 'month', 'year'].find((x: 'day' | 'week' | 'month' | 'year') => event.repeats.every[x]);
  const repeatsEndDateFinite = Number.isFinite(event.repeats && event.repeats.endDate);
  const reminders = event.reminders.sort((a, b) => a - b);

  return await render('partials/calendar/event/post', {
    event,
    isEmail,
    uid,
    response,
    active,
    repeatsEveryUnit,
    repeatsEndDateFinite,
    reminders,
    canRespond,
  });
}
