import { EventObjectInput } from 'fullcalendar';
import { decodeHTMLEntities as decode } from 'utils';
import { EventWithDeleted } from '../lib/event';

export interface EventFC extends EventObjectInput {
  start: number,
  className: string[],
  original: EventWithDeleted,
}

const mapper = (event: EventWithDeleted): EventFC => ({
  id: event.pid,
  title: decode(decode(event.name)),
  allDay: event.allday,
  start: event.startDate,
  end: event.endDate + 1,
  className: [
    `plugin-calendar-cal-event-category-${event.cid}`,
    `plugin-calendar-cal-event-response-${(event.responses && event.responses[app.user.uid]) || 'no'}`,
    event.topicDeleted ? 'plugin-calendar-cal-event-topic-deleted' : '',
  ],
  original: event,
});

const convertToFC = (events: EventWithDeleted[]): EventFC[] => events.map(mapper);

export default convertToFC;
