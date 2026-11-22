/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");


//calls the onSuccess with a user object or null
//calls the onFailure with an err object in case of technical error
var getUserByUsername = function(username, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan WHERE g2g.user.id = g2g.user_profile.user_id AND g2g.user_profile.plan = g2g.user_plan.name AND username = ?', [username], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a user with username " + username);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var user = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						firstName: rows[0].first_name,
						lastName: rows[0].last_name,
						dateOfBirth: rows[0].date_of_birth,
						phone: rows[0].phone,
						emailAddress: rows[0].email,
						eligibleForFreeDelivery: rows[0].eligible_for_free_delivery, // from user_profile
						eligibleForLifetimeFreeDelivery: rows[0].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[0].status,
						totalOrdersCount: rows[0].total_orders_count,
						registrationDate: rows[0].registration_date,
						plan: { // from user_plan
							name: rows[0].plan,
							firstTimeDeliveryCharge: rows[0].first_time_delivery_charge,
							deliveryCharge: rows[0].delivery_charge,
							description: rows[0].description
						},
						addresses: [],
						paymentMethods: []
						};
						// get the addresses of the user
						connection.query('SELECT * FROM g2g.address WHERE user_id = ?', [user.id], function(addressErr, addressRows) {
							if (addressErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to find the addresses of the user with username " + username);
								console.log(addressErr);
								onFailure(addressErr);
							} else {
								// no error is thrown, iterate over the results and create an object for each row and append it to the results list
								for (var i = 0; i < addressRows.length; i++) {
									user.addresses[i] = {
											id: addressRows[i].id,
											streetAddress1: addressRows[i].street_address_1,
											streetAddress2: addressRows[i].street_address_2,
											city: addressRows[i].city,
											state: addressRows[i].state,
											zipCode: addressRows[i].zip_code,
											addressDetails: addressRows[i].address_details,
											nickname: addressRows[i].address_nickname
									};
								}
										// end the connection
										connection.end();
										// call the callback function provided by the caller, and give it the response
										onSuccess(user);
							}
						});
					} else {
						// no user is found with the username
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

//calls the onSuccess with a user object or null
//calls the onFailure with an err object in case of technical error
var getUserById = function(id, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan WHERE g2g.user.id = g2g.user_profile.user_id AND g2g.user_profile.plan = g2g.user_plan.name AND g2g.user.id = ?', [id], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a user with id " + id);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var user = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						firstName: rows[0].first_name,
						lastName: rows[0].last_name,
						dateOfBirth: rows[0].date_of_birth,
						phone: rows[0].phone,
						emailAddress: rows[0].email,
						eligibleForFreeDelivery: rows[0].eligible_for_free_delivery, // from user_profile
						eligibleForLifetimeFreeDelivery: rows[0].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[0].status,
						totalOrdersCount: rows[0].total_orders_count,
						registrationDate: rows[0].registration_date,
						plan: { // from user_plan
							name: rows[0].plan,
							firstTimeDeliveryCharge: rows[0].first_time_delivery_charge,
							deliveryCharge: rows[0].delivery_charge,
							description: rows[0].description
						},
						addresses: [],
						paymentMethods: []
						};
						// get the addresses of the user
						connection.query('SELECT * FROM g2g.address WHERE user_id = ?', [user.id], function(addressErr, addressRows) {
							if (addressErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to find the addresses of the user with username " + username);
								console.log(addressErr);
								onFailure(addressErr);
							} else {
								// no error is thrown, iterate over the results and create an object for each row and append it to the results list
								for (var i = 0; i < addressRows.length; i++) {
									user.addresses[i] = {
											id: addressRows[i].id,
											streetAddress1: addressRows[i].street_address_1,
											streetAddress2: addressRows[i].street_address_2,
											city: addressRows[i].city,
											state: addressRows[i].state,
											zipCode: addressRows[i].zip_code,
											addressDetails: addressRows[i].address_details,
											nickname: addressRows[i].address_nickname
									};
								}
										// end the connection
										connection.end();
										// call the callback function provided by the caller, and give it the response
										onSuccess(user);
							}
						});
					} else {
						// no user is found with the id
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

//calls the onSuccess with a user object or null
//calls the onFailure with an err object in case of technical error
var getUserByEmailAddress = function(emailAddress, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan WHERE email = ?', [emailAddress], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a user with emailAddress " + emailAddress);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var user = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						firstName: rows[0].first_name,
						lastName: rows[0].last_name,
						dateOfBirth: rows[0].date_of_birth,
						phone: rows[0].phone,
						emailAddress: rows[0].email,
						eligibleForFreeDelivery: rows[0].eligible_for_free_delivery,  // from user_profile
						eligibleForLifetimeFreeDelivery: rows[0].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[0].status,
						totalOrdersCount: rows[0].total_orders_count,
						registrationDate: rows[0].registration_date,
						plan: { // from user_plan
							name: rows[0].plan,
							firstTimeDeliveryCharge: rows[0].first_time_delivery_charge,
							deliveryCharge: rows[0].delivery_charge,
							description: rows[0].description
						},
						addresses: [],
						paymentMethods: []
						};
						// get the addresses of the user
						connection.query('SELECT * FROM g2g.address WHERE user_id = ?', [user.id], function(addressErr, addressRows) {
							if (addressErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to find the addresses of the user with username " + username);
								console.log(addressErr);
								onFailure(addressErr);
							} else {
								// no error is thrown, iterate over the results and create an object for each row and append it to the results list
								for (var i = 0; i < addressRows.length; i++) {
									user.addresses[i] = {
											id: addressRows[i].id,
											streetAddress1: addressRows[i].street_address_1,
											streetAddress2: addressRows[i].street_address_2,
											city: addressRows[i].city,
											state: addressRows[i].state,
											zipCode: addressRows[i].zip_code,
											addressDetails: addressRows[i].address_details,
											nickname: addressRows[i].address_nickname
									};
								}
										// end the connection
										connection.end();
										// call the callback function provided by the caller, and give it the response
										onSuccess(user);
							}
						});
					} else {
						// no user is found with the username
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

var getUserByPhoneNumber = function(phone, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan WHERE g2g.user.id = g2g.user_profile.user_id AND g2g.user_profile.plan = g2g.user_plan.name AND phone like ?', ['%' + phone + '%'], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a user with phone " + phone);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var user = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						firstName: rows[0].first_name,
						lastName: rows[0].last_name,
						dateOfBirth: rows[0].date_of_birth,
						phone: rows[0].phone,
						emailAddress: rows[0].email,
						eligibleForFreeDelivery: rows[0].eligible_for_free_delivery, // from user_profile
						eligibleForLifetimeFreeDelivery: rows[0].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[0].status,
						totalOrdersCount: rows[0].total_orders_count,
						registrationDate: rows[0].registration_date,
						plan: { // from user_plan
							name: rows[0].plan,
							firstTimeDeliveryCharge: rows[0].first_time_delivery_charge,
							deliveryCharge: rows[0].delivery_charge,
							description: rows[0].description
						},
						addresses: [],
						paymentMethods: []
						};
						// get the addresses of the user
						connection.query('SELECT * FROM g2g.address WHERE user_id = ?', [user.id], function(addressErr, addressRows) {
							if (addressErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to find the addresses of the user with phone " + phone);
								console.log(addressErr);
								onFailure(addressErr);
							} else {
								// no error is thrown, iterate over the results and create an object for each row and append it to the results list
								for (var i = 0; i < addressRows.length; i++) {
									user.addresses[i] = {
											id: addressRows[i].id,
											streetAddress1: addressRows[i].street_address_1,
											streetAddress2: addressRows[i].street_address_2,
											city: addressRows[i].city,
											state: addressRows[i].state,
											zipCode: addressRows[i].zip_code,
											addressDetails: addressRows[i].address_details,
											nickname: addressRows[i].address_nickname
									};
								}
								// end the connection
								connection.end();
								// call the callback function provided by the caller, and give it the response
								onSuccess(user);
							}
						});
					} else {
						// no user is found with the username
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

//calls the onSuccess with a user object or null
//calls the onFailure with an err object in case of technical error
var getAllUsersByCreationDate = function(fromDate, toDate, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan WHERE g2g.user.id = g2g.user_profile.user_id AND g2g.user_profile.plan = g2g.user_plan.name AND g2g.user.id > 0 AND g2g.user.registration_date between ? AND ? ORDER BY registration_date desc', [fromDate, toDate], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find all users between dates");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var users = [];
					var userIds = [];
					for (var i = 0; i < rows.length; i++) {
						// populate the user attributes
						var user = {
						id: rows[i].id,
						username: rows[i].username,
						password: rows[i].password,
						firstName: rows[i].first_name,
						lastName: rows[i].last_name,
						dateOfBirth: rows[i].date_of_birth,
						phone: rows[i].phone,
						emailAddress: rows[i].email,
						eligibleForFreeDelivery: rows[i].eligible_for_free_delivery, // from user_profile
						eligibleForLifetimeFreeDelivery: rows[i].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[i].status,
						totalOrdersCount: rows[i].total_orders_count,
						registrationDate: rows[i].registration_date,
						plan: { // from user_plan
							name: rows[i].plan,
							firstTimeDeliveryCharge: rows[i].first_time_delivery_charge,
							deliveryCharge: rows[i].delivery_charge,
							description: rows[i].description
						},
						addresses: [],
						paymentMethods: []
						};
						
						userIds.push(user.id);
						users.push(user);
					}
					
					// populate addresses
					connection.query('SELECT * FROM g2g.address WHERE user_id in (?)', [userIds], function(addressesErr, addressesRows) {
						if (addressesErr) {
							// end the connection
							connection.end();
							console.log("An error occurred while trying to find addresses of all users ");
							console.log(addressesErr);
							onFailure(addressesErr);
						} else {
							// iterate over the addresses
							for (var j = 0; j < addressesRows.length; j++) {
								// populate the address attributes
								var address = {
									id: addressesRows[j].id,
									userId: addressesRows[j].user_id,
									streetAddress1: addressesRows[j].street_address_1,
									streetAddress2: addressesRows[j].street_address_2,
									city: addressesRows[j].city,
									state: addressesRows[j].state,
									zipCode: addressesRows[j].zip_code,
									addressDetails: addressesRows[j].address_details,
									addressNickname: addressesRows[j].address_nickname
								};
								for (var k = 0; k < users.length; k++) {
									if (users[k].id == address.userId) { // user found
										if (users[k].addresses == null)	users[k].addresses = [];
										users[k].addresses.push(address);
										
										// also, set the zip code and city to the user
										if (users[k].zipCodes == null) {
											users[k].zipCodes = "";
											users[k].zipCodes += address.zipCode;
										} else 
											users[k].zipCodes += " | " + address.zipCode;
										
										if (users[k].cities == null) {
											users[k].cities = "";
											users[k].cities += address.city;
										}
										else users[k].cities += " | " + address.city;
									}
								}
							}
							connection.end();
							onSuccess(users);
						}
					});
				}
			});
		}
	});
};

