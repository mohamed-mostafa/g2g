var g2gDriversBusiness = require('../business/g2g_drivers_business.js');
var g2gNotificationsBusiness = require('../business/g2g_notifications_business.js');

var loginDriver = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var username = req.body.username;
		var password = req.body.password;
		g2gDriversBusiness.login(username, password,
				function(driver) {
			res.json({driver: driver});
		},
		function(){
			res.status(401).send("Login failed. Are you sure you're using a valid G2G credentials ?");
		},
		function(){
			res.status(401).send("Login failed. Are you sure you're using a valid G2G credentials ?");
		},
		function(err) {
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /drivers/login");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateDriver = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driver = req.body.driver;
		g2gDriversBusiness.updateExistingDriver(driver, function(driver) {
			res.json(driver);
		}, function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(businessError) {
			res.status(500).send(businessError);
		});
	} catch (error) {
		console.log("An error occured in /drivers");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var clockOut = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driverId = req.body.driverId;
		g2gDriversBusiness.clockOut(driverId, function(driverSession) {
			res.json(driverSession);
		}, function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(businessError) {
			res.status(500).send(businessError);
		});
	} catch (error) {
		console.log("An error occured in /clockout");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createDriver = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driver = req.body.driver;
		g2gDriversBusiness.registerNewDriver(driver, function(driver) {
			res.json(driver);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /drivers");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var clockIn = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driverId = req.body.driverId;
		var lng = req.body.lng;
		var lat = req.body.lat;
		var plannedDuration = req.body.plannedDuration;
		g2gDriversBusiness.clockIn(driverId, lng, lat, plannedDuration, function(driverSession) {
			res.json(driverSession);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(businessError) {
			res.status(500).send(businessError);
		});
	} catch (error) {
		console.log("An error occured in /clockin");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getDriverActiveSession = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driverId = req.params.driverId;
		g2gDriversBusiness.getDriverActiveSession(driverId, function(driverSession) {
			res.json(driverSession);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /activesession");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateDriverLocation = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driverId = req.body.driverId;
		var lat = req.body.lat;
		var lng = req.body.lng;
		g2gDriversBusiness.updateDriverLocation(driverId, lat, lng, function() {
			res.end();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /driver/location");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var modifySessionDuration = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var driverId = req.body.driverId;
		var newPlannedDuration = req.body.newPlannedDuration;
		g2gDriversBusiness.modifySessionDuration(driverId, newPlannedDuration, function(driverSession) {
			res.json(driverSession);
		}, function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		}, function(businessError) {
			res.status(500).send(businessError);
		});
	} catch (error) {
		console.log("An error occured in /plannedDuration");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllDrivers = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		g2gDriversBusiness.getAllDrivers(function(drivers) {
			res.json(drivers);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /drivers");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllActiveDrivers = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		g2gDriversBusiness.getAllActiveDrivers(function(drivers) {
			res.json(drivers);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /drivers/active");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getClockedInDrivers = function(req, res) {
	try {
		// call the business function and give it a callback function 
		g2gDriversBusiness.getClockedInDrivers(function(drivers) {
			res.json(drivers);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /drivers/clockedin");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var notifyG2GDriver = function(req, res) {
	try {
		var username = req.body.username;
		var message = req.body.message;
		g2gNotificationsBusiness.notifyG2GDriver(message, username, function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /driver/notify");
			console.log(err);
			res.send("An error occured while sending push notification to a driver: " + err);
		});
	} catch (err) {
		console.log("An error occured in /driver/notify");
		console.log(err);
		res.send("An error occured while sending push notification to a driver: " + err);
	}
};

var notifyAllG2GDrivers = function(req, res) {
	try {
		var message = req.body.message
		g2gNotificationsBusiness.notifyAllG2GDrivers(message,  function() {
			res.end();
		}, function(err) {
			console.log("An error occured in /drivers/notify");
			console.log(err);
			res.send("An error occured while sending push notification to a driver: " + err);
		});
	} catch (err) {
		console.log("An error occured in /drivers/notify");
		console.log(err);
		res.send("An error occured while sending push notification to a driver: " + err);
	}
};

exports.notifyAllG2GDrivers = notifyAllG2GDrivers;
exports.notifyG2GDriver = notifyG2GDriver;

exports.loginDriver = loginDriver;
exports.updateDriver = updateDriver;
exports.createDriver = createDriver;
exports.getAllDrivers = getAllDrivers;
exports.getAllActiveDrivers = getAllActiveDrivers;
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.modifySessionDuration = modifySessionDuration;
exports.getDriverActiveSession = getDriverActiveSession;
exports.updateDriverLocation = updateDriverLocation;
exports.getClockedInDrivers = getClockedInDrivers;