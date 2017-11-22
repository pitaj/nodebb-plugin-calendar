import fs from 'async-file';
import Promise from 'bluebird';
import {CronJob} from 'cron';
import rp from 'request-promise';
import os from 'os';
import path from 'path';

const p = Promise.promisify;
const db = require.main.require('./src/database');
const utils = require.main.require('./public/src/utils');

const sortedSetAdd = p(db.sortedSetAdd);
const sortedSetCard = p(db.sortedSetCard);
const sortedSetRemove = p(db.sortedSetRemove);
const setObject = p(db.setObject);
const getObjects = p(db.getObjects);
const dbDelete = p(db.delete);
const getSortedSetRange = p(db.getSortedSetRange);

const tmpDir = [os.tmpdir(), "nodebb-calendar"].join(path.sep);
fs.mkdir(tmpDir).catch(() => {});

const addICal = async (data) => {
  const icalId = utils.generateUUID();
  const count = await sortedSetCard('plugins:calendar:icals');
  const err = await sortedSetAdd('plugins:calendar:icals', count+1, icalId);
  const ical = await setObject('plugins:calendar:ical:' + icalId, data);
};

const getICals = async () => {
  const keys = await getSortedSetRange('plugins:calendar:icals', 0, -1);
  const icals = await getObjects(keys.map((key) => 'plugins:calendar:ical:' + key));
  for (let i = 0; i < icals.length; i++) {
    icals[i]._key = keys[i];
  }
  return icals;
};

const getICalBody = async (ical) => {
  const body = await fs.readFile([tmpDir, ical._key + ".ical"].join(path.sep));
  return body;
};

const deleteICal = async (icalId) => {
  await dbDelete('plugins:calendar:ical:' + icalId);
  await sortedSetRemove('plugins:calendar:icals', icalId);
};

const downloadICal = async (ical) => {
  const body = await rp(ical.url);
  const targetFile = [tmpDir, ical._key + ".ical"].join(path.sep);
  await fs.writeFile(targetFile, body);
};

const updateICalJob = new CronJob(
  '00 00 */12 * * *',
  async () => {
    const icals = await getICals();
    await Promise.all(icals.map(async (ical) => {
      try {
        await downloadICal(ical);
      } catch(e) {
        console.error("iCal download failed " + ical._key);
        return false;
      }
      return true;
    }));
  },
  null,
  true,
  null,
  null,
  true
);

export {
  addICal,
  getICals,
  getICalBody,
  deleteICal,
  updateICalJob,
};
