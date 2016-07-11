const meta = require.main.require('./src/meta');

import Promise from 'bluebird';
const p = Promise.promisify;

const getSettings = p(meta.settings.get);
const setSettings = p(meta.settings.set);
import controllers from './controllers';

export default ({ router, middleware }, callback) => {
  controllers(router, middleware);

  const defaults = {
    permissions: {
      group: 'registered-users', // anyone can post an event
    },
  };

  getSettings('plugin-calendar').then(settings =>
    setSettings('plugin-calendar', { ...defaults, ...settings })
  ).asCallback(callback);

  // TODO: configuration
  // TODO: notification scheduler
};
