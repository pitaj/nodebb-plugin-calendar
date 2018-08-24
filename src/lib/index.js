import 'source-map-support/register';

import { callbackify } from 'util';

import init from './init';
import { parsePostCallback, parseRawCallback } from './parseFilters';
import { postSaveCallback } from './postSave';
import { privilegesList, privilegesGroupsList, privilegesListHuman } from './privileges';
import { deleteEvent } from './event';
import './sockets';
import initTranslatorModule from './translatorModule';

const { Translator } = require.main.require('./public/src/modules/translator');
initTranslatorModule(Translator);

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

const composerFormatting = (data, callback) => {
  data.options.push({
    name: 'plugin-calendar-event',
    className: 'fa fa-calendar-o plugin-calendar-composer-edit-event',
    title: '[[calendar:edit_event]]',
  });
  callback(null, data);
};

const postDelete = callbackify(deleteEvent);

export {
  init,
  addNavigation,
  adminMenu,
  parsePostCallback as parsePost,
  parseRawCallback as parseRaw,
  postSaveCallback as postSave,
  postSaveCallback as postEdit,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
  composerFormatting,
  postDelete,
};
