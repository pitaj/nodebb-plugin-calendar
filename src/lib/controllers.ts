import { Router, RequestHandler, Request } from 'express';

import { getEvent, escapeEvent } from './event';
import { canViewPost } from './privileges';
import eventTemplate from './templates';
import { getUserResponse } from './responses';
import { getSetting, getSettings, setSettings } from './settings';

const { filterCids } = require.main?.require('./src/privileges').categories;
const { getAllCategoryFields } = require.main?.require('./src/categories');

/* eslint-disable */
function shadeColor2(color: string, percent: number) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
/* eslint-enable */

// eslint-disable-next-line
const controllers = (router: Router, middleware: any): void => {
  const renderAdmin: RequestHandler = (req, res, next) => {
    getSettings().then((settings) => {
      res.render('admin/plugins/calendar', {
        settings,
      });
    }).catch(next);
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  router.get('/api/admin/plugins/calendar/save', (req, res, next) => {
    Promise.resolve()
      .then(() => setSettings(JSON.parse(req.query.settings as string)))
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  });

  const renderPage = async ({ uid, params }: Request) => {
    const [cats, calendarViews] = await Promise.all([
      getAllCategoryFields(['cid', 'bgColor', 'color']) as { cid: number, bgColor: string, color: string}[],
      getSetting('calendarViews'),
    ]);
    const filtered = new Set(await filterCids('read', cats.map(c => c.cid), uid));

    const colors = cats.filter(c => filtered.has(c.cid));

    const style = colors.map(({ cid, bgColor, color }) => `
      .plugin-calendar-cal-event-category-${cid} {
      background-color: ${bgColor};
      color: ${color};
      border-color: ${shadeColor2(bgColor, -0.2)};
    }`);

    const pid = parseInt(params.eventPid, 10);
    const day: string = params.eventDay;

    if (!pid || !(await canViewPost(pid, uid))) {
      return {
        calendarEventsStyle: style.join('\n'),
        title: '[[calendar:calendar]]',
        eventJSON: 'null',
        calendarViews,
      };
    }

    const raw = await getEvent(pid);
    const [event, userResponse] = await Promise.all([
      escapeEvent(raw),
      getUserResponse({ pid, day, uid }).catch((err): 'unable' => {
        if (err.message === '[[error:no-privileges]]') {
          return 'unable';
        }
        throw err;
      }),
    ]);
    event.day = day || undefined;

    if (event.repeats && event.day) {
      const { startDate, endDate } = event;
      const occurenceDate = new Date(day);
      const s = new Date(startDate);

      s.setUTCFullYear(occurenceDate.getUTCFullYear());
      s.setUTCDate(occurenceDate.getUTCDate());
      s.setUTCMonth(occurenceDate.getUTCMonth());

      event.startDate = s.valueOf();
      event.endDate = event.startDate + (endDate - startDate);
    }

    event.responses = {};
    if (userResponse !== 'unable') {
      event.responses[uid] = userResponse;
    }

    return {
      calendarEventsStyle: style.join('\n'),
      title: '[[calendar:calendar]]',
      eventData: event,
      eventJSON: JSON.stringify(event),
      eventHTML: await eventTemplate({ event, uid, canRespond: userResponse !== 'unable' }),
      calendarViews,
    };
  };

  const renderPageHandler: RequestHandler = (req, res, next) => {
    renderPage(req).then(
      data => res.render('calendar', data),
      err => setImmediate(next, err)
    );
  };

  router.get('/calendar/event/:eventPid/:eventDay', middleware.buildHeader, renderPageHandler);
  router.get('/api/calendar/event/:eventPid/:eventDay', renderPageHandler);
  router.get('/calendar/event/:eventPid', middleware.buildHeader, renderPageHandler);
  router.get('/api/calendar/event/:eventPid', renderPageHandler);
  router.get('/calendar', middleware.buildHeader, renderPageHandler);
  router.get('/api/calendar', renderPageHandler);
};

export default controllers;
