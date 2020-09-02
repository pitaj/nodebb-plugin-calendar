import { EventInfo, Keys } from './event';

/* eslint-disable @typescript-eslint/no-explicit-any */
const isArrayOf = (arr: any, type: string) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.every(x => typeof x === type); // eslint-disable-line valid-typeof
};

const checkDate = (val: any) => Number.isFinite(val) && new Date(val).getTime() === val;

const fields: {
  [K in Keys]: (val: any) => boolean
} = {
  name: (val: any) => typeof val === 'string' && (val.length > 5),
  allday: (val: any) => typeof val === 'boolean',
  startDate: checkDate,
  endDate: checkDate,
  reminders: (val: any) => isArrayOf(val, 'number'),
  mandatory: (val: any) => typeof val === 'boolean',
  location: (val: any) => typeof val === 'string' && !val.includes('\n'),
  description: (val: any) => typeof val === 'string',
  repeats: (val: any) => val == null || (val && !!Object.keys(val.every).length),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const validateEvent = (event: EventInfo): [boolean, (Keys | 'repeatEndDate')[]] => {
  let failures: (Keys | 'repeatEndDate')[] = [];

  Object.keys(fields).forEach((key: keyof typeof fields) => {
    if (!fields[key](event[key])) {
      failures.push(key);
    }
  });
  if (event.startDate > event.endDate) {
    failures.push('startDate', 'endDate');
  }
  if (
    event.repeats &&
    Number.isFinite(event.repeats.endDate) &&
    event.repeats.endDate < event.startDate
  ) {
    failures.push('repeatEndDate');
  }

  // make array unique
  failures = [...new Set(failures)];

  return [!!failures.length, failures];
};

export default validateEvent;
