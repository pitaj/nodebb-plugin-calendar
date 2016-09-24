const init = (Translator, moment) => {
  Translator.registerModule('time', (lang) => {
    const zero = moment(0).locale(lang.toLowerCase().replace('_', '-'));

    return (key, [duration]) => {
      const ms = parseInt(duration, 10);
      switch (key) {
        case 'ago':
          return zero.from(ms);
        case 'in':
          return zero.to(ms);
        case 'duration':
          return zero.to(ms, true);
        default:
          return '';
      }
    };
  });
};

export { init };
