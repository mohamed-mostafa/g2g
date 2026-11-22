/**
 * 
 */

var g2gPlansBusiness = require('../business/g2g_plans_business.js');

var getAllPlans = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		g2gPlansBusiness.getAllPlans(function(plans) {
			res.json(plans);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /plans");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createNewPlan = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var plan = req.body.plan;
		g2gPlansBusiness.createNewPlan(plan, function(plan) {
			res.json(plan);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /plans");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updatePlan = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var plan = req.body.plan;
		g2gPlansBusiness.updateExistingPlan(plan, function(plan) {
			res.json(plan);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /plans");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markPlanDefault = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var plan = req.params.planName;
		g2gPlansBusiness.markPlanDefault(plan, function() {
			res.json();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /plan/:planName/markdefault");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

exports.getAllPlans = getAllPlans;
exports.createNewPlan = createNewPlan;
exports.updatePlan = updatePlan;
exports.markPlanDefault = markPlanDefault;