/*var userSearchCriteria = {
		email: "",
		name: "",
		registrationDateRange: "", 
		city: "", 
		zipCode:"", 
		address:"", 
		phone: "",
		plan:"", 
		status:"", 
		eligibleForFreeDelivery:0, 
		eligibleForLifetimeFreeDelivery:0
};*/

var searchUsers = function(userSearchCriteria, onSuccess, onFailure) {
	
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = 'SELECT DISTINCT g2g.user.*, g2g.user_profile.*, g2g.user_plan.* FROM g2g.user, g2g.user_profile, g2g.user_plan, g2g.address WHERE g2g.user.id = g2g.user_profile.user_id AND g2g.user_profile.plan = g2g.user_plan.name AND g2g.user.id = g2g.address.user_id AND g2g.user.id > 0 ';
			var variables = [];
			
			if (userSearchCriteria) {
	//			email
				if (userSearchCriteria.email != null && userSearchCriteria.email != "") {
					statement += " AND email like '%" + userSearchCriteria.email + "%'";
				}
	//			name
				if (userSearchCriteria.name != null && userSearchCriteria.name != "") {
					statement += " AND (first_name like '%" + userSearchCriteria.name + "%' OR last_name like '%" + userSearchCriteria.name + "%' )";
				}
	//			plan
				if (userSearchCriteria.plan != null && userSearchCriteria.plan != "") {
					statement += " AND plan like '%" + userSearchCriteria.email + "%'";
				}
	//			status
				if (userSearchCriteria.status != null && userSearchCriteria.status != "") {
					statement += " AND status like '%" + userSearchCriteria.status + "%'";
				}
	//			address
				if (userSearchCriteria.address != null && userSearchCriteria.address != "") {
					statement += " AND (street_address_1 like '%" + userSearchCriteria.address +
							"%' OR street_address_2 like '%" + userSearchCriteria.address +
							"%' OR address_details like '%" + userSearchCriteria.address +
							"%' )";
				}
	//			zip code
				if (userSearchCriteria.zipCode != null && userSearchCriteria.zipCode != "") {
					statement += " AND zip_code like '%" + userSearchCriteria.zipCode + "%'";
				}
	//			city
				if (userSearchCriteria.city != null && userSearchCriteria.city != "") {
					statement += " AND city like '%" + userSearchCriteria.city + "%'";
				}
	//			phone
				if (userSearchCriteria.phone != null && userSearchCriteria.phone != "") {
					statement += " AND phone like '%" + userSearchCriteria.phone + "%'";
				}
	//			registration date
				if (userSearchCriteria.registrationDateRange != null && userSearchCriteria.registrationDateRange.from != null) {
					statement += " AND registration_date >= ?";
					variables.push(userSearchCriteria.registrationDateRange.from);
				}
				if (userSearchCriteria.registrationDateRange != null && userSearchCriteria.registrationDateRange.to != null) {
					statement += " AND registration_date <= ?";
					variables.push(userSearchCriteria.registrationDateRange.to);
				}
	//			eligibility For Free Delivery
				if (userSearchCriteria.eligibleForFreeDelivery != null && userSearchCriteria.eligibleForFreeDelivery == 1) {
					statement += " AND eligible_for_free_delivery = ?";
					variables.push(userSearchCriteria.eligibleForFreeDelivery);
				}
	//			eligibility For Lifetime Free Delivery
				if (userSearchCriteria.eligibleForLifetimeFreeDelivery != null && userSearchCriteria.eligibleForLifetimeFreeDelivery == 1) {
					statement += " AND eligible_for_lifetime_free_delivery = ?";
					variables.push(userSearchCriteria.eligibleForLifetimeFreeDelivery);
				}
			}
			
			statement += ' ORDER BY registration_date desc';
			connection.query(statement, variables, function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find all users between dates");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var users = [];
					var userIds = [];
					for (var i = 0; i < rows.length; i++) {
						// populate the user attributes
						var user = {
						id: rows[i].id,
						username: rows[i].username,
						password: rows[i].password,
						firstName: rows[i].first_name,
						lastName: rows[i].last_name,
						dateOfBirth: rows[i].date_of_birth,
						phone: rows[i].phone,
						emailAddress: rows[i].email,
						eligibleForFreeDelivery: rows[i].eligible_for_free_delivery, // from user_profile
						eligibleForLifetimeFreeDelivery: rows[i].eligible_for_lifetime_free_delivery, // from user_profile
						status: rows[i].status,
						totalOrdersCount: rows[i].total_orders_count,
						registrationDate: rows[i].registration_date,
						plan: { // from user_plan
							name: rows[i].plan,
							firstTimeDeliveryCharge: rows[i].first_time_delivery_charge,
							deliveryCharge: rows[i].delivery_charge,
							description: rows[i].description
						},
						addresses: [],
						paymentMethods: []
						};
						
						userIds.push(user.id);
						users.push(user);
					}
					
					if (userIds.length > 0) {
						
						// populate addresses
						connection.query('SELECT * FROM g2g.address WHERE user_id in (?)', [userIds], function(addressesErr, addressesRows) {
							if (addressesErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to find addresses of all users ");
								console.log(addressesErr);
								onFailure(addressesErr);
							} else {
								// iterate over the addresses
								for (var j = 0; j < addressesRows.length; j++) {
									// populate the address attributes
									var address = {
										id: addressesRows[j].id,
										userId: addressesRows[j].user_id,
										streetAddress1: addressesRows[j].street_address_1,
										streetAddress2: addressesRows[j].street_address_2,
										city: addressesRows[j].city,
										state: addressesRows[j].state,
										zipCode: addressesRows[j].zip_code,
										addressDetails: addressesRows[j].address_details,
										addressNickname: addressesRows[j].address_nickname
									};
									for (var k = 0; k < users.length; k++) {
										if (users[k].id == address.userId) { // user found
											if (users[k].addresses == null)	users[k].addresses = [];
											users[k].addresses.push(address);
											
											// also, set the zip code and city to the user
											if (users[k].zipCodes == null) {
												users[k].zipCodes = "";
												users[k].zipCodes += address.zipCode;
											} else 
												users[k].zipCodes += " | " + address.zipCode;
											
											if (users[k].cities == null) {
												users[k].cities = "";
												users[k].cities += address.city;
											}
											else users[k].cities += " | " + address.city;
										}
									}
								}
								connection.end();
								onSuccess(users);
							}
						});
					} else {
						connection.end();
						onSuccess(users);
					}
				}
			});
		}
	});
};

