/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gOrdersDao = require('../dataaccess/g2g_orders_dao.js');
var g2gUsersBusiness = require("./g2g_users_business.js");
var g2gPaymentAdapter = require('../adapters/g2g_payment_adapter.js');
var g2gNotificationsBusiness = require('./g2g_notifications_business.js');
var g2gDriversBusiness = require('./g2g_drivers_business.js');
var g2gConfigurationsBusiness = require('./g2g_configurations_business.js');
var g2gPromotionsBusiness = require('../business/g2g_promotions_business.js');

var orderDeliveryTimeInMinutes = 60;

//calls the onSuccess with a user object if the user was successfully created
var placeOrder = function(order, onSuccess, onFailure, onUserError) {
	// calculate the exact order value in cents
	var orderValueInCents = Math.floor(order.totalWithTips * 100);
	// charge the credit card using the token that was prepared using stripe.js ... and retrieve the chargeId
	// send the invoice to the user's email address
	
	// comment the next 2 lines for testing
	g2gPaymentAdapter.chargeCreditCard(order.paymentTokenId, orderValueInCents, order.deliveryUserEmailAddress, function(paymentCharge) { // success
		order.paymentChargeId = paymentCharge.id;  // capture the charge id
		// amount charged successfully
		// insert the order in our database
		order.placedAt = new Date();
		var eta = new Date(order.placedAt.getTime() + 45 * 60 * 1000); // eta is after 60 minutes
		order.eta = eta;
		order.rating = 0;
		order.etaMessage = "Expected to arrive on time";
		order.status = "PLACED";
		g2gOrdersDao.createNewOrder(order, function(order) {
			// after an order is placed, we update some properties in the user profile
			g2gUsersBusiness.updateUserProfileAfterPlacingAnOrder(order.userId, onSuccess, onFailure);
			
			// async - Mark promotion consumed, if exists
			g2gPromotionsBusiness.consumePromotionByUser(order.userId, order.promotionId, function() {}, function(error) {console.log(error)});
			
			// async - Notify
			g2gNotificationsBusiness.notifyNewOrderReceived(order.id);
			
		}, function(err) {
			// respond to caller
			console.log("An error occured while saving order to DB");
			console.log(err);
			onFailure(err);
		});
	}, function(err) { // technical error
		onFailure(err);
	}, function(userErrorMessage) {
		onUserError(userErrorMessage);
	});
};

var refundOrder = function(orderId, refundReason, onSuccess, onFailure, onUserError) {
	// get the order itself
	getOrderById(orderId, function(order) {
		// order retrieved
		// charge the credit card using the token that was prepared using stripe.js ... and retrieve the chargeId
		g2gPaymentAdapter.refundCreditCard(order.chargeId, function(refund) { // success
			// amount refunded successfully
			// mark the order as refunded
			markOrderRefunded(orderId, function() {
				// when the order is successfully refunded, update the count of orders
				g2gUsersBusiness.updateUserProfileAfterRefundingAnOrder(order.userId, function() {
					// when this update is also done, update
					g2gOrdersDao.modifyOrderETAMessage(orderId, refundReason, onSuccess, onFailure);
					
					// async
					g2gPromotionsBusiness.unconsumePromotionByUser(order.userId, order.promotionId, function() {}, function(error) {console.log(error)});
					
				}, onFailure);
			}, onFailure);
		}, function(err) { // technical error
			onFailure(err);
		}, function(userErrorMessage) {
			onUserError(userErrorMessage);
		});
	}, onFailure);
};

var getOrderById = function(orderId, onSuccess, onFailure) {
	g2gOrdersDao.getOrderById(orderId, onSuccess, onFailure);
};

var getOrdersByUserId = function(userId, onSuccess, onFailure) {
	g2gOrdersDao.getOrdersByUserId(userId, onSuccess, onFailure);
};

