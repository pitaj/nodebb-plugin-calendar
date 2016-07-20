/* global $ */

import moment from 'moment';

const justDate = 'dddd, LL';
const justTime = 'LT';
const dateAndTime = 'LLLL';

const formatDates = (s, e, allday, utc) => {
  const mom = utc ? moment.utc : moment;

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

const parseTimeDateViews = () => {
  $('.plugin-calendar-time-date-view[data-parsed=false]').each((i, elem) => {
    const el = $(elem);
    const s = parseInt(el.attr('data-startDate'), 10);
    const e = parseInt(el.attr('data-endDate'), 10);
    const allday = el.attr('data-allday') === 'true';
    const dateString = formatDates(s, e, allday);

    el.html(dateString);
  });
};

const initTimeDateViews = () => {
  $(window).on(
    'action:posts.loaded action:ajaxify.end action:posts.edited action:calendar.event.display',
    parseTimeDateViews
  );
};

export default initTimeDateViews;