//calls the onSuccess with a number
//calls the onFailure with an err object in case of technical error
var countAllUsers = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT id FROM g2g.user WHERE id > 0', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};

var countAllUsersWithStatus = function(status, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT id FROM g2g.user WHERE id > 0 AND status = ?', [status], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};

var countAllUsersWithOrdersEqualsToZero = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select id from g2g.user WHERE id not in (select distinct user_id from g2g.order) AND id > 0', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};

var countAllUsersWithOrdersEqualsToOne = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select g2g.user.id , count(g2g.order.id) as orders_count from g2g.user JOIN g2g.order ON g2g.user.id = g2g.order.user_id WHERE g2g.user.id > 0 GROUP BY g2g.order.user_id HAVING orders_count = 1', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};

var countAllUsersWithOrdersGreaterThanZero = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select g2g.user.id , count(g2g.order.id) as orders_count from g2g.user JOIN g2g.order ON g2g.user.id = g2g.order.user_id WHERE g2g.user.id > 0 GROUP BY g2g.order.user_id', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};

var countAllUsersWithZipCodesInRestaurants = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select distinct address.user_id from g2g.address where zip_code in (select g2g.restaurant_zip_code.zip_code from g2g.restaurant_zip_code)', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to count the users");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var ids = [];
					for(var i = 0; i < rows.length; i++) {
						ids.push(rows[i].user_id);
					}
					onSuccess(ids);
					connection.end();
				}
			});
		}
	});
};




