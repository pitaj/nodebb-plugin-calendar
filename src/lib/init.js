import controllers from './controllers';
import { initNotifierDaemon } from './reminders';
import { getSettings, setSettings } from './settings';

const shallowEqual = (a, b) => Object.keys(a).every(key => a[key] === b[key]);

export default ({ router, middleware }, callback) => {
  controllers(router, middleware);

  const defaults = {
    checkingInterval: 1000 * 60 * 5,
    checkingICalInterval: 60 * 24,
    mainPostOnly: false,
    respondIfCanReply: false,
  };
  (async () => {
    const old = await getSettings();
    const settings = { ...defaults, ...old };

    const changed = !shallowEqual(settings, old);
    if (changed) {
      await setSettings(settings);
    }

    await initNotifierDaemon();
  })().asCallback(callback);
};
