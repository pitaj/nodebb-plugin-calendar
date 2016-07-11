/* global $, socket */

const find = (posts, data) => {
  const uuid = Object.keys(posts).find(key => {
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

export default composer => {
  const onChange = data => {
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
  $(window).on('action:composer.post.new action:composer.post.edit action:composer.topic.new',
  (e, { pid, tid, cid }) => {
    onChange({
      tid,
      cid,
      pid,
    });
  });
  $(document.body).on('change', '.composer .category-list', e => {
    const uuid = $(e.target)
      .closest('.composer')
      .attr('id')
      .replace('cmp-uuid-', '');
    const { pid, tid, cid } = composer.posts[uuid];
    onChange({
      tid,
      cid,
      pid,
    });
  });
};
