/**
 * 
 */

var g2gPromotionsBusiness = require('../business/g2g_promotions_business.js');

var getAllPromotions = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		g2gPromotionsBusiness.getAllPromotions(function(promotions) {
			res.json(promotions);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotions");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createNewPromotion = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var promotion = req.body.promotion;
		g2gPromotionsBusiness.createNewPromotion(promotion, function(promotion) {
			res.json(promotion);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotion");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateExistingPromotion = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var promotion = req.body.promotion;
		g2gPromotionsBusiness.updateExistingPromotion(promotion, function(promotion) {
			res.json(promotion);
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotion");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markPromotionActive = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var promotionId = req.params.promotionId;
		g2gPromotionsBusiness.markPromotionActive(promotionId, function() {
			res.json();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotion/:promotionId/activate");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var markPromotionInActive = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var promotionId = req.params.promotionId;
		g2gPromotionsBusiness.markPromotionInActive(promotionId, function() {
			res.json();
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotion/:promotionId/deactivate");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var addPromotionToUser = function(req, res) {	
	try {
		// call the business function and give it a callback function 
		var promotionCode = req.body.promotionCode;
		var userEmail = req.body.userEmail;
		// userId, promotionCode, onSuccess, onUserNotFound, onPromotionNotFound, onUserAlreadyConsumedPromotion, onUserAlreadyHasPromotionActive, onFailure
		g2gPromotionsBusiness.addPromotionToUser(userEmail, promotionCode, function() {
			res.end(); // success
		},
		function() { // onUserNotFound
			res.status(500).send("Please enter the email associated with your G2G account.");
		},
		function() { // onPromotionNotFound
			res.status(500).send("Promo code not valid.");
		},
		function() { // onUserAlreadyConsumedPromotion
			res.status(500).send("We're sorry! This promo code could only be used once.");
		},
		function() { // onUserAlreadyHasPromotionActive
			res.status(500).send("Promo code already applied to your account.");
		},
		function() { // onUserHasAnotherActivePromotion
			res.status(500).send("You can only use one promotion at a time.");
		},
		function(validityDate) { // onPromotionExpired
			res.status(500).send("This promotion has expired");
		},
		function(error){
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
	} catch (error) {
		console.log("An error occured in /promotion/assign");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

exports.getAllPromotions = getAllPromotions;
exports.createNewPromotion = createNewPromotion;
exports.updateExistingPromotion = updateExistingPromotion;
exports.markPromotionActive = markPromotionActive;
exports.markPromotionInActive = markPromotionInActive;
exports.addPromotionToUser = addPromotionToUser;