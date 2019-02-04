import { callbackify } from 'util';

import controllers from './controllers';
import { initNotifierDaemon } from './reminders';
import { getSettings, setSettings } from './settings';

const nconf = require.main.require('nconf');

const primary = nconf.get('isPrimary') === 'true' || nconf.get('isPrimary') === true;

const shallowEqual = (a, b) => Object.keys(a).every(key => a[key] === b[key]);

const initCb = callbackify(async () => {
  const defaults = {
    checkingInterval: 1000 * 60 * 5,
    mainPostOnly: false,
    respondIfCanReply: false,
  };

  const old = await getSettings();
  const settings = { ...defaults, ...old };

  const changed = !shallowEqual(settings, old);
  if (changed) {
    await setSettings(settings);
  }

  if (primary) {
    await initNotifierDaemon();
  }
});

export default ({ router, middleware }, callback) => {
  controllers(router, middleware);

  initCb(callback);
};
