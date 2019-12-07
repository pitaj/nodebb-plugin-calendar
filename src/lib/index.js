import 'source-map-support/register';

import init from './init';
import { parsePost, parseRaw, postSummary, topicTeaser } from './parseFilters';
import { postSave } from './postSave';
import { privilegesList, privilegesGroupsList, privilegesListHuman } from './privileges';
import { deleteEvent, restoreEvent, purgeEvent } from './event';
import './sockets';
import { initialize as initTranslatorModule } from './translatorModule';

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

const sanitizeConfig = (config, callback) => {
  config.allowedTags.push('input');
  config.allowedAttributes.input = ['class', 'title', 'type'];

  // in case we're on an older NodeBB version
  config.allowedClasses = config.allowedClasses || {};
  config.allowedClasses.input = ['form-control'];

  callback(null, config);
};

const postDelete = (data) => { deleteEvent(data); };
const postRestore = (data) => { restoreEvent(data); };
const postPurge = (data) => { purgeEvent(data); };

export {
  init,
  addNavigation,
  adminMenu,
  parsePost,
  parseRaw,
  postSummary,
  topicTeaser,
  postSave as postCreate,
  postSave as postEdit,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
  composerFormatting,
  sanitizeConfig,
  postDelete,
  postRestore,
  postPurge,
};
