/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");

//calls the onSuccess with an order object if successful
//calls the onFailure with an err object in case of technical error
var createNewOrder = function(order, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// begin a transaction to insert the order and its items
			connection.beginTransaction(function(err) {
				// execute the query
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to begin a database transaction");
					console.log(err);
					onFailure(err);
				} else {
					connection.query('INSERT INTO g2g.order (status, placed_at, value, tax, discounts, delivery_charge, total_without_tips, tips_percent, tips_amount, total_with_tips, delivery_street_address_1, delivery_street_address_2, delivery_city, delivery_state, delivery_zip_code, delivery_address_details, delivery_user_full_name, delivery_user_phone, delivery_user_email, restaurant_street_address, restaurant_city, restaurant_zip_code, user_id, restaurant_id, payment_token_id, payment_charge_id, eta, eta_message, rating, app_version, special_instructions, promotion_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
					[order.status, order.placedAt, order.value, order.tax, order.discounts, order.deliveryCharge, order.totalWithoutTips, order.tipsPercent, order.tipsAmount, order.totalWithTips, order.deliveryStreetAddress1, order.deliveryStreetAddress2, order.deliveryCity, order.deliveryState, order.deliveryZipCode, order.deliveryAddressDetails, order.deliveryUserFullName, order.deliveryUserPhone, order.deliveryUserEmailAddress, order.restaurant.streetAddress, order.restaurant.city, order.restaurant.zipCode, order.userId, order.restaurant.id, order.paymentTokenId, order.paymentChargeId, order.eta, order.etaMessage, order.rating, order.appVersion, order.specialInstructions, order.promotionId], 
					function(err, result) {
						// if an error is thrown, end the connection and throw an error
						if (err) { // if the first insert statement fails
							console.log("An error occurred while trying to create the new order: " + JSON.stringify(order));
							console.log(err);
							connection.rollback(); // rollback the transaction
							// end the connection
							connection.end();
							onFailure(err);
						} else {
							// set the id to the order
							order.id = result.insertId;
							
							// insert the items
							if (order.orderItems.length > 0) {
								// concatenate sides names
								var orderItemSides = "";
								for (var i = 0; i < order.orderItems[0].sides.length; i++) {
									if (orderItemSides.length != 0) orderItemSides += " | ";
									orderItemSides += order.orderItems[0].sides[i].name;
								}
								var batchInsertStatement = "INSERT INTO g2g.order_item (price, quantity, special_instructions, sides, restaurant_menu_category_item_id, order_id) values (" + connection.escape(order.orderItems[0].price) + ", " + connection.escape(order.orderItems[0].quantity) + ", " + connection.escape(order.orderItems[0].specialInstructions) + ", " + connection.escape(orderItemSides) + ", " + connection.escape(order.orderItems[0].restaurantMenuCategoryItem.id) + ", " + connection.escape(order.id) + ")";
								for (var i = 1; i < order.orderItems.length; i++) {
									// for each other item, 
									orderItemSides = ""; // concatenate sides names
									for (var j = 0; j < order.orderItems[i].sides.length; j++) {
										if (orderItemSides.length != 0) orderItemSides += " | ";
										orderItemSides += order.orderItems[i].sides[j].name;
									}
									batchInsertStatement += ", (" + connection.escape(order.orderItems[i].price) + ", " + connection.escape(order.orderItems[i].quantity) + ", " + connection.escape(order.orderItems[i].specialInstructions) + ", " + connection.escape(orderItemSides) + ", " + connection.escape(order.orderItems[i].restaurantMenuCategoryItem.id) + ", " + connection.escape(order.id) + ")";
								}
								connection.query(batchInsertStatement, function(err, result) {
									// if an error is thrown, end the connection and throw an error
									if (err) { // if the 2nd insert statement fails
										console.log("An error occurred while trying to create the items of the order: " + JSON.stringify(order));
										console.log(err);
										connection.rollback();
										// end the connection
										connection.end();
										onFailure(err);
									} else {
										// set the id to the items
										for (var i = 0; i < order.orderItems.length; i++) {
											order.orderItems[i].id = result.insertId[i];
										}
										// end the connection
										connection.commit();
										connection.end();
										// call the callback function provided by the caller, and give it the response
										onSuccess(order);
									}});
							} else { // no items to insert
								// end the connection
								connection.commit();
								connection.end();
								// call the callback function provided by the caller, and give it the order object
								onSuccess(order);
							}
						}
					});
				}
			});
		}
	});
};

