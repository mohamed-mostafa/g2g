/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");


//calls the onSuccess with a promotion object or null
//calls the onFailure with an err object in case of technical error
var getPromotionByPromotionCode = function(code, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.promotion WHERE promotion_code = ? and active = 1', [code], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a promotion with code " + code);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var promotion = {
						id: rows[0].id,
						name: rows[0].name,
						promotionCode: rows[0].promotion_code,
						customerMessage: rows[0].customer_message,
						valueDiscountPercent: rows[0].value_discount_percent,
						deliveryChargeDiscountPercent: rows[0].delivery_charge_discount_percent,
						validityDate: rows[0].validity_date,
						minimumOrderValue: rows[0].minimum_order_value,
						active: rows[0].active
						};
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(promotion);
					} else {
						// no promotion is found with the code
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};


var createNewPromotion = function(promotion, onSuccess, onFailure) {
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
					connection.query('INSERT INTO g2g.promotion (name, customer_message, promotion_code, value_discount_percent, delivery_charge_discount_percent, validity_date, minimum_order_value) values (?, ?, ?, ?, ?, ?, ?)', [promotion.name, promotion.customerMessage, promotion.promotionCode, promotion.valueDiscountPercent, promotion.deliveryChargeDiscountPercent, promotion.validityDate, promotion.minimumOrderValue], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.rollback(); // rollback the transaction
							connection.end();
							console.log("An error occurred while trying to create the new promotion: " + promotion.name);
							console.log(err);
							onFailure(err);
						} else {
							// end the connection
							promotion.id = result.insertId;
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(promotion);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a user object if successful
//calls the onFailure with an err object in case of technical error
var updateExistingPromotion = function(promotion, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.promotion SET name= ?, customer_message= ?, promotion_code= ?, value_discount_percent = ?, delivery_charge_discount_percent = ?, validity_date = ?, minimum_order_value = ?  WHERE id=?', [promotion.name, promotion.customerMessage, promotion.promotionCode, promotion.valueDiscountPercent, promotion.deliveryChargeDiscountPercent, promotion.validityDate, promotion.minimumOrderValue, promotion.id], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to update the existing promotion: " + promotion);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess(promotion);
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a list of promotions or an empty list
//calls the onFailure with an err object in case of technical error
var getAllPromotions = function(onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.promotion', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while list all promotions");
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var promotions = [];
					// populate the attributes
					for (var i = 0; i < rows.length; i++) {
						var promotion = {
								id: rows[i].id,
								name: rows[i].name,
								customerMessage: rows[i].customer_message,
								deliveryChargeDiscountPercent: rows[i].delivery_charge_discount_percent,
								valueDiscountPercent: rows[i].value_discount_percent,
								active: rows[i].active,
								promotionCode: rows[i].promotion_code,
								validityDate: rows[i].validity_date,
								minimumOrderValue: rows[i].minimum_order_value,
						};
						promotions.push(promotion);
					}
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess(promotions);
				}
			});
		}
	});
};

var getUnconsumedValidUserPromotion = function(userId, onSuccess, onFailure) {
	// select p.* from g2g.user_promotion up join g2g.promotion p on p.id = up.promotion_id where up.user_id = ? and u.active = 1 and up.consumed = 0
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select p.* from g2g.user_promotion up join g2g.promotion p on p.id = up.promotion_id where up.user_id = ? and p.active = 1 and up.consumed = 0 and p.validity_date > ?', [userId, new Date()], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find an unconsumed promotion for userId " + userId);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var promotion = {
						id: rows[0].id,
						name: rows[0].name,
						promotionCode: rows[0].promotion_code,
						customerMessage: rows[0].customer_message,
						valueDiscountPercent: rows[0].value_discount_percent,
						deliveryChargeDiscountPercent: rows[0].delivery_charge_discount_percent,
						validityDate: rows[0].validity_date,
						minimumOrderValue: rows[0].minimum_order_value,
						active: rows[0].active
						};
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(promotion);
					} else {
						// no promotion is found with the code
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

var getUserPromotionByPromotionCode = function(userId, promotionCode, onSuccess, onFailure) {
	// select p.* from g2g.user_promotion up join g2g.promotion p on p.id = up.promotion_id where up.user_id = ? AND p.promotion_code = ?
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('select p.*, up.consumed from g2g.user_promotion up join g2g.promotion p on p.id = up.promotion_id where up.user_id = ? AND p.promotion_code = ?', [userId, promotionCode], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to find a promotion with code " + promotionCode + " for userId " + userId);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						// populate the user attributes
						var promotion = {
						id: rows[0].id,
						name: rows[0].name,
						promotionCode: rows[0].promotion_code,
						customerMessage: rows[0].customer_message,
						valueDiscountPercent: rows[0].value_discount_percent,
						deliveryChargeDiscountPercent: rows[0].delivery_charge_discount_percent,
						active: rows[0].active,
						validityDate: rows[0].validity_date,
						minimumOrderValue: rows[0].minimum_order_value,
						consumed: rows[0].consumed
						};
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(promotion);
					} else {
						// no promotion is found with the code
						connection.end();
						onSuccess(null);
					}
				}
				
			});
		}
	});
};

var addPromotionToUser = function(userId, promotionId, onSuccess, onFailure) {
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
					connection.query('INSERT INTO g2g.user_promotion (user_id, promotion_id, consumed) values (?, ?, ?)', [userId, promotionId, 0], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							// end the connection
							connection.rollback(); // rollback the transaction
							connection.end();
							console.log("An error occurred while trying to assign user: " + userId + " the new promotion: " + promotionId);
							console.log(err);
							onFailure(err);
						} else {
							// end the connection
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess();
						}
					});
				}
			});
		}
	});
};

var markPromotionActive = function(promotionId, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.promotion SET active= 1 WHERE id=?', [promotionId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to activate promotion: " + promotionId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess();
						}
					});
				}
			});
		}
	});
};

var markPromotionInActive = function(promotionId, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.promotion SET active= 0 WHERE id=?', [promotionId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to deactivate promotion: " + promotionId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess();
						}
					});
				}
			});
		}
	});
};

var updatePromotionConsumptionForUser = function(userId, promotionId, consumed, onSuccess, onFailure) {
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
					connection.query('UPDATE g2g.user_promotion SET consumed= ? WHERE user_id=? AND promotion_id = ?', [consumed, userId, promotionId], function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to consume or unconsume promotion: " + promotionId);
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							connection.commit();
							connection.end();
							// call the callback function provided by the caller, and give it the response
							onSuccess();
						}
					});
				}
			});
		}
	});
};

exports.createNewPromotion = createNewPromotion;

exports.updateExistingPromotion = updateExistingPromotion;
exports.markPromotionActive = markPromotionActive;
exports.markPromotionInActive = markPromotionInActive;
exports.updatePromotionConsumptionForUser = updatePromotionConsumptionForUser;
exports.addPromotionToUser = addPromotionToUser;

exports.getPromotionByPromotionCode = getPromotionByPromotionCode;
exports.getAllPromotions = getAllPromotions;
exports.getUnconsumedValidUserPromotion = getUnconsumedValidUserPromotion;
exports.getUserPromotionByPromotionCode = getUserPromotionByPromotionCode;