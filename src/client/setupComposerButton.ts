import composer from 'composer';
import { translate } from 'translator';
import { inPost } from '../lib/parse';

export default (): void => {
  const onChange = () => {
    const data = composer.posts[composer.active];
    socket.emit('plugins.calendar.canPostEvent', data, (e, { canPost, canPostMandatory }) => {
      if (canPost) {
        $(`[component="composer"][data-uuid=${composer.active}]`)
          .find('.plugin-calendar-composer-edit-event')
          .parent()
          .css('display', 'inline-block');
      }

      $('#plugin-calendar-event-editor-mandatory')
        .closest('.form-group')
        .toggle(canPostMandatory);
    });
  };

  const alterSubmit = () => {
    const comp = $(`[component="composer"][data-uuid="${composer.active}"]`);
    const write = comp.find('.write-container textarea.write');
    const eventExisted = inPost.test(String(write.val()));

    if (eventExisted) {
      const button = comp.find('.composer-submit').filter(':visible');

      const orig = $._data(button[0], 'events').click.map(x => x.handler); // eslint-disable-line
      const trigger = (self: HTMLElement, e: JQuery.Event) => {
        orig.forEach((handler) => {
          handler.call(self, e);
        });
      };
      button.off('click').on('click', function onClick(e) {
        const text = String(write.val());
        if (!inPost.test(text)) {
          translate('[[calendar:confirm_delete_event]]', (question) => {
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
  };

  $(window).on([
    'action:composer.post.new',
    'action:composer.post.edit',
    'action:composer.topic.new',
  ].join(' '), () => {
    setTimeout(() => {
      onChange();
      alterSubmit();
    }, 400);
  });
  $(document.body).on('change', '.composer .category-list', onChange);

  onChange();
  alterSubmit();
};
