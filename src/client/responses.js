const userTemplate = (user) => (`
  <li class="icon pull-left">
    <a href="${config.relative_path}/user/${user.userslug}">
  		${user.picture ? `
      <img title="${user.username}" class="img-rounded user-img not-responsive"
        src="${user.picture}">
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
  const $responses = $(`[data-pid=${pid}] .plugin-calendar-event-responses-lists`);
  const day = $(`[data-pid=${pid}]`).attr('data-day');

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

const setUserResponseToPost = ({ pid, day }, cb) => {
  let buttonCont = $(`[data-pid=${pid}] .plugin-calendar-event-responses-user`);

  if (!buttonCont.length) {
    return;
  }

  if (!app.user.uid) {
    buttonCont.remove();
    return;
  }

  socket.emit('plugins.calendar.getUserResponse', { pid, day }, (err, value) => {
    buttonCont = $(`[data-pid=${pid}] .plugin-calendar-event-responses-user`);
    const button = buttonCont.find(`[data-value=${value}]`);

    button.siblings().removeClass('active');
    button.addClass('active');

    if (typeof cb === 'function') {
      cb();
    }
  });
};

const initResponses = () => {
  $(document.body).on('click', '.plugin-calendar-event-responses-user .btn', (e) => {
    const button = $(e.target);
    const value = button.data('value');
    const elem = button.closest('[data-pid!=""]');
    const pid = elem.attr('data-pid');
    const day = elem.attr('data-day');

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

  const checkPosts = (e, data) => {
    const posts = data.posts || data.post || ajaxify.data.posts;

    if (posts && posts.length > 0) {
      setTimeout(() => {
        posts.forEach((post) => setUserResponseToPost({ pid: post.pid }));
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
export { setUserResponseToPost };
