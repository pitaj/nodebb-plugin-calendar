'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.widgets = exports.views = exports.user = exports.topics = exports.socketio = exports.routes = exports.rewards = exports.privileges = exports.posts = exports.plugins = exports.navigation = exports.middleware = exports.meta = exports.messaging = exports.groups = exports.database = exports.controllers = exports.categories = undefined;

var _es6PromisifyAll = require('es6-promisify-all');

var _es6PromisifyAll2 = _interopRequireDefault(_es6PromisifyAll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mainRequire = name => require.main.require(name);

// NodeBB imports
const categories = (0, _es6PromisifyAll2.default)(mainRequire('./src/categories'));
const controllers = (0, _es6PromisifyAll2.default)(mainRequire('./src/controllers'));
const database = (0, _es6PromisifyAll2.default)(mainRequire('./src/database'));
const groups = (0, _es6PromisifyAll2.default)(mainRequire('./src/groups'));
const messaging = (0, _es6PromisifyAll2.default)(mainRequire('./src/messaging'));
const meta = (0, _es6PromisifyAll2.default)(mainRequire('./src/meta'));
const middleware = (0, _es6PromisifyAll2.default)(mainRequire('./src/middleware'));
const navigation = (0, _es6PromisifyAll2.default)(mainRequire('./src/navigation'));
const plugins = (0, _es6PromisifyAll2.default)(mainRequire('./src/plugins'));
const posts = (0, _es6PromisifyAll2.default)(mainRequire('./src/posts'));
const privileges = (0, _es6PromisifyAll2.default)(mainRequire('./src/privileges'));
const rewards = (0, _es6PromisifyAll2.default)(mainRequire('./src/rewards'));
const routes = (0, _es6PromisifyAll2.default)(mainRequire('./src/routes'));
const socketio = (0, _es6PromisifyAll2.default)(mainRequire('./src/socket.io'));
const topics = (0, _es6PromisifyAll2.default)(mainRequire('./src/topics'));
const user = (0, _es6PromisifyAll2.default)(mainRequire('./src/user'));
const views = (0, _es6PromisifyAll2.default)(mainRequire('./src/views'));
const widgets = (0, _es6PromisifyAll2.default)(mainRequire('./src/widgets'));
const utils = (0, _es6PromisifyAll2.default)(mainRequire('./public/src/utils'));

// NodeBB exports
exports.categories = categories;
exports.controllers = controllers;
exports.database = database;
exports.groups = groups;
exports.messaging = messaging;
exports.meta = meta;
exports.middleware = middleware;
exports.navigation = navigation;
exports.plugins = plugins;
exports.posts = posts;
exports.privileges = privileges;
exports.rewards = rewards;
exports.routes = routes;
exports.socketio = socketio;
exports.topics = topics;
exports.user = user;
exports.views = views;
exports.widgets = widgets;
exports.utils = utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcm9taXNlcy9ub2RlYmIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxNQUFNLGNBQWMsUUFBUSxRQUFRLElBQVIsQ0FBYSxPQUFiLENBQXFCLElBQXJCLENBQTVCOzs7QUFHQSxNQUFNLGFBQWEsK0JBQUssWUFBWSxrQkFBWixDQUFMLENBQW5CO0FBQ0EsTUFBTSxjQUFjLCtCQUFLLFlBQVksbUJBQVosQ0FBTCxDQUFwQjtBQUNBLE1BQU0sV0FBVywrQkFBSyxZQUFZLGdCQUFaLENBQUwsQ0FBakI7QUFDQSxNQUFNLFNBQVMsK0JBQUssWUFBWSxjQUFaLENBQUwsQ0FBZjtBQUNBLE1BQU0sWUFBWSwrQkFBSyxZQUFZLGlCQUFaLENBQUwsQ0FBbEI7QUFDQSxNQUFNLE9BQU8sK0JBQUssWUFBWSxZQUFaLENBQUwsQ0FBYjtBQUNBLE1BQU0sYUFBYSwrQkFBSyxZQUFZLGtCQUFaLENBQUwsQ0FBbkI7QUFDQSxNQUFNLGFBQWEsK0JBQUssWUFBWSxrQkFBWixDQUFMLENBQW5CO0FBQ0EsTUFBTSxVQUFVLCtCQUFLLFlBQVksZUFBWixDQUFMLENBQWhCO0FBQ0EsTUFBTSxRQUFRLCtCQUFLLFlBQVksYUFBWixDQUFMLENBQWQ7QUFDQSxNQUFNLGFBQWEsK0JBQUssWUFBWSxrQkFBWixDQUFMLENBQW5CO0FBQ0EsTUFBTSxVQUFVLCtCQUFLLFlBQVksZUFBWixDQUFMLENBQWhCO0FBQ0EsTUFBTSxTQUFTLCtCQUFLLFlBQVksY0FBWixDQUFMLENBQWY7QUFDQSxNQUFNLFdBQVcsK0JBQUssWUFBWSxpQkFBWixDQUFMLENBQWpCO0FBQ0EsTUFBTSxTQUFTLCtCQUFLLFlBQVksY0FBWixDQUFMLENBQWY7QUFDQSxNQUFNLE9BQU8sK0JBQUssWUFBWSxZQUFaLENBQUwsQ0FBYjtBQUNBLE1BQU0sUUFBUSwrQkFBSyxZQUFZLGFBQVosQ0FBTCxDQUFkO0FBQ0EsTUFBTSxVQUFVLCtCQUFLLFlBQVksZUFBWixDQUFMLENBQWhCO0FBQ0EsTUFBTSxRQUFRLCtCQUFLLFlBQVksb0JBQVosQ0FBTCxDQUFkOzs7UUFJRSxVLEdBQUEsVTtRQUNBLFcsR0FBQSxXO1FBQ0EsUSxHQUFBLFE7UUFDQSxNLEdBQUEsTTtRQUNBLFMsR0FBQSxTO1FBQ0EsSSxHQUFBLEk7UUFDQSxVLEdBQUEsVTtRQUNBLFUsR0FBQSxVO1FBQ0EsTyxHQUFBLE87UUFDQSxLLEdBQUEsSztRQUNBLFUsR0FBQSxVO1FBQ0EsTyxHQUFBLE87UUFDQSxNLEdBQUEsTTtRQUNBLFEsR0FBQSxRO1FBQ0EsTSxHQUFBLE07UUFDQSxJLEdBQUEsSTtRQUNBLEssR0FBQSxLO1FBQ0EsTyxHQUFBLE87UUFDQSxLLEdBQUEsSyIsImZpbGUiOiJub2RlYmIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcEFsbCBmcm9tICdlczYtcHJvbWlzaWZ5LWFsbCc7XG5cbmNvbnN0IG1haW5SZXF1aXJlID0gbmFtZSA9PiByZXF1aXJlLm1haW4ucmVxdWlyZShuYW1lKTtcblxuLy8gTm9kZUJCIGltcG9ydHNcbmNvbnN0IGNhdGVnb3JpZXMgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9jYXRlZ29yaWVzJykpO1xuY29uc3QgY29udHJvbGxlcnMgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9jb250cm9sbGVycycpKTtcbmNvbnN0IGRhdGFiYXNlID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvZGF0YWJhc2UnKSk7XG5jb25zdCBncm91cHMgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9ncm91cHMnKSk7XG5jb25zdCBtZXNzYWdpbmcgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9tZXNzYWdpbmcnKSk7XG5jb25zdCBtZXRhID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvbWV0YScpKTtcbmNvbnN0IG1pZGRsZXdhcmUgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9taWRkbGV3YXJlJykpO1xuY29uc3QgbmF2aWdhdGlvbiA9IHBBbGwobWFpblJlcXVpcmUoJy4vc3JjL25hdmlnYXRpb24nKSk7XG5jb25zdCBwbHVnaW5zID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvcGx1Z2lucycpKTtcbmNvbnN0IHBvc3RzID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvcG9zdHMnKSk7XG5jb25zdCBwcml2aWxlZ2VzID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvcHJpdmlsZWdlcycpKTtcbmNvbnN0IHJld2FyZHMgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9yZXdhcmRzJykpO1xuY29uc3Qgcm91dGVzID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvcm91dGVzJykpO1xuY29uc3Qgc29ja2V0aW8gPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy9zb2NrZXQuaW8nKSk7XG5jb25zdCB0b3BpY3MgPSBwQWxsKG1haW5SZXF1aXJlKCcuL3NyYy90b3BpY3MnKSk7XG5jb25zdCB1c2VyID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvdXNlcicpKTtcbmNvbnN0IHZpZXdzID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvdmlld3MnKSk7XG5jb25zdCB3aWRnZXRzID0gcEFsbChtYWluUmVxdWlyZSgnLi9zcmMvd2lkZ2V0cycpKTtcbmNvbnN0IHV0aWxzID0gcEFsbChtYWluUmVxdWlyZSgnLi9wdWJsaWMvc3JjL3V0aWxzJykpO1xuXG4vLyBOb2RlQkIgZXhwb3J0c1xuZXhwb3J0IHtcbiAgY2F0ZWdvcmllcyxcbiAgY29udHJvbGxlcnMsXG4gIGRhdGFiYXNlLFxuICBncm91cHMsXG4gIG1lc3NhZ2luZyxcbiAgbWV0YSxcbiAgbWlkZGxld2FyZSxcbiAgbmF2aWdhdGlvbixcbiAgcGx1Z2lucyxcbiAgcG9zdHMsXG4gIHByaXZpbGVnZXMsXG4gIHJld2FyZHMsXG4gIHJvdXRlcyxcbiAgc29ja2V0aW8sXG4gIHRvcGljcyxcbiAgdXNlcixcbiAgdmlld3MsXG4gIHdpZGdldHMsXG4gIHV0aWxzLFxufTtcbiJdfQ==