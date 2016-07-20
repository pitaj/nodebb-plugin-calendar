/* global $, socket, app, config, ajaxify */

const userTemplate = user => (`
  <li class="icon pull-left">
    <a href="${config.relative_path}/user/${user.userslug}">
  		${user.picture ? `
      <img title="${user.username}" class="img-rounded user-img" src="${user.picture}">
      `	: `
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
  const $responses =
  $(`[component=post][data-pid=${pid}] .content .plugin-calendar-event-responses-lists`);

  if (!$responses.length) {
    return;
  }

  socket.emit('plugins.calendar.getResponses', pid, (err, responses) => {
    if (err) {
      app.alertError(err);
      return;
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

const setUserResponseToPost = (pid, cb) => {
  const buttonCont = $(`[component=post][data-pid=${pid}] .content ` +
  '.plugin-calendar-event-responses-user');

  if (!buttonCont.length) {
    return;
  }

  socket.emit('plugins.calendar.getUserResponse', pid, (err, value) => {
    const button = buttonCont.find(`[data-value=${value}]`);

    button.siblings().removeClass('active');
    button.addClass('active');

    if (typeof cb === 'function') {
      cb();
    }
  });
};

const initResponses = () => {
  $(document.body).on('click', '.plugin-calendar-event-responses-user .btn', e => {
    const button = $(e.target);
    const value = button.data('value');
    const pid = button.closest('[data-pid]').data('pid');

    socket.emit('plugins.calendar.submitResponse', { pid, value }, err => {
      if (err) {
        app.alertError(err);
        return;
      }
      button.siblings().removeClass('active');
      button.addClass('active');
    });
  });

  const checkPosts = (e, data) => {
    const posts = data.posts || (data.post && [data.post]) || ajaxify.data.posts;

    if (posts && posts.length > 0) {
      setTimeout(() => {
        posts.forEach(post => setUserResponseToPost(post.pid));
      }, 200);
    }
  };

  $(window).on('action:calendar.event.display', (e, { pid, modal }) => {
    const buttonCont = modal.find('.plugin-calendar-event-responses-user');
    socket.emit('plugins.calendar.getUserResponse', pid, (err, value) => {
      const button = buttonCont.find(`[data-value=${value}]`);

      button.siblings().removeClass('active');
      button.addClass('active');
    });

    const $responses = modal.find('.plugin-calendar-event-responses-lists');
    socket.emit('plugins.calendar.getResponses', pid, (err, responses) => {
      if (err) {
        app.alertError(err);
        return;
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
    });
  });

  $(window).on(
    'action:posts.loaded action:ajaxify.end action:posts.edited',
    checkPosts
  );
  checkPosts(null, ajaxify.data);

  $(document.body).on(
    'click',
    '[component=post] .plugin-calendar-event-responses-lists .panel-heading a',
    e => {
      const target = $(e.target).closest('a');
      const notLoaded = target.is('[data-loaded=false] a');
      const pid = target.closest('[component=post]').data('pid');

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

  window.requirejs(['translator'], translator => {
    translator.translate(
      '[[calendar:no_x_responses, [[calendar:response_yes]]]],' +
      '[[calendar:no_x_responses, [[calendar:response_maybe]]]],' +
      '[[calendar:no_x_responses, [[calendar:response_no]]]]',
      translated => {
        const text = translated.split(',');
        noYesResponses = text[0];
        noMaybeResponses = text[1];
        noNoResponses = text[2];
      }
    );
  });
};

export default initResponses;
