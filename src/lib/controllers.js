import { promisify as p, callbackify } from 'util';
import { getEvent, escapeEvent, getEventsByDate } from './event';
import { canViewPost, filterByPid } from './privileges';
import eventTemplate from './templates';
import { getUserResponse } from './responses';
import { getSettings, setSettings } from './settings';
import getOccurencesOfRepetition from './repetition';

const privileges = require.main.require('./src/privileges');
const categories = require.main.require('./src/categories');
const user = require.main.require('./src/user');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const getAllCategoryFields = p(categories.getAllCategoryFields);
const getCategoriesFields = p(categories.getCategoriesFields);
const filterCids = p(privileges.categories.filterCids);
const getUsersData = p(user.getUsersData);
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));

/* eslint-disable */
function shadeColor2(color, percent) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
/* eslint-enable */

export default (router, middleware) => {
  const renderAdmin = (req, res, next) => {
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
      .then(() => setSettings(JSON.parse(req.query.settings)))
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  });

  const renderCalendarCb = callbackify(async ({ uid, params }) => {
    const cats = await getAllCategoryFields(['cid', 'bgColor']);
    const filtered = new Set(await filterCids('read', cats.map(c => c.cid), uid));

    const colors = cats.filter(c => filtered.has(c.cid));

    const style = colors.map(({ cid, bgColor }) => `
    .plugin-calendar-cal-event-category-${cid} {
      background-color: ${bgColor};
      border-color: ${shadeColor2(bgColor, -0.2)};
    }`);

    const { eventPid: pid, eventDay: day } = params;

    if (!pid || !(await canViewPost(pid, uid))) {
      return {
        calendarEventsStyle: style.join('\n'),
        title: '[[calendar:calendar]]',
        eventJSON: 'null',
      };
    }

    const raw = await getEvent(pid);
    const [event, userResponse] = await Promise.all([
      escapeEvent(raw),
      getUserResponse({ pid, day, uid }),
    ]);
    event.day = day || null;

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

    event.responses = {
      [uid]: userResponse,
    };

    return {
      calendarEventsStyle: style.join('\n'),
      title: '[[calendar:calendar]]',
      eventData: event,
      eventJSON: JSON.stringify(event),
      eventHTML: await eventTemplate({ event, uid }),
    };
  });

  const renderCalendar = (req, res, next) => {
    const cb = (err, data) => {
      if (err) {
        next(err);
        return;
      }
      res.render('calendar', data);
    };

    renderCalendarCb(req, cb);
  };

  router.get('/calendar/event/:eventPid/:eventDay', middleware.buildHeader, renderCalendar);
  router.get('/api/calendar/event/:eventPid/:eventDay', renderCalendar);
  router.get('/calendar/event/:eventPid', middleware.buildHeader, renderCalendar);
  router.get('/api/calendar/event/:eventPid', renderCalendar);
  router.get('/calendar', middleware.buildHeader, renderCalendar);
  router.get('/api/calendar', renderCalendar);

  const renderUpcomingCb = callbackify(async ({ uid }) => {
    const end = new Date();
    end.setMonth(end.getMonth() + 3);

    const endDate = end.valueOf();
    const startDate = Date.now();

    const events = await getEventsByDate(startDate, endDate);
    const filtered = await filterByPid(events, uid);

    const cids = new Set();
    const uids = new Set();
    const pids = new Set();

    const occurences = filtered.reduce((prev, event) => {
      cids.add(event.cid);
      uids.add(event.uid);
      pids.add(event.pid);

      if (event.repeats && event.repeats.every) {
        return [...prev, ...getOccurencesOfRepetition(event, startDate, endDate)];
      }
      return [...prev, event];
    }, []);

    const [cats, users, deletedTopics, escaped] = await Promise.all([
      getCategoriesFields([...cids], []),
      getUsersData([...uids]),
      Promise.all([...pids].map(async (pid) => {
        const tid = await tidFromPid(pid);
        return parseInt(await topicIsDeleted(tid), 10) && pid;
      })),
      Promise.all(occurences.map(event => escapeEvent(event))),
    ]);

    const pidInDeletedTopic = new Set(deletedTopics.filter(Boolean));
    const userMap = new Map(users.map(u => [u.uid, u]));
    const catMap = new Map(cats.map(c => [c.cid, c]));

    escaped.forEach((event) => {
      if (pidInDeletedTopic.has(event.pid)) {
        return;
      }

      const c = catMap.get(event.cid);
      c.events = c.events || [];

      c.events.push({
        ...event,
        user: userMap.get(event.uid),
      });
    });

    return {
      categories: [...catMap.values()],
    };
  });

  const renderUpcoming = (req, res, next) => {
    const cb = (err, data) => {
      if (err) {
        next(err);
        return;
      }
      res.render('events/upcoming', data);
    };

    renderUpcomingCb(req, cb);
  };

  router.get('/events/upcoming', middleware.buildHeader, renderUpcoming);
  router.get('/api/events/upcoming', renderUpcoming);
};
