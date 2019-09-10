import moment from 'moment';
import 'eonasdan-bootstrap-datetimepicker';

const factory = ($ul) => {
  const list = $ul
    .find('#plugin-calendar-event-editor-repetition-change > ul');
  list.find('li[data-value=custom] > div').click((e) => {
    e.stopPropagation();
  });

  const custom = $('#plugin-calendar-event-editor-repetition-custom');
  const changeButton = $('#plugin-calendar-event-editor-repetition-change-button');
  const changeButtonText = changeButton.find('.text');
  const daysOfWeek = $('#plugin-calendar-event-editor-repetition-custom-daysOfWeek');
  const customEnd = custom.find('.plugin-calendar-event-editor-repetition-custom-end');
  const endDate = $('#plugin-calendar-event-editor-repetition-endDate');

  endDate.data('DateTimePicker')
    .format('L')
    .date(moment().add(7, 'day'))
    .widgetPositioning({
      vertical: 'top',
      horizontal: 'left',
    });

  list.change(() => {
    const elem = list.find('input[name=repetition-select]:checked');
    const value = elem.val();

    changeButtonText.html(elem.siblings('span').html());

    if (value === 'custom') {
      custom.slideDown(200);
    } else {
      custom.slideUp(200);
    }
  });

  $('#plugin-calendar-event-editor-repetition-custom-daysOfWeek > ul > li > a').click((e) => {
    e.preventDefault();
    $(e.target).toggleClass('active');
  });

  custom.find('.btn.btn-primary').click(() => {
    changeButton.dropdown('toggle');
  });

  customEnd.change(() => {
    const forever = customEnd
      .find('[name=repetition-end]:checked')
      .val() === 'forever';
    endDate.toggle(!forever);
  });

  const methods = {
    setRepeat: (repeat) => {
      if (!repeat) {
        const elem = list
          .find('[name="repetition-select"][value="no-repeat"]')
          .prop('checked', true);
        changeButtonText.html(elem.siblings('span').html());
        return;
      }

      const key = ['day', 'week', 'month', 'year']
        .find((x) => repeat.every[x]);
      custom.toggle(!key);
      if (key) {
        const elem = list
          .find(`[name="repetition-select"][value="${key}"]`)
          .prop('checked', true);
        changeButtonText.html(elem.siblings('span').html());
        return;
      }

      const elem = list
        .find('[name="repetition-select"][value="custom"]')
        .prop('checked', true);
      changeButtonText.html(elem.siblings('span').html());

      if (repeat.every.daysOfWeek) {
        daysOfWeek
          .find('li > a')
          .removeClass('active');
        repeat.every.daysOfWeek.forEach((day) => {
          daysOfWeek
            .find(`li[data-value=${day}] > a`)
            .addClass('active');
        });
        const forever = !Number.isFinite(repeat.endDate);
        customEnd
          .find(`[name=repetition-end][value=${forever ? 'forever' : 'end'}]`)
          .prop('checked', true);
        endDate.toggle(!forever);
        if (!forever) {
          endDate.data('DateTimePicker').date(moment(repeat.endDate));
        }
      }
    },
    getRepeat: () => {
      const value = list.find('[name=repetition-select]:checked').val();
      if (value === 'no-repeat') {
        return null;
      }
      if (value !== 'custom') {
        return {
          every: {
            [value]: true,
          },
          endDate: null,
        };
      }

      const selected = 'weekly';
      if (selected === 'weekly') {
        const days = [...daysOfWeek.find('li > a.active').parent()]
          .map((elem) => parseInt(elem.dataset.value, 10));
        const forever = customEnd
          .find('[name=repetition-end]:checked')
          .val() === 'forever';
        if (forever) {
          return {
            every: {
              daysOfWeek: days,
            },
            endDate: null,
          };
        }
        const end = endDate
          .data('DateTimePicker')
          .date()
          .valueOf();
        return {
          every: {
            daysOfWeek: days,
          },
          endDate: end,
        };
      }

      return {};
    },
  };

  return methods;
};

export default factory;
