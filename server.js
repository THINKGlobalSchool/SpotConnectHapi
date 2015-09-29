var Hapi = require('hapi');
var Good = require('good');
var Request = require('request');
var _ = require('underscore');
var qs = require('querystring');
var Wreck = require('wreck');

var server = new Hapi.Server();
server.connection({ port: 3000 });

var spotEndpoint = "https://spotdev19.net/services/api/rest/json/";
var spotPort = 443; // Used for proxying

routes = [];

routes.push({
	'method': 'POST', 
	'path': '/api/auth.get_user_pass_auth_token',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var endpoint = spotEndpoint + '?method=auth.get_user_pass_auth_token';

			Request.post(
		   		endpoint,
			    {	
			    	form: {
				    	username: request.payload.username,
				    	password: request.payload.password,
				    	api_key: request.payload.api_key 
			   		},
			   		rejectUnauthorized: false
				},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
					        'status': -1,
					        'message': error
					    });
			        }	        
			    }
			);
		}
	}
});

routes.push({
	'method': 'POST', 
	'path': '/api/auth.get_google_auth_token',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var endpoint = spotEndpoint + '?method=auth.get_google_auth_token';

			Request.post(
		   		endpoint,
			    {	
			    	form: {
				    	email: request.payload.email,
				    	api_key: request.payload.api_key 
			   		},
			   		rejectUnauthorized: false
				},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
					        'status': -1,
					        'message': error
					    });
			        }	        
			    }
			);
		}
	}
});

routes.push({
	'method': 'POST', 
	'path': '/api/thewire.post',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var endpoint = spotEndpoint + '?method=thewire.post';

			Request.post(
		   		endpoint,
			    {	
			    	form: {
				    	text: request.payload.text,
				    	api_key: request.payload.api_key,
				    	auth_token: request.payload.auth_token
			   		},
			   		rejectUnauthorized: false
				},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
			);
		}
	}
});

routes.push({
	'method': 'POST', 
	'path': '/api/bookmark.post',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var endpoint = spotEndpoint + '?method=bookmark.post';

			Request.post(
		   		endpoint,
			    {	
			    	form: {
				    	title: request.payload.title,
				    	url: request.payload.url,
				    	api_key: request.payload.api_key,
				    	auth_token: request.payload.auth_token
			   		},
			   		rejectUnauthorized: false
				},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
			);
		}
	}
});


routes.push({
	'method': 'POST', 
	'path': '/api/photos.post',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);
			var endpoint = spotEndpoint + '?method=photos.post';

			// Just proxy this sucker (can't deal with the post data at the moment.. boo)
			reply.proxy({
				uri: endpoint,
				rejectUnauthorized: false,
				onResponse: function(err, res, request, reply, settings, ttl) {
					if (err) {
						reply(err).code(500);
						return;
					}
					
					Wreck.read(res, {json: 'true'}, function (err, payload) {
						server.log('info', 'HAY');
						server.log('info', payload);
						reply(payload);
						//reply(res).ttl(ttl).passThrough(true);
					});

					
				}
			});

			// NOTE: I could do this globally and skip manual requests
		},
		payload: {
			parse: false,
			maxBytes: 1048576 * 100,
			output: 'stream'
		}
	}
});

routes.push({
	'method': 'POST', 
	'path': '/api/photos.finalize.post',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var endpoint = spotEndpoint + '?method=photos.finalize.post';

			Request.post(
		   		endpoint,
			    {	
			    	form: {
				    	batch: request.payload.batch,
				    	api_key: request.payload.api_key,
				    	auth_token: request.payload.auth_token
			   		},
			   		rejectUnauthorized: false
				},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
			);
		}
	}
});

routes.push({
	'method': 'GET', 
	'path': '/api/user.get_profile',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var params = request.url.query;
			params.method = "user.get_profile";

			var endpoint = spotEndpoint + '?' + qs.stringify(params);
			Request.get(
		   		endpoint,
			    {rejectUnauthorized: false},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
			);
		}
	}
});

routes.push({
	'method': 'GET', 
	'path': '/api/util.ping',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var params = request.url.query;

			params.method = "util.ping";

			var endpoint = spotEndpoint + '?' + qs.stringify(params);

			Request.get(
		   		endpoint,
			    {rejectUnauthorized: false},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
	);
		}
	}
});

routes.push({
	'method': 'GET', 
	'path': '/api/albums.list',
	'config': {
		handler: function(request, reply) {
			server.log('info', 'Calling [' + request.method + '] ' + request.route.path);

			var params = request.url.query;

			params.method = "albums.list";

			var endpoint = spotEndpoint + '?' + qs.stringify(params);

			Request.get(
		   		endpoint,
			    {rejectUnauthorized: false},
			    function (error, response, body) {
			        if (!error && response.statusCode == 200) {
			            server.log('info', body);
			            reply(body);
			        } else {
			        	reply({
			        		'status': -1,
					        'error': error
					    });
			        }	        
			    }
	);
		}
	}
});

server.route(routes);

// Register Good logging
server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
	        events: {
	            request: '*',
	            log: '*'
	        }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});