var getPendingOrderSummaries = function(userId, onSuccess, onFailure, includeLogos) { // 'pending' orders at the customre app are his orders that aren't archived
	var statuses = ['PLACED', 'RECEIVED', 'BEING_PREPARED', 'PICKED_UP', 'DELIVERED', 'REFUNDED']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesByUserAndStatus(userId, statuses, onSuccess, onFailure, includeLogos);
};
var getInProgressOrderSummariesByUserId = function(userId, onSuccess, onFailure, includeLogos) { // 'in progress' orders at the customre app are his orders that are currently running
	var statuses = ['PLACED', 'RECEIVED', 'BEING_PREPARED', 'PICKED_UP']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP
	g2gOrdersDao.getOrderSummariesByUserAndStatus(userId, statuses, onSuccess, onFailure, includeLogos);
};
var getCompletedOrderSummaries = function(onSuccess, onFailure) { // 'completed' orders at the admin app are all orders that are delivered
	var statuses = ['DELIVERED', 'REFUNDED', 'DELIVERED_ARCHIVED', 'REFUNDED_ARCHIVED']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesByStatus(statuses, onSuccess, onFailure);
};
var getPlacedOrderSummaries = function(onSuccess, onFailure) { // 'completed' orders at the admin app are all orders that are delivered
	var statuses = ['PLACED']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesByStatus(statuses, onSuccess, onFailure);
};
var getInProgressOrderSummaries = function(onSuccess, onFailure) { // 'in proress' orders at the admin app are all orders that are currently running
	var statuses = ['RECEIVED', 'BEING_PREPARED', 'PICKED_UP']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesByStatus(statuses, onSuccess, onFailure);
};
var getPlacedOrderSummariesCount = function(onSuccess, onFailure) {
	var statuses = ['PLACED']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesCountByStatus(statuses, onSuccess, onFailure);
};
var getInProgressOrderSummariesCount = function(onSuccess, onFailure) { // 'in progress' orders at the admin app are all orders that are being prepared or picked up
	var statuses = ['RECEIVED', 'BEING_PREPARED', 'PICKED_UP']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesCountByStatus(statuses, onSuccess, onFailure);
};
var getCompletedOrderSummariesCount = function(onSuccess, onFailure) { // 'completed' orders at the admin app are all orders that are delivered but not yet archived
	var statuses = ['DELIVERED', 'REFUNDED', 'DELIVERED_ARCHIVED', 'REFUNDED_ARCHIVED']; // DRAFT ,PLACED, BEING_PREPARED, PICKED_UP, ARCHIVED
	g2gOrdersDao.getOrderSummariesCountByStatus(statuses, onSuccess, onFailure);
};
var getOrderStatusById = function(orderId, onSuccess, onFailure) { // retrieve the order status as just a string
	g2gOrdersDao.getOrderStatusById(orderId, onSuccess, onFailure);
};

var getUndeliveredOrdersByDriver = function(driverId, onSuccess, onFailure) {
	g2gOrdersDao.getOrderSummariesByDriverAndStatus (driverId, ['PLACED', 'RECEIVED', 'BEING_PREPARED', 'PICKED_UP'], onSuccess, onFailure);
};

var markOrderPlaced = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'PLACED', {}, onSuccess, onFailure);
};
var markOrderReceived = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'RECEIVED', {}, onSuccess, onFailure);
};
var markOrderDelivered = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'DELIVERED', {deliveredAt: new Date()}, function() {
		// send push notification to the customer - ASYNC
		notifyCustomerOfOrderStatusChange(orderId, "delivered to you. Bon Appetit. Please rate the order and the driver.");
		onSuccess();
	}, onFailure);
};
var markOrderBeingPrepared = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'BEING_PREPARED', {}, function() {
		// send push notification to the customer - ASYNC
		notifyCustomerOfOrderStatusChange(orderId, "being prepared by the restaurant.");
		onSuccess();
	}, onFailure);
};
var markOrderPickedUp = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'PICKED_UP', {pickedUpAt: new Date()}, function() {
		// send push notification to the customer - ASYNC
		notifyCustomerOfOrderStatusChange(orderId, "picked up by the driver.");
		onSuccess();
	}, onFailure);
};
var markOrderRefunded = function(orderId, onSuccess, onFailure) {
	markOrderWithStatus(orderId, 'REFUNDED', {}, function() {
		// send push notification to the customer - ASYNC
		notifyCustomerOfOrderStatusChange(orderId, "cancelled and the money is refunded to your credit card.");
		onSuccess();
	}, onFailure);
};
var markOrderArchived = function(orderId, onSuccess, onFailure) {
	g2gOrdersDao.getOrderStatusById(orderId, function(status) {
		if (status == 'REFUNDED' || status == 'DELIVERED') {
			markOrderWithStatus(orderId, status + '_ARCHIVED', {}, onSuccess, onFailure);
		} else {
			onFailure("Can't archive an order that is not complete");
		}
	}, onFailure);
};
var markOrderUnArchived = function(orderId, onSuccess, onFailure) {
	g2gOrdersDao.getOrderStatusById(orderId, function(status) {
		if (status == 'REFUNDED_ARCHIVED') {
			markOrderWithStatus(orderId, 'REFUNDED', {}, onSuccess, onFailure);
		} else if (status == 'DELIVERED_ARCHIVED') {
			markOrderWithStatus(orderId, 'DELIVERED', {}, onSuccess, onFailure);
		} else {
			onFailure("Can't un-archive an order that is not archived");
		}
	}, onFailure);
};
var notifyCustomerOfOrderStatusChange = function(orderId, status) {
	getOrderById(orderId, function(order) {
		g2gUsersBusiness.getUserById(order.userId, function(user) {
			g2gNotificationsBusiness.notifyG2GCustomer("Order #" + orderId + " is now " + status, user.username, function() {
				// success
			}, function(err) {
				console.log("Failed to norify customer of order status change to " + status);
				console.log(err);
			});
		}, function(err) {
			console.log("Failed to notify customer of order status change to " + status);
			console.log(err);
		});
	}, function(err) {
		console.log("Failed to notify customer of order status change to " + status);
		console.log(err);
	});
};
var notifyDriverOfOrderAssigned = function(orderId, driverId) {
	g2gDriversBusiness.getDriverById(driverId, function(driver) {
		g2gNotificationsBusiness.notifyG2GDriver(driver.fullName + ", Order #" + orderId + " is assigned to you.", driver.username, function() {
			// success
		}, function(err) {
			console.log("Failed to norify driver of order assignment");
			console.log(err);
		})
	}, function(err) {
		console.log("Failed to notify customer of order assignment");
		console.log(err);
	});
};
var markOrderWithStatus = function(orderId, status, statusDate, onSuccess, onFailure) {
	g2gOrdersDao.modifyOrderStatusById(orderId, status, statusDate, onSuccess, onFailure);
};

