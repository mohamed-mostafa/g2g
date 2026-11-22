var g2gOrdersBusiness = require('../business/g2g_orders_business.js');

var placeOrder = function(req, res) {	
	try {
		var order = req.body.order;
		order.appVersion = 1;
		console.log("A new order was placed, App-version : " + app_version);
		// call the business function and give it a callback function 
		g2gOrdersBusiness.placeOrder(order, function(order) {
			res.json({order: order});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(userErrorMessage) {
			res.status(500).send(userErrorMessage);
		});
	} catch (error) {
		console.log("An error occured in /order/place");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var valuateOrder = function(req, res) {
	try {
		var order = req.body.order;
		g2gOrdersBusiness.valuateOrder(order, function(valuatedOrder, valuationMessage, user) {
			res.json({valuatedOrder: valuatedOrder, user: user, valuationMessage: valuationMessage});
		}, function(error) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/valuate");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var placeOrderV2 = function(req, res) {	
	// overriding the original version at the web server level, to differentiate between the stripe errors (now coded 402) and the normal errors (still coded 500)
	try {
		var order = req.body.order;
		var app_version = req.headers["g2g-version"];
		order.appVersion = app_version;
		
		// call the business function and give it a callback function
		g2gOrdersBusiness.placeOrder(order, function(order) {
			res.json({order: order});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(userErrorMessage) {
			res.status(402).send(userErrorMessage);
		});
	} catch (error) {
		console.log("An error occured in v2/order/place");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var rateOrder = function(req, res) {	
	try {
		var orderId = req.body.orderId;
		var rating = req.body.rating;
		
		// call the business function and give it a callback function
		g2gOrdersBusiness.rateOrder(orderId, rating, function() {
			res.end();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/rating");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var addTimeToOrderETA = function(req, res) {	
	try {
		var orderId = req.body.orderId;
		var minutes = req.body.minutes;
		var message = req.body.message;
		
		// call the business function and give it a callback function
		g2gOrdersBusiness.addTimeToETA(orderId, minutes, message, function() {
			res.end();
		},
		function(error) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/eta");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var modifyOrderRestaurantAddress = function(req, res) {	
	try {
		var orderId = req.body.orderId;
		var newRestaurantStreetAddress = req.body.newRestaurantStreetAddress;
		var newRestaurantCity = req.body.newRestaurantCity;
		var newRestaurantZipCode = req.body.newRestaurantZipCode;
		
		// call the business function and give it a callback function
		g2gOrdersBusiness.modifyOrderRestaurantAddress(orderId, newRestaurantStreetAddress, newRestaurantCity, newRestaurantZipCode, function() {
			res.end();
		},
		function(error) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/:id/restaurantaddress");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getPendingOrderSummariesByUserId = function(req, res) {	
	try {
		var userId = req.params.userId;
		var includeLogos = true;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getPendingOrderSummaries(userId, function(orderSummaries) {
			res.json({pendingOrders: orderSummaries.orderSummaries});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, includeLogos);
	} catch (error) {
		console.log("An error occured in /order/pending");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getUndeliveredOrdersByDriver = function(req, res) {
	try {
		var driverId = req.params.driverId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getUndeliveredOrdersByDriver(driverId, function(orderSummaries) {
			res.json(orderSummaries);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /orders/assignedundelivered");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
}

var getInProgressOrderSummariesByUserId = function(req, res) {	
	try {
		var userId = req.params.userId;
		var includeLogos = false;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getInProgressOrderSummariesByUserId(userId, function(orderSummaries) {
			res.json(orderSummaries.orderSummaries);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, includeLogos);
	} catch (error) {
		console.log("An error occured in /order/inprogress");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getPendingOrderSummariesV2 = function(req, res) {	
	try {
		var userId = req.params.userId;
		var includeLogos = false;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getPendingOrderSummaries(userId, function(orderSummaries) {
			res.json({pendingOrders: orderSummaries.orderSummaries});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, includeLogos);
	} catch (error) {
		console.log("An error occured in /v2/order/pending/:userId");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getOrderStatusById = function(req, res) {
	try {
		var orderId = req.params.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getOrderStatusById(orderId, function(status) {
			res.json({status: status});
		},
		function(error){
			console.log(error);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getOrderById = function(req, res) {
	try {
		var orderId = req.params.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getOrderById(orderId, function(order) {
			res.json(order);
		},
		function(error){
			console.log(error);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var assignDriverToOrder = function(req, res) {
	try {
		var orderId = req.params.orderId;
		var driverId = req.body.driverId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.assignDriverToOrder(orderId, driverId, function() {
			res.json();
		},
		function(error){
			console.log(error);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order:orderId/driver");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var refundOrder = function(req, res) {
	try {
		var orderId = req.params.orderId;
		var refundReason = req.body.refundReason;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.refundOrder(orderId, refundReason, function() {
			res.json();
		},
		function(error){
			console.log(error);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		},
		function(userErrorMessage) {
			res.status(500).send(userErrorMessage);
		});
	} catch (error) {
		console.log("An error occured in /order:orderId/driver");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getCompletedOrderSummariesCount = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getCompletedOrderSummariesCount(function(count) {
			res.json({count: count});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/delivered/count");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getInProgressOrderSummariesCount = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getInProgressOrderSummariesCount(function(count) {
			res.json({count: count});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/inprogress/count");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getPlacedOrderSummariesCount = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getPlacedOrderSummariesCount(function(count) {
			res.json({count: count});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/placed/count");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getPlacedOrderSummaries = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getPlacedOrderSummaries(
			function(orderSummaries) {
				res.json(orderSummaries.orderSummaries);
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/placed");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getCompletedOrderSummaries = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getCompletedOrderSummaries(
			function(orderSummaries) {
				res.json(orderSummaries.orderSummaries);
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/delivered");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getInProgressOrderSummaries = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gOrdersBusiness.getInProgressOrderSummaries(
			function(orderSummaries) {
				res.json(orderSummaries.orderSummaries);
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/status/inprogress");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderBeingPrepared = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderBeingPrepared(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/beingprepared");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderReceived = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderReceived(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/received");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderPickedUp = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderPickedUp(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/pickedup");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderDelivered = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderDelivered(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/delivered");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderArchived = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderArchived(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/archive");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderUnArchived = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderUnArchived(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/unarchive");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markOrderPlaced = function(req, res) {
	try {
		var orderId = req.body.orderId;
		// call the business function and give it a callback function 
		g2gOrdersBusiness.markOrderPlaced(orderId,
			function() {
				res.json();
			},
			function(error){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /order/ststus/placed");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var searchOrders = function(req, res) {
	var searchCriteria = req.body.searchCriteria;
	g2gOrdersBusiness.searchOrders(searchCriteria,function(orders) {
		res.json(orders);
	}, function(err) {
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
	});
};

var searchAndExport = function(req, res) {
	var searchCriteriaString = req.query.searchCriteria;
	var searchCriteria = JSON.parse(searchCriteriaString);
	g2gOrdersBusiness.searchOrders(searchCriteria,function(orders) {
		for (var i = 0; i < orders.length; i++) {
			delete(orders[i].deliveryStreetAddress1);
			delete(orders[i].deliveryStreetAddress2);
			delete(orders[i].deliveryAddressDetails);
			delete(orders[i].deliveryUserFullName);
			orders[i].restaurant = orders[i].restaurant.name;
		}
		res.xls("Orders.xlsx", orders);
	}, function(err) {
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
	});
};


exports.placeOrder = placeOrder;
exports.valuateOrder = valuateOrder;
exports.placeOrderV2 = placeOrderV2;
exports.rateOrder = rateOrder;
exports.addTimeToOrderETA = addTimeToOrderETA;
exports.getPendingOrderSummariesByUserId = getPendingOrderSummariesByUserId;
exports.getInProgressOrderSummariesByUserId = getInProgressOrderSummariesByUserId;
exports.getPendingOrderSummariesV2 = getPendingOrderSummariesV2;
exports.getOrderStatusById = getOrderStatusById;
exports.getOrderById = getOrderById;
exports.assignDriverToOrder = assignDriverToOrder;
exports.refundOrder = refundOrder;
exports.getCompletedOrderSummariesCount = getCompletedOrderSummariesCount;
exports.getInProgressOrderSummariesCount = getInProgressOrderSummariesCount;
exports.getPlacedOrderSummariesCount = getPlacedOrderSummariesCount;
exports.getPlacedOrderSummaries = getPlacedOrderSummaries;
exports.getCompletedOrderSummaries = getCompletedOrderSummaries;
exports.getInProgressOrderSummaries = getInProgressOrderSummaries;
exports.markOrderBeingPrepared = markOrderBeingPrepared;
exports.markOrderReceived = markOrderReceived;
exports.markOrderPickedUp = markOrderPickedUp;
exports.markOrderDelivered = markOrderDelivered;
exports.markOrderArchived = markOrderArchived;
exports.markOrderUnArchived = markOrderUnArchived;
exports.markOrderPlaced = markOrderPlaced;
exports.searchOrders = searchOrders;
exports.searchAndExport = searchAndExport;
exports.getUndeliveredOrdersByDriver = getUndeliveredOrdersByDriver;
exports.modifyOrderRestaurantAddress = modifyOrderRestaurantAddress;