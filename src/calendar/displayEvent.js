const displayEvent = ({ pid }, cb) => {
  socket.emit('plugins.calendar.getParsedEvent', pid, (err, { content, parsed }) => {
    if (err) {
      if (err.message) {
        app.alertError(err);
      }
      throw err;
    }

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
    $(window).trigger('action:calendar.event.display', { pid, modal: $display });

    if (typeof cb === 'function') {
      cb({ content, parsed });
    }
  });
};

export default displayEvent;
