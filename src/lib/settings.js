import Promise from 'bluebird';

const db = require.main.require('./src/database');

const p = Promise.promisify;
const getObject = p(db.getObject);
const getObjectField = p(db.getObjectField);
const setObject = p(db.setObject);

const convert = {
  checkingInterval: x => parseInt(x, 10) || 1000 * 60 * 5,
  checkingICalInterval: x => parseInt(x, 10) || 60 * 24,
  respondIfCanReply: x => x === true || x === 'true',
  mainPostOnly: x => x === true || x === 'true',
};

const getSettings = async () => {
  const { checkingInterval, checkingICalInterval, respondIfCanReply, mainPostOnly } = await getObject('plugin-calendar:settings') || {};
  return {
    checkingInterval: convert.checkingInterval(checkingInterval),
    checkingICalInterval: convert.checkingICalInterval(checkingICalInterval),
    respondIfCanReply: convert.respondIfCanReply(respondIfCanReply),
    mainPostOnly: convert.mainPostOnly(mainPostOnly),
  };
};

const setSettings = settings => setObject('plugin-calendar:settings', settings);

const getSetting = async (key) => {
  const value = await getObjectField('plugin-calendar:settings', key);
  if (!convert[key]) {
    throw Error('invalid-data');
  }
  return convert[key](value);
};

export {
  getSettings,
  getSetting,
  setSettings,
};
