const state = {
  current: window.location.pathname,
  prev: '',
  handlers: [],
  listen(handler) {
    this.handlers.push(handler);
  },
};

$(window).on('action:ajaxify.start', (e, data) => {
  state.prev = state.current;
  state.current = data.url;

  state.handlers.forEach((handler) => handler(state, data));
});

export default state;
