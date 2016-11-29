var 	auth = require('./auth');
var		rest = require('./rest');
var		config = require('./conf.json');
var		epcis_ac_api_address = config.EPCIS_AC_API_ADDRESS;

exports.configure = function (app) {	
	app.get('/css/', function (req, res) {
		res.contentType('text/css');
		res.sendfile(__dirname + '/css/EPCIS_AC.css');
	});
	
	//---possess features---
	
	/**
	 * get /addepcis
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
	 * post /addepcis
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
				res.render('addepcis.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * get /delepcis/:epcisname
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
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/**
	 * get /editepcis
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.29
	 */
	app.get('/editepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var epcisname = req.params.epcisname;
		var username = req.user.email;

		rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/geturl", null, req.user.token, null, null, function (error1, response1) {
			if (!error1 && response1 !== null && response1.epcisurl.length !== null && response1.epcisurl !== null) { 
				var epcisurl = response1.epcisurl;
				res.render('editepcis.jade', {user: req.user, epcisname:epcisname, epcisurl:epcisurl, error:null});
			}else {
			res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
			}
		});
	});
	
	/** 
	 * post /editepcis
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.29
	 */ 
	app.post('/editepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcisurl = req.body.epcisurl;
		var args = "{\"username\":\""+username+"\",\"epcisurl\":\""+epcisurl+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/editurl", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	//---possess features end---
	//---furnish features---
	
	/** 
	 * get /furnishepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 * integrated
	 * 2016.11.09
	 */

	app.get('/furnishepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcisfurnishers = null;
		var epcisfurnishergroups = null;
		var epcisfurnisherothers = null;
		var epcisfurnisherothersgroup = null;
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				if (response.possessor === 'yes'){
					rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/furnisher", null, req.user.token, null, null, function (error1, response1) {
						if (!error1 && response1 !== null && response1.epcisfurnishers.length !== null && response1.epcisfurnishers !== null && response1.epcisfurnisherothers.length !== null && response1.epcisfurnisherothers !== null && response1.epcisfurnishergroups.length !== null && response1.epcisfurnishergroups !== null &&  response1.epcisfurnisherothersgroup.length !== null && response1.epcisfurnisherothersgroup !== null) { 
							epcisfurnishers = response1.epcisfurnishers;
							epcisfurnisherothers = response1.epcisfurnisherothers;
							epcisfurnishergroups = response1.epcisfurnishergroups;
							epcisfurnisherothersgroup = response1.epcisfurnisherothersgroup;
							res.render('furnishepcis.jade', {user: req.user, epcisname:epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishergroups:epcisfurnishergroups, others:epcisfurnisherothers, othersgroup:epcisfurnisherothersgroup, error:null});
						} else if (!error1) {
							error = "invalid JSON returned from FindZones";
						}
					});	
				} else {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
	 * post /furnishepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.post('/furnishepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				if (response.possessor === 'yes'){
					if (req.body.epcisfurnishername != undefined){
						var epcisfurnishername = req.body.epcisfurnishername;
						var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnish", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
							} else {
								res.redirect('/index');
							}
						});
					}
					if (req.body.epcisfurnishergroupname != undefined){
						var epcisfurnishergroupname = req.body.epcisfurnishergroupname;
						var args = "{\"epcisfurnishergroupname\":\""+epcisfurnishergroupname+"\"}";
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnish/group", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
							} else {
								res.redirect('/index');
							}
						});
					}
				} else if (error) {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
	 * get /unfurnepcis/:epcisname/user/:epcisfurnishername
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.get('/unfurnepcis/:epcisname/user/:epcisfurnishername', auth.ensureAuthenticated, function(req, res){
		
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcisfurnishername = req.params.epcisfurnishername;
		var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/furnish", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
					} else {
						var result2 = response.furnisher;
						if (result1 === 'yes' || result2 === 'yes'){
							rest.delOperation(epcis_ac_api_address, "unfurnepcis/"+epcisname+"/user/"+epcisfurnishername , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('error.jade', { user: req.user, epcisname: epcisname, epcisfurnishername:epcisfurnishername, error: JSON.stringify(error) });
								} else {
									res.redirect('/index');
								}
							});	
						}else	{
							res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
						}	
					}
				});
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
				
		});
	});
	
	/** 
	 * get /unfurnepcis/:epcisname/group/:epcisfurnishergroupname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.08
	 */
	app.get('/unfurnepcis/:epcisname/group/:epcisfurnishergroupname', auth.ensureAuthenticated, function(req, res){
		
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcisfurnishergroupname = req.params.epcisfurnishergroupname;
		var args = "{\"epcisfurnishergroupname\":\""+epcisfurnishergroupname+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/group/"+epcisfurnishergroupname+"/manage", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
					} else {
						var result2 = response.manager;
						if (result1 === 'yes' && result2 === 'yes')	{
							rest.delOperation(epcis_ac_api_address, "unfurnepcis/"+epcisname+"/group/"+epcisfurnishergroupname , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('error.jade', { user: req.user, epcisname: epcisname, epcisfurnishergroupname:epcisfurnishergroupname, error: JSON.stringify(error) });
								} else {
									res.redirect('/index');
								}
							});	
						}else	{
							res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
						}
							
					}
				});
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
				
		});
	});
	
	//---furnish epcis features end---
	//---subscribe epcis features---
	
	/** 
	 * get /subscribeepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 * integrated
	 * 2016.11.09
	 */
	app.get('/subscribeepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcissubscribers = null;
		var epcissubscriberothers = null;
		var epcissubscribergroups = null;
		var epcissubscriberothersgroup = null;
		var epcisname = req.params.epcisname;
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				if (response.possessor === 'yes'){
					rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/subscriber", null, req.user.token, null, null, function (error1, response1) {
						if (!error1 && response1 !== null && response1.epcissubscribers.length !== null && response1.epcissubscribers !== null && response1.epcissubscriberothers.length !== null && response1.epcissubscriberothers !== null && response1.epcissubscribergroups.length !== null && response1.epcissubscribergroups !== null && response1.epcissubscriberothersgroup.length !== null && response1.epcissubscriberothersgroup !== null) { 
							epcissubscribers = response1.epcissubscribers;
							epcissubscriberothers = response1.epcissubscriberothers;
							epcissubscribergroups = response1.epcissubscribergroups;
							epcissubscriberothersgroup = response1.epcissubscriberothersgroup;
							res.render('subscribeepcis.jade', {user: req.user, epcisname:epcisname, epcissubscribers:epcissubscribers, others:epcissubscriberothers, epcissubscribergroups:epcissubscribergroups, othersgroup:epcissubscriberothersgroup, error:null});
						} else if (!error1) {
							error = "invalid JSON returned from FindZones";
						}
					});
				} else {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
				}
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}	
		});
	});

	/** 
	 * post /subscribeepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.post('/subscribeepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				if (response.possessor === 'yes'){
					if (req.body.epcissubscribername != undefined)	{
						var epcissubscribername = req.body.epcissubscribername;
						var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscribe", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
							} else {
								res.redirect('/index');
							}
						});	
					}
					if (req.body.epcissubscribergroupname != undefined)	{
						var epcissubscribergroupname = req.body.epcissubscribergroupname;
						var args = "{\"epcissubscribergroupname\":\""+epcissubscribergroupname+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscribe/group", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
							} else {
								res.redirect('/index');
							}
						});	
					}
				} else {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
				}
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
	 * get /unsubsepcis/:epcisname/user/:epcissubscribername
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.get('/unsubsepcis/:epcisname/user/:epcissubscribername', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcissubscribername = req.params.epcissubscribername;
		var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
					} else {
						var result2 = response.subscriber;
						if (result1 === 'yes' || result2 === 'yes'){
							rest.delOperation(epcis_ac_api_address, "unsubsepcis/"+epcisname+"/user/"+epcissubscribername , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('subscribeepcis.jade', { user: req.user, epcisname: epcisname, epcissubscribers:epcissubscribers, epcissubscribername:epcissubscribername, error: JSON.stringify(error) });
								} else {
									res.redirect('/index');
								}
							});	
						}else {
							res.render('error.jade', {  user: req.user, epcisname: epcisname, error: 'no permission' });
						}
					}
				});
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
	 * get /unsubsepcis/:epcisname/group/:epcissubscribergroupname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.08
	 */
	app.get('/unsubsepcis/:epcisname/group/:epcissubscribergroupname', auth.ensureAuthenticated, function(req, res){
		
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcissubscribergroupname = req.params.epcissubscribergroupname;
		var args = "{\"epcissubcribergrouprname\":\""+epcissubscribergroupname+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/group/"+epcissubscribergroupname+"/manage", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
					} else {
						var result2 = response.manager;
						if (result1 === 'yes' && result2 === 'yes')	{
							rest.delOperation(epcis_ac_api_address, "unsubsepcis/"+epcisname+"/group/"+epcissubscribergroupname , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('error.jade', { user: req.user, epcisname: epcisname, epcissubscribergroupname:epcissubscribergroupname, error: JSON.stringify(error) });
								} else {
									res.redirect('/index');
								}
							});	
						}else	{
							res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
						}
							
					}
				});
			} else if (!error) {
				error = "invalid JSON returned from FindZones";
			}
				
		});
	});
	
	//---subcribe features end---
	//---capture features---
	
	/** 
	 * get /captureepcis/:epcisname
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
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
			} else {
				if(response.furnisher === 'yes'){
					res.render('captureevent.jade', { user: req.user, epcisname: epcisname, furnisher: response.furnisher, error: null });
				} else {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: 'no permission' });
					
				}
			}
		});
	});
	
	/** 
	 * post /captureepcis/:epcisname
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
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * post /captureepcis/:epcisname/user/:username/apicapture
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.12
	 * 
	 */ 
	app.post('/captureepcis/:epcisname/user/:username/apicapture', function(req, res){
		var epcisname = req.params.epcisname;
		var clienttoken = req.body.token;
		var raw_epcisevent = req.body.epcisevent;
		raw_epcisevent = raw_epcisevent+"<ac:EPCISName>"+epcisname+"</ac:EPCISName>";
		var epcisevent = raw_epcisevent.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, " ").replace(/\"/g,"<q>");
		var args = "{\"epcisevent\":\""+epcisevent+"\"}";
		rest.postOperation(epcis_ac_api_address, "user/"+req.params.username+"/epcis/"+epcisname+"/token/"+clienttoken+"/apicapture", null, "", null, args, function (error, response) {
			if (error) {
				console.log(JSON.stringify(error));
				res.send(error);
			} else {
				res.send(response.result);
			}
		});
	});
	
	//---capture features end---
	//---query features---
	
	/** 
	 * get /qryepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/qryepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: JSON.stringify(error) });
			} else {
				if(response.subscriber === 'yes'){
					res.render('queryevent.jade', { user: req.user, epcisname: req.params.epcisname, subscriber: response.subscriber, error: null, epcisquery:'' });
				} else {
					res.render('error.jade', { user: req.user, epcisname: req.params.epcisname, error: 'no permission'});
				}
			}
		});
	});
	
	/** 
	 * post /qryepcis/:epcisname
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * 
	 */ 
	app.post('/qryepcis/:epcisname', auth.ensureAuthenticated, function(req, res){
		rest.getOperationResNoJSON(epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+req.params.epcisname+"/query?"+req.body.epcisquery, null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: req.params.epcisname, error: JSON.stringify(error)});
			} else {
				var queryresult = (response.body).replace(/<n>/g, "\n").replace(/<r>/g, "\r").replace(/<t>/g, "&nbsp; &nbsp; &nbsp; &nbsp; ").replace(/<q>/g,"\"");
				res.render('queryresult.jade', { user: req.user, epcisname: req.params.epcisname, error: null, epcisquery:queryresult });
			}
		});
	});
	
	/** 
	 * get /qryepcis/:epcisname/user/:username/token/:token/apiquery?
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.07
	 * modified
	 * 2016.11.12
	 */ 
	app.get('/qryepcis/:epcisname/user/:username/token/:token/apiquery', function(req, res){
		if (req.query !== null && req.query.__proto__ !== null)	{
			delete req.query.__proto__;
		}
		var epcisquery = jsonToQueryString(req.query);
		rest.getOperationResNoJSON(epcis_ac_api_address, "user/"+req.params.username+"/epcis/"+req.params.epcisname+"/token/"+req.params.token+"/apiquery?"+epcisquery, null, "", null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: req.params.epcisname, error: JSON.stringify(error)});
			} else {
				var queryresult = (response.body).replace(/<n>/g, "\n").replace(/<r>/g, "\r").replace(/<t>/g, "\t").replace(/<q>/g,"\"");
				res.send( queryresult );
			}
		});
	});
	
	/** 
	 * jsonToQueryString
	 * @creator Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.07
	 * 
	 */
	var jsonToQueryString = function (json) {
	    return '' + 
	        Object.keys(json).map(function(key) {
	            return encodeURIComponent(key) + '=' +
	                encodeURIComponent(json[key]);
	        }).join('&');
	}
	
	//---query features end---
	//---group features---
	
	app.get('/addgroup', auth.ensureAuthenticated, function(req, res){
		res.render('addgroup.jade', {user: req.user, groupname:"", error:null});
	});
	
	app.post('/addgroup', auth.ensureAuthenticated, function(req, res){
		var groupname = req.body.groupname;
		var args = "{\"groupname\":\""+groupname+"\"}";
		
		rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/manage", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('addgroup.jade', {user: req.user, groupname:"", error: JSON.stringify(error)});
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * get /delgroup/:groupname
	 * @modifier Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * modified
	 * 2016.11.09
	 * 
	 */
	app.get('/delgroup/:groupname', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var args = "{\"groupname\":\""+groupname+"\"}";
		rest.delOperation(epcis_ac_api_address, "user/"+req.user.email+"/unmanage", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * get /group/:groupname
	 * @modifier Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * modified
	 * 2016.11.09
	 * 
	 */
	app.get('/group/:groupname', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var args = "{\"managername\":\""+req.user.email+"\"}";
		rest.getOperation(epcis_ac_api_address, "group/"+groupname+"/join", null, req.user.token, null, args, function (error, response) {
			if (error)	{
				res.render('error.jade', {  user: req.user, error: JSON.stringify(error) });
			}else {
				res.render('editgroup.jade', { user: req.user, groupname: groupname, users: response.users, error: null });
			}
		});
	});
	
	/** 
	 * get /joinedgroup/:joinedgroupname
	 * @creator Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.08
	 * 
	 */
	app.get('/joinedgroup/:joinedgroupname', auth.ensureAuthenticated, function(req, res){
		var joinedgroupname = req.params.joinedgroupname;
		var username = req.user.email;
		var epcisfurns = null;
		var epcissubss = null;
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/joinedgroup/"+joinedgroupname+"/member", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, joinedgroupname: joinedgroupname, error: JSON.stringify(error) });
			} else {
				if(response.member === 'yes'){
					rest.getOperation(epcis_ac_api_address, "joinedgroup/"+joinedgroupname+"/furnish", null, req.user.token, null, null, function (error, response) {
						if (!error && response !== null && response.epcisfurns.length !== null && response.epcisfurns !== null) { 
							epcisfurns = response.epcisfurns;
						} else if (!error) {
							error = "invalid JSON returned from FindZones";
						}
						rest.getOperation(epcis_ac_api_address, "joinedgroup/"+joinedgroupname+"/subscribe", null, req.user.token, null, null, function (error, response) {
							if (!error && response !== null && response.epcissubss.length !== null && response.epcissubss !== null) { 
								epcissubss = response.epcissubss;
							} else if (!error) {
								error = "invalid JSON returned from FindZones";
							}
							res.render('joinedgroup.jade', { user: req.user, joinedgroupname: joinedgroupname, epcisfurns:epcisfurns, epcissubss:epcissubss, error: null });
						});
					});
				}else {
					res.render('error.jade', { user: req.user, joinedgroupname: joinedgroupname, error: 'no permission' });
				}
			}
		});
	});

	/** 
	 * get /group/:groupname/join
	 * @modifier Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * modified
	 * 2016.11.09
	 * 
	 */
	app.get('/group/:groupname/join', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var args = "{\"managername\":\""+req.user.email+"\"}";
		rest.getOperation(epcis_ac_api_address, "group/"+groupname+"/other", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, error: JSON.stringify(error) });
			}else{
				res.render('adduser.jade', { user: req.user, groupname: groupname, others: response.others, error: null });
			}
		});
	});
	
	/** 
	 * post /group/:groupname/join
	 * @modifier Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * modified
	 * 2016.11.09
	 * 
	 */
	app.post('/group/:groupname/join', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var username = req.body.username;
		var args = "{\"username\":\""+username+"\",\"managername\":\""+req.user.email+"\"}";
		rest.postOperation(epcis_ac_api_address, "group/"+groupname+"/join", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: JSON.stringify(error) });
			} else {
				res.redirect('/group/'+groupname);
			}
		});
	});
	
	/** 
	 * get /group/:groupname/unjoin/:username
	 * @modifier Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * modified
	 * 2016.11.09
	 * 
	 */
	app.get('/group/:groupname/unjoin/:username', auth.ensureAuthenticated, function(req, res){
		var groupname = req.params.groupname;
		var username = req.params.username;
		var args = "{\"username\":\""+username+"\",\"managername\":\""+req.user.email+"\"}";
		rest.postOperation(epcis_ac_api_address, "group/"+groupname+"/unjoin", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, groupname: groupname, error: JSON.stringify(error) });
			} else {
				res.redirect('/group/'+groupname);
			}
		});
	});

	//---group features end---
	
	//---index features---
	

	
	/**
	 * get /adopttoken/:accesstoken/clienttoken/:clienttoken
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.14
	 * 
	 */ 
	app.get('/adopttoken/:accesstoken/clienttoken/:clienttoken', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var accesstoken = req.params.accesstoken;
		var clienttoken = req.params.clienttoken;
		var args = "{\"accesstoken\":\""+accesstoken+"\",\"clienttoken\":\""+clienttoken+"\"}";
		rest.postOperation(epcis_ac_api_address, "user/"+username+"/adopt", null, req.user.token, null, args, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, error: JSON.stringify(error) });
			} else {
				res.redirect('/index');
			}
		});
	});
	
	/** 
	 * get /index
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * added subscribing functionality
	 * 2016.11.04
	 * added furnishing functionality
	 * removed thing, service functionality
	 * 2016.11.05
	 * added joinedgroup functionality
	 * 2016.11.08
	 * added group access control functionality
	 * integrated
	 * 2016.11.09
	 * added client token features
	 * 2016.11.14
	 */ 
	app.get('/index', auth.ensureAuthenticated, function(req, res){
		var offset = req.param('offset', 0);
		var count = req.param('count', 10);
		rest.getOperation(epcis_ac_api_address, "user/"+req.user.email+"/account", null, req.user.token, null, null, function (error, response) {
			var epciss = null;
			var epcisfurns = null;
			var epcissubss = null;
			var groups = null;
			var joinedgroups = null;
			var myaccesstoken = null;
			var clienttoken = null;
			if (!error && response !== null && response.epciss.length !== null && response.epciss !== null && response.epcisfurns.length !== null && response.epcisfurns !== null && response.epcissubss.length !== null && response.epcissubss !== null && response.groups.length !== null && response.groups !== null && response.joinedgroups.length !== null && response.joinedgroups !== null) { 
				epciss = response.epciss;
				epcisfurns = response.epcisfurns;
				epcissubss = response.epcissubss;
				groups = response.groups;
				joinedgroups = response.joinedgroups;
				myaccesstoken = req.user.token;
				clienttoken = response.clienttoken;
				if (clienttoken == null){
					var args = "{\"accesstoken\":\""+req.user.token+"\",\"clienttoken\":\"\"}";
					rest.postOperation(epcis_ac_api_address, "user/"+req.user.email+"/adopt", null, req.user.token, null, args, function (error1, response1) {
						if (error1) {
							return res.render('error.jade', { user: req.user, error: error1 });
						} else {
							clienttoken = response1.result;
							return res.render('index.jade', { user: req.user, offset: offset, count: count, epciss:epciss, epcisfurns:epcisfurns, epcissubss:epcissubss, groups: groups, joinedgroups:joinedgroups, myaccesstoken:myaccesstoken, clienttoken: clienttoken, error: null });
						}
					});
				}else{
					return res.render('index.jade', { user: req.user, offset: offset, count: count, epciss:epciss, epcisfurns:epcisfurns, epcissubss:epcissubss, groups: groups, joinedgroups:joinedgroups, myaccesstoken:myaccesstoken, clienttoken: clienttoken, error: null });
				}
			} else if (!error) {
				return res.render('error.jade', {user: req.user, error:'OAuth: Authentication failed. Invalid token.'});
			} else {
				return res.render('error.jade', {user: req.user, error:'Something wrong with graph database.'});
			}
		});
	});
	
	//---index features end---
	//---default routing features---
		
	/**
	 * get /:offset?/:count?
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.10.31
	 * 
	 */ 
	app.get('/:offset?/:count?', function(req, res){
		res.redirect('/index');
	});
	
	//---default routing features end---

};
