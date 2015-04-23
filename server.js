var Hapi = require('hapi');
var Good = require('good');
var Request = require('request');
var _ = require('underscore');
var qs = require('querystring');

var server = new Hapi.Server();
server.connection({ port: 3000 });

var spotEndpoint = "https://spotdev19.net/services/api/rest/json/";

var apiCalls = {'post': [],'get': []};

// Get token API call
apiCalls.post.push({call: 'auth.get_user_pass_auth_token', 'handler': function(request, reply) {
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
}});

// Get token API call
apiCalls.post.push({call: 'auth.get_google_auth_token', 'handler': function(request, reply) {
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
}});

apiCalls.post.push({call: 'thewire.post', 'handler': function(request, reply) {
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
}});

apiCalls.post.push({call: 'bookmark.post', 'handler': function(request, reply) {
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
}});

apiCalls.get.push({call: "user.get_profile", 'handler': function(request, reply) {
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
}});

apiCalls.get.push({call: "util.ping", 'handler': function(request, reply) {
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
}});

// Handle All API Methods
var apiMethodHandler = function(request, reply) {
	if (Object.keys(request.params).length > 0) {
		// Make sure request method is defined in apiCalls
		if (request.method in apiCalls) {
			// See if the call is registered in apiCalls
			obj = _.find(apiCalls[request.method], function(obj) { return obj.call == request.params.call});
			if (obj) {
				// Found it, call the handler
				server.log('info', 'Calling [' + request.method + '] ' + request.params.call);
				obj.handler(request, reply);
			} else {
				// No such call
				server.log('error', 'Unknown API call for [' + request.method + '] ' + request.params.call);
				reply({error: 'Unknown API call for [' + request.method + '] ' + request.params.call});
			}
		} else {
			// No such method
			server.log('error', 'Unknown Method: ' + request.method);
			reply({error: 'Unknown Method: ' + request.method});
		}
	} else {
		// @TODO prettier list
		reply(apiCalls);
	}
}

// Main API Route
server.route({
	method: ['GET', 'POST'],
	path: '/api/{call?}',
	handler: apiMethodHandler
});

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