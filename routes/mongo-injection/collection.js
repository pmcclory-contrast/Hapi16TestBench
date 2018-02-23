'use strict';

const Hoek = require('hoek');
const pluginName = 'hapitestbench.mongodbCollection';

const sinks = [
	'find',
	'insertOne',
	'insertMany',
	'insert',
	'updateOne',
	'replaceOne',
	'updateMany',
	'update',
	'removeOne',
	'deleteOne',
	'deleteMany',
	'removeMany',
	'remove',
	'save',
	'findOne',
	'rename',
	'findOneAndDelete',
	'findOneAndReplace',
	'findOneAndUpdate',
	'findAndModify',
	'findAndRemove'
];

const needArray = [
	'insertMany'
];

// NOTE: in most cases, these are not executing valid operations
// and mongo will return an error. This does not affect the validity of the
// finding, and so we just ignore the error.
function handle (collection, sink, request, reply) {
	const value = Hoek.reach(request, 'query.input');

	let query = {where: value};
	if (needArray.indexOf(sink) !== -1) {
		query = [query];
	}

	if (sink === 'rename') {
		query = value;
	}

	const cb = (err, result) => {
		reply('!');
	};

	if (sink.toLowerCase().includes('update') ||
		sink.toLowerCase().includes('replace')) {
		const op = {input: value};
		collection[sink](query, op, cb);
	} else {
		collection[sink](query, cb);
	}
}

exports.register = function(server, options, next) {
	const db = server.plugins['hapitestbench.mongodb'].db;
	const col = db.collection(pluginName);

	server.route({
		method: 'GET',
		path: '/',
		handler: function(req, r) {
			r('hello');
		}
	});

	sinks.forEach(sink => {
		server.route([
			{
				path: `${sink}/safe`,
				method: 'GET',
				// TODO: proper test here
				handler: (request, reply) => reply('SAFE')
			}, {
				path: `${sink}/unsafe`,
				method: 'GET',
				handler: handle.bind(this, col, sink)
			}
		]);
	});

	next();
};

exports.register.attributes = {name: pluginName};
