const isArrayOf = (arr, type) => {
  if (!Array.isArray(arr)) {
    return false;
  }
  for (const x of arr) {
    if (typeof x !== type) {
      return false;
    }
  }
  return true;
};

const checkDate = (val) => typeof val === 'number' && new Date(val).getTime() === val;

const fields = {
  name: (val) => typeof val === 'string' && (val.length > 5),
  allday: (val) => typeof val === 'boolean',
  startDate: checkDate,
  endDate: checkDate,
  reminders: (val) => isArrayOf(val, 'number'),
  mandatory: (val) => typeof val === 'boolean',
  location: (val) => typeof val === 'string' && !val.includes('\n'),
  description: (val) => typeof val === 'string',
};

const validateEvent = (event) => {
  let failures = [];

  for (const key of Object.keys(fields)) {
    if (!fields[key](event[key])) {
      failures.push(key);
    }
  }
  if (event.startDate > event.endDate) {
    failures.push('startDate', 'endDate');
  }

  // make array unique
  failures = failures.filter((x, i) => failures.indexOf(x) === i);

  return [!!failures.length, failures];
};

export default validateEvent;
