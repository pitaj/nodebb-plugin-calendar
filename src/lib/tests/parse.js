import assert from 'assert';
import parse from '../parse';
import rawTemplate from '../../client/templates';

[
  () => {
    // basic test
    const data = {
      name: 'a test name',
      allday: true,
      startDate: Date.now(),
      endDate: Date.now() + (3 * 24 * 60 * 60 * 1000),
      reminders: [50, 20, 10, 0],
      location: 'here somewhere',
      description: 'somewhere else',
      mandatory: false,
      repeats: null,
    };
    const result = parse(
      `other things that make sense
      ${rawTemplate(data)}
      and some more *markdown*`
    );

    assert(result && typeof result === 'object', 'Expected Object, got a falsy value');
    assert.strictEqual(data.name, result.name, '`name` field incorrect');
    assert.strictEqual(data.allday, result.allday, '`allday` field incorrect');
    assert.strictEqual(data.startDate, result.startDate, '`startDate` field incorrect');
    assert.strictEqual(data.endDate, result.endDate, '`endDate` field incorrect');
    assert.deepEqual(data.reminders, result.reminders, '`reminders` field incorrect');
    assert.strictEqual(data.location, result.location, '`location` field incorrect');
    assert.strictEqual(data.description, result.description, '`description` field incorrect');
    assert.strictEqual(data.repeats, result.repeats, '`repeats` field incorrect');
  },
  () => {
    // test allday false and repeats as full object
    const data = {
      name: 'a test name',
      allday: false,
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      endDate: Date.now(),
      reminders: [50, 20, 10, 0],
      location: 'here somewhere',
      description: 'somewhere else',
      mandatory: false,
      repeats: {
        every: {
          week: true,
        },
        endDate: null,
      },
    };
    const result = parse(rawTemplate(data));
    assert(typeof result === 'object', 'Expected Object, got something else');
    assert.strictEqual(data.name, result.name, '`name` field incorrect');
    assert.strictEqual(data.allday, result.allday, '`allday` field incorrect');
    assert.strictEqual(data.startDate, result.startDate, '`startDate` field incorrect');
    assert.strictEqual(data.endDate, result.endDate, '`endDate` field incorrect');
    assert.deepEqual(data.reminders, result.reminders, '`reminders` field incorrect');
    assert.strictEqual(data.location, result.location, '`location` field incorrect');
    assert.strictEqual(data.description, result.description, '`description` field incorrect');
    assert.deepEqual(data.repeats, result.repeats, '`repeats` field incorrect');
  },
  () => {
    // test bad date failing completely
    const data = {
      name: 'a test name',
      allday: false,
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      endDate: 'a string',
      reminders: [50, 20, 10, 0],
      location: 'here somewhere',
      description: 'somewhere else',
      mandatory: false,
    };
    const result = parse(rawTemplate(data));
    assert.strictEqual(null, result, 'Expected null, got something else');
  },
  () => {
    // test bad reminders failing completely
    const data = {
      name: 'a test name',
      allday: false,
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      endDate: Date.now(),
      reminders: 'a string',
      location: 'here somewhere',
      description: 'somewhere else',
      mandatory: false,
    };
    const result = parse(rawTemplate(data));
    assert.strictEqual(null, result, 'Expected null, got something else');
  },
  () => {
    // test bad location failing completely
    const data = {
      name: 'a test name',
      allday: false,
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      endDate: Date.now(),
      reminders: [50, 20, 10, 0],
      location: 'here somewhere\nhasbbks',
      description: 'somewhere else',
      mandatory: false,
    };
    const result = parse(rawTemplate(data));
    assert.strictEqual(null, result, 'Expected null, got something else');
  },
  () => {
    // test bad name failing completely
    const data = {
      name: 'a test name\ndsjvhoaho',
      allday: false,
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      endDate: Date.now(),
      reminders: [50, 20, 10, 0],
      location: 'here somewhere',
      description: 'somewhere else',
      mandatory: false,
    };
    const result = parse(rawTemplate(data));
    assert.strictEqual(null, result, 'Expected null, got something else');
  },
].forEach((x) => x());
