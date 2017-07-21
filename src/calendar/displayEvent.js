import { eventTemplate } from '../lib/templates';
import { setupPost } from '../client/responses';

const displayEvent = (event, cb) => {
  const content = eventTemplate({ event, uid: app.user.uid });
  const pid = event.pid;

  const div = $(content);
  const $display = $('#plugin-calendar-cal-event-display');
  $display
    .modal('hide')
    .find('.modal-body .posts')
    .empty()
    .append(div);
  if (event.external) {
    $display
      .find('.modal-footer a.btn-primary')
      .hide();
  } else {
    $display
      .find('.modal-footer a.btn-primary')
      .show()
      .attr('href', `${RELATIVE_PATH}/post/${pid}`);
  }
  $display
    .find('.modal-body')
    .attr('data-pid', pid);
  if (!event.external && event.repeats) {
    $display.find('[data-day]').attr('data-day', event.day);
  }
  $display
    .modal('show');

  setupPost({ pid }, () => {
    $(window).trigger('action:calendar.event.display', { pid, day: event.day, modal: $display });

    if (typeof cb === 'function') {
      cb({ content, parsed: event });
    }
  });
};

export default displayEvent;
