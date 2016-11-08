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
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
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
				var result = response.possessor;
				if (result === 'yes')
				{
					rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnisher", null, req.user.token, null, null, function (error1, response1) {
						if (!error1 && response1 !== null && response1.epcisfurnishers.length !== null && response1.epcisfurnishers !== null) { 
							epcisfurnishers = response1.epcisfurnishers;
						} else if (!error1) {
							error = "invalid JSON returned from FindZones";
						}
						
						rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnisher/others", null, req.user.token, null, null, function (error2, response2) {
							if (!error2 && response2 !== null && response2.epcisfurnisherothers.length !== null && response2.epcisfurnisherothers !== null) { 
								epcisfurnisherothers = response2.epcisfurnisherothers;
							} else if (!error2) {
								error = "invalid JSON returned from FindZones";
							}
							rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/furnishergroup", null, req.user.token, null, null, function (error3, response3) {
								if (!error3 && response3 !== null && response3.epcisfurnishergroups.length !== null && response3.epcisfurnishergroups !== null) { 
									epcisfurnishergroups = response3.epcisfurnishergroups;
								} else if (!error3) {
									error = "invalid JSON returned from FindZones";
								}
								rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/furnishergroup/others", null, req.user.token, null, null, function (error4, response4) {
									if (!error4 && response4 !== null && response4.epcisfurnisherothersgroup.length !== null && response4.epcisfurnisherothersgroup !== null) { 
										epcisfurnisherothersgroup = response4.epcisfurnisherothersgroup;
									} else if (!error4) {
										error = "invalid JSON returned from FindZones";
									}
									res.render('furnishepcis.jade', {user: req.user, epcisname:epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishergroups:epcisfurnishergroups, others:epcisfurnisherothers, othersgroup:epcisfurnisherothersgroup, error:null});
								});
							});
						});
					});	
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
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
				var result = response.possessor;
				if (result === 'yes')
				{
					if (req.body.epcisfurnishername != undefined){
						var epcisfurnishername = req.body.epcisfurnishername;
						var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/furnish", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
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
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
							} else {
								res.redirect('/index');
							}
						});
					}
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.05
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.get('/unfurnepcis/epcis/:epcisname/user/:epcisfurnishername', auth.ensureAuthenticated, function(req, res){
		
		var username = req.email.user;
		var epcisname = req.params.epcisname;
		var epcisfurnishername = req.params.epcisfurnishername;
		var args = "{\"epcisfurnishername\":\""+epcisfurnishername+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/furnish", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
					} else {
						var result2 = response.furnisher;
						if (result1 === 'yes' || result2 === 'yes')
						{
							rest.delOperation(epcis_ac_api_address, "unfurnepcis/"+epcisname+"/user/"+epcisfurnishername , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('furnishepcis.jade', { user: req.user, epcisname: epcisname, epcisfurnishers:epcisfurnishers, epcisfurnishername:epcisfurnishername, error: error });
								} else {
									res.redirect('/index');
								}
							});	
						}
						else	{
							res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
						}
							
					}
				});
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
				
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
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
				var result = response.possessor;
				if (result === 'yes')
				{
					rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscriber", null, req.user.token, null, null, function (error1, response1) {
						if (!error1 && response1 !== null && response1.epcissubscribers.length !== null && response1.epcissubscribers !== null) { 
							epcissubscribers = response1.epcissubscribers;
						} else if (!error1) {
							error = "invalid JSON returned from FindZones";
						}
						rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscriber/others", null, req.user.token, null, null, function (error2, response2) {
							if (!error2 && response2 !== null && response2.epcissubscriberothers.length !== null && response2.epcissubscriberothers !== null) { 
								epcissubscriberothers = response2.epcissubscriberothers;
							} else if (!error2) {
								error = "invalid JSON returned from FindZones";
							}
							rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/subscribergroup", null, req.user.token, null, null, function (error3, response3) {
								if (!error3 && response3 !== null && response3.epcissubscribergroups.length !== null && response3.epcissubscribergroups !== null) { 
									epcissubscribergroups = response3.epcissubscribergroups;
								} else if (!error3) {
									error = "invalid JSON returned from FindZones";
								}
								rest.getOperation(epcis_ac_api_address, "epcis/"+epcisname+"/user/"+username+"/subscribergroup/others", null, req.user.token, null, null, function (error4, response4) {
									if (!error4 && response4 !== null && response4.epcissubscriberothersgroup.length !== null && response4.epcissubscriberothersgroup !== null) { 
										epcissubscriberothersgroup = response4.epcissubscriberothersgroup;
									} else if (!error4) {
										error = "invalid JSON returned from FindZones";
									}
									res.render('subscribeepcis.jade', {user: req.user, epcisname:epcisname, epcissubscribers:epcissubscribers, others:epcissubscriberothers, epcissubscribergroups:epcissubscribergroups, othersgroup:epcissubscriberothersgroup, error:null});
								});
							});
						});	
					});
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}	
		});
	});

	/** 
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
				var result = response.possessor;
				if (result === 'yes')
				{
					if (req.body.epcissubscribername != undefined)
					{
						var epcissubscribername = req.body.epcissubscribername;
						var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscribe", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
							} else {
								res.redirect('/index');
							}
						});	
					}
					if (req.body.epcissubscribergroupname != undefined)
					{
						var epcissubscribergroupname = req.body.epcissubscribergroupname;
						var args = "{\"epcissubscribergroupname\":\""+epcissubscribergroupname+"\"}";
						
						rest.postOperation(epcis_ac_api_address, "epcis/"+epcisname+"/subscribe/group", null, req.user.token, null, args, function (error, response) {		
							if (error) {
								res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
							} else {
								res.redirect('/index');
							}
						});	
					}
				}
			} else if (error) {
				error = "invalid JSON returned from FindZones";
			}
		});
	});
	

	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.04
	 * modified to toss args username
	 * check permission
	 * 2016.11.08
	 */
	app.get('/unsubsepcis/epcis/:epcisname/user/:epcissubscribername', auth.ensureAuthenticated, function(req, res){
		var username = req.user.email;
		var epcisname = req.params.epcisname;
		var epcissubscribername = req.params.epcissubscribername;
		var args = "{\"epcissubscribername\":\""+epcissubscribername+"\"}";
		
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/epcis/"+epcisname+"/possess", null, req.user.token, null, null, function (error, response) {
			if (!error && response !== null && response.possessor.length !== null && response.possessor !== null) { 
				var result1 = response.possessor;
				rest.getOperation (epcis_ac_api_address, "user/"+username+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
					if (error) {
						res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
					} else {
						var result2 = response.subscriber;
						if (result1 === 'yes' || result2 === 'yes'){
							rest.delOperation(epcis_ac_api_address, "unsubsepcis/"+epcisname+"/user/"+epcissubscribername , null, req.user.token, null, args, function (error, response) {
								if (error) {
									res.render('subscribeepcis.jade', { user: req.user, epcisname: epcisname, epcissubscribers:epcissubscribers, epcissubscribername:epcissubscribername, error: error });
								} else {
									res.redirect('/index');
								}
							});	
						}
					}
				});
			} else if (error) {
				error = "invalid JSON returned from FindZones";
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
		
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+epcisname+"/furnish", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.furnisher === 'yes'){
		
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
				}
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
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.subscriber === 'yes'){
					res.render('queryevent.jade', { user: req.user, epcisname: req.params.epcisname, subscriber: response.subscriber, error: error, epcisquery:'' });
				} else {
					res.render('queryevent.jade', { user: req.user, epcisname: req.params.epcisname, error: error, epcisquery:'' });
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
		
		rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.subscriber === 'yes'){
					rest.getOperationResNoJSON(epcis_ac_api_address, "user/"+req.user.email+"/epcis/"+req.params.epcisname+"?"+req.body.epcisquery, null, req.user.token, null, null, function (error, response) {
						if (error) {
							res.render('queryresult.jade', { user: req.user, epcisname: req.params.epcisname, error: error, epcisquery:'' });
						} else {
							
							var queryresult = (response.body).replace(/<n>/g, "\n").replace(/<r>/g, "\r").replace(/<t>/g, "&nbsp; &nbsp; &nbsp; &nbsp; ").replace(/<q>/g,"\"");
							res.render('queryresult.jade', { user: req.user, epcisname: req.params.epcisname, error: error, epcisquery:queryresult });
						}
					});
				}
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha 
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.07
	 * TODO will be implemented
	 * 
	 */ 
	app.get('/qryepcis/:epcisname/user/:username', auth.ensureAuthenticated, function(req, res){
		if (req.query !== null && req.query.__proto__ !== null)	{
			delete req.query.__proto__;
		}
		rest.getOperation (epcis_ac_api_address, "user/"+req.params.username+"/epcis/"+req.params.epcisname+"/subscribe", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
			} else {
				if(response.subscriber === 'yes'){
					var epcisquery = jsonToQueryString(req.query);
					rest.getOperationResNoJSON(epcis_ac_api_address, "user/"+req.params.username+"/epcis/"+req.params.epcisname+epcisquery, null, req.user.token, null, null, function (error, response) {
						if (error) {
							res.render('queryresult.jade', { user: req.user, epcisname: req.params.epcisname, error: error, epcisquery:'' });
						} else {
							var queryresult = (response.body).replace(/<n>/g, "\n").replace(/<r>/g, "\r").replace(/<t>/g, "&nbsp; &nbsp; &nbsp; &nbsp; ").replace(/<q>/g,"\"");
							res.render('queryresult.jade', { user: req.user, epcisname: req.params.epcisname, error: error, epcisquery:queryresult });
						}
					});
				}
			}
		});
	});
	
	/** 
	 * @creator Jaehee Ha
	 * lovesm135@kaist.ac.kr
	 * created
	 * 2016.11.07
	 * 
	 */
	var jsonToQueryString = function (json) {
	    return '?' + 
	        Object.keys(json).map(function(key) {
	            return encodeURIComponent(key) + '=' +
	                encodeURIComponent(json[key]);
	        }).join('&');
	}
	
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
		rest.delOperation(epcis_ac_api_address, "user/"+req.user.email+"/unmanage", null, req.user.token, null, args, function (error, response) {
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
	
	/** 
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
		var epcissubs = null;
		rest.getOperation(epcis_ac_api_address, "user/"+username+"/joinedgroup/"+joinedgroupname+"/member", null, req.user.token, null, null, function (error, response) {
			if (error) {
				res.render('error.jade', { user: req.user, joinedgroupname: joinedgroupname, error: error });
			} else {
				if(response.member === 'yes'){
					rest.getOperation(epcis_ac_api_address, "joinedgroup/"+joinedgroupname+"/furnish", null, req.user.token, null, null, function (error, response) {
						if (!error && response !== null && response.epcisfurns.length !== null && response.epcisfurns !== null) { 
							epcisfurns = response.epcisfurns;
						} else if (error) {
							res.render('error.jade', { user: req.user, joinedgroupname: joinedgroupname, error: error });
						} 
						rest.getOperation(epcis_ac_api_address, "joinedgroup/"+joinedgroupname+"/subscribe", null, req.user.token, null, null, function (error, response) {
							if (!error && response !== null && response.epcissubss.length !== null && response.epcissubss !== null) { 
								epcissubss = response.epcissubss;
							} else if (error) {
								res.render('error.jade', { user: req.user, joinedgroupname: joinedgroupname, error: error });
							} 
							res.render('joinedgroup.jade', { user: req.user, joinedgroupname: joinedgroupname, epcisfurns:epcisfurns, epcissubs:epcissubs, error: error });
						});
						
					});
				}else {
					res.render('error.jade', { user: req.user, epcisname: epcisname, error: error });
				}
			}
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
	 * added joinedgroup functionality
	 * 2016.11.08
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
						rest.getOperation (epcis_ac_api_address, "user/"+req.user.email+"/join", null, req.user.token, null, null, function (error, response) {
							var joinedgroups = null;
							if (!error && response !== null && response.joinedgroups.length !== null && response.joinedgroups !== null) { 
								joinedgroups = response.joinedgroups;
							} else if (!error) {
								error = "invalid JSON returned from FindZones";
							}
							res.render('index.jade', { user: req.user, offset: offset, count: count, epciss:epciss, epcisfurns:epcisfurns, epcissubss:epcissubss, groups: groups, joinedgroups:joinedgroups, error: error });
						});
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
