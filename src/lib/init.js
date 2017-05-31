import Promise from 'bluebird';
import controllers from './controllers';
import { initNotifierDaemon } from './reminders';

const meta = require.main.require('./src/meta');

const p = Promise.promisify;

const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);

const shallowEqual = (a, b) => Object.keys(a).every(key => a[key] === b[key]);

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
