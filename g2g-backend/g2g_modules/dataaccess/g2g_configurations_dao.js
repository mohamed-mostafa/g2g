/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");


//calls the onSuccess with a configuration object
//calls the onFailure with an err object in case of technical error
var getCurrentApplicationConfigurations = function (onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.configuration WHERE deactivation_date is null', function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load the configurations");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty configuration objecct
					configurations = {configurations: []};
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var configuration = {
								key: rows[i].key,
								value: rows[i].value
								};
						configurations.configurations.push(configuration);
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(configurations);
				}
			});
		}
	});
};

var setCurrentApplicationConfiguration = function(key, value, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.configuration SET g2g.configuration.value = ? where g2g.configuration.key = ?', [value, key], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update " + key + " to " + value);
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var getAllAds = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.advertisement order by sort_order', function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load the ads");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty configuration objecct
					var ads = [];
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var ad = {
								id: rows[i].id,
								image: rows[i].image,
								active: rows[i].active,
								};
						ads.push(ad);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(ads);
				}
			});
		}
	});
};

var getActiveAds = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.advertisement WHERE active = 1 order by sort_order', function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load the active ads");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty configuration objecct
					var ads = [];
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var ad = {
								id: rows[i].id,
								image: rows[i].image,
								active: rows[i].active,
								};
						ads.push(ad);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(ads);
				}
			});
		}
	});
};

var modifyAd = function(id, image, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.advertisement set image = ? where id = ?', [image, id], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update ad: " + id);
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var enableAd = function(id, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.advertisement set active = 1 where id = ?', [id], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to enable an ad ");
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
}

var disableAd = function(id, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.advertisement set active = 0 where id = ?', [id], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to disable an ad");
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
}


exports.getCurrentApplicationConfigurations = getCurrentApplicationConfigurations;
exports.setCurrentApplicationConfiguration = setCurrentApplicationConfiguration;
exports.getActiveAds = getActiveAds;
exports.enableAd = enableAd;
exports.disableAd = disableAd;
exports.modifyAd = modifyAd;
exports.getAllAds = getAllAds;