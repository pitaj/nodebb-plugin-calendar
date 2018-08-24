const replaceInFCLang = /!function\(e\)\{.*?moment\)\}/;

const replaceWithFCLang = 'import moment from "moment"; (function (e) { e(jQuery, moment); })';

const fullCalendarLang = text => text
  .replace(replaceInFCLang, replaceWithFCLang)
  .replace(/defineLocale/, 'updateLocale');

const replaceInDTP = /\(function \(factory\) \{[\w\W]+\}\(function \(\$, moment\) \{/;

const replaceWithDTP =
`import moment from "moment";
(function (factory) {
  factory(jQuery, moment);
}(function ($, moment) {
`;

const dtp = text => text
  .replace(replaceInDTP, replaceWithDTP);

module.exports = function loader(content) {
  if (this.resourcePath.match(/fullcalendar[/\\]+dist[/\\]+locale/)) {
    const output = fullCalendarLang(content);
    return output;
  }
  if (this.resourcePath.includes('eonasdan-bootstrap-datetimepicker')) {
    const output = dtp(content);
    return output;
  }
  return content;
};
