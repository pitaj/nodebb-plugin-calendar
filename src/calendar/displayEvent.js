import postTemplate from '../lib/template';

const displayEvent = (event, cb) => {
  const content = postTemplate(event);
  const pid = event.pid;

  const div = $(content);
  const $display = $('#plugin-calendar-cal-event-display');
  $display
    .find('.modal-body')
    .empty()
    .append(div);
  $display
    .find('.modal-footer a.btn-primary')
    .attr('href', `${RELATIVE_PATH}/post/${pid}`);
  $display
    .find('.plugin-calendar-event-responses-lists .panel-body')
    .addClass('topic')
    .find('ul')
    .addClass('posts');
  $display
    .attr('data-pid', pid)
    .modal('hide')
    .modal('show');
  if (event.day) {
    $display.attr('data-day', event.day);
  }
  $(window).trigger('action:calendar.event.display', { pid, day: event.day, modal: $display });

  if (typeof cb === 'function') {
    cb({ content, parsed: event });
  }
};

export default displayEvent;
