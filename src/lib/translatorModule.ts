import moment, { Locale } from 'moment';

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

interface NodebbTranslator {
  registerModule(
    name: string,
    moduleHandler: (language: string) => ((key: string, args: string[]) => string)
  ): void;
}

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

    function hasOwnProperty<T>(obj: T, key: string | number | symbol): key is keyof T {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }

    const data = zero.localeData();
    const localeData = (key: string, [n, ...a]: string[]) => {
      let member: Locale[keyof Locale];
      const loN = `_${n}`;
      if (hasOwnProperty(data, n)) {
        member = data[n];
      } else if (hasOwnProperty(data, loN)) {
        member = data[loN];
      } else {
        return '';
      }

      if (typeof member === 'function') {
        const args = a.map((x) => {
          if (x === 'true') {
            return true;
          }
          if (x === 'false') {
            return false;
          }
          if (/^[0-9]+$/.test(x)) {
            return parseInt(x, 10);
          }
          return x;
        });
        return (member as (...args: (string | number | boolean)[]) => string)(...args);
      }

      const [index] = a;
      if (member && hasOwnProperty(member, index)) {
        return member[index];
      }

      return '';
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
