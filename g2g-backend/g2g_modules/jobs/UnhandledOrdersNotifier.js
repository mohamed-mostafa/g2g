/**
 * Checks if there are orders that are in the 'PLACED' state for more than 5 minutes
 */

var g2gOrdersBusiness = require("../business/g2g_orders_business.js");
var g2gNotificationsBusiness = require("../business/g2g_notifications_business.js");

var execute = function() {
	var interval = setInterval(repetableFunction, 5 * 60 * 1000); // every 5 minutes
};

var repetableFunction = function() {
	var fiveMinutesAgo = new Date(new Date().getTime() - (5 * 60 * 1000));
	g2gOrdersBusiness.getPlacedOrdersPlacedBefore(fiveMinutesAgo, handleUnnoticedPlacedOrdersFound, handleUnnoticedPlacedOrdersError)
};

var handleUnnoticedPlacedOrdersFound = function(orders) {
	if (orders.length == 0) {
		// do nothing
		console.log("No unhandled orders");
	} else {
		// notify that there're are X number of unhandled placed orders
		console.log("Notifying " + orders.length + " unhandled orders");
		g2gNotificationsBusiness.notifyUnhandledPlacedOrders(orders);
	}
};

var handleUnnoticedPlacedOrdersError = function(err) {
	console.log("The unnoticedPlacedOrdersNotifier is unable to query for pending, unhandled placed orders");
};

exports.execute = execute;