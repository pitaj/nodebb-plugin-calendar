const replaceInFCLang = /!function\(a\)\{[\w\W]+\}\(function\(a,b\)\{/;

const replaceWithFCLang = 'import moment from "moment";' +
'!function(a){a(jQuery,moment)}(function(a,b){';

const fullCalendarLang = text =>
  text
    .replace(replaceInFCLang, replaceWithFCLang)
    .replace(/'use strict';/g, '');

const replaceInFC = /\(function\(factory\) \{[\w\W]+\}\)\(function\(\$, moment\) \{/;

const replaceWithFC =
`import moment from "moment";
(function(factory) {
	factory(jQuery, moment);
})(function($, moment) {`;

const fullCalendar = text =>
  text
    .replace(replaceInFC, replaceWithFC)
    .replace(/'use strict';/g, '');

const replaceInDTP = /\(function \(factory\) \{[\w\W]+\}\(function \(\$, moment\) \{/;

const replaceWithDTP =
`import moment from "moment";
(function (factory) {
  factory(jQuery, moment);
}(function ($, moment) {
`;

const dtp = text =>
  text
    .replace(replaceInDTP, replaceWithDTP)
    .replace(/'use strict';/g, '');

module.exports = function loader(content) {
  if (this.resourcePath.includes('fullcalendar/dist/lang')) {
    const output = fullCalendarLang(content);
    return output;
  }
  if (this.resourcePath.includes('fullcalendar')) {
    const output = fullCalendar(content);
    return output;
  }
  if (this.resourcePath.includes('eonasdan-bootstrap-datetimepicker')) {
    const output = dtp(content);
    return output;
  }
  // if (this.resourcePath.includes('moment/locales')) {
  //   return momentLocales(content);
  // }
  return content;
};
