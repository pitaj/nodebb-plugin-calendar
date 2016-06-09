const db = require.main.require('./src/database');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
import Promise from 'bluebird';
import validator from 'validator';
import parse from './parse';
import postTemplate from './template';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const setObject = p(db.setObject);
const getUserSettings = p(user.getSettings);
const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);

const listKey = 'plugins:calendar:events';
const objectKey = `${listKey}:id`;

const save = async event => {
  const name = validator.escape(event.name);
  await Promise.all([
    sortedSetAdd(listKey, event.startDate, event.id),
    setObject(`${objectKey}:${event.id}`, { ...event, name }),
  ]);
};

const parsePost = async postData => {
  const event = parse(postData.content);
  if (!event) {
    return postData;
  }
  event.pid = postData.pid;

  const userLang = (await getUserSettings(postData.uid)).userLang;
  const content = postData.content.replace(
    parse.tagTemplate('event', '[\\w\\W]*'),
    postTemplate(event, userLang)
  );
  await save(event);

  return {
    ...postData,
    content,
  };
};

export default {
  init: ({ router, middleware }, callback) => {
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

    const defaults = {};
    getSettings('plugin-calendar').then(sets => {
      const settings = { ...sets };
      Object.keys(defaults).forEach(key => {
        if (!settings.hasOwnProperty(key)) {
          settings[key] = defaults[key];
        }
      });
      return setSettings('plugin-calendar', settings);
    })
    .then(() => callback())
    .catch(err => callback(err));
  },
  addNavigation: (navs, callback) => {
    navs.push({
      route: '/calendar',
      title: '\\[\\[calendar:calendar\\]\\]',
      iconClass: 'fa-calendar',
      textClass: 'visible-xs-inline',
      text: '\\[\\[calendar:calendar\\]\\]',
    });
    callback(null, navs);
  },
  adminMenu: (header, callback) => {
    header.plugins.push({
      route: '/plugins/calendar',
      icon: 'fa-calendar',
      name: 'Calendar',
    });
    callback(null, header);
  },
  parsePost: ({ postData }, callback) =>
    parsePost(postData).asCallback(callback),
  parseRaw: (content, callback) => {
    const event = parse(content);
    if (!event) {
      callback(null, content);
    }
    const lang = meta.config.defaultLang || 'en_GB';
    callback(null, content.replace(
      parse.tagTemplate('event', '[\\w\\W]*'),
      postTemplate(event, lang),
    ));
  },
};
