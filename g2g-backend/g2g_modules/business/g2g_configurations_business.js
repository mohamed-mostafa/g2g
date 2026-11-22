/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gConfigurationsDao = require('../dataaccess/g2g_configurations_dao.js');

//calls the onSuccess with a configuration object if it is retrieved
var getCurrentApplicationConfiguration = function(onSuccess, onFailure) {
	g2gConfigurationsDao.getCurrentApplicationConfigurations(function(configurations){
		// respond to caller
		var configuration = {};
		for (var i = 0; i < configurations.configurations.length; i++) {
			configuration[configurations.configurations[i].key] = configurations.configurations[i].value;
		}
		onSuccess(configuration);
	}, function(err){
		// respond to caller
		onFailure(err);
	});
};

var setCurrentApplicationConfiguration = function(key, value, onSuccess, onFailure) {
	g2gConfigurationsDao.setCurrentApplicationConfiguration(key, value, onSuccess, onFailure);
};

var getActiveAds = function(onSuccess, onFailure) {
	g2gConfigurationsDao.getActiveAds(function(ads){
		if (ads.length > 3) {
			var newAds = [];
			newAds.push(ads[0]);
			newAds.push(ads[1]);
			newAds.push(ads[2]);
			onSuccess(newAds);
		} else {
			onSuccess(ads);
		}
	}, onFailure);
};

var g2gIsOnline = function(onYes, onNo, onFailure) {
	getCurrentApplicationConfiguration(function(configurationObject) {
		var openTime = parseInt(configurationObject.openTime);
		var closeTime = parseInt(configurationObject.closeTime);
		var now = new Date();
		var nowHours = now.getHours().toString();
		var nowMinutes = now.getMinutes().toString();
		while (nowHours.length < 2) nowHours = "0" + nowHours;
		while (nowMinutes.length < 2) nowMinutes = "0" + nowMinutes;
		var nowTime = parseInt(nowHours + nowMinutes);
		if (closeTime > openTime) { // midnight is not in the middle (eg 1000 to 2100)
			if (nowTime >= openTime && nowTime < closeTime) { // if we're now between open and close time (open inclusive, close exclusive)
				onYes();
			} else {
				onNo(configurationObject.openTime, configurationObject.closeTime);
			}
		} else if (closeTime < openTime) { // midnight is in the middle (e.g. 2100 to 400)
			if (nowTime >= openTime || nowTime < closeTime) { // if we're now after the open date in the same day, or before the close time in the next date (open inclusive, close exclusive)
				onYes();
			} else {
				onNo(configurationObject.openTime, configurationObject.closeTime);
			}
		} else {
			onYes();
		}
	}, onFailure);
};

var enableAd = function(id, onSuccess, onFailure) {
	g2gConfigurationsDao.enableAd(id, onSuccess, onFailure);
};
var disableAd = function(id, onSuccess, onFailure) {
	g2gConfigurationsDao.disableAd(id, onSuccess, onFailure);
};
var modifyAd = function(id, image, onSuccess, onFailure) {
	g2gConfigurationsDao.modifyAd(id, image, onSuccess, onFailure);
};
var getAllAds = function(onSuccess, onFailure) {
	g2gConfigurationsDao.getAllAds(onSuccess, onFailure);
};

exports.getCurrentApplicationConfiguration = getCurrentApplicationConfiguration;
exports.setCurrentApplicationConfiguration = setCurrentApplicationConfiguration;
exports.g2gIsOnline = g2gIsOnline;
exports.getActiveAds = getActiveAds;
exports.enableAd = enableAd;
exports.disableAd = disableAd;
exports.modifyAd = modifyAd;
exports.getAllAds = getAllAds;