import moment from 'moment';

const userTemplate = user => (`
  <li class="icon pull-left">
    <a href="${config.relative_path}/user/${user.userslug}">
      ${user.picture ? `
      <img title="${user.username}" class="img-rounded user-img not-responsive"
        src="${user.picture}">
      ` : `
      <div class="user-icon user-img" style="background-color: ${user['icon:bgColor']};"
        title="${user.username}">${user['icon:text']}</div>
      `}
    </a>
  </li>
`);

let noYesResponses;
let noMaybeResponses;
let noNoResponses;

const addResponsesToPost = (pid, cb) => {
  const $responses = $(`[data-pid=${pid}] .plugin-calendar-event-responses-lists`);
  const day = $(`[data-pid=${pid}] [data-day]`).attr('data-day');

  if (!$responses.length) {
    return;
  }

  socket.emit('plugins.calendar.getResponses', { pid, day }, (err, responses) => {
    if (err) {
      if (err.message) {
        app.alertError(err);
      }
      throw err;
    }
    if (!responses ||
    !responses.yes ||
    !responses.maybe ||
    !responses.no) {
      return;
    }

    const yess = $responses.find('.plugin-calendar-event-responses-list-yes');
    const maybes = $responses.find('.plugin-calendar-event-responses-list-maybe');
    const nos = $responses.find('.plugin-calendar-event-responses-list-no');

    const yes = responses.yes.map(userTemplate);
    const maybe = responses.maybe.map(userTemplate);
    const no = responses.no.map(userTemplate);

    yess.empty().append(yes.length ? yes : noYesResponses);
    maybes.empty().append(maybe.length ? maybe : noMaybeResponses);
    nos.empty().append(no.length ? no : noNoResponses);

    cb();
  });
};

const setupDTP = (responses, day) => {
  const dayInput = responses.find('.plugin-calendar-event-responses-day input');
  if (!dayInput.length) {
    return;
  }
  const m = moment(day || Date.now());

  dayInput.datetimepicker({
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
    locale: (config.userLang || config.defaultLang).toLowerCase().replace(/_/g, '-'),
    format: 'L',
    useCurrent: true,
  })
  .data('DateTimePicker')
  .date(m);
};

const noop = () => {};

const setupPost = ({ pid, e }, cb = noop) => {
  let buttonCont = $(`[data-pid=${pid}] .plugin-calendar-event-responses-user`);
  const responses = buttonCont.closest('[data-day]');
  const day = responses.attr('data-day') || null;

  if (!buttonCont.length) {
    cb();
    return;
  }

  if (!app.user.uid) {
    buttonCont.remove();
    cb();
    return;
  }

  if (!e) {
    setupDTP(responses, day);
  }

  socket.emit('plugins.calendar.getUserResponse', { pid, day }, (err, value) => {
    if (err) {
      app.alertError(err);
      throw err;
    }

    buttonCont = $(`[data-pid=${pid}] .plugin-calendar-event-responses-user`);
    const button = buttonCont.find(`[data-value=${value || 'no'}]`);

    button.siblings().removeClass('active');
    button.addClass('active');

    cb();
  });
};

const initResponses = () => {
  $(document.body).on('click', '.plugin-calendar-event-responses-user .btn', (e) => {
    const button = $(e.target);
    const value = button.data('value');
    const pid = button.closest('[data-pid]').attr('data-pid');
    const day = button.closest('[data-day]').attr('data-day');

    socket.emit('plugins.calendar.submitResponse', { pid, value, day }, (err) => {
      if (err) {
        if (err.message) {
          app.alertError(err);
        }
        throw err;
      }
      app.alertSuccess();
      button.siblings().removeClass('active');
      button.addClass('active');
    });
  });

  $(document.body).on('change dp.change', '.plugin-calendar-event-responses-day input', (e) => {
    const input = $(e.target);
    const day = input
      .data('DateTimePicker').date()
      .toISOString()
      .split('T')[0];
    const pid = input.closest('[data-pid]').attr('data-pid');
    const responses = input.closest('[data-day]');
    responses.attr('data-day', day);

    responses
      .find('.plugin-calendar-event-responses-lists')
      .attr('data-loaded', 'false')
      .find('.panel')
      .addClass('closed');

    setupPost({ pid, e });
  });

  const checkPosts = (e, data) => {
    const posts = data.posts || data.post || ajaxify.data.posts;

    if (posts && posts.length > 0) {
      setTimeout(() => {
        posts.forEach(post => setupPost({ pid: post.pid }));
      }, 200);
    }
  };

  $(document.body).on(
    'click',
    '[data-pid] .plugin-calendar-event-responses-lists .panel-heading a',
    (e) => {
      const target = $(e.target).closest('a');
      const notLoaded = target.is('[data-loaded=false] a');
      const pid = parseInt(target.closest('[data-pid]').attr('data-pid'), 10);

      const toggle = () => {
        const panel = target.closest('.panel');
        const cont = panel.find('.panel-collapse');
        const height = cont.children()[0].scrollHeight;
        cont.css('height', `${height}px`);
        panel.toggleClass('closed');
      };

      if (notLoaded) {
        addResponsesToPost(pid, toggle);
        target
          .closest('.plugin-calendar-event-responses-lists')
          .attr('data-loaded', 'true');
      } else {
        toggle();
      }
    }
  );

  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
  ].join(' '), checkPosts);
  checkPosts(null, ajaxify.data);

  window.requirejs(['translator'], (translator) => {
    translator.translate(
      '[[calendar:no_x_responses, [[calendar:response_yes]]]],' +
      '[[calendar:no_x_responses, [[calendar:response_maybe]]]],' +
      '[[calendar:no_x_responses, [[calendar:response_no]]]]',
      (translated) => {
        const text = translated.split(',');
        noYesResponses = text[0];
        noMaybeResponses = text[1];
        noNoResponses = text[2];
      }
    );
  });
};

export default initResponses;
export { setupPost, setupDTP };
