var g2gConfigurationsBusiness = require('../business/g2g_configurations_business.js');

var getActiveAds = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gConfigurationsBusiness.getActiveAds(
			function(ads) {
				res.json(ads);
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /ads");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllAds = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gConfigurationsBusiness.getAllAds(
			function(ads) {
				res.json(ads);
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /ads");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var modifyAd = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var id = req.body.id;
		var image = req.body.image;
		g2gConfigurationsBusiness.modifyAd(id, image,
			function() {
				res.end();
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /ad");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var enableAd = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var id = req.body.id;
		g2gConfigurationsBusiness.enableAd(id,
			function() {
				res.end();
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /ads");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var disableAd = function(req, res) {
	try {
		var id = req.body.id;
		// call the business function and give it the callback functions
		g2gConfigurationsBusiness.disableAd(id,
			function() {
				res.end();
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /ads");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

exports.getActiveAds = getActiveAds;
exports.getAllAds = getAllAds;
exports.modifyAd = modifyAd;
exports.enableAd = enableAd;
exports.disableAd = disableAd;