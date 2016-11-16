const eventTemplate = (event) => {
  const repeats = event.repeats && {
    ...event.repeats,
    endDate: event.repeats.endDate ? event.repeats.endDate.valueOf() : null,
  };
  return `[event][name]${event.name}[/name][allday]${event.allday}[/allday]` +
  `[startDate]${event.startDate}[/startDate][endDate]${event.endDate}[/endDate]` +
  `[reminders]${JSON.stringify(event.reminders)}[/reminders]` +
  `[location]${event.location}[/location]` +
  `[description]${event.description}[/description][mandatory]${event.mandatory}[/mandatory]` +
  `${repeats ? `[repeats]${JSON.stringify(repeats)}[/repeats]` : ''}[/event]`;
};

export {
  eventTemplate,
};