var assignDriverToOrder = function(orderId, driverId, onSuccess, onFailure) {
	g2gOrdersDao.modifyOrderDriverById(orderId, driverId, function() {
		notifyDriverOfOrderAssigned(orderId, driverId);
		onSuccess();
	}, onFailure);
};

var rateOrder = function(orderId, rating, onSuccess, onFailure) {
	g2gOrdersDao.modifyOrderRating(orderId, rating, onSuccess, onFailure);
}

var getPlacedOrdersPlacedBefore = function(datetime, onSuccess, onFailure) {
	g2gOrdersDao.getPlacedOrdersPlacedBefore(datetime, onSuccess, onFailure);
};

var getAtRiskOrders = function(datetime, onSuccess, onFailure) {
	g2gOrdersDao.getOverdueUnpickedOrdersStarting(datetime, onSuccess, onFailure);
};

var getOverdueOrders = function(datetime, onSuccess, onFailure) {
	g2gOrdersDao.getOverdueUndeliveredOrdersStarting(datetime, onSuccess, onFailure);
};

var searchOrders = function(searchCriteria, onSuccess, onFailure) {
	g2gOrdersDao.searchOrders(searchCriteria, onSuccess, onFailure);
};

var modifyOrderRestaurantAddress = function(orderId, newRestaurantStreetAddress, newRestaurantCity, newRestaurantZipCode, onSuccess, onFailure) {
	g2gOrdersDao.modifyOrderRestaurantAddress(orderId, newRestaurantStreetAddress, newRestaurantCity, newRestaurantZipCode, onSuccess, onFailure);
};

var addTimeToETA = function(orderId, timeInMinutes, etaMessage, onSuccess, onFailure) {
	getOrderById(orderId, function(order){
		var newETA = new Date(order.eta.getTime() + timeInMinutes * 60 * 1000);
		order.eta = newETA;
		order.etaMessage = etaMessage;
		g2gOrdersDao.modifyOrderETA(orderId, newETA, etaMessage, onSuccess, onFailure);
	}, onFailure);
}

