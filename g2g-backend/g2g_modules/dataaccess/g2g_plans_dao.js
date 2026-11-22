/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");


//calls the onSuccess with a plan object or null
//calls the onFailure with an err object in case of technical error
var getPlanByName = function(name, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.user_plan WHERE name = ?', [name], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a plan with name " + name);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var plan = {
						name: rows[0].name,
						description: rows[0].description,
						deliveryCharge: rows[0].delivery_charge,
						firstTimeDeliveryCharge: rows[0].first_time_delivery_charge,
						isDefault: rows[0].is_default,
						};
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(plan);
					} else {
						// no plan is found with the name
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};


var createNewPlan = function(plan, onSuccess, onFailure) {
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
					connection.query('INSERT INTO g2g.user_plan (name, description, delivery_charge, first_time_delivery_charge, is_default) values (?, ?, ?, ?)', [plan.name, plan.description, plan.deliveryCharge, plan.firstTimeDeliveryCharge, 0], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.end();
							console.log("An error occurred while trying to create the new plan: " + plan.name);
							console.log(err);
							connection.rollback(); // rollback the transaction
							onFailure(err);
						} else {
							// end the connection
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(plan);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var updateExistingPlan = function(plan, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.user_plan SET description= ?, delivery_charge= ?, first_time_delivery_charge= ? WHERE name=?', [plan.description, plan.deliveryCharge, plan.firstTimeDeliveryCharge, plan.name], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the existing plan: " + oldName);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(plan);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a list of delivery persons or an empty list
//calls the onFailure with an err object in case of technical error
var getAllPlans = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.user_plan', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while list all plans");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var plans = [];
					// populate the attributes
					for (var i = 0; i < rows.length; i++) {
						var plan = {
								name: rows[i].name,
								description: rows[i].description,
								deliveryCharge: rows[i].delivery_charge,
								firstTimeDeliveryCharge: rows[i].first_time_delivery_charge,
								isDefault: rows[i].is_default,
						};
						plans.push(plan);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(plans);
				}
			});
		}
	});
};

var markPlanDefault = function(planName, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.user_plan SET is_default = CASE WHEN name = ? THEN 1 ELSE 0 END', [planName], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to mark a plan with name " + planName + " as default");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

exports.getPlanByName = getPlanByName;
exports.createNewPlan = createNewPlan;
exports.updateExistingPlan = updateExistingPlan;
exports.getAllPlans = getAllPlans;
exports.markPlanDefault = markPlanDefault;