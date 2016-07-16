export default (router, middleware) => {
  const renderAdmin = (req, res) => {
    res.render('admin/plugins/calendar', {});
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  const renderPage = (req, res) => {
    res.render('calendar', {});
  };

  router.get('/calendar', middleware.buildHeader, renderPage);
  router.get('/api/calendar', renderPage);
};
