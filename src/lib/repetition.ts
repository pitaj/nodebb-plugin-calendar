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
import { Event } from './event';

export interface Repeats {
  endDate: number,
  every: {
    // [A, B] repeats every A days and every B days from first instance
    numOfDays?: number[],
    // [A, B] repeats every Ath and Bth day of the week
    daysOfWeek?: number[],
    // [A, B] repeats every Ath and Bth day of the month
    // if dayOfMonth > days in current month, use maximum possible
    daysOfMonth?: number[],
    // repeats every day at startDate.time
    // aliased to { numOfDays = [1] }
    day?: boolean,
    // repeats every 7 days
    // aliased to { numOfDays = [7] }
    // equal to { daysOfWeek = [startDate.dayOfWeek] }
    week?: boolean,
    // repeats every month on startDate.dayOfMonth
    // aliased to { daysOfMonth = [startDate.dayOfMonth] }
    month?: boolean,
    // repeats every year on startDate.dayOfMonth of startDate.month
    year?: boolean,
  }
}

interface Occurence extends Event {
  startDate: number,
  endDate: number,
  day: string,
}

// get occurences of `event` over the interval from `start` to `end`
export default function getOccurencesOfRepetition(
  event: Event,
  start: number,
  end: number
): Occurence[] {
  const startDate = new Date(event.startDate);
  const endDate = event.repeats.endDate || Infinity;
  const every = event.repeats.every;

  // handle aliases
  if (every.day) {
    every.numOfDays = [1];
  } else if (every.week) {
    every.numOfDays = [7];
  } else if (every.month) {
    every.daysOfMonth = [startDate.getDate()];
  }

  const duration = event.endDate - event.startDate;
  let dates: number[] = [];
  if (every.numOfDays) {
    dates = Array.prototype.concat.apply([], every.numOfDays.map((num) => {
      const current = moment(event.startDate);

      // increase by `num` days until we're within the target range
      while (current.isBefore(start)) {
        current.add(num, 'days');
      }
      // now `current` is first occurence within range

      // add repetitions until reaching the end of the target range
      const out = [];
      // need to use direct comparison as `moment#isBefore(Infinity) === false`
      while (current.valueOf() < end && current.valueOf() < endDate) {
        out.push(current.valueOf());
        // increase by `num` days for next repetition
        current.add(num, 'days');
      }
      return out;
    }));
  } else if (every.daysOfWeek) {
    dates = Array.prototype.concat.apply([], every.daysOfWeek.map((day) => {
      const current = moment(event.startDate);
      // set day of week
      current.set('day', day);

      // increase by week until we're within the target range
      while (current.isBefore(event.startDate) && current.isBefore(start)) {
        current.add(1, 'week');
      }
      // now `current` is first occurence within range

      // add repetitions until reaching the end of the target range
      const out = [];
      // need to use direct comparison as `moment#isBefore(Infinity) === false`
      while (current.valueOf() < end && current.valueOf() < endDate) {
        out.push(current.valueOf());
        // increase by 1 week for next repetition
        current.add(1, 'week');
      }
      return out;
    }));
  } else if (every.daysOfMonth) {
    dates = Array.prototype.concat.apply([], every.daysOfMonth.map((date) => {
      const current = moment(event.startDate);
      // set day of month
      current.set('date', date);

      // increase by month until we're within the target range
      while (current.isBefore(event.startDate) && current.isBefore(start)) {
        current.add(1, 'month');
      }
      // now `current` is first occurence within range

      // add repetitions until reaching the end of the target range
      const out = [];
      // need to use direct comparison as `moment#isBefore(Infinity) === false`
      while (current.valueOf() < end && current.valueOf() < endDate) {
        out.push(current.valueOf());
        // increase by 1 week for next repetition
        current.add(1, 'month');
      }
      return out;
    }));
  } else if (every.year) {
    const current = moment(event.startDate);

    // increase by years until we're within the target range
    while (current.isBefore(start)) {
      current.add(1, 'year');
    }
    // now `current` is first occurence within range

    // add repetitions until reaching the end of the target range
    const out = [];
    // need to use direct comparison as `moment#isBefore(Infinity) === false`
    while (current.valueOf() < end && current.valueOf() < endDate) {
      out.push(current.valueOf());
      // increase by 1 year for next repetition
      current.add(1, 'years');
    }
    dates = out;
  }

  const occurences = dates.map(date => ({
    ...event,
    startDate: date,
    endDate: date + duration,
    day: moment.utc(date).format('YYYY-MM-DD'),
  }));
  return occurences;
}