//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var getOrderSummariesByUserAndStatus = function(userId, statuses, onSuccess, onFailure, includeLogos) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT o.id, o.placed_at, o.status, o.total_with_tips, o.delivery_user_full_name, o.delivery_street_address_1, o.delivery_user_phone, o.restaurant_street_address, o.restaurant_city, o.restaurant_zip_code, r.name, r.cuisine, r.location, r.logo, r.id as restaurantId, count(oi.id) as order_items_count FROM g2g.order o JOIN g2g.restaurant r ON o.restaurant_id = r.id JOIN g2g.order_item oi on oi.order_id = o.id  WHERE status IN (?) AND user_id = ? GROUP BY o.id, o.status, o.total_with_tips, r.name, r.cuisine, r.location, r.logo ORDER BY o.placed_at DESC ', [statuses, userId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to find an order with userId " + userId + " and statuses " + statuses);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var orderSummaries = {orderSummaries: []};
					if (rows.length != 0) {
						// populate the user attributes
						for (var i = 0; i < rows.length; i++) {
							if (includeLogos) {
								var orderSummary = {
										id: rows[i].id,
										status: rows[i].status,
										totalValue: rows[i].total_with_tips,
										itemsCount: rows[i].order_items_count,
										deliveryFullName: rows[i].delivery_user_full_name,
										deliveryStreetAddress1: rows[i].delivery_street_address_1,
										deliveryStreetAddress2: rows[i].delivery_street_address_2,
										deliveryZipCode: rows[i].delivery_zip_code,
										deliveryAddressDetails: rows[i].delivery_address_details,
										deliveryUserPhone: rows[i].delivery_user_phone,
										restaurantStreetAddress: rows[i].restaurant_street_address,
										restaurantCity: rows[i].restaurant_city,
										restaurantZipCode: rows[i].restaurant_zip_code,
										restaurant:{
											name: rows[i].name,
											cuisine: rows[i].cuisine,
											location: rows[i].location,
											logo: rows[i].logo
										}
								};
								orderSummaries.orderSummaries.push(orderSummary);
							} else {
								var orderSummary = {
										id: rows[i].id,
										status: rows[i].status,
										totalValue: rows[i].total_with_tips,
										itemsCount: rows[i].order_items_count,
										deliveryFullName: rows[i].delivery_user_full_name,
										deliveryStreetAddress1: rows[i].delivery_street_address_1,
										deliveryUserPhone: rows[i].delivery_user_phone,
										deliveryStreetAddress2: rows[i].delivery_street_address_2,
										deliveryZipCode: rows[i].delivery_zip_code,
										deliveryAddressDetails: rows[i].delivery_address_details,
										restaurantStreetAddress: rows[i].restaurant_street_address,
										restaurantCity: rows[i].restaurant_city,
										restaurantZipCode: rows[i].restaurant_zip_code,
										restaurant:{
											name: rows[i].name,
											cuisine: rows[i].cuisine,
											location: rows[i].location,
											id: rows[i].restaurantId
										}
								};
								orderSummaries.orderSummaries.push(orderSummary);
							}
						}
					}
					connection.end();
					onSuccess(orderSummaries);
				}
			});
		}
	});
};

