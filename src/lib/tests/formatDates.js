import assert from 'assert';
import { formatDates } from '../translatorModule';

const lang = 'en-us';

[
  // same day, same time, not allday
  () => {
    const s = 1465186294775;
    const e = s + (1000 * 60 * 43) + (1000 * 60 * 60 * 2); // offset 2 hours 43 min

    const start = new Date(s);

    const st = {
      date: start.toLocaleDateString(lang),
      hours: start.getHours(),
      mins: start.getMinutes(),
      ampm: start.toLocaleTimeString(lang).replace(/[^APM]/g, ''),
    };

    assert(`${st.date}<br>${st.hours}:${st.mins} ${st.ampm}`, formatDates(s, e, false, lang));
  },
  // same day, time separation, not allday
  () => {
    const s = 1465186294775;
    const e = s + (1000 * 60 * 43) + (1000 * 60 * 60 * 2); // offset 2 hours 43 min

    const start = new Date(s);
    const end = new Date(e);

    const st = {
      date: start.toLocaleDateString(lang),
      hours: start.getHours(),
      mins: start.getMinutes(),
      ampm: start.toLocaleTimeString(lang).replace(/[^APM]/g, ''),
    };

    const en = {
      hours: end.getHours(),
      mins: end.getMinutes(),
      ampm: end.toLocaleTimeString(lang).replace(/[^APM]/g, ''),
    };

    assert(`${st.date}<br>${st.hours}:${st.mins} ${st.ampm} - ` +
      `${en.hours}:${en.minutes} ${en.ampm}`, formatDates(s, e, false, lang));
  },
  // same day, time separation, allday
  () => {
    const s = 1465186294775;
    const e = s + (1000 * 60 * 43) + (1000 * 60 * 60 * 2); // offset 2 hours 43 min

    const start = new Date(s);

    assert(`${start.toLocaleDateString(lang)}`, formatDates(s, e, true, lang));
  },
  // different day, not allday
  () => {
    const s = 1465186294775;
    const e = s +
      (1000 * 60 * 60 * 24) +
      (1000 * 60 * 60 * 2) +
      (1000 * 60 * 43); // offset 1 day 2 hours 43 min

    const start = new Date(s);
    const end = new Date(e);

    const st = {
      date: start.toLocaleDateString(lang),
      hours: start.getHours(),
      mins: start.getMinutes(),
      ampm: start.toLocaleTimeString(lang).replace(/[^APM]/g, ''),
    };

    const en = {
      date: end.toLocaleDateString(lang),
      hours: end.getHours(),
      mins: end.getMinutes(),
      ampm: end.toLocaleTimeString(lang).replace(/[^APM]/g, ''),
    };

    assert(`${st.date} ${st.hours}:${st.mins} ${st.ampm} - ` +
      `${en.date} ${en.hours}:${en.minutes} ${en.ampm}`, formatDates(s, e, false, lang));
  },
  // different day, time separation, allday
  () => {
    const s = 1465186294775;
    const e = s +
      (1000 * 60 * 60 * 24) +
      (1000 * 60 * 60 * 2) +
      (1000 * 60 * 43); // offset 1 day 2 hours 43 min

    const start = new Date(s);
    const end = new Date(e);

    assert(`${start.toLocaleDateString(lang)} - ${end.toLocaleDateString(lang)}`,
      formatDates(s, e, true, lang));
  },
].forEach(x => x());
