/* global $, socket, app, config */

const userTemplate = user => (`
  <a href="${config.relative_path}/user/${user.userslug}">
		${user.picture ? `
    <img title="${user.username}" class="img-rounded user-img" src="${user.picture}">
    `	: `
    <div class="user-icon user-img" style="background-color: ${user['icon:bgColor']};"
    title="${user.username}">${user['icon:text']}</div>
    `}
	</a>
`);

const addResponsesToPost = pid => {
  socket.emit('plugins.calendar.getResponses', pid, (err, responses) => {
    if (err) {
      app.alertError(err);
      return;
    }

    const $responses =
    $(`[component=post][data-pid=${pid}] .content .plugin-calendar-event-responses-lists`);

    const yess = $responses.find('.plugin-calendar-event-responses-list-yes');
    const maybes = $responses.find('.plugin-calendar-event-responses-list-maybe');
    const nos = $responses.find('.plugin-calendar-event-responses-list-no');

    yess.append(responses.yes.map(userTemplate));
    maybes.append(responses.maybe.map(userTemplate));
    nos.append(responses.no.map(userTemplate));
  });
};

const initResponses = () => {
  $(document.body).on('click', '.plugin-calendar-event-responses-user .btn', e => {
    const button = $(e.target);
    const value = button.data('value');
    const pid = button.closest('[component=post]').data('pid');

    socket.emit('plugins.calendar.submitResponse', { pid, value }, err => {
      if (err) {
        app.alertError(err);
        return;
      }
      button.siblings().removeClass('active');
      button.addClass('active');
    });
  });

  $(window).on('action:posts.loaded', ({ posts }) => {
    setTimeout(() => {
      posts.forEach(post => addResponsesToPost(post.pid));
    }, 200);
  });
};

export { initResponses };
