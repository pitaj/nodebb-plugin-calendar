import { EventInfo, Keys } from './event';

const isArrayOf = (arr: unknown, type: string) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.every(x => typeof x === type); // eslint-disable-line valid-typeof
};

const isFiniteNumber = (val: unknown): val is number => Number.isFinite(val);
const checkDate = (val: unknown) => isFiniteNumber(val) && new Date(val).getTime() === val;

const isRecord = (val: unknown): val is Record<string, unknown> => !!val;

const fields: {
  [K in Keys]: (val: unknown) => boolean
} = {
  name: val => typeof val === 'string' && (val.length > 5),
  allday: val => typeof val === 'boolean',
  startDate: checkDate,
  endDate: checkDate,
  reminders: val => isArrayOf(val, 'number'),
  mandatory: val => typeof val === 'boolean',
  location: val => typeof val === 'string' && !val.includes('\n'),
  description: val => typeof val === 'string',
  repeats: val => val == null || (
    isRecord(val) &&
    isRecord(val.every) &&
    !!Object.keys(val.every).length
  ),
};

const validateEvent = (event: EventInfo): [boolean, (Keys | 'repeatEndDate')[]] => {
  let failures: (Keys | 'repeatEndDate')[] = [];

  (Object.keys(fields) as (keyof typeof fields)[]).forEach((key) => {
    if (!fields[key](event[key])) {
      failures.push(key);
    }
  });
  if (event.startDate > event.endDate) {
    failures.push('startDate', 'endDate');
  }
  if (
    event.repeats &&
    event.repeats.endDate &&
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
