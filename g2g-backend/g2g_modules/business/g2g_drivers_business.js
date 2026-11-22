/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gDriversDao = require('../dataaccess/g2g_drivers_dao.js');

// a map of iD/
var driversLocationMap = {};

// calls the onSuccess with a user object if the user exists
// calls onUserNotFound without parameters if the username doesn't exist
// calls the onIncorrectPassword without parameters if the password is not correct
// calls the onFailure with an error object if technical error occurs
var login = function(username, password, onSuccess, onDriverNotFound, onIncorrectPassword, onFailure) {
	g2gDriversDao.getDriverByUsername(username, function(driver) {
		if (driver == null) {
			onDriverNotFound();
		} else if (password === driver.password) { // compare the passwords 
			onSuccess(driver);
		} else {
			onIncorrectPassword();
		}
	}, onFailure);
};

//calls the onSuccess with a user object if the user was successfully created
var registerNewDriver = function(driver, onSuccess, onFailure) {
	g2gDriversDao.createNewDriver(driver, onSuccess, onFailure);
};

//calls the onSuccess with a user object if the user was successfully created
var updateExistingDriver = function(driver, onSuccess, onFailure) {
	g2gDriversDao.updateExistingDriver(driver, onSuccess, onFailure);
};

var getAllDrivers = function(onSuccess, onFailure) {
	g2gDriversDao.getAllDrivers(onSuccess, onFailure);
};
var getAllActiveDrivers = function(onSuccess, onFailure) {
	g2gDriversDao.getAllDrivers(function(drivers){
		var activeDrivers = [];
		for (var i = 0; i < drivers.length; i++) {
			if (drivers[i].active) {
				activeDrivers.push(drivers[i]);
			}
		}
		onSuccess(activeDrivers);
	}, onFailure);
};

var updateDriverLocation = function(driverId, lat, lng) {
	driversLocationMap["ID" + driverId] = {time: new Date(), lat: lat, lng: lng};
};

var getDriverLocation = function(driverId) {
	return driversLocationMap["ID" + driverId];
}

var clockIn = function(driverId, lng, lat, plannedDuration, onSuccess, onFailure, onBusinessError) {
	g2gDriversDao.getActiveDriverSession(driverId, function(driverSession){
		if (driverSession) {
			onBusinessError("The driver is already clocked-in");
		} else {
			var now = new Date();
			var plannedEndTime = new Date(now.getTime() + (plannedDuration * 60 * 1000));
			var driverSession = {driverId: driverId, startLng: lng, startLat: lat, plannedDuration: plannedDuration, startTime: now, plannedEndTime: plannedEndTime};
			g2gDriversDao.createNewDriverSession(driverSession, function(newDriverSession) {
				onSuccess(newDriverSession);
				
				// async update location 
				g2gDriversDao.getDriverById(driverId, function(driver) {
					updateDriverLocation(driverId, lng, lat);
				}, function(err) {
					// do nothing
					console.log("Failed to update location with driver clockin");
				})
			}, onFailure);
		}
	}, onFailure);
};

var clockOut = function(driverId, onSuccess, onFailure, onBusinessError) {
	g2gDriversDao.getActiveDriverSession(driverId, function(driverSession){
		if (driverSession) {
			driverSession.actualEndTime = new Date();
			g2gDriversDao.updateExistingDriverSession(driverSession, onSuccess, onFailure);
			
			// async remove driver location
			driversLocationMap["ID" + driverId] = null;
		} else {
			onBusinessError("The driver is not clocked-in");
		}
	}, onFailure);
};

var modifySessionDuration = function(driverId, newDurationInMinutes, onSuccess, onFailure, onBusinessError) {
	g2gDriversDao.getActiveDriverSession(driverId, function(driverSession){
		if (driverSession) {
			onBusinessError("This feature is not implemented yet");
		} else {
			onBusinessError("The driver is not clocked-in");
		}
	}, onFailure);
};

var getDriverActiveSession = function(driverId, onSuccess, onFailure) {
	g2gDriversDao.getActiveDriverSession(driverId, onSuccess, onFailure);
};

var getClockedInDrivers = function(onSuccess, onFailure) {
	g2gDriversDao.getClockedInDrivers(function(drivers) {
		for (var i = 0; i < drivers.length; i++) {
			drivers[i].location = driversLocationMap["ID" + drivers[i].id];
		}
		onSuccess(drivers);
	}, onFailure);
};

var getDriversLocations = function() {
	return driversLocationMap;
};


exports.login = login;
exports.registerNewDriver = registerNewDriver;
exports.updateExistingDriver = updateExistingDriver;
exports.getAllDrivers = getAllDrivers;
exports.getAllActiveDrivers = getAllActiveDrivers;
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.getDriverActiveSession = getDriverActiveSession;
exports.modifySessionDuration = modifySessionDuration;
exports.updateDriverLocation = updateDriverLocation;
exports.getDriverLocation = getDriverLocation;
exports.getClockedInDrivers = getClockedInDrivers;
exports.getDriversLocations = getDriversLocations;
exports.getDriverById = g2gDriversDao.getDriverById;