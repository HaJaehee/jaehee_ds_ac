var 	auth = require('./auth');
var		rest = require('./rest');
var		config = require('./conf.json');
var		epcis_ac_api_address = config.EPCIS_AC_API_ADDRESS;

exports.configure = function (app) {	
	app.get('/css/', function (req, res) {
		res.contentType('text/css');
		res.sendfile(__dirname + '/css/EPCIS_AC.css');
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */
	app.get('/addepcis', auth.ensureAuthenticated, function(req, res){
		res.render('addepcis.jade', {user: req.user, epcisname:"", error:null});
	});
	
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.post('/addepcis', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.body.epcisname;
		var args = "{\"epcisname\":\""+epcisname+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/possess", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('addepcis.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * 
	 */
	var epcisfurnishers = null;
	app.get('/furnishepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var epcisfurnishers;
		rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnisher", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.epcisfurnishers.length !== null && response.epcisfurnishers !== null) { 
				epcisfurnishers = response.epcisfurnishers;
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
			var others;
			rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnisher/others", null, req.user.token, null, null, function (error2, response2) {
				if (!error2 && response2 !== null && response2.epcisfurnisherothers.length !== null && response2.epcisfurnisherothers !== null) { 
					others = response.epcisfurnisherothers;
				} else if (!error) {
					error = "invalid JSON returned from FindZones";
				}
				res.render('furnishepcis.jade', {user: req.user, epcisname:epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishername:'', others:others, error:null});
			});
		});	
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * 
	 */
	app.post('/furnishepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var epcisfurnishername = req.body.epcisfurnishername;
		var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnish", null, req.user.token, null, args, function (error, response) {		
			if (error) {
				res.render('subscribeepcis.jade', { user: req.user, epcisname: epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishername:epcisfurnishername, error: error });
			} else {
				res.redirect('/index');
			}
		});	
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * 
	 */
	var epcissubscribers = null;
	app.get('/subscribeepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscriber", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.epcissubscribers.length !== null && response.epcissubscribers !== null) { 
				epcissubscribers = response.epcissubscribers;
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
			var others;
			rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscriber/others", null, req.user.token, null, null, function (error2, response2) {
				if (!error2 && response2 !== null && response2.epcissubscriberothers.length !== null && response2.epcissubscriberothers !== null) { 
					others = response.epcissubscriberothers;
				} else if (!error) {
					error = "invalid JSON returned from FindZones";
				}
				res.render('subscribeepcis.jade', {user: req.user, epcisname:epcisname, epcissubscribers:epcissubscribers, others:others, error:null});
		
			});	
		});
	});

	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * 
	 */
	app.post('/subscribeepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var epcissubscribername = req.body.epcissubscribername;
		var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscribe", null, req.user.token, null, args, function (error, response) {		
			if (error) {
				res.render('subscribeepcis.jade', { user: req.user, epcisname: epcisname, epcissubscribers:epcissubscribers, epcissubscribername:epcissubscribername, error: error });
			} else {
				res.redirect('/index');
			}
		});	
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * 
	 */
	app.get('/unfurnepcis/epcis/:epcisname/user/:epcisfurnishername', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var epcisfurnishername = req.params.epcisfurnishername;
		var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
		
		rest.delOperation(epcis_ac_api_address, "unfurnepcis/"+epcisname+"/user/"+epcisfurnishername , null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('furnishepcis.jade', { user: req.user, epcisname: epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishername:epcisfurnishername, error: error });
			} else {
				res.redirect('/index');
			}
		});	
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * 
	 */
	app.get('/unsubsepcis/epcis/:epcisname/user/:epcissubscribername', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var epcissubscribername = req.params.epcissubscribername;
		var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
		
		rest.delOperation(epcis_ac_api_address, "unsubsepcis/"+epcisname+"/user/"+epcissubscribername , null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('subscribeepcis.jade', { user: req.user, epcisname: epcisname, epcissubscribers:epcissubscribers, epcissubscribername:epcissubscribername, error: error });
			} else {
				res.redirect('/index');
			}
		});	
	});
	

	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/delepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var args = "{\"epcisname\":\""+epcisname+"\",\"username\":\""+req.user.email+"\"}";
		rest.delOperation(epcis_ac_api_address, "delepcis/"+epcisname, null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/captureepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/furnish", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.furnisher === 'yes'){
					res.render('captureevent.jade', { user: req.user, epcisname: epcisname, furnisher: response.furnisher, error: error });
				} else {
					res.render('captureevent.jade', { user: req.user, epcisname: epcisname, error: error });
					
				}
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * 
	 */ 
	app.post('/captureepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var raw_epcisevent = req.body.epcisevent;
		var epcisname = req.params.epcisname;
		raw_epcisevent = raw_epcisevent+"<ac:EPCISName>"+epcisname+"</ac:EPCISName>";
		var epcisevent = raw_epcisevent.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, " ").replace(/\"/g,"<q>");

		var args = "{\"epcisevent\":\""+epcisevent+"\"}";

		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/capture", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('captureevent.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/qryepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.possessor === 'yes'){
					res.render('queryevent.jade', { user: req.user, epcisname: epcisname, subscriber: response.subscriber, error: error });
				} else {
					res.render('queryevent.jade', { user: req.user, epcisname: epcisname, error: error });
				}
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * TODO will be implemented
	 * 
	 */ 
	app.post('/qryepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var raw_epcisquery = req.body.epcisquery;
		var epcisname = req.params.epcisname;
		var epcisquery = raw_epcisquery.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, " ").replace(/\"/g,"<q>");

		var args = "{\"epcisquery\":\""+epcisquery+"\"}";

		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/query", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('queryevent.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	app.get('/addgroup', auth.ensureAuthenticated, function(req, res){
		res.render('addgroup.jade', {user: req.user, groupname:"", error:null});
	});
	
	app.post('/addgroup', auth.ensureAuthenticated, function(req, res){
		var groupname = req.body.groupname;
		var args = "{\"groupname\":\""+groupname+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/manage", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('addgroup.jade', {user: req.user, groupname:"", error: error});
			} else {
				res.redirect('/index');
			}
		});
		
	
	});
	
	app.get('/delgroup/:groupname', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var args = "{\"groupname\":\""+groupname+"\"}";
		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/unmanage", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	app.get('/group/:groupname', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		rest.getOperation(epcis_ac_api_address, "group/"+groupname+"/join", null, req.user.token, null, null, function (error, response) {
			res.render('editgroup.jade', { user: req.user, groupname: groupname, users: response.users, error: error });
		});
	});
	

	app.get('/group/:groupname/join', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		rest.getOperation(epcis_ac_api_address, "group/"+groupname+"/other", null, req.user.token, null, null, function (error, response) {
			res.render('adduser.jade', { user: req.user, groupname: groupname, others: response.others, error: error });
		});
	});
	
	app.post('/group/:groupname/join', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var username = req.body.username;
		var args = "{\"username\":\""+username+"\"}";
		rest.postOperation(epcis_ac_api_address, "group/"+groupname+"/join", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: error });
			} else {
				res.redirect('/group/'+groupname);
			}
		});
	});
	
	app.get('/group/:groupname/unjoin/:username', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var username = req.params.username;
		var args = "{\"username\":\""+username+"\"}";
		rest.postOperation(epcis_ac_api_address, "group/"+groupname+"/unjoin", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: error });
			} else {
				res.redirect('/group/'+groupname);
			}
		});
	});

		
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * added subscribing functionality
	 * 2016.11.04
	 * added furnishing functionality
	 * removed thing, service functionality
	 * 2016.11.05
	 * 
	 */ 
	app.get('/index', auth.ensureAuthenticated, function(req, res){
		var offset = req.param('offset', 0);
		var count = req.param('count', 10);
		rest.getOperation(epcis_ac_api_address, "user/"+req.user.email+"/possess", null, req.user.token, null, null, function (error, response) {
			var epciss = null;
			if (!error && response !== null && response.epciss.length !== null && response.epciss !== null) { 
				epciss = response.epciss;
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
			//
			rest.getOperation(epcis_ac_api_address, "user/"+req.user.email+"/furnish", null, req.user.token, null, null, function (error, response) {
				var epcisfurns = null;
				if (!error && response !== null && response.epcisfurns.length !== null && response.epcisfurns !== null) { 
					epcisfurns = response.epcisfurns;
				} else if (!error) {
					error = "invalid JSON returned from FindZones";
				}
				rest.getOperation(epcis_ac_api_address, "user/"+req.user.email+"/subscribe", null, req.user.token, null, null, function (error, response) {
					var epcissubss = null;
					if (!error && response !== null && response.epcissubss.length !== null && response.epcissubss !== null) { 
						epcissubss = response.epcissubss;
					} else if (!error) {
						error = "invalid JSON returned from FindZones";
					}
					rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/manage", null, req.user.token, null, null, function (error, response) {
						var groups = null;
						if (!error && response !== null && response.groups.length !== null && response.groups !== null) { 
							groups = response.groups;
						} else if (!error) {
							error = "invalid JSON returned from FindZones";
						}
						res.render('index.jade', { user: req.user, offset: offset, count: count, epciss:epciss, epcisfurns:epcisfurns, epcissubss:epcissubss, groups: groups, error: error });
					});
				});
			});
		});
	});
	
	/**
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/:offset?/:count?', function(req, res){
		res.redirect('/index');
	});
	

};
