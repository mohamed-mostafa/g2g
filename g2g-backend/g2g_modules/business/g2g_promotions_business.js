/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gpromotionsDao = require('../dataaccess/g2g_promotions_dao.js');
var g2gUsersDao = require('../dataaccess/g2g_users_dao.js');

var getPromotionByPromotionCode = function(promotionCode, onSuccess, onFailure) {
	g2gpromotionsDao.getPromotionByPromotionCode(promotionCode, onSuccess, onFailure);
};
var createNewPromotion = function(promotion, onSuccess, onFailure) {
	g2gpromotionsDao.createNewPromotion(promotion, onSuccess, onFailure);
};
var updateExistingPromotion = function(promotion, onSuccess, onFailure) {
	g2gpromotionsDao.updateExistingPromotion(promotion, onSuccess, onFailure);
};
var getAllPromotions = function(onSuccess, onFailure) {
	g2gpromotionsDao.getAllPromotions(onSuccess, onFailure);
};
var getUnconsumedValidUserPromotion = function(userId, onSuccess, onFailure) {
	g2gpromotionsDao.getUnconsumedValidUserPromotion(userId, onSuccess, onFailure);
};
var getUserPromotionByPromotionCode = function(userId, promotionCode, onSuccess, onFailure) {
	g2gpromotionsDao.getUserPromotionByPromotionCode(userId, promotionCode, onSuccess, onFailure);
};
var markPromotionActive = function(promotionId, onSuccess, onFailure) {
	g2gpromotionsDao.markPromotionActive(promotionId, onSuccess, onFailure);
};
var markPromotionInActive = function(promotionId, onSuccess, onFailure) {
	g2gpromotionsDao.markPromotionInActive(promotionId, onSuccess, onFailure);
};

// validity date is considered here
var addPromotionToUser = function(username, promotionCode, onSuccess, onUserNotFound, onPromotionNotFound, onUserAlreadyConsumedPromotion, onUserAlreadyHasPromotionActive, onUserHasAnotherActivePromotion, onPromotionExpired, onFailure) {
	g2gUsersDao.getUserByUsername(username, function(user) { // a user with the provided email address was found
		if (user != null) {
			getUnconsumedValidUserPromotion(user.id, function(unconsumedPromotion) {
				if (unconsumedPromotion != null) { // user has another active & valid promotion
					onUserHasAnotherActivePromotion();
				} else {
					getPromotionByPromotionCode(promotionCode, function(existingPromotion) {
						if (existingPromotion != null) { // promotion exists
							var now = new Date();
							var promotionValidityDate = new Date(existingPromotion.validityDate);
							if (promotionValidityDate.getTime() > now.getTime()) { // promotion is still valid
								getUserPromotionByPromotionCode(user.id, promotionCode, function(userPromotion) {
									if (userPromotion != null) { // promotion was assigned to user before
										if (userPromotion.consumed) {
											onUserAlreadyConsumedPromotion();
										} else {
											onUserAlreadyHasPromotionActive();
										}
									} else { // promotion code does exists, and was not assigned to this user before
										g2gpromotionsDao.addPromotionToUser(user.id, existingPromotion.id, onSuccess, onFailure);
									}
								}, onFailure);
							} else {
								onPromotionExpired(promotionValidityDate);
							}
						} else { // promotion code doesn't exist
							onPromotionNotFound();
						}
					}, onFailure);
				}
			}, onFailure);
		} else { // no user was found with that emai laddress
			onUserNotFound();
		}
	}, onFailure);
};

var consumePromotionByUser = function(userId, promotionId, onSuccess, onFailure) {
	g2gpromotionsDao.updatePromotionConsumptionForUser(userId, promotionId, 1, onSuccess, onFailure);
};

var unconsumePromotionByUser = function(userId, promotionId, onSuccess, onFailure) {
	g2gpromotionsDao.updatePromotionConsumptionForUser(userId, promotionId, 0, onSuccess, onFailure);
};

exports.getPromotionByPromotionCode = getPromotionByPromotionCode;
exports.createNewPromotion = createNewPromotion;
exports.updateExistingPromotion = updateExistingPromotion;
exports.getAllPromotions = getAllPromotions;
exports.getUnconsumedValidUserPromotion = getUnconsumedValidUserPromotion;
exports.getUserPromotionByPromotionCode = getUserPromotionByPromotionCode;
exports.markPromotionActive = markPromotionActive;
exports.markPromotionInActive = markPromotionInActive;
exports.addPromotionToUser = addPromotionToUser;
exports.consumePromotionByUser = consumePromotionByUser;
exports.unconsumePromotionByUser = unconsumePromotionByUser;