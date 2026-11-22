/**
 * 
 */

var dt = require('datetimejs');

var g2gSMSAdapter = require('../adapters/g2g_sms_adapter.js');
var g2gEmailAdapter = require('../adapters/g2g_email_adapter.js');
var g2gPushNotificationsAdapter = require('../adapters/g2g_push_notifications_adapter.js');
var g2gConfigurationsBusiness = require('./g2g_configurations_business.js');
var g2gOrdersBusiness = require('./g2g_orders_business.js');



var notifyNewOrderReceived = function(orderId) {
	g2gOrdersBusiness.getOrderById(orderId, function(order) {
		// get some configurations ... (phone numbers for sms and email notifications)
		g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
			var sms = "G2G has a new order!\r\n" +
					"ID: " + order.id +
					"\r\nCustomer: " + order.deliveryUserFullName +
					"\r\nRestaurant: " + order.restaurant.name +
					"\r\nTime: " + dt.strftime(order.placedAt, '%Y-%m-%d - %H:%M:%S%z');
			
			var emailBody = "<h3>A new order is placed at G2G!</h3>" +
					"<br><b>ID:</b> " + order.id +
					"<br><b>Time:</b> " + dt.strftime(order.placedAt, '%Y-%m-%d - %H:%M:%S%z') +
					"<br><b>Customer:</b> " + order.deliveryUserFullName +
					"<br><b>Restaurant:</b> " + order.restaurant.name;
			
			emailBody += "<br><br><b>Items:</b><br>";
			
			for (var i = 0; i < order.items.length; i++) {
				emailBody += "<br>&nbsp;&nbsp;- " + order.items[i].quantity + " x " + order.items[i].name + " (" + order.items[i].categoryName + ")";
				if (order.items[i].sides != null && order.items[i].sides != "") {
					emailBody += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- Sides: " + order.items[i].sides;
				}
				if (order.items[i].specialInstructions != null && order.items[i].specialInstructions != "") {
					emailBody += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- Special Instructions: " + order.items[i].specialInstructions;
				}
				emailBody += "<br>-----------------------------------------------------------";
			}
			emailBody += "<br><br><b>From: </b>" + order.restaurant.name + ", " + order.restaurant.streetAddress + ", " + order.restaurant.zipCode;
			
			emailBody += "<br><br><b>To :</b>" + order.deliveryUserFullName;
			emailBody += "<br>" + order.deliveryStreetAddress1;
			if (order.deliveryStreedAddress2 != null && order.deliveryStreetAddress2 != "") emailBody += "<br>" + order.deliveryStreetAddress2;
			emailBody += ", " + order.deliveryZipCode;
			if (order.deliveryAddressDetails != null && order.deliveryAddressDetails != "") emailBody += "<br>" + order.deliveryAddressDetails;
			emailBody += " (" + order.deliveryUserPhone + ")";
			// send email
			g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", "Order: " + order.id + " is placed at G2G!", emailBody);
			// send SMS
			g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, sms, function(response) {
				console.log("New order received. Notification SMS Sent");
				console.log(JSON.stringify(response));
			}, function(err) {
				console.log("New order received. Notification SMS Failed to send");
				console.log(JSON.stringify(err));
			});
		}, function(err) {
			console.log("An error occured while notifying users of a new order");
			console.log(err);
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new order");
		console.log(err);
	});
	
};


var notifyNewMessageFromUnknownSourceReceived = function(identifier, body) {
	// get some configurations ... (phone numbers for sms and email notifications)
	g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
		var notificationSMSBody = "A new message is sent to G2G!\r\nFrom: " + identifier + "\r\n" + body;
		var notificationEmailBody = "A new message is sent to G2G!<br/>From: " + identifier + "<br/> " + body;
		// send email
		g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", "A new message is sent to G2G!", notificationEmailBody);
		// send SMS
		g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, notificationSMSBody, function(response) {
			console.log("New message received. Notification SMS Sent");
			console.log(JSON.stringify(response));
		}, function(err) {
			console.log("New message received. Notification SMS Failed to send");
			console.log(JSON.stringify(err));
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new message");
		console.log(err);
	});
};


var notifyNewMessageFromKnownUserReceived = function(user, subject, body) {
	// get some configurations ... (phone numbers for sms and email notifications)
	g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
		var notificationSMSBody = user.firstName + " " + user.lastName + " sent a message to G2G!\r\nSubject: " + subject + "\r\n" + body;
		var notificationEmaiBody = user.firstName + " " + user.lastName + " sent a message to G2G!<br/>Subject: " + subject + "<br/>" + body;
		// send email
		g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", user.firstName + " " + user.lastName + " sent a message to G2G!", notificationEmaiBody);
		// send SMS
		g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, notificationSMSBody, function(response) {
			console.log("New message received. Notification SMS Sent");
			console.log(JSON.stringify(response));
		}, function(err) {
			console.log("New message received. Notification SMS Failed to send");
			console.log(JSON.stringify(err));
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new message");
		console.log(err);
	});
};