//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var createNewUser = function(user, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('INSERT INTO g2g.user (username, password, first_name, last_name, date_of_birth, phone, email, status, activation_number, registration_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.username, user.password, user.firstName, user.lastName, user.dateOfBirth, user.phone, user.emailAddress, user.status, user.activationNumber, new Date()], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.end();
							console.log("An error occurred while trying to create the new user: " + user.username);
							console.log(err);
							connection.rollback(); // rollback the transaction
							onFailure(err);
						} else {
							// set the userId to the user
							user.id = result.insertId;
							
							// create the user profile
							/* eligibile for free delivery is forced disabled here*/
							connection.query('INSERT INTO g2g.user_profile (SELECT ' + connection.escape(user.id) + ' , 0 , 0, 0, name from g2g.user_plan where g2g.user_plan.is_default is true)', [], function(profileErr, profileResult) {
								if (profileErr) {
									// end the connection
									connection.end();
									console.log("An error occurred while trying to create the profile of the new user: " + user.username);
									console.log(profileErr);
									connection.rollback(); // rollback the transaction
									onFailure(profileErr);
								} else {
									// insert the addresses
									if (user.addresses.length > 0) { 
										var batchInsertStatement = "INSERT INTO g2g.address (address_nickname, street_address_1, street_address_2, city, state, zip_code, address_details, user_id) values (" + connection.escape(user.addresses[0].nickname) + ", " + connection.escape(user.addresses[0].streetAddress1) + ", " + connection.escape(user.addresses[0].streetAddress2) + ", " + connection.escape(user.addresses[0].city) + ", " + connection.escape(user.addresses[0].state) + ", " + connection.escape(user.addresses[0].zipCode) + ", " + connection.escape(user.addresses[0].addressDetails) + ", " + connection.escape(user.id) + ")";
										for (var i = 1; i < user.addresses.length; i++) {
											// for each other address, 
											batchInsertStatement += ", (" + connection.escape(user.addresses[i].nickname) + ", " + connection.escape(user.addresses[i].streetAddress1) + ", " + connection.escape(user.addresses[i].streetAddress2) + ", " + connection.escape(user.addresses[i].city) + ", " + connection.escape(user.addresses[i].state) + ", " + connection.escape(user.addresses[i].zipCode) + ", " + connection.escape(user.addresses[i].addressDetails) + ", " + connection.escape(user.id) + ")";
										}
										connection.query(batchInsertStatement, function(err, result) {
											// if an error is thrown, end the connection and throw an error
											if (err) { // if the 2nd insert statement fails
												console.log("An error occurred while trying to create the addresses of the user: " + user.username);
												console.log(err);
												connection.rollback();
												// end the connection
												connection.end();
												onFailure(err);
											} else {
												// set the id to the addresses
												for (var i = 0; i < user.addresses.length; i++) {
													user.addresses[i].id = result.insertId[i];
												}
												// end the connection
												connection.commit();
												connection.end();
												// call the callback function provided by the caller, and give it the response
												onSuccess(user);
											}});
									} else { // no addresses to insert
										// end the connection
										connection.commit();
										connection.end();
										// call the callback function provided by the caller, and give it the response
										onSuccess(user);
									}
								}
							});
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var updateExistingUser = function(user, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('UPDATE g2g.user SET password = ?, first_name= ?, last_name= ?, date_of_birth= ?, phone= ?, email= ? WHERE id=?', [user.password, user.firstName, user.lastName, user.dateOfBirth, user.phone, user.emailAddress, user.id], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to create the new user: " + user.username);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							// delete the addresses
							connection.query('DELETE FROM g2g.address WHERE user_id=?', [user.id], function(err, result) {
								if (err) {
									console.log("An error occurred while trying to delete the addresses of the user: " + user.username);
									console.log(err);
									connection.rollback(); // rollback the transaction
									// end the connection
									connection.end();
									onFailure(err);
								} else { // if deletion succeeded, insert the new addresses
									// insert the addresses
									if (user.addresses.length > 0) { 
										var batchInsertStatement = "INSERT INTO g2g.address (address_nickname, street_address_1, street_address_2, city, state, zip_code, address_details, user_id) values (" + connection.escape(user.addresses[0].nickname) + ", " + connection.escape(user.addresses[0].streetAddress1) + ", " + connection.escape(user.addresses[0].streetAddress2) + ", " + connection.escape(user.addresses[0].city) + ", " + connection.escape(user.addresses[0].state) + ", " + connection.escape(user.addresses[0].zipCode) + ", " + connection.escape(user.addresses[0].addressDetails) + ", " + connection.escape(user.id) + ")";
										for (var i = 1; i < user.addresses.length; i++) {
											// for each other address, 
											batchInsertStatement += ", (" + connection.escape(user.addresses[i].nickname) + ", " + connection.escape(user.addresses[i].streetAddress1) + ", " + connection.escape(user.addresses[i].streetAddress2) + ", " + connection.escape(user.addresses[i].city) + ", " + connection.escape(user.addresses[i].state) + ", " + connection.escape(user.addresses[i].zipCode) + ", " + connection.escape(user.addresses[i].addressDetails) + ", " + connection.escape(user.id) + ")";
										}
										connection.query(batchInsertStatement, function(err, result) {
											// if an error is thrown, end the connection and throw an error
											if (err) { // if the 2nd insert statement fails
												console.log("An error occurred while trying to create the addresses of the user: " + user.username);
												console.log(err);
												connection.rollback();
												// end the connection
												connection.end();
												onFailure(err);
											} else {
												// set the id to the addresses
												for (var i = 0; i < user.addresses.length; i++) {
													user.addresses[i].id = result.insertId[i];
												}
												// end the connection
												connection.commit();
												connection.end();
												// call the callback function provided by the caller, and give it the response
												onSuccess(user);
											}});
									} else { // no addresses to insert
											// end the connection
											connection.commit();
											connection.end();
											// call the callback function provided by the caller, and give it the response
											onSuccess(user);
									}
								}
							});
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var createNewMessage = function(userId, subject, message, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.user_message (user_id, subject, message, message_time) values (?, ?, ?, ?)', [userId, subject, message, new Date()], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				connection.end();
				if (err) {
					console.log("An error occurred while trying to insert the message: " + userId + " - " + subject + " - " + message);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					onSuccess();
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var changeUserPassword = function(userId, newPassword, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = 'UPDATE g2g.user SET password = ' + connection.escape(newPassword) + ' WHERE id = ?';
			connection.query(statement, [userId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				connection.end();
				if (err) {
					console.log("An error occurred while trying to update a user with id " + userId);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					onSuccess();
				}
			});
		}
	});
};

// set the 
var updateUserEligibilityForLifetimeFreeDelivery = function(userId, lifetimeEligibilitty, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('UPDATE g2g.user_profile SET eligible_for_lifetime_free_delivery = ?, eligible_for_free_delivery = ? WHERE user_id= ?', [lifetimeEligibilitty, lifetimeEligibilitty, userId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the lifetime eligibility of the new user: " + userId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							onSuccess();
						}
					});
				}
			});
		}
	});
};
var updateUserEligibilityForFreeDelivery = function(userId, eligibility, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('UPDATE g2g.user_profile SET eligible_for_free_delivery = ? WHERE user_id= ?', [eligibility, userId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the eligibility of the new user: " + userId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							onSuccess();
						}
					});
				}
			});
		}
	});
};

