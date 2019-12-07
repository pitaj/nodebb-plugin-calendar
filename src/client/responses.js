import { translate } from 'translator';
import Benchpress from 'benchpress';
import moment from 'moment';
import 'eonasdan-bootstrap-datetimepicker';

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

    Promise.all(
      [
        { responseType: 'yes', users: responses.yes },
        { responseType: 'maybe', users: responses.maybe },
        { responseType: 'no', users: responses.no },
      ].map((data) => Benchpress.render('partials/calendar/event/response-list', data).then((html) => translate(html)))
    ).then(([yes, maybe, no]) => {
      yess.empty().append(yes);
      maybes.empty().append(maybe);
      nos.empty().append(no);

      cb();
    });
  });
};

const setupDTP = (responses, day) => {
  const dayInput = responses.find('.plugin-calendar-event-responses-day input');
  if (!dayInput.length) {
    return;
  }
  const m = day ? moment.utc(day) : moment();

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
  }).data('DateTimePicker').date(m);
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

  if (!e) {
    setupDTP(responses, day);
  }

  if (!app.user.uid) {
    buttonCont.remove();
    cb();
    return;
  }

  socket.emit('plugins.calendar.getUserResponse', { pid, day }, (err, value) => {
    if (err && err.message === '[[error:no-privileges]]') {
      cb();
      return;
    }

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

let initialized = false;
const initialize = () => {
  if (initialized) {
    return;
  }

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
    const data = input.data('DateTimePicker');
    const day = data && data.date().utc().format('YYYY-MM-DD');

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
        posts.forEach((post) => setupPost({ pid: post.pid }));
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

      e.preventDefault();
    }
  );

  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
  ].join(' '), checkPosts);
  checkPosts(null, ajaxify.data);

  initialized = true;
};

export { setupPost, setupDTP, initialize };