// this method uses the same structure of the order object of the front end
// this methods puts the values in the order. it can do switch cases on the user's plan to apply whatever rules.
var valuateOrder = function(order, onSuccess, onFailure) {

	// get the user
	g2gUsersBusiness.getUserByUsername(order.username, function(user) {
		// get the application configurations
		g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurations) {
			var valuationMessage = null;
			// here, we have the user and the configuration objects, let's valuate the order based on the user's plan and the global configurations
			order.value = 0.00;
			order.discounts = 0.00;
			var taxPercent = parseFloat(configurations.defaultTaxPercent);
			// delivery charge calculation
			var deliveryCharge = user.plan.deliveryCharge; // we start with the delivery charge of the user's plan
			if (order.restaurant.partner == true) { // if a partner restaurant, restaurant's delivery charge overrides
				deliveryCharge = order.restaurant.deliveryCharge;
			}
			if (user.totalOrdersCount == 0) { // if first order, plan's first time delivery charge overrides all
				deliveryCharge = user.plan.firstTimeDeliveryCharge;
			}
			if (user.eligibleForFreeDelivery) {
				deliveryCharge = 0.00;
				valuationMessage = "Your order is FREE of delivery charge";
			}
			// end delivery charge calculation
			
			for (var i = 0; i < order.orderItems.length; i++) {
				// first, set the price of the order item (quantity * menu item price)
				order.orderItems[i].price = order.orderItems[i].restaurantMenuCategoryItem.price;
				
				// then, update this price to include sides
				for (var j = 0; j < order.orderItems[i].sides.length; j++) {
					order.orderItems[i].price += order.orderItems[i].sides[j].price;
				}
				// then, multiply by quantity
				order.orderItems[i].price *= order.orderItems[i].quantity; 
				// then, update the total order value
				order.value += order.orderItems[i].price;
			}
			
			order.tax = order.value * (taxPercent / 100);
			order.deliveryCharge = deliveryCharge;
			order.totalWithoutTips = order.value + order.tax + order.deliveryCharge - order.discounts;
			
			// round to 2 decimal points
			order.value = order.value.toFixed(2);
			order.tax = order.tax.toFixed(2);
			order.deliveryCharge = order.deliveryCharge.toFixed(2);
			order.discounts = order.discounts.toFixed(2);
			
			order.totalWithoutTips = order.totalWithoutTips.toFixed(2);
			
			// then,find out if the user has an active promotion
			g2gPromotionsBusiness.getUnconsumedValidUserPromotion(user.id, function(promotion){
				if (promotion != null) { // user has a valid unconsumed promotion
					// check first whether to apply this promotion
					if (order.value >= promotion.minimumOrderValue) {
						
						order.discounts = (order.value * promotion.valueDiscountPercent) + (order.deliveryCharge * promotion.deliveryChargeDiscountPercent);
						order.totalWithoutTips = parseFloat(order.value) + parseFloat(order.tax) + parseFloat(order.deliveryCharge) - parseFloat(order.discounts);
						
						order.discounts = order.discounts.toFixed(2);
						order.totalWithoutTips = order.totalWithoutTips.toFixed(2);
						
						order.promotionId = promotion.id;
						valuationMessage = "Promotion " + promotion.promotionCode + " applied";
					}
					onSuccess(order, valuationMessage, user); // return the valuated order and the user object.
				} else { //user doesn't have a promotion
					onSuccess(order, valuationMessage, user); // return the valuated order and the user object.
				}
			}, function(error) { // error retrieving promotions - act as if no promotions
				console.log(error);
				onSuccess(order, valuationMessage, user); // return the valuated order and the user object.
			});
		}, onFailure); // failed to retrieve app configuration
	}, onFailure); // failed to retrieve user
};


exports.placeOrder = placeOrder;
exports.refundOrder = refundOrder;
exports.getOrderById = getOrderById;
exports.getOrdersByUserId = getOrdersByUserId;
exports.assignDriverToOrder = assignDriverToOrder;
exports.getPendingOrderSummaries = getPendingOrderSummaries;
exports.getCompletedOrderSummaries = getCompletedOrderSummaries;
exports.getPlacedOrderSummaries = getPlacedOrderSummaries;
exports.getInProgressOrderSummaries = getInProgressOrderSummaries;
exports.getCompletedOrderSummariesCount = getCompletedOrderSummariesCount;
exports.getPlacedOrderSummariesCount = getPlacedOrderSummariesCount;
exports.getInProgressOrderSummariesCount = getInProgressOrderSummariesCount;
exports.getOrderStatusById = getOrderStatusById;
exports.markOrderPickedUp = markOrderPickedUp;
exports.markOrderPlaced = markOrderPlaced;
exports.markOrderDelivered = markOrderDelivered;
exports.markOrderBeingPrepared = markOrderBeingPrepared;
exports.markOrderRefunded = markOrderRefunded;
exports.markOrderArchived = markOrderArchived;
exports.markOrderUnArchived = markOrderUnArchived;
exports.markOrderReceived = markOrderReceived;
exports.valuateOrder = valuateOrder;
exports.rateOrder = rateOrder;
exports.addTimeToETA = addTimeToETA;
exports.getPlacedOrdersPlacedBefore = getPlacedOrdersPlacedBefore;
exports.getOverdueOrders = getOverdueOrders;
exports.getAtRiskOrders = getAtRiskOrders;
exports.getInProgressOrderSummariesByUserId = getInProgressOrderSummariesByUserId;
exports.searchOrders = searchOrders;
exports.getUndeliveredOrdersByDriver = getUndeliveredOrdersByDriver;
exports.modifyOrderRestaurantAddress = modifyOrderRestaurantAddress;