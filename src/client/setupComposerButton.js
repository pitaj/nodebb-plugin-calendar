/* global $, socket, app, bootbox */

const find = (posts, data) => {
  const uuid = Object.keys(posts).find((key) => {
    const post = posts[key];
    if (data.pid && parseInt(post.pid, 10) === parseInt(data.pid, 10)) {
      return true;
    }
    if (data.tid && parseInt(post.tid, 10) === parseInt(data.tid, 10)) {
      return true;
    }
    if (data.cid && parseInt(post.cid, 10) === parseInt(data.cid, 10)) {
      return true;
    }
    return false;
  });
  return uuid;
};

const regex = new RegExp(
  '(\\[\\s?event\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\s?\\])|' +
  '(\\[\\s?event\\-invalid?\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\-invalid?\\s?\\])'
);

export default (composer, translator) => {
  const onChange = (data) => {
    socket.emit('plugins.calendar.canPostEvent', data, (e, canPost) => {
      const uuid = find(composer.posts, data);
      setTimeout(() =>
        $(`#cmp-uuid-${uuid}`)
        .find('.plugin-calendar-composer-edit-event')
        .toggle(canPost),
        200
      );
    });
  };

  const alterSubmit = (data) => {
    if (!data.pid) {
      return;
    }
    setTimeout(() => {
      const uuid = find(composer.posts, data);
      const comp = $(`#cmp-uuid-${uuid}`);
      const write = comp.find('.write-container textarea.write');
      const eventExisted = regex.test(write.val());

      if (eventExisted) {
        const button = comp.find('.composer-submit:visible');

        /* eslint-disable */
        const orig = $._data(button[0], 'events').click.map(x => x.handler);
        /* eslint-enable */
        const trigger = (self, e) => {
          orig.forEach((handler) => {
            handler.call(self, e);
          });
        };
        button.off('click').on('click', function onClick(e) {
          const text = write.val();
          if (!regex.test(text)) {
            translator.translate('[[calendar:confirm_delete_event]]', (question) => {
              bootbox.confirm(question, (okay) => {
                if (okay) {
                  trigger(this, e);
                }
              });
            });
          } else {
            trigger(this, e);
          }
        });
      }
    }, 200);
  };

  $(window).on('action:composer.post.new action:composer.post.edit action:composer.topic.new',
  (e, data) => {
    onChange(data);
    alterSubmit(data);
  });
  $(document.body).on('change', '.composer .category-list', (e) => {
    const uuid = $(e.target)
      .closest('.composer')
      .attr('id')
      .replace('cmp-uuid-', '');
    const data = composer.posts[uuid];
    onChange(data);
  });
};