//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var getOrderSummariesByDriverAndStatus = function(driverId, statuses, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT o.id, o.placed_at, o.status, o.total_with_tips, o.delivery_user_full_name, o.delivery_street_address_1, o.delivery_city, o.delivery_zip_code, o.delivery_user_phone, o.restaurant_street_address, o.restaurant_city, o.restaurant_zip_code, o.eta,  r.name, r.cuisine, r.location, r.logo, r.id as restaurantId FROM g2g.order o JOIN g2g.restaurant r ON o.restaurant_id = r.id WHERE status IN (?) AND delivery_person_id = ? ORDER BY o.placed_at DESC ', [statuses, driverId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to find orders with driverId " + driverId + " and statuses " + statuses);
					console.log(err);
					onFailure(err);
				} else {
					// no error is thrown
					var orderSummaries = [];
					if (rows.length != 0) {
						// populate the user attributes
						for (var i = 0; i < rows.length; i++) {
							var orderSummary = {
									id: rows[i].id,
									status: rows[i].status,
									totalValue: rows[i].total_with_tips,
									deliveryFullName: rows[i].delivery_user_full_name,
									deliveryStreetAddress1: rows[i].delivery_street_address_1,
									deliveryUserPhone: rows[i].delivery_user_phone,
									deliveryStreetAddress2: rows[i].delivery_street_address_2,
									deliveryZipCode: rows[i].delivery_zip_code,
									deliveryAddressDetails: rows[i].delivery_address_details,
									deliveryCity: rows[i].delivery_city,
									restaurantStreetAddress: rows[i].restaurant_street_address,
									restaurantCity: rows[i].restaurant_city,
									restaurantZipCode: rows[i].restaurant_zip_code,
									eta: rows[i].eta,
									restaurant:{
										name: rows[i].name,
										cuisine: rows[i].cuisine,
										location: rows[i].location,
										id: rows[i].restaurantId
									}
							};
							orderSummaries.push(orderSummary);
						}
					}
					connection.end();
					onSuccess(orderSummaries);
				}
			});
		}
	});
};

//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var getOrderSummariesByStatus = function(statuses, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT o.id, o.placed_at, o.status, o.total_with_tips, o.delivery_user_full_name, o.delivery_street_address_1, o.delivery_user_phone, o.restaurant_street_address, o.restaurant_city, o.restaurant_zip_code, r.name, r.cuisine, r.location, r.logo, count(oi.id) as order_items_count FROM g2g.order o JOIN g2g.restaurant r ON o.restaurant_id = r.id JOIN g2g.order_item oi on oi.order_id = o.id  WHERE status IN (?) GROUP BY o.id, o.status, o.total_with_tips, r.name, r.cuisine, r.location, r.logo ORDER BY o.placed_at DESC ', [statuses], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find order summaries with statuses " + statuses);
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					var orderSummaries = {orderSummaries: []};
					if (rows.length != 0) {
						// populate the user attributes
						for (var i = 0; i < rows.length; i++) {
							var orderSummary = {
									id: rows[i].id,
									status: rows[i].status,
									totalValue: rows[i].total_with_tips,
									itemsCount: rows[i].order_items_count,
									deliveryFullName: rows[i].delivery_user_full_name,
									deliveryStreetAddress1: rows[i].delivery_street_address_1,
									deliveryStreetAddress2: rows[i].delivery_street_address_2,
									deliveryZipCode: rows[i].delivery_zip_code,
									deliveryAddressDetails: rows[i].delivery_address_details,
									deliveryUserFullName: rows[i].delivery_user_full_name,
									deliveryUserPhone: rows[i].delivery_user_phone,
									restaurantStreetAddress: rows[i].restaurant_street_address,
									restaurantCity: rows[i].restaurant_city,
									restaurantZipCode: rows[i].restaurant_zip_code,
									restaurant:{
										name: rows[i].name,
										cuisine: rows[i].cuisine,
										location: rows[i].location,
									}
							};
							orderSummaries.orderSummaries.push(orderSummary);
						}
					}
					connection.end();
					onSuccess(orderSummaries);
				}
			});
		}
	});
};

var orderSearchCriteria = {
		restaurantId: null,
		driverId: null,
		customerName: null,
		customerZipCode: null,
		customerCity: null,
		placedAtRange: {from: null, to: null},
		status: null,
		rating: null,
		onTime: null,
		excludeArchived: null,
};

