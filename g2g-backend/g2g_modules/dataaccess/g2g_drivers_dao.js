/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");


//calls the onSuccess with a driver object or null
//calls the onFailure with an err object in case of technical error
var getDriverByUsername = function(username, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.delivery_person WHERE username = ?', [username], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a driver with username " + username);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var driver = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						fullName: rows[0].full_name,
						phone: rows[0].phone
						};
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(driver);
						// get the addresses of the user
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

var getDriverById = function(id, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.delivery_person WHERE id = ?', [id], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a driver with id " + id);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var driver = {
						id: rows[0].id,
						username: rows[0].username,
						password: rows[0].password,
						fullName: rows[0].full_name,
						phone: rows[0].phone
						};
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(driver);
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


var createNewDriver = function(driver, onSuccess, onFailure) {
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
					connection.query('INSERT INTO g2g.delivery_person (username, password, full_name, phone, active) values (?, ?, ?, ?, ?)', [driver.username, driver.password, driver.fullName, driver.phone, 1], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.end();
							console.log("An error occurred while trying to create the new delivery person: " + driver.username);
							console.log(err);
							connection.rollback(); // rollback the transaction
							onFailure(err);
						} else {
							// set the userId to the user
							driver.id = result.insertId;
							
							// end the connection
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(driver);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var updateExistingDriver = function(driver, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.delivery_person SET password = ?, full_name= ?, phone= ?, active= ? WHERE id=?', [driver.password, driver.fullName, driver.phone, driver.active, driver.id], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the existing driver: " + driver.username);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(driver);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a list of delivery persons or an empty list
//calls the onFailure with an err object in case of technical error
var getAllDrivers = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.delivery_person', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while list all drivers");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var drivers = [];
					// populate the attributes
					for (var i = 0; i < rows.length; i++) {
						var driver = {
								id: rows[i].id,
								username: rows[i].username,
								password: rows[i].password,
								fullName: rows[i].full_name,
								phone: rows[i].phone,
								active: rows[i].active
						};
						drivers.push(driver);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(drivers);
				}
			});
		}
	});
};

var getActiveDriverSession = function(driverId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.delivery_person_session WHERE delivery_person_id = ? AND actual_end_time IS NULL AND planned_end_time > ?', [driverId, new Date()], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while listing active driver sessions");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					connection.end();
					if (rows.length == 0) {
						onSuccess(null);
					} else {
						var driverSession = {
								id: rows[0].id,
								driverId: rows[0].delivery_person_id,
								startTime: rows[0].start_time,
								plannedEndTime: rows[0].planned_end_time,
								plannedDuration: rows[0].planned_duration,
						};
						onSuccess(driverSession);
					}
				}
			});
		}
	});
};

var getClockedInDrivers = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT d.* FROM g2g.delivery_person_session s, g2g.delivery_person d WHERE d.id = s.delivery_person_id AND actual_end_time IS NULL AND planned_end_time > ?', [new Date()], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while listing clocked in drivers");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var drivers = [];
					// populate the attributes
					for (var i = 0; i < rows.length; i++) {
						var driver = {
								id: rows[i].id,
								username: rows[i].username,
								password: rows[i].password,
								fullName: rows[i].full_name,
								phone: rows[i].phone,
								active: rows[i].active
						};
						drivers.push(driver);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(drivers);
				}
			});
		}
	});
};


var createNewDriverSession = function(driverSession, onSuccess, onFailure) {
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
					connection.query('INSERT INTO g2g.delivery_person_session (start_time, planned_end_time, planned_duration, actual_end_time, start_lng, start_lat, delivery_person_id) values (?, ?, ?, ?, ?, ?, ?)', [driverSession.startTime, driverSession.plannedEndTime, driverSession.plannedDuration, driverSession.actualEndTime, driverSession.startLng, driverSession.startLat, driverSession.driverId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.end();
							console.log("An error occurred while trying to create the new driver session: " + JSON.stringify(driverSession));
							console.log(err);
							connection.rollback(); // rollback the transaction
							onFailure(err);
						} else {
							// set the userId to the user
							driverSession.id = result.insertId;
							
							// end the connection
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(driverSession);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var updateExistingDriverSession = function(driverSession, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.delivery_person_session SET planned_end_time = ?, planned_duration = ?, actual_end_time = ? WHERE id = ?', [driverSession.plannedEndTime, driverSession.plannedDuration, driverSession.actualEndTime, driverSession.id], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the existing driver session: " + JSON.stringify(driverSession));
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(driverSession);
						}
					});
				}
			});
		}
	});
};

exports.getDriverByUsername = getDriverByUsername;
exports.getDriverById = getDriverById;
exports.createNewDriver = createNewDriver;
exports.updateExistingDriver = updateExistingDriver;
exports.getAllDrivers = getAllDrivers;

exports.updateExistingDriverSession = updateExistingDriverSession;
exports.createNewDriverSession = createNewDriverSession;
exports.getActiveDriverSession = getActiveDriverSession;
exports.getClockedInDrivers = getClockedInDrivers;