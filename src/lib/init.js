const meta = require.main.require('./src/meta');

import Promise from 'bluebird';
const p = Promise.promisify;

const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);
import controllers from './controllers';
import { initNotifierDaemon } from './reminders';

export default ({ router, middleware }, callback) => {
  controllers(router, middleware);

  const defaults = {
    checkingInterval: 1000 * 60 * 5,
  };

  getSettings('plugin-calendar').then((settings) =>
    setSettings('plugin-calendar', { ...defaults, ...settings })
  )
  .then(() => initNotifierDaemon())
  .asCallback(callback);

  // TODO: configuration
};
