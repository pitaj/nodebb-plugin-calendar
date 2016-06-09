'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = undefined;

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tagTemplate = (name, content) => `\\[\\s*${ name }\\s*\\](${ content })\\[\\s*\\\\${ name }\\s*\\]`;
const regExps = {
  name: '.*',
  allday: 'true|false',
  startDate: '[0-9]+',
  endDate: '[0-9]+',
  notifications: '\\[[0-9,\\s]*\\]',
  location: '.*',
  description: '[\\w\\W]*'
};

const full = Object.keys(regExps).map(r => {
  regExps[r] = tagTemplate(r, regExps[r]);
  return regExps[r].replace(/[\(\)]/g, '');
}).join('');
const eventRegExp = tagTemplate('event', full);

const parse = text => {
  const match = text.match(eventRegExp)[0];
  const results = {};
  Object.keys(regExps).forEach(r => {
    results[r] = match.match(regExps[r])[0];
  });
  return results;
};

exports.parse = parse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUVBLE1BQU0sY0FBYyxDQUFDLElBQUQsRUFBTyxPQUFQLEtBQW1CLENBQUMsT0FBRCxHQUFVLElBQVYsRUFBZSxRQUFmLEdBQXlCLE9BQXpCLEVBQWlDLFlBQWpDLEdBQStDLElBQS9DLEVBQW9ELE9BQXBELENBQXZDO0FBQ0EsTUFBTSxVQUFVO0FBQ2QsUUFBTSxJQURRO0FBRWQsVUFBUSxZQUZNO0FBR2QsYUFBVyxRQUhHO0FBSWQsV0FBUyxRQUpLO0FBS2QsaUJBQWUsa0JBTEQ7QUFNZCxZQUFVLElBTkk7QUFPZCxlQUFhO0FBUEMsQ0FBaEI7O0FBVUEsTUFBTSxPQUFPLE9BQU8sSUFBUCxDQUFZLE9BQVosRUFBcUIsR0FBckIsQ0FBeUIsS0FBSztBQUN6QyxVQUFRLENBQVIsSUFBYSxZQUFZLENBQVosRUFBZSxRQUFRLENBQVIsQ0FBZixDQUFiO0FBQ0EsU0FBTyxRQUFRLENBQVIsRUFBVyxPQUFYLENBQW1CLFNBQW5CLEVBQThCLEVBQTlCLENBQVA7QUFDRCxDQUhZLEVBR1YsSUFIVSxDQUdMLEVBSEssQ0FBYjtBQUlBLE1BQU0sY0FBYyxZQUFZLE9BQVosRUFBcUIsSUFBckIsQ0FBcEI7O0FBRUEsTUFBTSxRQUFRLFFBQVE7QUFDcEIsUUFBTSxRQUFRLEtBQUssS0FBTCxDQUFXLFdBQVgsRUFBd0IsQ0FBeEIsQ0FBZDtBQUNBLFFBQU0sVUFBVSxFQUFoQjtBQUNBLFNBQU8sSUFBUCxDQUFZLE9BQVosRUFBcUIsT0FBckIsQ0FBNkIsS0FBSztBQUNoQyxZQUFRLENBQVIsSUFBYSxNQUFNLEtBQU4sQ0FBWSxRQUFRLENBQVIsQ0FBWixFQUF3QixDQUF4QixDQUFiO0FBQ0QsR0FGRDtBQUdBLFNBQU8sT0FBUDtBQUNELENBUEQ7O1FBU1MsSyxHQUFBLEsiLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcCBmcm9tICdlczYtcHJvbWlzaWZ5JztcblxuY29uc3QgdGFnVGVtcGxhdGUgPSAobmFtZSwgY29udGVudCkgPT4gYFxcXFxbXFxcXHMqJHtuYW1lfVxcXFxzKlxcXFxdKCR7Y29udGVudH0pXFxcXFtcXFxccypcXFxcXFxcXCR7bmFtZX1cXFxccypcXFxcXWA7XG5jb25zdCByZWdFeHBzID0ge1xuICBuYW1lOiAnLionLFxuICBhbGxkYXk6ICd0cnVlfGZhbHNlJyxcbiAgc3RhcnREYXRlOiAnWzAtOV0rJyxcbiAgZW5kRGF0ZTogJ1swLTldKycsXG4gIG5vdGlmaWNhdGlvbnM6ICdcXFxcW1swLTksXFxcXHNdKlxcXFxdJyxcbiAgbG9jYXRpb246ICcuKicsXG4gIGRlc2NyaXB0aW9uOiAnW1xcXFx3XFxcXFddKicsXG59O1xuXG5jb25zdCBmdWxsID0gT2JqZWN0LmtleXMocmVnRXhwcykubWFwKHIgPT4ge1xuICByZWdFeHBzW3JdID0gdGFnVGVtcGxhdGUociwgcmVnRXhwc1tyXSk7XG4gIHJldHVybiByZWdFeHBzW3JdLnJlcGxhY2UoL1tcXChcXCldL2csICcnKTtcbn0pLmpvaW4oJycpO1xuY29uc3QgZXZlbnRSZWdFeHAgPSB0YWdUZW1wbGF0ZSgnZXZlbnQnLCBmdWxsKTtcblxuY29uc3QgcGFyc2UgPSB0ZXh0ID0+IHtcbiAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKGV2ZW50UmVnRXhwKVswXTtcbiAgY29uc3QgcmVzdWx0cyA9IHt9O1xuICBPYmplY3Qua2V5cyhyZWdFeHBzKS5mb3JFYWNoKHIgPT4ge1xuICAgIHJlc3VsdHNbcl0gPSBtYXRjaC5tYXRjaChyZWdFeHBzW3JdKVswXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuZXhwb3J0IHsgcGFyc2UgfTtcbiJdfQ==