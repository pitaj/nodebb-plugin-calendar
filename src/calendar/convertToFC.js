const mapper = (event) => ({
  id: event.pid,
  title: event.name,
  allDay: event.allday,
  start: event.startDate,
  end: event.endDate,
  className: [
    `plugin-calendar-cal-event-category-${event.cid}`,
    `plugin-calendar-cal-event-response-${event.responses[app.user.uid] || 'no'}`,
    event.topicDeleted ? 'plugin-calendar-cal-event-topic-deleted' : '',
  ],
});

const convertToFC = (events) => events.map(mapper);

export default convertToFC;
