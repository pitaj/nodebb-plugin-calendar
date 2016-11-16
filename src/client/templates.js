const eventTemplate = (event) => (
  `[event][name]${event.name}[/name][allday]${event.allday}[/allday]` +
  `[startDate]${event.startDate}[/startDate][endDate]${event.endDate}[/endDate]` +
  `[reminders]${JSON.stringify(event.reminders)}[/reminders]` +
  `[location]${event.location}[/location]` +
  `[description]${event.description}[/description][mandatory]${event.mandatory}[/mandatory]` +
  `${event.repeats ? `[repeats]${JSON.stringify(event.repeats)}[/repeats]` : ''}[/event]`
);

export {
  eventTemplate,
};