//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var searchOrders = function(orderSearchCriteria, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			var statement = 'SELECT o.id, o.placed_at, o.delivered_at, o.tips_amount, o.delivery_charge, o.value, o.tax, o.discounts, o.status, o.total_with_tips, o.delivery_user_full_name, o.delivery_street_address_1, o.delivery_street_address_2, o.delivery_zip_code, o.delivery_city, o.restaurant_street_address, o.restaurant_city, o.restaurant_zip_code, o.rating, o.on_time, o.delivery_user_phone, r.name, r.cuisine, r.location, r.logo, dp.full_name, count(oi.id) as order_items_count FROM g2g.order o JOIN g2g.restaurant r ON o.restaurant_id = r.id JOIN g2g.order_item oi on oi.order_id = o.id LEFT OUTER JOIN g2g.delivery_person dp ON o.delivery_person_id = dp.id WHERE o.id > 0';
			var variables = [];
			
			if (orderSearchCriteria != null) {
				
	//			zip code
				if (orderSearchCriteria.customerZipCode != null && orderSearchCriteria.customerZipCode != "") {
					statement += " AND o.delivery_zip_code like '%" + orderSearchCriteria.customerZipCode + "%'";
				}
	//			city
				if (orderSearchCriteria.customerCity != null && orderSearchCriteria.customerCity != "") {
					statement += " AND o.delivery_city like '%" + orderSearchCriteria.customerCity + "%'";
				}
	//			restaurant
				if (orderSearchCriteria.restaurant != null && orderSearchCriteria.restaurant.id != "" && orderSearchCriteria.restaurant.id != 0) {
					statement += " AND r.id = ?";
					variables.push(orderSearchCriteria.restaurant.id);
				}
	//			driver
				if (orderSearchCriteria.driver != null && orderSearchCriteria.driver.id != "" && orderSearchCriteria.driver.id != 0) {
					statement += " AND dp.id = ?";
					variables.push(orderSearchCriteria.driver.id);
				}
	//			status
				if (orderSearchCriteria.status != null && orderSearchCriteria.status.id != "") {
					if (orderSearchCriteria.status.id == 'DELIVERED' && orderSearchCriteria.excludeArchived != null && orderSearchCriteria.excludeArchived == 0) {
						statement += " AND o.status in ('DELIVERED', 'DELIVERED_ARCHIVED')";
					} else if (orderSearchCriteria.status.id == 'REFUNDED' && orderSearchCriteria.excludeArchived != null && orderSearchCriteria.excludeArchived == 0) {
						statement += " AND o.status in ('REFUNDED', 'REFUNDED_ARCHIVED')";
					} else {
						statement += " AND o.status = ?";
						variables.push(orderSearchCriteria.status.id);
					}
				} else {
					if (orderSearchCriteria.excludeArchived != null && orderSearchCriteria.excludeArchived == 1)
						statement += " AND o.status NOT IN ('DELIVERED_ARCHIVED', 'REFUNDED_ARCHIVED')";
				}
	//			fullname
				if (orderSearchCriteria.customerName != null && orderSearchCriteria.customerName != "") {
					statement += " AND o.delivery_user_full_name like '%" + orderSearchCriteria.customerName + "%'";
				}
	//			rating
				if (orderSearchCriteria.rating != null && orderSearchCriteria.rating.id != "") {
					statement += " AND o.rating = ?";
					variables.push(orderSearchCriteria.rating.id);
				}
	//			placed at date
				if (orderSearchCriteria.placedAtRange != null && orderSearchCriteria.placedAtRange.from != null) {
					statement += " AND o.placed_at >= ?";
					variables.push(orderSearchCriteria.placedAtRange.from);
				}
				if (orderSearchCriteria.placedAtRange != null && orderSearchCriteria.placedAtRange.to != null) {
					statement += " AND o.placed_at <= ?";
					variables.push(orderSearchCriteria.placedAtRange.to);
				}
	//			on time
				if (orderSearchCriteria.onTime != null && orderSearchCriteria.onTime == 1) {
					statement += " AND o.on_time = ?";
					variables.push(!orderSearchCriteria.onTime);
				}
				
			}
			
			statement += ' GROUP BY o.id, o.status, o.total_with_tips, r.name, r.cuisine, r.location, r.logo';
			statement += ' ORDER BY o.placed_at DESC';
			// execute the query
			connection.query(statement, variables, function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find order summaries");
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					var orderSummaries = [];
					if (rows.length != 0) {
						// populate the user attributes
						for (var i = 0; i < rows.length; i++) {
							var orderSummary = {
									id: rows[i].id,
									deliveryFullName: rows[i].delivery_user_full_name,
									deliveryStreetAddress1: rows[i].delivery_street_address_1,
									deliveryStreetAddress2: rows[i].delivery_street_address_2,
									deliveryZipCode: rows[i].delivery_zip_code,
									deliveryAddressDetails: rows[i].delivery_address_details,
									deliveryUserFullName: rows[i].delivery_user_full_name,
									deliveryUserPhone: rows[i].delivery_user_phone,
									restaurantStreetAddress: rows[i].restaurant_street_address,
									restaurantCity: rows[i].restaurant_city,
									restaurantZipCode: rows[i].restaurant_zip_code,
									restaurant:{
										name: rows[i].name,
										cuisine: rows[i].cuisine,
										location: rows[i].location,
									},
									driver: rows[i].full_name,
									status: rows[i].status,
									placedAt: rows[i].placed_at,
									deliveredAt: rows[i].delivered_at,
									value: rows[i].value,
									tax: rows[i].tax,
									deliveryCharge: rows[i].delivery_charge,
									discounts: rows[i].discounts,
									tips: rows[i].tips_amount,
									totalValue: rows[i].total_with_tips,
									itemsCount: rows[i].order_items_count,
									onTime: rows[i].on_time,
									rating: rows[i].rating,
							};
							orderSummaries.push(orderSummary);
						}
					}
					connection.end();
					onSuccess(orderSummaries);
				}
			});
		}
	});
};

