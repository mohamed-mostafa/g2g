var g2gUsersBusiness = require('../business/g2g_users_business.js');
var g2gNotificationsBusiness = require('../business/g2g_notifications_business.js');

var checkUsernameAvailability = function(req, res) {
	try {
		// call the business function and give it a callback function
		g2gUsersBusiness.checkUsernameAvailability(req.params.username,
			function(usernameAvailability) {
				res.json({usernameAvailability: usernameAvailability});
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /user/checkUsernameAvailability");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var checkEmailAddressAvailability = function(req, res) {
	try {
		// call the business function and give it a callback function
		g2gUsersBusiness.checkEmailAddressAvailability(req.params.email,
			function(emailAddressAvailability) {
				res.json({emailAddressAvailability: emailAddressAvailability});
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /user/checkEmailAddressAvailability");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getUserByUsername = function(req, res) {
	try {
		// call the business function and give it a callback function
		g2gUsersBusiness.getUserByUsername(req.params.email,
			function(user) {
				res.json(user);
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /user/:email");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getUserById = function(req, res) {
	try {
		// call the business function and give it a callback function
		g2gUsersBusiness.getUserById(req.params.id,
			function(user) {
				res.json(user);
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /user/id/:id");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var registerNewUser = function(req, res) {	
	try {
		var user = req.body.user;
		// call the business function and give it a callback function 
		g2gUsersBusiness.registerNewUser(user, function(user) {
			res.json({user: user});
		},
		function(error) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /user/register");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateExistingUser = function(req, res) {	
	try {
		var user = req.body.user;
		var updatePassword = req.body.updatePassword;
		// call the business function and give it a callback function 
		g2gUsersBusiness.updateExistingUser(user, updatePassword, function(user) {
			res.json({user: user});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /user/update");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var login = function(req, res) {
	try {			
		var username = req.body.username;
		var password = req.body.password;

		// call the business function and give it a callback function 
		g2gUsersBusiness.login(username, password,
				function(user) {
					res.json({user: user});
				},
				function(){
					res.status(401).send("Login failed. Are you sure you're using a valid G2G credentials ?");
				},
				function(){
					res.status(401).send("Login failed. Are you sure you're using a valid G2G credentials ?");
				},
				function(user) {
					res.json({user: user});
//						res.status(401).send("Login failed. Your account is not yet activated !");
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/login");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllUsers(
				function(ids) {
					res.json({registeredUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/count");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllActiveUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllActiveUsers(
				function(ids) {
					res.json({activeUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/activecount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllAwaitingActivationUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllAwaitingActivationUsers(
				function(ids) {
					res.json({awaitingActivationUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/awaitingactivationcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllLockedUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllLockedUsers(
				function(ids) {
					res.json({lockedUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/awaitingactivationcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllSilentUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllSilentUsers(
				function(ids) {
					res.json({silentUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/coveredcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllReturningUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllReturningUsers(
				function(ids) {
					res.json({returningUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/returningcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllOneTimeUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllOneTimeUsers(
				function(ids) {
					res.json({oneTimeUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/onetimecount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllMultipleTimesUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllOneTimeUsers(
				function(oneTimersIds) {
					g2gUsersBusiness.countAllReturningUsers(
							function(allIds) { // get all ids
								var multipleTimerIds = [];
								for (var i = 0; i < allIds.length; i++) { // iterate over all returning ids
									var idInOneTimers = false; // current id is not in one timers, by default
									for (var j = 0; j < oneTimersIds.length; j++) { // iterate over one imters ids
										if (allIds[i] == oneTimersIds[j]) { // if id is found in the one timers ones
											idInOneTimers = true; // mark a flag
											break; // and stop
										}
									}
									if (!idInOneTimers) { // if the flag is not marked
										multipleTimerIds.push(allIds[i]); // id is not one timer
									}
								}
								res.json({multipleTimersUsersIds: multipleTimerIds});
							},
							function(err) {
								res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
							});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/multipletimerscount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllCoveredUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllCoveredUsers(
				function(ids) {
					res.json({coveredUsersIds: ids});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/coveredcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var countAllUncoveredUsers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gUsersBusiness.countAllCoveredUsers(
				function(coveredIds) { // get all covered ids
					g2gUsersBusiness.countAllUsers(
						function(allIds) { // get all ids
							var uncoveredIds = [];
							for (var i = 0; i < allIds.length; i++) { // iterate over all ids
								var idInCovered = false; // current id is not covered, by default
								for (var j = 0; j < coveredIds.length; j++) { // iterate over covered ids
									if (allIds[i] == coveredIds[j]) { // if id is found in the covered ones
										idInCovered = true; // mark a flag
										break; // and stop
									}
								}
								if (!idInCovered) { // if the flag is not marked
									uncoveredIds.push(allIds[i]); // id is not covered
								}
							}
							res.json({uncoveredUsersIds: uncoveredIds});
						},
						function(err) {
							res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
						});
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/users/uncoveredcount");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var saveNewUserMessage = function(req, res) {
	try {
		// call the business function and give it a callback function
		var userId = req.body.userId;
		var subject = req.body.subject;
		var message = req.body.message;
		g2gUsersBusiness.getUserById(userId, function(user) {
			g2gUsersBusiness.saveNewUserMessage(user, subject, message,
			function() {
				res.end();
			},
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		}, function(err) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /user/contact");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var resetPassword = function(req, res) {
	try {
		// call the business function and give it a callback function 
		var emailAddress = req.body.emailAddress;
		g2gUsersBusiness.resetPassword(emailAddress,
				function() {
					res.end();
				},
				function() {
					res.status(500).send("This email address is not registered with G2G.");
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/passwordreset");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var assignPlanToUser = function(req, res) {
	try {
		// call the business function and give it a callback function 
		var userId = req.params.userId;
		var plan = req.params.plan;
		g2gUsersBusiness.assignPlanToUser(userId, plan,
				function() {
					res.end();
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /user/:userId/plan/:plan");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var setUserEligibilityForLifetimeFreeDelivery = function(req, res) {
	try {
		// call the business function and give it a callback function 
		var eligibility = req.params.eligibility;
		var userId = req.params.userId;
		if (eligibility == 'true') {
			g2gUsersBusiness.markUserEligibileForLifetimeFreeDelivery(userId, function() {
				res.end();
			}, function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		} else {
			g2gUsersBusiness.markUserUnEligibileForLifetimeFreeDelivery(userId, function() {
				res.end();
			}, function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		}
	} catch (error) {
		console.log("An error occured in /user/:userId/freedelivery/lifetimeeligibility/:eligibility");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var setUserEligibilityForFreeDelivery = function(req, res) {
	try {
		// call the business function and give it a callback function 
		var eligibility = req.params.eligibility;
		var userId = req.params.userId;
		if (eligibility == 'true') {
			g2gUsersBusiness.markUserEligibileForFreeDelivery(userId, function() {
				res.end();
			}, function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		} else {
			g2gUsersBusiness.markUserUnEligibileForFreeDelivery(userId, function() {
				res.end();
			}, function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		}
	} catch (error) {
		console.log("An error occured in /user/:userId/freedelivery/eligibility/:eligibility");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markUserEligibileForFreeDelivery = function(req, res) {
	try {
		// call the business function and give it a callback function 
		var status = req.params.status;
		var userId = req.params.userId;
		g2gUsersBusiness.markUserEligibileForFreeDelivery(userId, function() {
			res.end();
		}, function(err) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /user/:userId/freedelivery/eligibility/:eligibility");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};


// search for users
var getAllUsersByCreationDate = function(req, res) {
	var from = req.body.fromDate;
	var to = req.body.toDate;
	g2gUsersBusiness.getAllUsersByCreationDate(from, to,function(users) {
		res.json(users);
	}, function(err) {
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
	});
};

var searchUsers = function(req, res) {
	var searchCriteria = req.body.searchCriteria;
	g2gUsersBusiness.searchUsers(searchCriteria,function(users) {
		res.json(users);
	}, function(err) {
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
	});
};

var searchUsersAndExport = function(req, res) {
	var searchCriteriaString = req.query.searchCriteria;
	var searchCriteria = JSON.parse(searchCriteriaString);
	g2gUsersBusiness.searchUsers(searchCriteria,function(users) {
		var flatUsers = users;
		res.xls("Customers.xlsx", flatUsers);
	}, function(err) {
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
	});
};

var getUserByActivationNumber = function(req, res) {
	try {
		var activationNumber = req.params.activationNumber;
		g2gUsersBusiness.getUserByActivationNumber(activationNumber, function(user) {
			if (user) {
				g2gUsersBusiness.activateUser(user.id, function() {
					res.send("Your G2G account is now active.");
				}, function(err) {
					console.log("An error occured in /activate");
					console.log(err);
					res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
				});
			} else {
				res.send("G2G couldn't find a pending user with the provided activation key. Please contact G2G support at support@g2gapp.net");
			}
		}, function(err) {
			console.log("An error occured in /activate");
			console.log(err);
			res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
		});
	} catch (error) {
		console.log("An error occured in /activate");
		console.log(err);
		res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
	}
};

var activateUser = function(req, res) {
	try {
		var userId = req.params.userId;
		g2gUsersBusiness.activateUser(userId, function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /user/:userId/activate");
			console.log(err);
			res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
		});
	} catch (error) {
		console.log("An error occured in /user/:userId/activate");
		console.log(err);
		res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
	}
};

var lockUser = function(req, res) {
	try {
		var userId = req.params.userId;
		g2gUsersBusiness.lockUser(userId, function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /user/:userId/lock");
			console.log(err);
			res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
		});
	} catch (error) {
		console.log("An error occured in /user/:userId/lock");
		console.log(err);
		res.send("An error occured while activating your account. Please contact G2G support at support@g2gapp.net");
	}
};

var notifyG2GCustomer = function(req, res) {
	try {
		var userEmailAddress = req.body.userEmailAddress
		var message = req.body.message
		g2gNotificationsBusiness.notifyG2GCustomer(message, userEmailAddress, function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /user/notify");
			console.log(err);
			res.send("An error occured while sending push notification to a customer: " + err);
		});
	} catch (err) {
		console.log("An error occured in /user/notify");
		console.log(err);
		res.send("An error occured while sending push notification to a customer: " + err);
	}
};

var notifyAllG2GCustomers = function(req, res) {
	try {
		var message = req.body.message
		g2gNotificationsBusiness.notifyAllG2GCustomers(message,  function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /users/notify");
			console.log(err);
			res.send("An error occured while sending push notification to a customer: " + err);
		});
	} catch (err) {
		console.log("An error occured in /users/notify");
		console.log(err);
		res.send("An error occured while sending push notification to a customer: " + err);
	}
};

var notifyAllAnonymousG2GCustomers = function(req, res) {
	try {
		var message = req.body.message;
		console.log("notifyAllAnonymousG2GCustomers");
		console.log(message);
		g2gNotificationsBusiness.notifyAllAnonymousG2GCustomers(message,  function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /anonymoususers/notify");
			console.log(err);
			res.send("An error occured while sending push notification to a customer: " + err);
		});
	} catch (err) {
		console.log("An error occured in /anonymoususers/notify");
		console.log(err);
		res.send("An error occured while sending push notification to a customer: " + err);
	}
};

exports.checkUsernameAvailability = checkUsernameAvailability;
exports.checkEmailAddressAvailability = checkEmailAddressAvailability;
exports.getUserByUsername = getUserByUsername;
exports.getUserById = getUserById;
exports.registerNewUser = registerNewUser;
exports.updateExistingUser = updateExistingUser;
exports.login = login;
exports.countAllUsers = countAllUsers;
exports.countAllActiveUsers = countAllActiveUsers;
exports.countAllAwaitingActivationUsers = countAllAwaitingActivationUsers;
exports.countAllLockedUsers = countAllLockedUsers;
exports.countAllSilentUsers = countAllSilentUsers;
exports.countAllReturningUsers = countAllReturningUsers;
exports.countAllOneTimeUsers = countAllOneTimeUsers;
exports.countAllMultipleTimesUsers = countAllMultipleTimesUsers;
exports.countAllCoveredUsers = countAllCoveredUsers;
exports.countAllUncoveredUsers = countAllUncoveredUsers;
exports.saveNewUserMessage = saveNewUserMessage;
exports.resetPassword = resetPassword;
exports.assignPlanToUser = assignPlanToUser;
exports.setUserEligibilityForLifetimeFreeDelivery = setUserEligibilityForLifetimeFreeDelivery;
exports.setUserEligibilityForFreeDelivery = setUserEligibilityForFreeDelivery;
exports.markUserEligibileForFreeDelivery = markUserEligibileForFreeDelivery;
exports.getAllUsersByCreationDate = getAllUsersByCreationDate;
exports.searchUsers = searchUsers;
exports.searchUsersAndExport = searchUsersAndExport;
exports.getUserByActivationNumber = getUserByActivationNumber;
exports.activateUser = activateUser;
exports.lockUser = lockUser;

exports.notifyAllAnonymousG2GCustomers = notifyAllAnonymousG2GCustomers;
exports.notifyAllG2GCustomers = notifyAllG2GCustomers;
exports.notifyG2GCustomer = notifyG2GCustomer;