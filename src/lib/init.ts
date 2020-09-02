import controllers from './controllers';
import { initNotifierDaemon } from './reminders';

const nconf = require.main.require('nconf');

const primary = nconf.get('isPrimary') === 'true' || nconf.get('isPrimary') === true;

const init: static__app_load = async (params) => {
  controllers(params.router, params.middleware);

  if (primary) {
    await initNotifierDaemon();
  }
};

export default init;
