import 'source-map-support/register';

import init from './init';
import { parsePost, parseRaw, postSummary, topicTeaser } from './parseFilters';
import { postSave } from './postSave';
import { privilegesList, privilegesGroupsList, privilegesListHuman } from './privileges';
import { deleteEvent, restoreEvent, purgeEvent } from './event';
import './sockets';
import { initialize as initTranslatorModule } from './translatorModule';
import {
  action__post_delete,
  action__post_purge,
  action__post_restore,
  filter__admin_header_build,
  filter__composer_formatting,
  filter__navigation_available,
  filter__sanitize_config,
} from './hooks';

const { Translator } = require.main?.require('./public/src/modules/translator');
initTranslatorModule(Translator);

const addNavigation: filter__navigation_available = async (navs) => {
  navs.push({
    route: '/calendar',
    title: '\\[\\[calendar:calendar\\]\\]',
    iconClass: 'fa-calendar',
    textClass: 'visible-xs-inline',
    text: '\\[\\[calendar:calendar\\]\\]',
  });
  return navs;
};
const adminMenu: filter__admin_header_build = async (header) => {
  header.plugins.push({
    route: '/plugins/calendar',
    icon: 'fa-calendar',
    name: 'Calendar',
  });
  return header;
};

const composerFormatting: filter__composer_formatting = async (data) => {
  data.options.push({
    name: 'plugin-calendar-event',
    className: 'fa fa-calendar-o plugin-calendar-composer-edit-event',
    title: '[[calendar:edit_event]]',
  });
  return data;
};

/* eslint-disable no-param-reassign */
const sanitizeConfig: filter__sanitize_config = async (config) => {
  config.allowedTags.push('input');
  config.allowedAttributes.input = ['class', 'title', 'type'];

  // in case we're on an older NodeBB version
  config.allowedClasses = config.allowedClasses || {};
  config.allowedClasses.input = ['form-control'];

  return config;
};
/* eslint-enable no-param-reassign */

const postDelete: action__post_delete = (data) => { deleteEvent(data); };
const postRestore: action__post_restore = (data) => { restoreEvent(data); };
const postPurge: action__post_purge = (data) => { purgeEvent(data); };

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
