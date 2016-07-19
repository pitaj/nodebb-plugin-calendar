// import { getEventsByDate, filterByPid, escapeEvent } from './event';

export default (router, middleware) => {
  const renderAdmin = (req, res) => {
    res.render('admin/plugins/calendar', {});
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  const renderPage = (req, res) => { // next
    // const cb = (err, data) => {
    //   if (err) {
    //     next(err);
    //     return;
    //   }
    //   res.render('calendar', data);
    // };
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


    res.render('calendar', {});
  };

  router.get('/calendar', middleware.buildHeader, renderPage);
  router.get('/api/calendar', renderPage);
};
