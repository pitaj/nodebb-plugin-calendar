/* global $, config */

import { formatDates } from '../lib/template';

const lang = config.userLang || config.defaultLang;
const momentLang = lang.toLowerCase().replace(/_/g, '-');

const parseTimeDateViews = () => {
  $('.plugin-calendar-time-date-view[data-parsed=false]').each((i, elem) => {
    const el = $(elem);
    const s = parseInt(el.attr('data-startDate'), 10);
    const e = parseInt(el.attr('data-endDate'), 10);
    const allday = el.attr('data-allday') === 'true';
    const dateString = formatDates(s, e, allday, momentLang);

    el.html(dateString);
  });
};

const initTimeDateViews = () => {
  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
    'action:calendar.event.display',
    'action:composer.preview',
  ].join(' '), parseTimeDateViews);
  parseTimeDateViews();
};

export default initTimeDateViews;
