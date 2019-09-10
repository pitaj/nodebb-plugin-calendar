// define the schema for repeating events
/*
  event.repeats = null; // single instance event
  event.repeats = {
    every: {
      // repeats every A days and every B days from first instance
      numOfDays: [A, B, ...],
      // repeats every Ath and Bth day of the week
      daysOfWeek: [A, B, ...],
      // repeats every Ath and Bth day of the month
      daysOfMonth: [A, B, ...],
      // repeats every day at startDate.time
      // aliased to { numOfDays = [1] }
      day: true,
      // repeats every week on startDate.dayOfWeek
      // aliased to { daysOfWeek = [startDate.dayOfWeek] }
      // equal to { numOfDays = [7] }
      week: true,
      // repeats every month on startDate.dayOfMonth
      // aliased to { daysOfMonth = [startDate.dayOfMonth] }
      month: true,
      // repeats every year on startDate.dayOfMonth of startDate.month
      year: true,
    },
    endDate, // cut-off date for event occurences
  };
  event.startDate; // first occurrence of event on which repetition is based
  event.endDate; // end of the first occurrence
*/

import moment from 'moment';

const dayMS = 24 * 60 * 60 * 1000;

// get occurences of `event` over the interval from `start` to `end`
export default function getOccurencesOfRepetition(event, start, end) {
  const startDate = new Date(event.startDate);
  const { endDate, every } = event.repeats;
  if (every.day) {
    every.numOfDays = [1];
  } else if (every.week) {
    every.daysOfWeek = [startDate.getDay()];
  } else if (every.month) {
    every.daysOfMonth = [startDate.getDate()];
  }

  const duration = event.endDate - event.startDate;
  let dates = [];
  if (every.numOfDays) {
    dates = Array.prototype.concat.apply([], every.numOfDays.map((num) => {
      // first occurrence after start
      const current = new Date(startDate.valueOf());
      if (current < start) {
        const s = new Date(start);
        current.setFullYear(s.getFullYear());
        current.setMonth(s.getMonth());
        current.setDate(s.getDate());

        if (current < start) {
          current.setDate(current.getDate() + 1);
        }
        const mod = ((current - startDate) % num) * dayMS;
        if (mod !== 0) {
          current.setDate(((current.getDate() + num) - mod) / dayMS);
        }
      }

      const out = [];
      while (current < end && (!endDate || current < endDate)) {
        out.push(current.valueOf());
        current.setDate(current.getDate() + num);
      }
      return out;
    }));
  } else if (every.daysOfWeek) {
    dates = Array.prototype.concat.apply([], every.daysOfWeek.map((day) => {
      // first occurrence after start
      const current = new Date(startDate.valueOf());
      if (current < start) {
        const s = new Date(start);
        current.setFullYear(s.getFullYear());
        current.setMonth(s.getMonth());
        current.setDate(s.getDate());

        if (current < start) {
          current.setDate(current.getDate() + 1);
        }
      }
      if (current.getDay() !== day) {
        let add = day - current.getDay();
        if (add < 0) {
          add += 7;
        }
        current.setDate(current.getDate() + add);
      }

      const out = [];
      while (current < end && (!endDate || current < endDate)) {
        out.push(current.valueOf());
        current.setDate(current.getDate() + 7);
      }
      return out;
    }));
  } else if (every.daysOfMonth) {
    dates = Array.prototype.concat.apply([], every.daysOfMonth.map((date) => {
      // first occurrence after start
      const current = new Date(startDate.valueOf());
      if (current < start) {
        const s = new Date(start);
        current.setFullYear(s.getFullYear());
        current.setMonth(s.getMonth());

        if (current < start) {
          current.setMonth(current.getMonth() + 1);
        }
      }
      current.setDate(date);

      const out = [];
      while (current < end && (!endDate || current < endDate)) {
        out.push(current.valueOf());
        current.setMonth(current.getMonth() + 1);
      }
      return out;
    }));
  } else if (every.year) {
    // first occurrence after start
    const current = new Date(startDate.valueOf());
    if (current < start) {
      const s = new Date(start);
      current.setFullYear(s.getFullYear());

      if (current < start) {
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    const out = [];
    while (current < end && (!endDate || current < endDate)) {
      out.push(current.valueOf());
      current.setFullYear(current.getFullYear() + 1);
    }
    dates = out;
  }

  const occurences = dates.map((date) => ({
    ...event,
    startDate: date,
    endDate: date + duration,
    day: moment.utc(date).format('YYYY-MM-DD'),
  }));
  return occurences;
}