//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var getPlacedOrdersPlacedBefore = function(datetime, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection"); console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query("SELECT id FROM g2g.order WHERE status = 'PLACED' AND placed_at <= ? ", [datetime], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find placed orders placed before datetime " + datetime); console.log(err); connection.end(); onFailure(err);
				} else {
					var placedOrders = [];
					if (rows.length != 0) {
						for (var i = 0; i < rows.length; i++) {
							placedOrders.push(rows[i].id);
						}
					}
					connection.end();
					onSuccess(placedOrders);
				}
			});
		}
	});
};

var getOverdueUnpickedOrdersStarting = function(datetime, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection"); console.log(err); onFailure(err);
		} else {
			// execute the query
			var now = new Date();
			connection.query("SELECT id FROM g2g.order WHERE status IN ('RECEIVED', 'BEING_PREPARED') AND eta between ? and ? AND  eta is not null", [now, datetime], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find unpicked orders overdue before datetime " + datetime); console.log(err); connection.end(); onFailure(err);
				} else {
					var atRiskOrders = [];
					if (rows.length != 0) {
						for (var i = 0; i < rows.length; i++) {
							atRiskOrders.push(rows[i].id);
						}
					}
					connection.end();
					onSuccess(atRiskOrders);
				}
			});
		}
	});
};


var getOverdueUndeliveredOrdersStarting = function(datetime, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection"); console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query("SELECT id FROM g2g.order WHERE status IN ('RECEIVED', 'BEING_PREPARED', 'PICKED_UP') AND eta <= ? AND eta is not null", [datetime], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find unpicked orders overdue before datetime " + datetime); console.log(err); connection.end(); onFailure(err);
				} else {
					var atRiskOrders = [];
					if (rows.length != 0) {
						for (var i = 0; i < rows.length; i++) {
							atRiskOrders.push(rows[i].id);
						}
					}
					connection.end();
					onSuccess(atRiskOrders);
				}
			});
		}
	});
};
//calls the onSuccess with a list of OrderSummary
//calls the onFailure with an err object in case of technical error
var getOrderSummariesCountByStatus = function(statuses, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT count(id) as count FROM g2g.order WHERE status IN (?)', [statuses], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to count order summaries with statuses " + statuses);
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.end();
					onSuccess(rows[0].count);
				}
			});
		}
	});
};

//calls the onSuccess with a string
//calls the onFailure with an err object in case of technical error
var getOrderStatusById = function(orderId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT status FROM g2g.order WHERE id = ?', [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find an order with id " + orderId);
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						var orderStatus = rows[0].status;
						connection.end();
						onSuccess(orderStatus);
					} else {
						connection.end();
						onFailure("No order found with ID: " + orderId);
					}
				}
			});
		}
	});
};