var getUserByActivationNumber = function(activationNumber, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.user WHERE activation_number = ? AND status = ?', [activationNumber, 'AWAITING_ACTIVATION'], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a user with activation number " + activationNumber);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var user = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						firstName: rows[0].first_name,
						lastName: rows[0].last_name,
						dateOfBirth: rows[0].date_of_birth,
						phone: rows[0].phone,
						emailAddress: rows[0].email,
						status: rows[0].status,
						registrationDate: rows[0].registration_date,
						};
						connection.end();
						onSuccess(user);
					} else {
						// no user is found with the username
						connection.end();
						onSuccess(null);
					}
				}
			});
		}
	});
};

var setUserStatus = function(userId, status, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('UPDATE g2g.user SET status = ? WHERE id= ?', [status, userId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to set the status the user: " + userId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							onSuccess();
						}
					});
				}
			});
		}
	});
};

var getPendingUserMessages = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT *, m.id as mid FROM g2g.user_message m JOIN g2g.user u on u.id = m.user_id WHERE m.user_id NOT IN (-1) AND m.read = false', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to list the user messages");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var messages = [];
					for (var i = 0; i < rows.length; i++) {
						// populate the user attributes
						var message = {
						id: rows[i].mid,
						userFirstName: rows[i].first_name,
						userLastName: rows[i].last_name,
						subject: rows[i].subject,
						message: rows[i].message,
						messageTime: rows[i].message_time,
						userId: rows[i].user_id
						};
						messages.push(message);
					}
					connection.end();
					onSuccess(messages);
				}
			});
		}
	});
};

