var 	auth = require('./auth');
var		rest = require('./rest');
var		config = require('./conf.json');
var		epcis_ac_api_address = config.EPCIS_AC_API_ADDRESS;
var		tdt =  require('./tdt/tdt');

exports.configure = function (app) {	
	app.get('/css/', function (req, res) {
		res.contentType('text/css');
		res.sendfile(__dirname + '/css/EPCIS_AC.css');
	});
	
	app.get('/chart/', function (req, res) {
		res.contentType('text/javascript');
		res.sendfile(__dirname + '/public/live_chart.js');
	});
	
	app.get('/tdt/thingname/:thingname/type/:type', function(req, res){
		res.send({result:tdt.convertString(req.params.thingname, req.params.type)});
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.10.31
	 * 
	 */
	app.get('/addepcis', auth.ensureAuthenticated, function(req, res){
		res.render('addepcis.jade', {user: req.user, epcisname:"", error:null});
	});
	
	app.get('/addthing', auth.ensureAuthenticated, function(req, res){
		res.render('addthing.jade', {user: req.user, thingname:"", error:null});
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
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
	
	app.post('/addthing', auth.ensureAuthenticated, function(req, res){
		var thingname = req.body.thingname;
		var args = "{\"thingname\":\""+thingname+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/own", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('addthing.jade', { user: req.user, thingname: thingname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	

	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.05
	 * TODO
	 */
	var epcisfurnishers = null;
	app.get('/furnishepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnisher", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.epcisfurnishers.length !== null && response.epcisfurnishers !== null) { 
				epcisfurnishers = response.epcisfurnishers;
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
			res.render('furnishepcis.jade', {user: req.user, epcisname:epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishername:'', error:null});
		});	
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.05
	 * TODO
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
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.04
	 * TODO
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
			res.render('subscribeepcis.jade', {user: req.user, epcisname:epcisname, epcissubscribers:epcissubscribers, epcissubscribername:'', error:null});
		});	
	});

	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.04
	 * TODO
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
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.05
	 * TODO
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
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.04
	 * TODO
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
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
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
	
	app.get('/delthing/:thingname', auth.ensureAuthenticated, function(req, res){
		var thingname = req.params.thingname;
		var args = "{\"thingname\":\""+thingname+"\"}";
		rest.delOperation(epcis_ac_api_address, "thing/"+thingname, null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, thingname: thingname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.10.31
	 * 
	 */ 
	app.get('/epcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.possessor === 'yes'){
					res.render('captureevent.jade', { user: req.user, epcisname: epcisname, possessor: response.possessor, error: error });
				} else {
					res.render('captureevent.jade', { user: req.user, epcisname: epcisname, error: error });
					
				}
			}
		});
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
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
	
	app.get('/thing/:thingname', auth.ensureAuthenticated, function(req, res){
		var thingname = tdt.convertString(req.params.thingname, 'PURE_IDENTITY');
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/thing/"+thingname+"/have", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, thingname: thingname, error: error });
			} else {
				var encodeServices = [];
				if(response.services){
					for(var i=0; i < response.services.length; i++){
						encodeServices.push(encodeURIComponent(response.services[i]));
					}
				}
				if(response.owner === 'yes'){
					res.render('editthing.jade', { user: req.user, thingname: thingname, services: response.services, encodeservices: encodeServices, owner: response.owner, error: error });
				} else {
					res.render('editthing.jade', { user: req.user, thingname: thingname, services: response.services, encodeservices: encodeServices, error: error });
					
				}
			}
		});
	});
	
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.11.04
	 * 
	 */ 
	app.post('/epcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var raw_epcisevent = req.body.epcisevent;
		var epcisname = req.params.epcisname;
		raw_epcisevent = raw_epcisevent+"<ac:EPCISName>"+epcisname+"</ac:EPCISName>";
		var epcisevent = raw_epcisevent.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, " ").replace(/\"/g,"<q>");
		console.log(epcisevent);
		var args = "{\"epcisevent\":\""+epcisevent+"\"}";

		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/capture", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('captureevent.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	app.get('/thing/:thingname/servicetype/:servicetype', auth.ensureAuthenticated, function(req, res){
		var thingname = req.params.thingname;
		var servicetype = req.params.servicetype;
		tdt.getServices(thingname, servicetype, function(err, services){
			if(err){
				return res.send(err)
			}
			res.send(services);
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
	
	app.get('/service/:servicename', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		rest.getOperation(epcis_ac_api_address, "service/"+encodeURIComponent(req.params.servicename)+"/grant", null, req.user.token, null, null, function (error, response) {
			var strArray = servicename.split(':');
			var pi = tdt.convertString(strArray[0], 'PURE_IDENTITY');
			res.render('editservice.jade', { user: req.user,  thingname: pi, servicename: servicename, encodeServicename: encodeURIComponent(servicename), groups: response.groups, users: response.users, error: error });
		});
	});


	app.get('/service/:servicename/view', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		rest.getOperation(epcis_ac_api_address, "authority/service/"+encodeURIComponent(servicename), null, req.user.token, null, null, function (error, response) {
			if(error){
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			} else {
				var strArray = servicename.split(':');
				var pi = tdt.convertString(strArray[0], 'PURE_IDENTITY');
				res.render('chart.jade', { user: req.user, thingname: pi,  servicename: servicename, encodeServicename: encodeURIComponent(servicename), observe_on: 'false' });
			} 
		});
	});
	
	app.post('/service/:servicename/observeOn', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var args = "{\"username\":\""+req.user.email+"\"}";
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/observe_on", null, req.user.token, null, args, function (error, response) {
			if(error){
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			}
			res.send(response);
		});
	});
	
	app.post('/service/:servicename/observeOff', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var args = "{\"username\":\""+req.user.email+"\"}";
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/observe_off", null, req.user.token, null, args, function (error, response) {
			if(error){
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			}
			res.send(response);
		});
	});
	
	app.get('/service/:servicename/grant', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		rest.getOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/other", null, req.user.token, null, null, function (error, response) {
			res.render('grantgroup.jade', { user: req.user,  servicename: servicename, encodeServicename: encodeURIComponent(servicename), otherGroups: response.otherGroups, otherUsers: response.otherUsers, error: error });
		});
	});
	

	app.post('/service/:servicename/grant', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.body.grantname
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/read", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, grantname: grantname, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename));
			}
		});
	});

	app.get('/service/:servicename/grant/:grantname/capability', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname;
		rest.getOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/grant/"+grantname+"/capability", null, req.user.token, null, null, function (error, response) {
			res.render('editcapa.jade', { user: req.user, grantname: grantname, encodeGrantname: encodeURIComponent(grantname), servicename: servicename, encodeServicename: encodeURIComponent(servicename), read: response.read, write: response.write, error: error });
		});
	});
	
	app.get('/service/:servicename/ungrant/:grantname', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname;
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/ungrant", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename));
			}
		});
	});
	

	app.get('/service/:servicename/read/:grantname', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/read", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, grantname: grantname, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename)+'/grant/'+grantname+'/capability');
			}
		});
	});

	app.get('/service/:servicename/unread/:grantname', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname;
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/unread", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename)+'/grant/'+grantname+'/capability');
			}
		});
	});
	

	app.get('/service/:servicename/write/:grantname', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/write", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, grantname: grantname, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename)+'/grant/'+grantname+'/capability');
			}
		});
	});

	app.get('/service/:servicename/unwrite/:grantname', auth.ensureAuthenticated, function(req, res){
		var servicename = req.params.servicename;
		var grantname = req.params.grantname;
		var args;
		
		if(grantname.search(req.user.email+":")=== -1){
			args = "{\"username\":\""+grantname+"\"}";
		} else {
			args = "{\"groupname\":\""+grantname+"\"}";
		}
		
		rest.postOperation(epcis_ac_api_address, "service/"+encodeURIComponent(servicename)+"/unwrite", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, servicename: servicename, error: error });
			} else {
				res.redirect('/service/'+encodeURIComponent(servicename)+'/grant/'+grantname+'/capability');
			}
		});
	});
		
	/** 
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.10.31
	 * added subscribing functionality
	 * 2016.11.04
	 * added furnishing functionality
	 * 2016.11.05
	 * TODO
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
			//TODO
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
					rest.getOperation(epcis_ac_api_address, "user/"+req.user.email+"/own", null, req.user.token, null, null, function (error, response) {
						var total = null;
						var things = null;
						if (!error && response !== null && response.things.length !== null && response.things !== null) { 
							total = response.things.length;
							things = response.things;
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
							res.render('index.jade', { user: req.user, total: total, offset: offset, count: count, epciss:epciss, epcisfurns:epcisfurns, epcissubss:epcissubss, things: things, groups: groups, error: error });
						});
					});
				});
			});
		});
	});
	
	/**
	 * Jaehee created
	 * lovesm135@kaist.ac.kr
	 * 2016.10.31
	 * 
	 */ 
	app.get('/:offset?/:count?', function(req, res){
		res.redirect('/index');
	});
	

};
