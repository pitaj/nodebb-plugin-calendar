import Benchpress from 'benchpress';
import { translate } from 'translator';
import formatting from 'composer/formatting';
import 'eonasdan-bootstrap-datetimepicker';

import { momentLang } from './clientSideTranslation';
import { initialize as initResponses } from './responses';
import createEventFactory, { CreateEvent } from './createEvent';
import setupComposerButton from './setupComposerButton';
import rawTemplate from './templates';
import parse, { inPost } from '../lib/parse';

let initialized: Promise<CreateEvent>;

const initialize = (): Promise<CreateEvent> => {
  initialized = initialized || Benchpress.render('partials/calendar/event-creation-modal', {})
    .then(template => translate(template)).then((html) => {
      $('body').append(html);

      setupComposerButton();
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
        locale: momentLang,
        sideBySide: true,
        useCurrent: true,
      });

      initResponses();
      return createEventFactory();
    });

  return initialized;
};

const prepareFormatting = (): void => {
  initialize().then((createEvent) => {
    formatting.addButtonDispatch('plugin-calendar-event', (textarea) => {
      const $textarea = $(textarea);
      const oldVal = String($textarea.val());
      const oldEvent = parse(oldVal.replace(/\[(\/?)event-invalid\]/g, '[$1event]'));

      createEvent(oldEvent || {}, (event) => {
        const text = event ? rawTemplate(event) : '';
        if (inPost.test(oldVal)) {
          const newVal = oldVal.replace(
            /\[event(?:-invalid)?\][\s\S]+\[\/event(?:-invalid)?\]/g,
            text
          );
          $textarea.val(newVal);
        } else {
          $textarea.val(`${oldVal}\n\n${text}`);
        }
        $textarea.trigger('input');
      });
    });
  });
};

export { initialize, prepareFormatting };
