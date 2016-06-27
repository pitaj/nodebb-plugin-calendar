import init from './init';
import { parsePostCallback, parseRawCallback } from './parseFilters';
import { postSaveCallback } from './postSave';
import { privilegesList, privilegesGroupsList } from './privileges';

export default {
  init,
  addNavigation: (navs, callback) => {
    navs.push({
      route: '/calendar',
      title: '\\[\\[calendar:calendar\\]\\]',
      iconClass: 'fa-calendar',
      textClass: 'visible-xs-inline',
      text: '\\[\\[calendar:calendar\\]\\]',
    });
    callback(null, navs);
  },
  adminMenu: (header, callback) => {
    header.plugins.push({
      route: '/plugins/calendar',
      icon: 'fa-calendar',
      name: 'Calendar',
    });
    callback(null, header);
  },
  parsePost: parsePostCallback,
  parseRaw: parseRawCallback,
  postSave: postSaveCallback,
  privilegesList,
  privilegesGroupsList,
};
