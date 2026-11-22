/**
 * The g2g server exposing the REST services
 */

var start = function () {
	// initialize express
	var express = require('express'); 
	var http = require('http');
	var cors = require('cors');
	var bodyParser = require('body-parser');
	var g2gFileSystemAdapter = require('../adapters/g2g_filesystem_adapter.js');
	var preventCacheMiddleware = require('../middlewares/prevent_cache_middleware.js');
	
	// interfaces
	var g2gDriverInterface = require('./g2g_driver_interface.js');
	var g2gMessagesInterface = require('./g2g_messages_interface.js');
	var g2gPlansInterface = require('./g2g_plans_interface.js');
	var g2gPromotionsInterface = require('./g2g_promotions_interface.js');
	var g2gOrdersInterface = require('./g2g_orders_interface.js');
	var g2gConfigurationsInterface = require('./g2g_configurations_interface.js');
	var g2gAdsInterface = require('./g2g_ads_interface.js');
	var g2gRestaurantsInterface = require('./g2g_restaurants_interface.js');
	var g2gUsersInterface = require('./g2g_users_interface.js');
	
	var json2xls = require('json2xls');
	var app = express();
	// your express configuration here

	app.use(cors());// add CORS middleware (to enable cross-domain requests from clients.)
	app.use(bodyParser.json());// for parsing application/json
	app.use(preventCacheMiddleware.preventCache);
	app.use(json2xls.middleware); // middleware to return contenttype xls

	// routing - Start
	
	// users
	app.get('/user/checkUsernameAvailability/:username', g2gUsersInterface.checkUsernameAvailability);
	app.get('/user/checkEmailAddressAvailability/:email', g2gUsersInterface.checkEmailAddressAvailability);
	app.get('/user/:email', g2gUsersInterface.getUserByUsername);
	app.get('/user/id/:id', g2gUsersInterface.getUserById);
	app.post('/user/register', g2gUsersInterface.registerNewUser);
	app.post('/user/update', g2gUsersInterface.updateExistingUser);
	app.post('/user/login', g2gUsersInterface.login);
	app.get('/user/users/count', g2gUsersInterface.countAllUsers);
	app.get('/user/users/activecount', g2gUsersInterface.countAllActiveUsers);
	app.get('/user/users/awaitingactivationcount', g2gUsersInterface.countAllAwaitingActivationUsers);
	app.get('/user/users/lockedcount', g2gUsersInterface.countAllLockedUsers);
	app.get('/user/users/silentcount', g2gUsersInterface.countAllSilentUsers);
	app.get('/user/users/returningcount', g2gUsersInterface.countAllReturningUsers);
	app.get('/user/users/onetimecount', g2gUsersInterface.countAllOneTimeUsers);
	app.get('/user/users/multipletimescount', g2gUsersInterface.countAllMultipleTimesUsers);
	app.get('/user/users/coveredcount', g2gUsersInterface.countAllCoveredUsers);
	app.get('/user/users/uncoveredcount', g2gUsersInterface.countAllUncoveredUsers);
	app.put('/user/contact', g2gUsersInterface.saveNewUserMessage);
	app.post('/user/passwordreset', g2gUsersInterface.resetPassword);
	app.post('/user/:userId/plan/:plan', g2gUsersInterface.assignPlanToUser);
	app.post('/user/:userId/freedelivery/lifetimeeligibility/:eligibility', g2gUsersInterface.setUserEligibilityForLifetimeFreeDelivery);
	app.post('/user/:userId/freedelivery/eligibility/:eligibility', g2gUsersInterface.setUserEligibilityForFreeDelivery);
	app.post('/user/:userId/status/:status', g2gUsersInterface.markUserEligibileForFreeDelivery);
	app.post('/users', bodyParser.json(), g2gUsersInterface.getAllUsersByCreationDate);
	app.post('/users/search', bodyParser.json(), g2gUsersInterface.searchUsers);
	app.get('/users/searchAndExport', g2gUsersInterface.searchUsersAndExport);
	app.get('/activate/:activationNumber', g2gUsersInterface.getUserByActivationNumber);
	app.post("/user/:userId/activate", g2gUsersInterface.activateUser);
	app.post("/user/:userId/lock", g2gUsersInterface.lockUser);
	app.put("/user/notify", g2gUsersInterface.notifyG2GCustomer);
	app.put("/users/notify", g2gUsersInterface.notifyAllG2GCustomers);
	app.put("/anonymoususers/notify", g2gUsersInterface.notifyAllAnonymousG2GCustomers);
	
	// restaurants
	app.get('/restaurants/:restaurantId/verfiyZipCodeAvailability/:zipCode', g2gRestaurantsInterface.verifyZipCodeAvailabilityForRestaurant);
	app.get('/restaurants/restaurants/:zipCode', g2gRestaurantsInterface.getAllActiveRestaurantsByZipCode);
	app.get('/v2/restaurants/logos', g2gRestaurantsInterface.getAllActiveRestaurantsLogosV2);
	app.get('/v2/restaurants/:zipCode', g2gRestaurantsInterface.getAllActiveRestaurantsByZipCodeV2);
	app.get('/restaurants/restaurant/:restaurantId/availability', g2gRestaurantsInterface.getRestaurantAvailability);
	app.get('/restaurants', g2gRestaurantsInterface.getAllRestaurants);
	app.put('/restaurants', g2gRestaurantsInterface.createRestaurant);
	app.put('/restaurants/category', g2gRestaurantsInterface.createCategory);
	app.put('/restaurants/categories/item', g2gRestaurantsInterface.createItem);
	app.put('/restaurants/categories/items/sidegroup', g2gRestaurantsInterface.createSideGroup);
	app.put('/restaurants/categories/items/sidegroups/sidegroupitem', g2gRestaurantsInterface.createSideGroupItem);
	app.put('/restaurants/zipcode', g2gRestaurantsInterface.createRestaurantZipCode);
	app.post('/restaurants', g2gRestaurantsInterface.updateRestaurant);
	app.post('/restaurants/category', g2gRestaurantsInterface.updateCategory);
	app.post('/restaurants/categories/item', g2gRestaurantsInterface.updateItem);
	app.post('/restaurants/categories/items/sidegroup', g2gRestaurantsInterface.updateSideGroup);
	app.post('/restaurants/categories/items/sidegroups/sideitem', g2gRestaurantsInterface.updateSideGroupItem);
	app.post('/restaurants/zipcode', g2gRestaurantsInterface.updateRestaurantZipCode);
	app.get('/restaurants/:restaurantId/restaurantMenuCategories', g2gRestaurantsInterface.getAllCategoriesByRestaurantId);
	app.get('/restaurants/:restaurantId/zipcodes', g2gRestaurantsInterface.getAllZipCodesByRestaurantId);
	app.get('/restaurants/categories/:categoryId/items', g2gRestaurantsInterface.getAllItemsByCategoryId);
	app.get('/restaurants/categories/items/:itemId/sidegroups', g2gRestaurantsInterface.getAllSideGroupsByItemId);
	app.get('/restaurants/categories/items/sidegroups/:sideGroupId/items', g2gRestaurantsInterface.getAllSideItemsBySideGroupId);
	app.get('/restaurants/restaurantMenuCategories/:restaurantId', g2gRestaurantsInterface.getActiveRestaurantMenuCategoriesByRestaurantId);
	app.get('/restaurants/restaurantMenuCategoryItems/:restaurantMenuCategoryId', g2gRestaurantsInterface.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId);
	app.post('/restaurants/categories/items/sidegroup/copy', g2gRestaurantsInterface.copySideGroupToSiblingItemsOfItem);
	app.get('/restaurants/activitychart', g2gRestaurantsInterface.getActivityChart);
	app.get("/restaurantitems/:restaurantId", g2gRestaurantsInterface.getItemsByRestaurantId);
	
	// orders
	app.post('/order/place', g2gOrdersInterface.placeOrder);
	app.post('/order/valuate', bodyParser.json(), g2gOrdersInterface.valuateOrder);
	app.post('/v2/order/place', g2gOrdersInterface.placeOrderV2);
	app.post('/order/rating', bodyParser.json(), g2gOrdersInterface.rateOrder);
	app.post('/order/eta', bodyParser.json(), g2gOrdersInterface.addTimeToOrderETA);
	app.get('/order/pending/:userId', g2gOrdersInterface.getPendingOrderSummariesByUserId);
	app.get('/order/inprogress/:userId', g2gOrdersInterface.getInProgressOrderSummariesByUserId);
	app.get('/v2/order/pending/:userId', g2gOrdersInterface.getPendingOrderSummariesV2);
	app.get('/order/:orderId/status', g2gOrdersInterface.getOrderStatusById);
	app.get('/order/:orderId', g2gOrdersInterface.getOrderById);
	app.post('/order/:orderId/driver', g2gOrdersInterface.assignDriverToOrder);
	app.post('/order/:orderId/refund', g2gOrdersInterface.refundOrder);
	app.get('/order/status/delivered/count', g2gOrdersInterface.getCompletedOrderSummariesCount);
	app.get('/order/status/inprogress/count', g2gOrdersInterface.getInProgressOrderSummariesCount);
	app.get('/order/status/placed/count', g2gOrdersInterface.getPlacedOrderSummariesCount);
	app.get('/order/status/placed', g2gOrdersInterface.getPlacedOrderSummaries);
	app.get('/order/status/delivered', g2gOrdersInterface.getCompletedOrderSummaries);
	app.get('/order/status/inprogress', g2gOrdersInterface.getInProgressOrderSummaries);
	app.post('/order/status/beingprepared', g2gOrdersInterface.markOrderBeingPrepared);
	app.post('/order/status/received', g2gOrdersInterface.markOrderReceived);
	app.post('/order/status/pickedup', g2gOrdersInterface.markOrderPickedUp);
	app.post('/order/status/delivered', g2gOrdersInterface.markOrderDelivered);
	app.post('/order/status/archive', g2gOrdersInterface.markOrderArchived);
	app.post('/order/status/unarchive', g2gOrdersInterface.markOrderUnArchived);
	app.post('/order/status/placed', g2gOrdersInterface.markOrderPlaced);
	app.post('/orders/search', bodyParser.json(), g2gOrdersInterface.searchOrders);
	app.get('/orders/searchAndExport', g2gOrdersInterface.searchAndExport);
	app.get('/orders/assignedundelivered/:driverId', g2gOrdersInterface.getUndeliveredOrdersByDriver);
	app.post('/order/restaurantaddress', g2gOrdersInterface.modifyOrderRestaurantAddress);
	
	// configurations
	app.get('/configuration', g2gConfigurationsInterface.getCurrentApplicationConfiguration);
	app.post('/configuration', bodyParser.json(), g2gConfigurationsInterface.setCurrentApplicationConfiguration);
	
	// drivers
	app.get('/drivers/active', g2gDriverInterface.getAllActiveDrivers);
	app.post('/drivers/login', g2gDriverInterface.loginDriver);
	app.get('/drivers', g2gDriverInterface.getAllDrivers);
	app.put('/drivers', g2gDriverInterface.createDriver);
	app.post('/drivers', g2gDriverInterface.updateDriver);
	app.post('/driver/clockout', g2gDriverInterface.clockOut);
	app.post('/driver/clockin', g2gDriverInterface.clockIn);
	app.post('/driver/plannedDuration', g2gDriverInterface.modifySessionDuration);
	app.get('/driver/:driverId/activesession', g2gDriverInterface.getDriverActiveSession);
	app.get('/drivers/clockedin', g2gDriverInterface.getClockedInDrivers);
	app.post('/driver/location', function(req, res) {	
//		console.log("Received a /drive/location request");
		g2gDriverInterface.updateDriverLocation(req, res);
//		var driverId = req.body.driverId;
//		var lat = req.body.lat;
//		var lng = req.body.lng;
//		console.log("Atempting to broadcast websocket method");
//		broadcastWebsocketMessage("driverLocationChanged", {driverId: driverId, lat: lat, lng: lng});
	});
	app.put("/driver/notify", g2gDriverInterface.notifyG2GDriver);
	app.put("/drivers/notify", g2gDriverInterface.notifyAllG2GDrivers);
	
	// plans
	app.get('/plans', g2gPlansInterface.getAllPlans);
	app.put('/plans', g2gPlansInterface.createNewPlan);
	app.post('/plans', g2gPlansInterface.updatePlan);
	app.post('/plan/:planName/markdefault', g2gPlansInterface.markPlanDefault);
	
	// promotions
	app.get('/promotions', g2gPromotionsInterface.getAllPromotions);
	app.put('/promotion', bodyParser.json(), g2gPromotionsInterface.createNewPromotion);
	app.post('/promotion', bodyParser.json(), g2gPromotionsInterface.updateExistingPromotion);
	app.post('/promotion/:promotionId/activate', g2gPromotionsInterface.markPromotionActive);
	app.post('/promotion/:promotionId/deactivate', g2gPromotionsInterface.markPromotionInActive);
	app.post('/promotion/assign', g2gPromotionsInterface.addPromotionToUser);
	
	// messages
	app.post('/sms', bodyParser.urlencoded({extended: true}), g2gMessagesInterface.saveNewSMS);
	app.put('/sms', bodyParser.json(), g2gMessagesInterface.sendSMS);
	app.get('/pendingsystemmessages', g2gMessagesInterface.getPendingSystemMessages);
	app.get('/pendingusermessages', g2gMessagesInterface.getPendingUserMessages);
	app.post('/message/:messageId/status/read', g2gMessagesInterface.markMessageRead);
	app.post('/message/:messageId/status/unread', g2gMessagesInterface.markMessageUnread);
	app.get('/messages', g2gMessagesInterface.getMessagesBetweenDates); // get messages filtered by dates
	
	// ads
	app.get('/ads', g2gAdsInterface.getActiveAds);
	app.get('/allAds', g2gAdsInterface.getAllAds);
	app.post('/ad', g2gAdsInterface.modifyAd);
	app.post('/ad/enable', g2gAdsInterface.enableAd);
	app.post('/ad/disable', g2gAdsInterface.disableAd);
	
	app.get('/termsandconditions', function(req, res) {
		try {
			g2gFileSystemAdapter.readTermsAndConditionsFile(function(data){
				var page = data.toString();
				res.send(page);
			}, function(error) {
				console.log("An error occured in /termsandconditions");
				console.log(error);
				res.send("An error occured while retrieving terms and conditions. Please contact G2G support at support@g2gapp.net");
			});
		} catch (error) {
			console.log("An error occured in /termsandconditionsPage");
			console.log(error);
			res.send("An error occured while retrieving terms and conditions. Please contact G2G support at support@g2gapp.net");
		}
	});
	
	app.get('/call', function(req, res) {
		try {
			res.send('<Response><Dial callerId="201006239091"><Number>14086463230</Number></Dial></Response>');
		} catch (error) {
			console.log("An error occured in /call");
			console.log(error);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any invonvinence.");
		}
	});
	
	app.get('/error/:message', function(req, res) {
		try {
			var error = req.params.message;
			console.log(error);
			res.end();
		} catch (error) {
			console.log("An error occured in /error itself");
			console.log(error);
			res.end();
		}
	});
	
	
	// routing - end
	
	var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//    var server = http.createServer(app);
//	// websockets configuration
//    var io = require('socket.io')(server);
//    io.set('authorization', function (handshakeData, accept) {
//    	accept(null, true);
//    });
//    
//    io.on("connection", function(socket) {
//    	console.log("A user just connected, will keep sending location");
//    });
//    io.on("disconnect", function(data) {
//    	console.log("A user just disconnected");
//    });
//    io.on("reportLocationsRequested", function(socket) {
//    	socket.emit("reportedLocationsRecieved", g2gDriversBusiness.getDriversLocations)
//    });
//          
//    var broadcastWebsocketMessage = function (method, content) {
//    	console.log("invoking io.sockets.emit");
//    	io.sockets.emit(method, content);
//    	console.log("done invoking io.sockets.emit");
//    };
    
    app.listen(port, ipaddress, function() {
        console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
    });
};

exports.start = start;