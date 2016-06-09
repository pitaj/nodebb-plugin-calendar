'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _nodebb = require('./promises/nodebb');

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } // import p from 'es6-promisify';


const listKey = 'plugins:calendar:events';
const objectKey = `${ listKey }:id`;

const IO = {
  event: {
    create: (() => {
      var ref = _asyncToGenerator(function* (obj) {
        const key = `${ objectKey }:${ obj.id }`;
        const name = _validator2.default.escape(obj.name);
        yield Promise.all([_nodebb.db.sortedSetAddAsync(listKey, obj.startDate, key), _nodebb.db.setObjectAsync(key, _extends({}, obj, { name }))]);
      });

      return function create(_x) {
        return ref.apply(this, arguments);
      };
    })()
  },
  notification: {}
};

exports.default = IO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7QUFFQSxNQUFNLFVBQVUseUJBQWhCO0FBQ0EsTUFBTSxZQUFZLENBQUMsQUFBRCxHQUFHLE9BQUgsRUFBVyxHQUFYLENBQWxCOztBQUVBLE1BQU0sS0FBSztBQUNULFNBQU87QUFDTDtBQUFBLGtDQUFRLFdBQU0sR0FBTixFQUFhO0FBQ25CLGNBQU0sTUFBTSxDQUFDLEFBQUQsR0FBRyxTQUFILEVBQWEsQ0FBYixHQUFnQixJQUFJLEVBQXBCLEVBQXVCLEFBQXZCLENBQVo7QUFDQSxjQUFNLE9BQU8sb0JBQVUsTUFBVixDQUFpQixJQUFJLElBQXJCLENBQWI7QUFDQSxjQUFNLFFBQVEsR0FBUixDQUFZLENBQ2hCLFdBQUcsaUJBQUgsQ0FBcUIsT0FBckIsRUFBOEIsSUFBSSxTQUFsQyxFQUE2QyxHQUE3QyxDQURnQixFQUVoQixXQUFHLGNBQUgsQ0FBa0IsR0FBbEIsZUFBNEIsR0FBNUIsSUFBaUMsSUFBakMsSUFGZ0IsQ0FBWixDQUFOO0FBSUQsT0FQRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURLLEdBREU7QUFXVCxnQkFBYztBQVhMLENBQVg7O2tCQWdCZSxFIiwiZmlsZSI6ImlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHAgZnJvbSAnZXM2LXByb21pc2lmeSc7XG5pbXBvcnQgeyBkYiB9IGZyb20gJy4vcHJvbWlzZXMvbm9kZWJiJztcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAndmFsaWRhdG9yJztcblxuY29uc3QgbGlzdEtleSA9ICdwbHVnaW5zOmNhbGVuZGFyOmV2ZW50cyc7XG5jb25zdCBvYmplY3RLZXkgPSBgJHtsaXN0S2V5fTppZGA7XG5cbmNvbnN0IElPID0ge1xuICBldmVudDoge1xuICAgIGNyZWF0ZTogYXN5bmMgb2JqID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGAke29iamVjdEtleX06JHtvYmouaWR9YDtcbiAgICAgIGNvbnN0IG5hbWUgPSB2YWxpZGF0b3IuZXNjYXBlKG9iai5uYW1lKTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgZGIuc29ydGVkU2V0QWRkQXN5bmMobGlzdEtleSwgb2JqLnN0YXJ0RGF0ZSwga2V5KSxcbiAgICAgICAgZGIuc2V0T2JqZWN0QXN5bmMoa2V5LCB7IC4uLm9iaiwgbmFtZSB9KSxcbiAgICAgIF0pO1xuICAgIH0sXG4gIH0sXG4gIG5vdGlmaWNhdGlvbjoge1xuXG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBJTztcbiJdfQ==