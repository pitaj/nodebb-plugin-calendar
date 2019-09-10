import moment from 'moment';

const makeListElement = (n) => {
  const zero = moment(0);
  const li = $(
    `<li class="plugin-calendar-event-editor-reminder" data-value="${n}">
      ${zero.to(n, true)}
      <a class="remove" href="#">
        <i class="fa fa-times"></i>
      </a>
    </li>`
  );
  li.data('value', n);
  return li;
};

const factory = ($ul) => {
  const addButtons = $ul
    .find('#plugin-calendar-event-editor-reminders-add li > a');

  const methods = {
    setReminders: (reminders) => {
      $ul.find('li.plugin-calendar-event-editor-reminder').remove();
      $ul.data('value', reminders);
      reminders
        .reverse()
        .map(makeListElement)
        .forEach((el) => $ul.prepend(el));
    },
    getReminders: () => $ul.data('value'),
    addReminder: (n) => {
      const nots = $ul.data('value');
      if (nots.includes(n)) {
        return;
      }

      const reminders = [...nots, n].sort((a, b) => b - a);
      const index = reminders.reverse().indexOf(n);
      $ul.data('value', reminders);

      const li = makeListElement(n);

      if (index === 0) {
        $ul.prepend(li);
      } else {
        $ul.find(`li.plugin-calendar-event-editor-reminder:nth-of-type(${index})`).after(li);
      }
    },
    removeReminder: (n) => {
      const nots = $ul.data('value');
      if (!nots.includes(n)) {
        return;
      }

      const reminders = nots.filter((not) => not !== n);
      $ul.data('value', reminders);

      $ul.find(`li.plugin-calendar-event-editor-reminder[data-value=${n}]`).remove();
    },
  };

  const popup = $('#plugin-calendar-event-editor-reminder-custom');
  const input = popup.find('#plugin-calendar-event-editor-reminder-custom-number');
  const radios = popup.find('#plugin-calendar-event-editor-reminder-custom-unit');
  const button = popup.find('button.btn-primary');

  radios.find('.btn').on('click', (e) => {
    $(e.target)
      .addClass('active')
      .siblings()
      .removeClass('active');
  });

  const promptCustom = (addNotif) => {
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

  popup.on('click', (e) => {
    e.stopPropagation();
  });

  addButtons.on('click', (e) => {
    const el = $(e.target).closest('li');
    const n = el.data('value');

    if (n === 'custom') {
      e.preventDefault();
      e.stopPropagation();
      promptCustom((notif) => methods.addReminder(notif));
      return;
    }
    methods.addReminder(n);
  });

  $ul.on('click', 'li.plugin-calendar-event-editor-reminder .remove', (e) => {
    e.preventDefault();
    const n = $(e.target).closest('li').data('value');
    methods.removeReminder(n);
  });

  return methods;
};

export default factory;
