const formatDates = (s, e, allday, lang) => {
  const start = new Date(s);
  const end = new Date(e);

  const formatTime = d => {
    const y = d.toLocaleTimeString(lang).split(':');
    return `${y[0]}:${y[1]}${y[2].replace(/[0-9]/g, '')}`;
  };

  if (Math.abs(s - e) <= 60 * 1000) {
    if (allday) {
      return start.toLocaleDateString(lang);
    }
    return `${start.toLocaleDateString()} ${formatTime(start)}`;
  }

  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getYear() === end.getYear()
  ) {
    if (allday) {
      return start.toLocaleDateString(lang);
    }
    return `${start.toLocaleDateString(lang)}<br>` +
      `${formatTime(start)} - ${formatTime(end)}`;
  }

  if (allday) {
    return `${start.toLocaleDateString(lang)} - ${end.toLocaleDateString(lang)}`;
  }
  return `${start.toLocaleDateString(lang)} ${formatTime(start)} - ` +
    `${end.toLocaleDateString(lang)} ${formatTime(end)}`;
};

const postTemplate = (event, lang) => {
  const html = `
<div class="plugin-calendar-event panel panel-default">
  <div class="plugin-calendar-event-name panel-heading">
    ${event.name}
  </div>
  <div class="plugin-calendar-event-date panel-body">
    ${formatDates(event.startDate, event.endDate, event.allday, lang)}
  </div>
  <div class="plugin-calendar-event-location panel-body">
    ${event.location}
  </div>
  <div class="plugin-calendar-event-description panel-body">
    ${event.description}
  </div>
</div>`.trim();

  return html;
};

export default postTemplate;
export { formatDates };
