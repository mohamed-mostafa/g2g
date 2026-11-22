/**
 * 
 */

var g2gConfigurationsBusiness = require('../business/g2g_configurations_business.js');;

//deprecated
var isG2GAvailable = function(req, res, next) {
	g2gConfigurationsBusiness.g2gIsOnline(function() {
		next();
	},function(startHour, endHour) {
		// fix start/end hours if they are not correctly set in the DB
		while(startHour.length < 4) startHour = "0" + startHour;
		while(endHour.length < 4) endHour = "0" + endHour;
		
		startHourStr = startHour.substr(0, 2) + ":" + startHour.substr(2,2);
		endHourStr = endHour.substr(0, 2) + ":" + endHour.substr(2,2);
		res.status(503).send("G2G is offline at the moment. Our go getters are available from " + "10:00 PM" + " to " + "4:00 AM");
	}, function(err) {
		console.log("An error occured in WorkingHoursMiddleware");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any invonvinence.");
	});
};

exports.isG2GAvailable = isG2GAvailable;