var getOrderById = function(orderId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT o.*, d.full_name, d.phone, r.name, r.street_address, r.zip_code FROM g2g.order o JOIN g2g.restaurant r ON r.id = o.restaurant_id LEFT OUTER JOIN g2g.delivery_person d ON o.delivery_person_id = d.id  WHERE o.id = ?', [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find an order with id " + orderId);
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					if (rows.length != 0) {
						var order = {
							id: rows[0].id,
							status: rows[0].status,
							placedAt: rows[0].placed_at,
							pickedUpAt: rows[0].picked_up_at,
							deliveredAt: rows[0].delivered_at,
							value: rows[0].value,
							tax: rows[0].tax,
							discounts: rows[0].discounts,
							deliveryCharge: rows[0].delivery_charge,
							totalWithoutTips: rows[0].total_without_tips,
							tipsPercent: rows[0].tips_percent,
							tipsAmount: rows[0].tips_amount,
							totalWithTips: rows[0].total_with_tips,
							specialInstructions: rows[0].special_instructions,
							deliveryStreetAddress1: rows[0].delivery_street_address_1,
							deliveryStreetAddress2: rows[0].delivery_street_address_2,
							deliveryCity: rows[0].delivery_city,
							deliveryState: rows[0].delivery_state,
							deliveryZipCode: rows[0].delivery_zip_code,
							deliveryAddressDetails: rows[0].delivery_address_details,
							deliveryUserFullName: rows[0].delivery_user_full_name,
							deliveryUserPhone: rows[0].delivery_user_phone,
							deliveryUserEmail: rows[0].delivery_user_email,
							restaurantStreetAddress: rows[0].restaurant_street_address,
							restaurantCity: rows[0].restaurant_city,
							restaurantZipCode: rows[0].restaurant_zip_code,
							chargeId: rows[0].payment_charge_id,
							userId: rows[0].user_id,
							restaurantId: rows[0].restaurant_id,
							driverId: rows[0].delivery_person_id,
							paymentTokenId: rows[0].payment_token_id,
							rating: rows[0].rating,
							eta: rows[0].eta,
							onTime: rows[0].on_time,
							etaMessage: rows[0].eta_message,
							appVersion: rows[0].app_version,
							promotionId: rows[0].promotion_id,
							restaurant: {
								id: rows[0].restaurant_id,
								name: rows[0].name,
								zipCode: rows[0].zip_code,
								streetAddress: rows[0].street_address
								},
							driver: {
								id: rows[0].delivery_person_id,
								fullName: rows[0].full_name,
								phone: rows[0].phone
							},
							items: []
						};
						// get the items of the order
						connection.query('SELECT oi.*, rmci.name, rmc.name as category_name FROM g2g.order_item oi JOIN g2g.restaurant_menu_category_item rmci ON oi.restaurant_menu_category_item_id = rmci.id JOIN g2g.restaurant_menu_category rmc ON rmci.restaurant_menu_category_id = rmc.id WHERE oi.order_id = ?', [orderId], function(itemsErr, itemsRows) {
							// if an error is thrown, end the connection and throw an error
							if (itemsErr) {
								console.log("An error occurred while trying to find the items of order with id " + orderId);
								console.log(itemsErr);
								connection.end();
								onFailure(itemsErr);
							} else {
								
								for (var i = 0; i < itemsRows.length; i++) {
									var item = {
										id: itemsRows[i].id,
										name: itemsRows[i].name,
										price: itemsRows[i].price,
										specialInstructions: itemsRows[i].special_instructions,
										sides: itemsRows[i].sides,
										quantity: itemsRows[i].quantity,
										categoryName: itemsRows[i].category_name
									};
									order.items.push(item);
								}
								connection.end();
								onSuccess(order);
							}
						});
					} else {
						connection.end();
						onSuccess(null);
					}
				}
			});
		}
	});
};


