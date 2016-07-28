const db = require.main.require('./src/database');
const user = require.main.require('./src/user');

import { canViewPost } from './privileges';
import Promise from 'bluebird';

const p = Promise.promisify;

const setAdd = p(db.setAdd);
const setsRemove = p(db.setsRemove);
const deleteAll = p(db.deleteAll);
const getSetsMembers = p(db.getSetsMembers);
const isSetMember = p(db.isSetMember);
const getUsersFields = p(user.getUsersFields);

const listKey = 'plugins:calendar:events';
const values = ['yes', 'maybe', 'no'];

const submitResponse = async ({ pid, uid, value }) => {
  if (!values.includes(value)) {
    throw new Error('[[error:invalid-data]]');
  }
  if (!await canViewPost(pid, uid)) {
    throw new Error('[[error:no-privileges]]');
  }

  await Promise.all([
    setsRemove(values
      .filter((val) => val !== value)
      .map((val) => `${listKey}:pid:${pid}:responses:${val}`), uid),
    setAdd(`${listKey}:pid:${pid}:responses:${value}`, uid),
  ]);
};

const removeAll = (pid) => deleteAll(
  values.map((val) => `${listKey}:pid:${pid}:responses:${val}`)
);

const getAll = async ({ pid, uid = false, selection = values } = {}) => {
  if (uid !== false && !await canViewPost(pid, uid)) {
    throw new Error('[[error:no-privileges]]');
  }

  const responseUids = await getSetsMembers(selection
    .map((val) => `${listKey}:pid:${pid}:responses:${val}`));
  const userFields = ['userslug', 'picture', 'username', 'icon:bgColor', 'icon:text'];

  const [yes, maybe, no] = await Promise.all(responseUids
    .map((uids) => getUsersFields(uids, userFields)));

  return {
    yes,
    maybe,
    no,
  };
};

const getUserResponse = async ({ pid, uid }) => {
  if (!await canViewPost(pid, uid)) {
    throw new Error('[[error:no-privileges]]');
  }

  const arr = await Promise.all(
    values.map((val) => isSetMember(`${listKey}:pid:${pid}:responses:${val}`, uid))
  );

  return values[arr.findIndex((val) => !!val)];
};

export { submitResponse, removeAll, getAll, getUserResponse };