var notifyUnhandledPlacedOrders = function(orderIds) {
	// get some configurations ... (phone numbers for sms and email notifications)
	g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
		var notificationSMSBody = "URGENT: G2G has " + orderIds.length + " unhandled orders.\r\nUnhandled orders are orders that are placed more than 5 minutes ago and are not yet received.\r\nOrders: " + orderIds;
		var notificationEmaiBody = "URGENT: G2G has " + orderIds.length + " unhandled orders<br/>Unhandled orders are orders that are placed more than 5 minutes ago and are not yet received.<br/>Orders: " + orderIds;
		// send email
		g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", "URGENT: G2G has " + orderIds.length + " unhandled orders", notificationEmaiBody);
		// send SMS
		g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, notificationSMSBody, function(response) {
			console.log("New message received. Notification SMS Sent");
			console.log(JSON.stringify(response));
		}, function(err) {
			console.log("New message received. Notification SMS Failed to send");
			console.log(JSON.stringify(err));
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new message");
		console.log(err);
	});
};


var notifyAtRiskOrders = function(orderIds) {
	// get some configurations ... (phone numbers for sms and email notifications)
	g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
		var notificationSMSBody = "URGENT: G2G has " + orderIds.length + " at-risk orders.\r\nAt-Risk orders are orders whose ETA is in 10 minutes, and are not picked-up yet.\r\nOrders: " + orderIds;
		var notificationEmaiBody = "URGENT: G2G has " + orderIds.length + " at-risk orders.<br/>At-Risk orders are orders whose ETA is in 10 minutes, and are not picked-up yet.<br/>Orders: " + orderIds;
		// send email
		g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", "URGENT: G2G has " + orderIds.length + " at-risk orders", notificationEmaiBody);
		// send SMS
		g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, notificationSMSBody, function(response) {
			console.log("New message received. Notification SMS Sent");
			console.log(JSON.stringify(response));
		}, function(err) {
			console.log("New message received. Notification SMS Failed to send");
			console.log(JSON.stringify(err));
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new message");
		console.log(err);
	});
};


var notifyOverdueOrders = function(orderIds) {
	// get some configurations ... (phone numbers for sms and email notifications)
	g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurationObject) {
		var notificationSMSBody = "URGENT: G2G has " + orderIds.length + " overdue orders\r\nOverdue orders are orders whose ETA has passed.\r\nOrders: " + orderIds;
		var notificationEmaiBody = "URGENT: G2G has " + orderIds.length + " overdue orders<br/>Overdue orders are orders whose ETA has passed.<br/>Orders: " + orderIds;
		// send email
		g2gEmailAdapter.sendEmail(configurationObject.notificationEmails, "G2G Notifications <notifications@g2gapp.net>", "URGENT: G2G has " + orderIds.length + " overdue orders", notificationEmaiBody);
		// send SMS
		g2gSMSAdapter.sendSMS(configurationObject.notificationNumbers, notificationSMSBody, function(response) {
			console.log("New message received. Notification SMS Sent");
			console.log(JSON.stringify(response));
		}, function(err) {
			console.log("New message received. Notification SMS Failed to send");
			console.log(JSON.stringify(err));
		});
	}, function(err) {
		console.log("An error occured while notifying users of a new message");
		console.log(err);
	});
};

var notifyAllG2GCustomers = function(message, onSuccess, onFailure) {
	g2gPushNotificationsAdapter.sendNotification(message, "customer", null, onSuccess, onFailure);
};
var notifyG2GCustomer = function(message, userEmailAddress, onSuccess, onFailure) {
	g2gPushNotificationsAdapter.sendNotification(message, "customer", userEmailAddress, onSuccess, onFailure);
};
var notifyAllG2GDrivers = function(message, onSuccess, onFailure) {
	g2gPushNotificationsAdapter.sendNotification(message, "driver", null, onSuccess, onFailure);
};
var notifyG2GDriver = function(message, driverUsername, onSuccess, onFailure) {
	g2gPushNotificationsAdapter.sendNotification(message, "driver", driverUsername, onSuccess, onFailure);
};
var notifyAllAnonymousG2GCustomers = function(message, onSuccess, onFailure) {
	g2gPushNotificationsAdapter.sendNotification(message, "customer", "anonymous", onSuccess, onFailure);
};

exports.notifyAllAnonymousG2GCustomers = notifyAllAnonymousG2GCustomers;
exports.notifyAllG2GCustomers = notifyAllG2GCustomers;
exports.notifyG2GCustomer = notifyG2GCustomer;

exports.notifyAllG2GDrivers = notifyAllG2GDrivers;
exports.notifyG2GDriver = notifyG2GDriver;

exports.notifyNewOrderReceived = notifyNewOrderReceived;
exports.notifyNewMessageFromKnownUserReceived = notifyNewMessageFromKnownUserReceived;
exports.notifyNewMessageFromUnknownSourceReceived = notifyNewMessageFromUnknownSourceReceived;
exports.notifyUnhandledPlacedOrders = notifyUnhandledPlacedOrders;
exports.notifyAtRiskOrders = notifyAtRiskOrders;
exports.notifyOverdueOrders = notifyOverdueOrders;