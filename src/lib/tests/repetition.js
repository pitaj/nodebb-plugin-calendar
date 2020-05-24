import assert from 'assert';
import getOccurencesOfRepetition from '../repetition';

(() => {
  const event = {
    startDate: 1478576134000,
    endDate: 1478576134000 + (2 * 60 * 60 * 1000),
    repeats: {
      every: {
        day: true,
      },
      endDate: 1478576134000 + (3 * 24 * 60 * 60 * 1000),
    },
  };

  const occurences = getOccurencesOfRepetition(
    event,
    1478576134000 + 5000,
    1478576134000 + (36 * 60 * 60 * 1000)
  );
  const expected = [
    {
      startDate: 1478576134000 + (1 * 24 * 60 * 60 * 1000),
      endDate: 1478576134000 + (1 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000),
      repeats: {
        every: {
          day: true,
          numOfDays: [1],
        },
        endDate: 1478576134000 + (3 * 24 * 60 * 60 * 1000),
      },
      day: '2016-11-09',
    },
  ];

  assert.deepEqual(occurences, expected);
})();
