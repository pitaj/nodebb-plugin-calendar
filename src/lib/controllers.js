const privileges = require.main.require('./src/privileges');
const categories = require.main.require('./src/categories');
const meta = require.main.require('./src/meta');

import { getEvent, escapeEvent } from './event';
import { canViewPost } from './privileges';
import { eventTemplate } from './templates';
import { getUserResponse } from './responses';
import Promise from 'bluebird';
const p = Promise.promisify;

const getAllCategoryFields = p(categories.getAllCategoryFields);
const filterCids = p(privileges.categories.filterCids);
const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);

/* eslint-disable */
function shadeColor2(color, percent) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
/* eslint-enable */

export default (router, middleware) => {
  const renderAdmin = (req, res, next) => {
    getSettings('plugin-calendar').then((settings) => {
      res.render('admin/plugins/calendar', {
        settings,
      });
    }).catch(next);
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  router.get('/api/admin/plugins/calendar/save', (req, res, next) => {
    Promise.resolve()
      .then(() => setSettings('plugin-calendar', JSON.parse(req.query.settings)))
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  });

  const renderPage = (req, res, next) => {
    const cb = (err, data) => {
      if (err) {
        next(err);
        return;
      }
      res.render('calendar', data);
    };

    // not using server rendering for events because it could be a lot of info
    // better to have a fast page load time

    (async () => {
      const uid = req.uid;
      const cats = await getAllCategoryFields(['cid', 'bgColor']);
      const filtered = await filterCids('read', cats.map((c) => c.cid), uid);

      const colors = cats.filter((c) => filtered.includes(c.cid));

      const style = colors.map(({ cid, bgColor }) => `
        .plugin-calendar-cal-event-category-${cid} {
        background-color: ${bgColor};
        border-color: ${shadeColor2(bgColor, -0.2)};
      }`);

      const { eventPid: pid, eventDay: day } = req.params;

      if (!pid || !(await canViewPost(pid, uid))) {
        return {
          calendarEventsStyle: style.join('\n'),
          title: '[[calendar:calendar]]',
        };
      }

      const raw = await getEvent(pid);
      const event = await escapeEvent(raw);
      event.day = day || null;

      const { startDate, endDate } = event;
      const occurenceDate = new Date(day);
      const s = new Date(startDate);

      s.setUTCFullYear(occurenceDate.getUTCFullYear());
      s.setUTCDate(occurenceDate.getUTCDate());
      s.setUTCMonth(occurenceDate.getUTCMonth());

      event.startDate = s.valueOf();
      event.endDate = event.startDate + (endDate - startDate);

      event.responses = {
        [uid]: await getUserResponse({ pid, day, uid }),
      };

      return {
        calendarEventsStyle: style.join('\n'),
        title: '[[calendar:calendar]]',
        eventData: event,
        eventJSON: JSON.stringify(event),
        eventHTML: eventTemplate({ event, uid }),
      };
    })().asCallback(cb);
  };

  router.get('/calendar/event/:eventPid/:eventDay', middleware.buildHeader, renderPage);
  router.get('/api/calendar/event/:eventPid/:eventDay', renderPage);
  router.get('/calendar/event/:eventPid', middleware.buildHeader, renderPage);
  router.get('/api/calendar/event/:eventPid', renderPage);
  router.get('/calendar', middleware.buildHeader, renderPage);
  router.get('/api/calendar', renderPage);
};