var getPendingSystemMessages = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT *, m.id as mid FROM g2g.user_message m JOIN g2g.user u on u.id = m.user_id WHERE m.user_id in (-1) AND m.read = false', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to list the system messages");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var messages = [];
					for (var i = 0; i < rows.length; i++) {
						// populate the user attributes
						var message = {
						id: rows[i].mid,
						userFirstName: rows[i].first_name,
						userLastName: rows[i].last_name,
						subject: rows[i].subject,
						message: rows[i].message,
						messageTime: rows[i].message_time,
						userId: rows[i].user_id
						};
						messages.push(message);
					}
					connection.end();
					onSuccess(messages);
				}
			});
		}
	});
};

var getMessagesBetweenDates = function(messagesFrom, messagesTo, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT *, m.id as mid FROM g2g.user_message m JOIN g2g.user u on u.id = m.user_id WHERE m.message_time >= ? AND m.message_time <= ?', [messagesFrom, messagesTo], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to list the messages");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var messages = [];
					for (var i = 0; i < rows.length; i++) {
						// populate the user attributes
						var message = {
						id: rows[i].mid,
						userFirstName: rows[i].first_name,
						userLastName: rows[i].last_name,
						subject: rows[i].subject,
						message: rows[i].message,
						messageTime: rows[i].message_time,
						read: rows[i].read,
						userId: rows[i].user_id
						};
						messages.push(message);
					}
					connection.end();
					onSuccess(messages);
				}
			});
		}
	});
};

