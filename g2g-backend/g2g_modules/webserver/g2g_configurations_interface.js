var g2gConfigurationsBusiness = require('../business/g2g_configurations_business.js');

var getCurrentApplicationConfiguration = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configurations) {
			res.json({configurations: configurations});
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /configuratoin");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var setCurrentApplicationConfiguration = function(req, res) {	
	try {
		var key = req.body.key;
		var value = req.body.value;
		// call the business function and give it a callback function 
		g2gConfigurationsBusiness.setCurrentApplicationConfiguration(key, value, function() {
			res.end();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /configuratoin/:key/:value");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

exports.setCurrentApplicationConfiguration = setCurrentApplicationConfiguration;
exports.getCurrentApplicationConfiguration = getCurrentApplicationConfiguration;