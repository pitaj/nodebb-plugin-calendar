const meta = require.main.require('./src/meta');

import Promise from 'bluebird';
const p = Promise.promisify;

const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);
import controllers from './controllers';
import { initNotifierDaemon } from './reminders';

const shallowEqual = (a, b) => {
  const aKeys = Object.keys(a);
  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

export default ({ router, middleware }, callback) => {
  controllers(router, middleware);

  const defaults = {
    checkingInterval: 1000 * 60 * 5,
    mainPostOnly: false,
    respondIfCanReply: false,
  };
  (async () => {
    const old = await getSettings('plugin-calendar');
    const settings = { ...defaults, ...old };

    const changed = !shallowEqual(settings, old);
    if (changed) {
      await setSettings('plugin-calendar', settings);
    }

    await initNotifierDaemon();
  })().asCallback(callback);
};
