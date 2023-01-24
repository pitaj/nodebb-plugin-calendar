import { canRespond, canViewPost } from './privileges';
import { listKey } from './event';

const {
  setAdd,
  setsRemove,
  deleteAll,
  getSetsMembers,
  isSetMember,
  setsCount,
} = (require.main as NodeJS.Module).require('./src/database');
const { getUsersFields } = (require.main as NodeJS.Module).require('./src/user');

export type Response = 'yes' | 'maybe' | 'no';
const values: Response[] = ['yes', 'maybe', 'no'];

export type ResponsesCount = {
  [R in Response]: number
};

const submitResponse = async (
  { pid, uid, value, day }:
  { pid: number, uid: number, value: Response, day?: string }
): Promise<void> => {
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
      .filter(val => val !== value)
      .map(val => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    toAddKey = `${listKey}:pid:${pid}:responses:${value}`;
    toRemoveKeys = values
      .filter(val => val !== value)
      .map(val => `${listKey}:pid:${pid}:responses:${val}`);
  }

  await Promise.all([
    setsRemove(toRemoveKeys, uid),
    setAdd(toAddKey, uid),
    setAdd(`${listKey}:pid:${pid}:responses:lists`, toAddKey),
  ]);
};

const removeAll = async (pid: number): Promise<void> => {
  const lists = await getSetsMembers(`${listKey}:pid:${pid}:responses:lists`);
  const old = values
    .map(val => `${listKey}:pid:${pid}:responses:${val}`);
  await deleteAll([`${listKey}:pid:${pid}:responses:lists`, ...lists, ...old]);
};

interface User {
  uid: number,
  userslug: string,
  picture: string,
  username: string,
  'icon:bgColor': string,
  'icon:text': string,
}

export type ResponseCollection = {
  [R in Response]: User[]
};

const getAll = async (
  { pid, uid = 0, selection = values, day }:
  { pid: number, uid?: number, selection?: Response[], day?: string } = { pid: 0 }
): Promise<ResponseCollection> => {
  if (!await canViewPost(pid, uid)) {
    throw Error('[[error:no-privileges]]');
  }

  let keys;
  if (day) {
    keys = selection
      .map(val => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    keys = selection
      .map(val => `${listKey}:pid:${pid}:responses:${val}`);
  }

  const responseUids: string[] = await getSetsMembers(keys);
  const userFields = ['uid', 'userslug', 'picture', 'username', 'icon:bgColor', 'icon:text'];

  const [yes, maybe, no] = await Promise.all(
    responseUids.map(uids => getUsersFields(uids, userFields))
  );

  return {
    yes,
    maybe,
    no,
  };
};

const getUserResponse = async (
  { pid, uid, day }: { pid: number, uid: number, day?: string }
): Promise<Response> => {
  if (!uid || !await canRespond(pid, uid)) {
    throw Error('[[error:no-privileges]]');
  }

  let keys;
  if (day) {
    keys = values
      .map(val => `${listKey}:pid:${pid}:responses:day:${day}:${val}`);
  } else {
    keys = values
      .map(val => `${listKey}:pid:${pid}:responses:${val}`);
  }

  const arr = await Promise.all(keys.map(key => isSetMember(key, uid)));
  return values[arr.findIndex(val => !!val)];
};

async function getResponsesCount(pidOrArray: number): Promise<ResponsesCount>;
async function getResponsesCount(pidOrArray: number[]): Promise<ResponsesCount[]>;
async function getResponsesCount(
  pidOrArray: number | number[]
): Promise<ResponsesCount[] | ResponsesCount> {
  // iterate over response values and post IDs to create the database keys
  const pids = Array.isArray(pidOrArray) ? pidOrArray : [pidOrArray];
  const keys = pids.flatMap(pid => values.map(val => `${listKey}:pid:${pid}:responses:${val}`));

  const counts = await setsCount(keys);
  const responsesCount = pids.map((pid, index) => ({
    yes: counts[(index * 3) + 0],
    maybe: counts[(index * 3) + 1],
    no: counts[(index * 3) + 2],
  }));

  if (Array.isArray(pidOrArray)) {
    return responsesCount;
  }

  return responsesCount[0];
}

export {
  submitResponse,
  removeAll,
  getAll,
  getUserResponse,
  getResponsesCount,
};
