import Promise from 'bluebird';

const p = Promise.promisify;
const db = require.main.require('./src/database');
const utils = require.main.require('./public/src/utils');

const sortedSetAdd = p(db.sortedSetAdd);
const sortedSetCard = p(db.sortedSetCard);
const setObject = p(db.setObject);
const getSortedSetRange = p(db.getSortedSetRange);

const addICal = async (data) => {
  const icalId = utils.generateUUID();
  const count = await sortedSetCard('plugins:calendar:icals');
  const err = await sortedSetAdd('plugins:calendar:icals', count+1, icalId);
  const asd = await setObject('plugins:calendar:ical:' + icalId, data);
};

const getICals = async () => {
  const icals = await getSortedSetRange('plugins:calendar:icals');
  console.log(icals);
}

export {
  addICal,
  getICals,
};
