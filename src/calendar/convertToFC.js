const decode = window.utils.decodeHTMLEntities;

const mapper = event => ({
  id: event.pid,
  title: decode(decode(event.name)),
  allDay: event.allday,
  start: event.startDate,
  end: event.endDate + 1,
  className: [
    `plugin-calendar-cal-event-category-${event.cid}`,
    `plugin-calendar-cal-event-response-${event.responses[app.user.uid] || 'no'}`,
    event.topicDeleted ? 'plugin-calendar-cal-event-topic-deleted' : '',
  ],
  original: event,
});

const convertToFC = events => events.map(mapper);

export default convertToFC;
