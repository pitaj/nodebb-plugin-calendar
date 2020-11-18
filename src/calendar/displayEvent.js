import eventTemplate from '../lib/templates';
import { setupPost } from '../client/responses';

const displayEvent = (event, cb) => {
  eventTemplate({ event, uid: app.user.uid }).then((content) => {
    const { pid } = event;

    const div = $(content);
    const $display = $('#plugin-calendar-cal-event-display');
    $display
      .modal('hide')
      .find('.modal-body .posts')
      .empty()
      .append(div);
    $display
      .find('.modal-footer a.btn-primary')
      .attr('href', `${config.relative_path}/post/${pid}`);
    $display
      .find('.modal-body')
      .attr('data-pid', pid);
    if (event.repeats) {
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
  });
};

export default displayEvent;