var getOrdersByUserId = function(userId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.order WHERE user_id = ?', [userId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					console.log("An error occurred while trying to find orders for user id " + userId);
					console.log(err);
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					var orders = [];
					for (var i = 0; i < rows.length; i++) {
						var order = {
							id: rows[i].id,
							status: rows[i].status,
							placedAt: rows[i].placed_at,
							pickedUpAt: rows[i].picked_up_at,
							deliveredAt: rows[i].delivered_at,
							value: rows[i].value,
							tax: rows[i].tax,
							discounts: rows[i].discounts,
							deliveryCharge: rows[i].delivery_charge,
							totalWithoutTips: rows[i].total_without_tips,
							tipsPercent: rows[i].tips_percent,
							tipsAmount: rows[i].tips_amount,
							totalWithTips: rows[i].total_with_tips,
							specialInstructions: rows[i].special_instructions,
							deliveryStreetAddress1: rows[i].delivery_street_address_1,
							deliveryStreetAddress2: rows[i].delivery_street_address_2,
							deliveryCity: rows[i].delivery_city,
							deliveryState: rows[i].delivery_state,
							deliveryZipCode: rows[i].delivery_zip_code,
							deliveryAddressDetails: rows[i].delivery_address_details,
							deliveryUserFullName: rows[i].delivery_user_full_name,
							deliveryUserPhone: rows[i].delivery_user_phone,
							deliveryUserEmail: rows[i].delivery_user_email,
							restaurantStreetAddress: rows[i].restaurant_street_address,
							restaurantCity: rows[i].restaurant_city,
							restaurantZipCode: rows[i].restaurant_zip_code,
							userId: rows[i].user_id,
							restaurantId: rows[i].restaurant_id,
							driverId: rows[i].delivery_person_id,
							rating: rows[i].rating,
							eta: rows[i].eta,
							onTime: rows[i].on_time,
							etaMessage: rows[i].eta_message,
							appVersion: rows[i].app_version,
							promotionId: rows[0].promotion_id,
							items: []
						};
						orders.push(order);
					}
					connection.end();
					onSuccess(orders);
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var modifyOrderStatusById = function(orderId, status, statusDates, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = 'UPDATE g2g.order SET status = ' + connection.escape(status);
			
			if (statusDates.deliveredAt) {
				statement += ', delivered_at = ' + connection.escape(statusDates.deliveredAt);
			}
			if (statusDates.pickedUpAt) {
				statement += ', picked_up_at = ' + connection.escape(statusDates.pickedUpAt);
			}
			
			statement += ' WHERE id = ?';
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to update an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var modifyOrderDriverById = function(orderId, driverId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = 'UPDATE g2g.order SET delivery_person_id = ' + connection.escape(driverId);
			statement += ' WHERE id = ?';
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to update an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var modifyOrderRating = function(orderId, rating, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = 'UPDATE g2g.order SET rating = ' + connection.escape(rating);
			statement += ' WHERE id = ?';
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to rate an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

//calls the onSuccess
//calls the onFailure with an err object in case of technical error
var modifyOrderETA = function(orderId, eta, etaMessage, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = "UPDATE g2g.order SET eta = " + connection.escape(eta) + ", eta_message = " + connection.escape(etaMessage) + ", on_time = 0";
			statement += " WHERE id = ?";
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to modify the ETA an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

var modifyOrderETAMessage = function(orderId, etaMessage, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = "UPDATE g2g.order SET eta_message = " + connection.escape(etaMessage);
			statement += " WHERE id = ?";
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to modify the ETA message an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

var modifyOrderRestaurantAddress = function(orderId, newRestaurantStreetAddress, newRestaurantCity, newRestaurantZipCode, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			var statement = "UPDATE g2g.order SET restaurant_street_address = " + connection.escape(newRestaurantStreetAddress)
			 + ", restaurant_city = " + connection.escape(newRestaurantCity)
			 + ", restaurant_zip_code = " + connection.escape(newRestaurantZipCode);
			statement += " WHERE id = ?";
			connection.query(statement, [orderId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
//				connection.end();
				if (err) {
					console.log("An error occurred while trying to modify the restaurant address of an order with id " + orderId);
					console.log(err);
					connection.rollback();
					connection.end();
					onFailure(err);
				} else {
					// no error is thrown
					connection.commit();
					connection.end();
					onSuccess();
				}
			});
		}
	});
};

exports.createNewOrder = createNewOrder;
exports.getOrderSummariesByUserAndStatus = getOrderSummariesByUserAndStatus;
exports.getOrderSummariesByStatus = getOrderSummariesByStatus;
exports.getOrderSummariesCountByStatus = getOrderSummariesCountByStatus;
exports.getOrderStatusById = getOrderStatusById;
exports.modifyOrderStatusById = modifyOrderStatusById;
exports.getOrderById = getOrderById;
exports.getOrdersByUserId = getOrdersByUserId;
exports.modifyOrderDriverById = modifyOrderDriverById;
exports.modifyOrderRating = modifyOrderRating;
exports.modifyOrderETA = modifyOrderETA;
exports.modifyOrderETAMessage = modifyOrderETAMessage;
exports.getPlacedOrdersPlacedBefore = getPlacedOrdersPlacedBefore;
exports.getOverdueUnpickedOrdersStarting = getOverdueUnpickedOrdersStarting;
exports.getOverdueUndeliveredOrdersStarting = getOverdueUndeliveredOrdersStarting;
exports.searchOrders = searchOrders;
exports.getOrderSummariesByDriverAndStatus = getOrderSummariesByDriverAndStatus;
exports.modifyOrderRestaurantAddress = modifyOrderRestaurantAddress;