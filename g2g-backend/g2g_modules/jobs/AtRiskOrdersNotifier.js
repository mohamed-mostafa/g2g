/**
 * Checks if there are orders that are not in the 'PICKED_UP' state and their ETA is withing the next 5 minutes
 */

var g2gOrdersBusiness = require("../business/g2g_orders_business.js");
var g2gNotificationsBusiness = require("../business/g2g_notifications_business.js");

var execute = function() {
	var interval = setInterval(repetableFunction, 5 * 60 * 1000); // every 5 minutes
};

var repetableFunction = function() {
	var minutesInTheFuture = new Date(new Date().getTime() + (10 * 60 * 1000));
	g2gOrdersBusiness.getAtRiskOrders(minutesInTheFuture, handleOverdueUnpickedOrdersFound, handleOverdueUnpickedOrdersError)
};

var handleOverdueUnpickedOrdersFound = function(orders) {
	if (orders.length == 0) {
		// do nothing
		console.log("No at-risk orders");
	} else {
		// notify that there're are X number of unhandled placed orders
		console.log("Notifying " + orders.length + " at risk orders");
		g2gNotificationsBusiness.notifyAtRiskOrders(orders);
	}
};

var handleOverdueUnpickedOrdersError = function(err) {
	console.log("The overdueUnpickedOrdersNotifier is unable to query for overdue unpicked orders");
};

exports.execute = execute;