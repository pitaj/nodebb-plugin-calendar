import moment from 'moment';

const justDate = 'dddd, LL';
const justTime = 'LT';
const dateAndTime = 'LLLL';

const formatDates = (s, e, allday, lang, utc) => {
  const mom = utc ? moment.utc : moment;
  moment.locale(lang);

  const start = mom(s);
  const end = mom(e);

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

const init = (Translator) => {
  Translator.registerModule('time', (lang) => {
    const zero = moment(0).locale(lang.toLowerCase().replace('_', '-'));

    return (key, [duration]) => {
      const ms = parseInt(duration, 10);
      switch (key) {
        case 'ago':
          return zero.from(ms);
        case 'in':
          return zero.to(ms);
        case 'duration':
          return zero.to(ms, true);
        default:
          return '';
      }
    };
  });

  Translator.registerModule('time-date-view', (lang) => (key, [start, end, allday]) => {
    const s = parseInt(start, 10);
    const e = parseInt(end, 10);
    const isAllday = allday === 'true';
    const momentLang = lang.replace(/[_@]/g, '-');

    if (key === 'utc') {
      return formatDates(s, e, isAllday, momentLang, true);
    }
    if (key === 'local') {
      return formatDates(s, e, isAllday, momentLang, false);
    }
    return '';
  });
};

export { formatDates };
export default init;
