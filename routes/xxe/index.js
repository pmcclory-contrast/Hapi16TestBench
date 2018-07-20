'use strict';

const libxmljs = require('libxmljs');

const pluginName = 'hapitestbench.xxe';

const ATTACK_XML = `
<!DOCTYPE read-fs [<!ELEMENT read-fs ANY >
<!ENTITY passwd SYSTEM "file:///etc/passwd" >]>
<users>
  <user>
    <read-fs>&passwd;</read-fs>
    <name>C.K Frode</name>
  </user>
</users>`;

exports.register = function xxe(server, options, next) {
	server.route({
		method: 'GET',
		path: '/',
		handler: (request, reply) => {
			return reply.view('xxe', { ATTACK_XML });
		}
	});

	server.route({
		method: 'POST',
		path: '/safe',
		handler: (request, reply) => {
			reply(libxmljs.parseXmlString(ATTACK_XML, { noent: false }).toString());
		}
	});

	server.route({
		method: 'POST',
		path: '/unsafe',
		handler: (request, reply) => {
			reply(libxmljs.parseXmlString(ATTACK_XML, { noent: true }).toString());
		}
	});

	next();
};

exports.register.attributes = { name: pluginName };
