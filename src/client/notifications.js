/* global $ */

import moment from 'moment';

const zero = moment(0);
const makeListElement = n => {
  const li = $(
    `<li class="plugin-calendar-event-editor-notification">
      ${zero.to(n, true)}
      <a class="remove" href="#">
        <i class="fa fa-times"></i>
      </a>
    </li>`);
  li.data('value', n);
  return li;
};

const factory = $ul => {
  const addButtons = $ul
  .find('#plugin-calendar-event-editor-notifications-add li > a');

  const obj = {
    setNotifications: notifications => {
      $ul.find('li.plugin-calendar-event-editor-notification').remove();
      $ul.data('value', notifications);
      notifications
      .reverse()
      .map(makeListElement)
      .forEach(el => $ul.prepend(el));
    },
    getNotifications: () => $ul.data('value'),
    addNotification: n => {
      const nots = $ul.data('value');
      if (nots.includes(n)) {
        return;
      }

      const notifications = [...nots, n].sort((a, b) => b - a);
      const index = notifications.reverse().indexOf(n);
      $ul.data('value', notifications);

      const li = makeListElement(n);

      if (index === 0) {
        $ul.prepend(li);
      } else {
        $ul.find(`li.plugin-calendar-event-editor-notification:nth-of-type(${index})`).after(li);
      }
    },
    removeNotification: n => {
      const nots = $ul.data('value');
      if (!nots.includes(n)) {
        return;
      }

      const index = nots.indexOf(n);
      const notifications = nots.filter(not => not !== n);
      $ul.data('value', notifications);

      $ul.find(`li.plugin-calendar-event-editor-notification:nth-of-type(${index + 1})`).remove();
    },
  };

  const popup = $('#plugin-calendar-event-editor-notification-custom');
  const input = popup.find('#plugin-calendar-event-editor-notification-custom-number');
  const radios = popup.find('#plugin-calendar-event-editor-notification-custom-unit');
  const button = popup.find('button.btn-primary');

  const promptCustom = addNotif => {
    button.on('click', () => {
      const unit = radios.find(':checked').val();
      const number = parseInt(input.val(), 10);

      const ms = ({
        mm: 1000 * 60,
        hh: 1000 * 60 * 60,
        dd: 1000 * 60 * 60 * 24,
      })[unit] * number;

      addNotif(ms);
      popup.slideUp(200);
      button.off('click');
    });

    popup.slideDown(200);
  };

  popup.on('click', e => {
    e.stopPropagation();
  });

  addButtons.on('click', e => {
    const el = $(e.target).closest('li');
    const n = el.data('value');

    if (n === 'custom') {
      e.preventDefault();
      e.stopPropagation();
      promptCustom(notif => obj.addNotification(notif));
      return;
    }
    obj.addNotification(n);
  });

  // customButton.popover({
  //   content: notificationTemplate,
  //   html: true,
  //   container: '#plugin-calendar-event-editor',
  // });

  $ul.on('click', 'li.plugin-calendar-event-editor-notification .remove', e => {
    e.preventDefault();
    const n = $(e.target).closest('li').data('value');
    obj.removeNotification(n);
  });

  return obj;
};

export default factory;
