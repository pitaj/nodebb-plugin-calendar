/* global $, config */

import 'bootstrap-datetimepicker';
import moment from 'moment';

import { eventTemplate, modalTemplate } from './templates';
import setupComposerButton from './setupComposerButton';
import createEventFactory from './createEvent';
import parse from '../parse';

const lang = config.userLang || config.defaultLang;
moment.locale(lang);
window.requirejs([
  'composer',
  'composer/formatting',
  'translator',
], (composer, formatting, translator) =>
$(document).ready(() => {
  translator.translate(modalTemplate(), lang, html => {
    $('body').append(html);

    setupComposerButton(composer);
    $('.plugin-calendar-event-editor-date').datetimepicker({
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-arrow-up',
        down: 'fa fa-arrow-down',
        previous: 'fa fa-arrow-left',
        next: 'fa fa-arrow-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash',
        close: 'fa fa-times',
      },
      allowInputToggle: true,
      locale: lang,
    });
    const createEvent = createEventFactory();

    const prepareFormattingTools = () => {
      if (!formatting) {
        return;
      }

      formatting.addButtonDispatch('plugin-calendar-event', textarea => {
        const $textarea = $(textarea);
        const old = parse($textarea.val());
        createEvent(old || {}, event => {
          $textarea.val(
            $textarea
            .val()
            .replace(/\[\s*event\s*\][\w\W]*\[\s*\/\s*event\s*\]/g, '') +
            eventTemplate(event)
          );
        });
      });
    };

    $(window).on('action:composer.enhanced', prepareFormattingTools);
  });
}));
