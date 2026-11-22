/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gPlansDao = require('../dataaccess/g2g_plans_dao.js');

//calls the onSuccess with a user object if the user was successfully created
var createNewPlan = function(plan, onSuccess, onFailure) {
	g2gPlansDao.createNewPlan(plan, onSuccess, onFailure);
};

//calls the onSuccess with a user object if the user was successfully created
var updateExistingPlan = function(plan, onSuccess, onFailure) {
	g2gPlansDao.updateExistingPlan(plan, onSuccess, onFailure);
};

var markPlanDefault = function(planName, onSuccess, onFailure) {
	g2gPlansDao.markPlanDefault(planName, onSuccess, onFailure);
};

var getAllPlans = function(onSuccess, onFailure) {
	g2gPlansDao.getAllPlans(onSuccess, onFailure);
};

exports.createNewPlan = createNewPlan;
exports.updateExistingPlan = updateExistingPlan;
exports.getAllPlans = getAllPlans;
exports.markPlanDefault = markPlanDefault;