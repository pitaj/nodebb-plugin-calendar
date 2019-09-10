import { canRespond, canViewPost } from './privileges';
import { listKey } from './event';

const {
  setAdd,
  setsRemove,
  deleteAll,
  getSetsMembers,
  isSetMember,
} = require.main.require('./src/database');
const { getUsersFields } = require.main.require('./src/user');

const values = ['yes', 'maybe', 'no'];

const submitResponse = async ({ pid, uid, value, day }) => {
  if (!values.includes(value)) {
    throw Error('[[error:invalid-data]]');
  }
  if (!uid || !await canRespond(pid, uid)) {
    throw Error('[[error:no-privileges]]');
  }

  let toAddKey;
  let toRemoveKeys;
  if (day) {
    toAddKey = `${listKey}:pid:${pid}:responses:day:${day}:${value}`;
    toRemoveKeys = values
      .filter((val) => val !== value)
      .map((val) => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    toAddKey = `${listKey}:pid:${pid}:responses:${value}`;
    toRemoveKeys = values
      .filter((val) => val !== value)
      .map((val) => `${listKey}:pid:${pid}:responses:${val}`);
  }

  await Promise.all([
    setsRemove(toRemoveKeys, uid),
    setAdd(toAddKey, uid),
    setAdd(`${listKey}:pid:${pid}:responses:lists`, toAddKey),
  ]);
};

const removeAll = async (pid) => {
  const lists = await getSetsMembers(`${listKey}:pid:${pid}:responses:lists`);
  const old = values
    .map((val) => `${listKey}:pid:${pid}:responses:${val}`);
  await deleteAll([`${listKey}:pid:${pid}:responses:lists`, ...lists, ...old]);
};

const getAll = async ({ pid, uid = 0, selection = values, day } = {}) => {
  if (!await canViewPost(pid, uid)) {
    throw Error('[[error:no-privileges]]');
  }

  let keys;
  if (day) {
    keys = selection
      .map((val) => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    keys = selection
      .map((val) => `${listKey}:pid:${pid}:responses:${val}`);
  }

  const responseUids = await getSetsMembers(keys);
  const userFields = ['userslug', 'picture', 'username', 'icon:bgColor', 'icon:text'];

  const [yes, maybe, no] = await Promise.all(responseUids
    .map((uids) => getUsersFields(uids, userFields)));

  return {
    yes,
    maybe,
    no,
  };
};

const getUserResponse = async ({ pid, uid, day }) => {
  if (!uid || !await canRespond(pid, uid)) {
    throw Error('[[error:no-privileges]]');
  }

  let keys;
  if (day) {
    keys = values
      .map((val) => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    keys = values
      .map((val) => `${listKey}:pid:${pid}:responses:${val}`);
  }

  const arr = await Promise.all(keys.map((key) => isSetMember(key, uid)));
  return values[arr.findIndex((val) => !!val)];
};

export { submitResponse, removeAll, getAll, getUserResponse };
