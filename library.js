(function(module, realModule) {

	"use strict";

	var fs = require("fs"),
			async = require('async'),
	    path = require("path"),
			db = realModule.parent.require('./database'),
			later = require("later"),
			beautify = require('js-beautify').js_beautify,
			ts;

	later.date.localTime();

	function getData(callback){
		db.get('plugins:calendar', function(err, data) {
			callback(err, JSON.parse(data));
		});
	}
	function setData(data, callback){
		db.set('plugins:calendar', JSON.stringify(data), callback);
	}

	module.init = function (app, middleware, controllers, callback) {

		app.get('/api/plugins/calendar', render);

		app.post('/api/plugins/calendar/save', save);

		getData( function(err, data) {
			if (err) { console.err(err); return; }
			console.log(data);



			callback();
		});
	};

	function render (res, next) {
		getData( function(err, data) {
			if (err) {
				return next(err);
			}

			console.log(data);

			res.render("api/plugins/calendar", data);
		});
	}

	function save (req, res, next) {

		console.log(req.body.tasks);

		var data = { tasks : req.body.tasks };

		db.setObject('plugins:calendar', data, function(err) {
			err ? res.json(500, 'Error while saving') : res.json('Successfully saved');
		});

	}

}(module.exports, module));
