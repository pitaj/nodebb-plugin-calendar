import moment, { RelativeTimeKey } from 'moment';
import { NodebbTranslator } from 'translator';

const justDate = 'dddd, LL';
const justTime = 'LT';
const dateAndTime = 'LLLL';

const formatDates = (
  s: number,
  e: number,
  allday: boolean,
  lang: string,
  utc: boolean
): string => {
  const mom = utc ? moment.utc : moment;

  const start = mom(s).locale(lang);
  const end = mom(e).locale(lang);

  if (Math.abs(s - e) <= 60 * 1000) {
    if (allday) {
      return start.format(justDate);
    }
    return start.format(dateAndTime);
  }

  if (
    start.dayOfYear() === end.dayOfYear() &&
    start.year() === end.year()
  ) {
    if (allday) {
      return start.format(justDate);
    }
    return `${start.format(justDate)}<br>` +
      `${start.format(justTime)} - ${end.format(justTime)}`;
  }

  if (allday) {
    return `${start.format(justDate)} - ${end.format(justDate)}`;
  }
  return `${start.format(dateAndTime)} - ${end.format(dateAndTime)}`;
};

const initialize = (Translator: NodebbTranslator): void => {
  Translator.registerModule('moment', (lang) => {
    const momentLang = lang.replace(/[_@]/g, '-');
    const zero = moment(0).locale(momentLang);

    const timeago = (key: string, [duration]: string[]) => {
      const ms = parseInt(duration, 10);
      switch (key) {
        case 'time-ago':
          return zero.from(ms);
        case 'time-in':
          return zero.to(ms);
        case 'time-duration':
          return zero.to(ms, true);
        default:
          return '';
      }
    };

    const timeDateView = (
      key: string,
      [timezone, start, end, allday]: string[]
    ) => {
      const s = parseInt(start, 10);
      const e = parseInt(end, 10);
      const isAllday = allday === 'true';

      if (timezone === 'utc') {
        return formatDates(s, e, isAllday, momentLang, true);
      }
      if (timezone === 'local') {
        return formatDates(s, e, isAllday, momentLang, false);
      }
      return '';
    };

    const data = zero.localeData();
    const localeData = (key: string, [method, a, b, c, d]: string[]) => {
      switch (method) {
        case 'months':
        case 'monthsShort':
        case 'weekdays':
        case 'weekdaysShort':
        case 'weekdaysMin': {
          const i = parseInt(a, 10);
          return data[method]()[i];
        }

        case 'relativeTime': {
          const isFuture = d === 'true';
          const withoutSuffix = b === 'true';
          const num = parseInt(a, 10);
          const unit = c.slice(0, (num === 1) ? 1 : 2) as RelativeTimeKey;

          if (a.trim() === '') {
            return data.relativeTime('', withoutSuffix, unit, isFuture).trim();
          }
          return data.relativeTime(num, withoutSuffix, unit, isFuture);
        }

        default:
          return '';
      }
    };

    return (key, args) => {
      switch (key) {
        case 'time-in':
        case 'time-ago':
        case 'time-duration':
          return timeago(key, args);
        case 'time-date-view':
          return timeDateView(key, args);
        case 'locale-data':
          return localeData(key, args);
        default:
          return '';
      }
    };
  });
};

export { formatDates, initialize };
