/**
 * 
 */

var unhandledOrdersNotifier = require("./UnhandledOrdersNotifier.js");
var atRiskOrdersNotifier = require("./AtRiskOrdersNotifier.js");
var overdueOrdersNotifier = require("./OverdueOrdersNotifier.js");

var startG2GJobs = function() {
	unhandledOrdersNotifier.execute();
	atRiskOrdersNotifier.execute();
	overdueOrdersNotifier.execute();
};


exports.startG2GJobs = startG2GJobs;