const privileges = require.main.require('./src/privileges');
const categories = require.main.require('./src/categories');

// import { getEventsByDate, filterByPid, escapeEvent } from './event';
import Promise from 'bluebird';
const p = Promise.promisify;

const getAllCategoryFields = p(categories.getAllCategoryFields);
const filterCids = p(privileges.categories.filterCids);

/* eslint-disable */
function shadeColor2(color, percent) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
/* eslint-enable */

export default (router, middleware) => {
  const renderAdmin = (req, res) => {
    res.render('admin/plugins/calendar', {});
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  const renderPage = (req, res, next) => {
    const cb = (err, data) => {
      if (err) {
        next(err);
        return;
      }
      res.render('calendar', data);
    };
    //
    // const startDate = new Date();
    // const endDate = new Date();
    // startDate.setDate(-1);
    // endDate.setDate(32);
    //
    // (async uid => {
    //   const events = await getEventsByDate(startDate.valueOf(), endDate.valueOf());
    //   const filtered = await filterByPid(events, uid);
    //   const escaped = await Promise.all(filtered.map(escapeEvent));
    //
    //   return {
    //     cal: JSON.stringify({
    //       events: escaped,
    //       startDate: startDate.valueOf(),
    //       endDate: endDate.valueOf(),
    //     }),
    //   };
    // })(req.uid).asCallback(cb);

    (async () => {
      const cats = await getAllCategoryFields(['cid', 'bgColor']);
      const filtered = await filterCids('read', cats.map((c) => c.cid), req.uid);

      const colors = cats.filter((c) => filtered.includes(c.cid));

      const style = colors.map(({ cid, bgColor }) =>
        `.plugin-calendar-cal-event-category-${cid} {
          background-color: ${bgColor};
          border-color: ${shadeColor2(bgColor, -0.2)};
        }`
      );

      return {
        calendarEventsStyle: style.join('\n'),
        title: '[[calendar:calendar]]',
      };
    })().asCallback(cb);

    // res.render('calendar', {});
  };

  router.get('/calendar', middleware.buildHeader, renderPage);
  router.get('/api/calendar', renderPage);
};
