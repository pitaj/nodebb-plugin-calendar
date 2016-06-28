import init from './init';
import { parsePostCallback, parseRawCallback } from './parseFilters';
import { postSaveCallback, postEditCallback } from './postSave';
import { privilegesList, privilegesGroupsList, privilegesListHuman } from './privileges';

const addNavigation = (navs, callback) => {
  navs.push({
    route: '/calendar',
    title: '\\[\\[calendar:calendar\\]\\]',
    iconClass: 'fa-calendar',
    textClass: 'visible-xs-inline',
    text: '\\[\\[calendar:calendar\\]\\]',
  });
  callback(null, navs);
};
const adminMenu = (header, callback) => {
  header.plugins.push({
    route: '/plugins/calendar',
    icon: 'fa-calendar',
    name: 'Calendar',
  });
  callback(null, header);
};

export {
  init,
  addNavigation,
  adminMenu,
  parsePostCallback as parsePost,
  parseRawCallback as parseRaw,
  postSaveCallback as postSave,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
  postEditCallback as postEdit,
};