var setMessageReadStatus = function(messageId, status, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the user and his addresses
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('UPDATE g2g.user_message SET g2g.user_message.read = ? WHERE id= ?', [status, messageId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to set the status the message: " + messageId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							onSuccess();
						}
					});
				}
			});
		}
	});
};



var updateOrdersCountInUserProfile = function(userId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = "UPDATE g2g.user_profile SET g2g.user_profile.total_orders_count = (select count(*) from g2g.order where g2g.order.status NOT IN ('REFUNDED', 'REFUNDED_ARCHIVED') and g2g.order.user_id = ?) where g2g.user_profile.user_id = ?;";
			connection.query(statement, [userId, userId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				connection.end();
				if (err) {
					console.log("An error occurred while trying to update a user profile for user with id " + userId);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					onSuccess();
				}
			});
		}
	});
};

var updatePlanOfUserProfile = function(userId, plan, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = "UPDATE g2g.user_profile SET g2g.user_profile.plan = ? WHERE g2g.user_profile.user_id = ?";
			connection.query(statement, [plan, userId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				connection.end();
				if (err) {
					console.log("An error occurred while trying to update a user profile for user with id " + userId + " to plan " + plan);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					onSuccess();
				}
			});
		}
	});
};



exports.getUserById = getUserById;
exports.getUserByEmailAddress = getUserByEmailAddress;
exports.createNewUser = createNewUser;
exports.updateExistingUser = updateExistingUser;
exports.countAllUsers = countAllUsers;
exports.countAllUsersWithStatus = countAllUsersWithStatus;
exports.changeUserPassword = changeUserPassword;
exports.createNewMessage = createNewMessage;
exports.updateUserEligibilityForFreeDelivery = updateUserEligibilityForFreeDelivery;
exports.updateUserEligibilityForLifetimeFreeDelivery = updateUserEligibilityForLifetimeFreeDelivery;
exports.getUserByActivationNumber = getUserByActivationNumber;
exports.setUserStatus = setUserStatus;
exports.getAllUsersByCreationDate = getAllUsersByCreationDate;
exports.getPendingUserMessages = getPendingUserMessages;
exports.getPendingSystemMessages = getPendingSystemMessages;
exports.setMessageReadStatus = setMessageReadStatus;
exports.getMessagesBetweenDates = getMessagesBetweenDates;
exports.updateOrdersCountInUserProfile = updateOrdersCountInUserProfile;
exports.updatePlanOfUserProfile = updatePlanOfUserProfile;
exports.countAllUsersWithZipCodesInRestaurants = countAllUsersWithZipCodesInRestaurants;
exports.countAllUsersWithOrdersGreaterThanZero = countAllUsersWithOrdersGreaterThanZero;
exports.countAllUsersWithOrdersEqualsToZero = countAllUsersWithOrdersEqualsToZero;
exports.countAllUsersWithOrdersEqualsToOne = countAllUsersWithOrdersEqualsToOne;
exports.getUserByUsername = getUserByUsername;
exports.getUserByPhoneNumber = getUserByPhoneNumber;
exports.searchUsers = searchUsers;