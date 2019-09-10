const isArrayOf = (arr, type) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.every((x) => typeof x === type); // eslint-disable-line valid-typeof
};

const checkDate = (val) => Number.isFinite(val) && new Date(val).getTime() === val;

const fields = {
  name: (val) => typeof val === 'string' && (val.length > 5),
  allday: (val) => typeof val === 'boolean',
  startDate: checkDate,
  endDate: checkDate,
  reminders: (val) => isArrayOf(val, 'number'),
  mandatory: (val) => typeof val === 'boolean',
  location: (val) => typeof val === 'string' && !val.includes('\n'),
  description: (val) => typeof val === 'string',
  repeats: (val) => val == null || (val && Object.keys(val.every).length),
};

const validateEvent = (event) => {
  let failures = [];

  Object.keys(fields).forEach((key) => {
    if (!fields[key](event[key])) {
      failures.push(key);
    }
  });
  if (event.startDate > event.endDate) {
    failures.push('startDate', 'endDate');
  }
  if (event.repeats &&
    Number.isFinite(event.repeats.endDate) &&
    event.repeats.endDate < event.startDate) {
    failures.push('repeatEndDate');
  }

  // make array unique
  failures = failures.filter((x, i) => failures.indexOf(x) === i);

  return [!!failures.length, failures];
};

export default validateEvent;
