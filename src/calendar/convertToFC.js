const mapper = event => {
  const newEvent = {
    id: event.pid,
    title: event.name,
    allDay: event.allday,
    start: event.startDate,
    end: event.endDate + 1,
    className: [],
    original: event,
  };

  if (event.external) {
    newEvent.className = ['plugin-calendar-cal-event-external'];
  } else {
    newEvent.className = [
      `plugin-calendar-cal-event-category-${event.cid}`,
      `plugin-calendar-cal-event-response-${event.responses[app.user.uid] || 'no'}`,
      event.topicDeleted ? 'plugin-calendar-cal-event-topic-deleted' : '',
    ];
  }

  return newEvent;
};

const convertToFC = events => events.map(mapper);

export default convertToFC;
