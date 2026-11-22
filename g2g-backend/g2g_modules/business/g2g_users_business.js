/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gUsersDao = require('../dataaccess/g2g_users_dao.js');
var g2gEmailAdapter = require('../adapters/g2g_email_adapter.js');
var g2gSMSAdapter = require('../adapters/g2g_sms_adapter.js');
var g2gConfigurationsBusiness = require('./g2g_configurations_business.js');
var g2gNotificationsBusiness = require('./g2g_notifications_business.js');
var g2gFileSystemAdapter = require('../adapters/g2g_filesystem_adapter.js');
var bCrypt = require('bcrypt-nodejs');

// calls the onSuccess with a user object if the user exists
// calls onUserNotFound without parameters if the username doesn't exist
// calls the onIncorrectPassword without parameters if the password is not correct
// calls the onFailure with an error object if technical error occurs
var login = function(username, password, onSuccess, onUserNotFound, onIncorrectPassword, onAwaitingActivation, onFailure) {
	g2gUsersDao.getUserByUsername(username, function(user) {
		if (user == null) {
			onUserNotFound();
		} else if (!bCrypt.compareSync(password, user.password)) { // compare the passwords using the hash
			onIncorrectPassword();
		} else if (user.status == 'AWAITING_ACTIVATION') {
			onAwaitingActivation(user);
		} else {
			onSuccess(user);
		}
	}, onFailure);
};

var getUserByUsername = function(username, onSuccess, onFailure) {
	g2gUsersDao.getUserByUsername(username, function(user) {
		onSuccess(user);
	}, onFailure);
};

var getUserByPhoneNumber = function(phone, onSuccess, onFailure) {
	g2gUsersDao.getUserByPhoneNumber(phone, function(user) {
		onSuccess(user);
	}, onFailure);
};

// calls the onSuccess with a boolean representing weather the username is available for use or not
var checkUsernameAvailability = function(username, onSuccess, onFailure) {
	g2gUsersDao.getUserByUsername(username, function(user) {
		if (user == null) {
			onSuccess(true); //user with this username is not found, this username's availability is true
		} else {
			onSuccess(false);//user with this username is found, this username's availability is false
		}
	}, onFailure);
};

var checkEmailAddressAvailability = function(emailAddress, onSuccess, onFailure) {
	g2gUsersDao.getUserByEmailAddress(emailAddress, function(user) {
		if (user == null) {
			onSuccess(true); //user with this email address is not found, this email address availability is true
		} else {
			onSuccess(false);//user with this email address is found, this email address availability is false
		}
	}, onFailure);
};

//calls the onSuccess with a user object if the user was successfully created
var registerNewUser = function(user, onSuccess, onFailure) {
	// hash the password first
	try {
		user.password = bCrypt.hashSync(user.password);
	} catch (err) {
		onFailure(err);
	}
	var newActivationNumber = (parseInt(Math.random() * 99999999)).toString(); // generate random 8 digits activation number
	user.eligibleForFreeDelivery = true;
	user.status = 'AWAITING_ACTIVATION';
	user.activationNumber = newActivationNumber;
	
	// fix the phone number
	user.phone = user.phone.replace(/\D+/g, '');
	
	// fix the addresses nicknames
	if (user.addresses.length == 1) {
		if (user.addresses[0].nickname == null || user.addresses[0].nickname == "") {
			user.addresses[0].nickname = "Default";
		}
	} else {
		var idx = 1;
		for (var i = 0; i < user.addresses.length; i++) {
			if (user.addresses[i].nickname == null || user.addresses[i].nickname == "") {
				user.addresses[i].nickname = "Default-" + idx;
				idx++;
			}
		}
	}
	
	getUserByPhoneNumber(user.phone, function(existingUser) {
		var userExistsBefore = false;
		if (existingUser != null) { // a user is found with that phone number
			userExistsBefore = true;
		} 
		
		// add the user
		g2gUsersDao.createNewUser(user, function(user) {
			g2gFileSystemAdapter.readActivateAccountFile(function(data){
				var email = data.toString();
				email = email.replace("${username}", user.firstName);
				email = email.replace("${username}", user.firstName); // twice, because there're 2 in the email ...
				email = email.replace("${activationNumber}", newActivationNumber);
				g2gEmailAdapter.sendEmail(user.emailAddress, "G2G Support <support@g2gapp.net>", "Activate your G2G Account", email);
			}, onFailure);
			
			if (userExistsBefore) {
				// assign to this user the REDUNDANT NIGHT OWL plan
				assignPlanToUser(user.id, "REDUNDANT NIGHT OWL", function() {
					onSuccess(user);
				}, onFailure);
			} else {
				onSuccess(user);
			}
		}, onFailure);
	}, onFailure);
};

//calls the onSuccess with a user object if the user was successfully created
var updateExistingUser = function(user, updatePassword, onSuccess, onFailure) {
	if (updatePassword) {
		// hash the password first
		try {
			user.password = bCrypt.hashSync(user.password);
		} catch (err) {
			onFailure(err);
		}
		// update the user
	} else {
		// do nothing, let the user have the same password
		// the password coming from the client this time should be the encrypted one
	}
	g2gUsersDao.updateExistingUser(user, function(user) {
		onSuccess(user);
	}, onFailure);
};

var countAllUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsers(onSuccess, onFailure);
};

var countAllActiveUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithStatus('ACTIVE', onSuccess, onFailure);
};

var countAllAwaitingActivationUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithStatus('AWAITING_ACTIVATION', onSuccess, onFailure);
};

var countAllLockedUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithStatus('LOCKED', onSuccess, onFailure);
};

var countAllSilentUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithOrdersEqualsToZero(onSuccess, onFailure);
};

var countAllReturningUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithOrdersGreaterThanZero(onSuccess, onFailure);
};

var countAllOneTimeUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithOrdersEqualsToOne(onSuccess, onFailure);
};

var countAllCoveredUsers = function(onSuccess, onFailure) { // count all the users in the DB, no restrictions
	g2gUsersDao.countAllUsersWithZipCodesInRestaurants(onSuccess, onFailure);
};

var resetPassword = function(emailAddress, onSuccess, onEmailNotFound, onFailure) {
	g2gUsersDao.getUserByEmailAddress(emailAddress, function(user) {
		if (user == null) {
			onEmailNotFound();
		} else {
			var newPassword = (parseInt(Math.random() * 99999999)).toString(); // generate random 8 digits password
			var newPasswordUnEncrypted = newPassword;
			newPassword = bCrypt.hashSync(newPassword);
			g2gUsersDao.changeUserPassword(user.id, newPassword, function() {
				g2gFileSystemAdapter.readForgotPasswordFile(function(data){
					var email = data.toString();
					email = email.replace("${username}", user.username);
					email = email.replace("${newPassword}", newPasswordUnEncrypted);
					g2gEmailAdapter.sendEmail(emailAddress, "G2G Support <support@g2gapp.net>", "G2G Password Changed", email);
				}, onFailure);
				onSuccess(); // don't wait to read the file and send the mail, respond directly
			}, onFailure);
		}
	}, onFailure);
};

var saveNewSMS = function(sender, message, onSuccess, onFailure) {
	
	var senderSearch = sender;
	// to search for the user who's sending this SMS, we need to convert the phone number into an american phone number without a country code, and search our database
	if (senderSearch.length == 10) { // american number without a country code
		// nothing, thats what we want
	} else if (senderSearch.length == 11 && senderSearch[0] == "1") { // american number with country code
		senderSearch = senderSearch.substring(1); // remove the country code
	} else { // otherwise, time to panic ...
		// do nothing, search with the number as is ...
	}
	
	getUserByPhoneNumber(senderSearch, function(user){
		if (user != null) {
			saveNewUserMessage(user, "[Via SMS]" , message, onSuccess, onFailure);
		} else {
			// user not found ... save as a system message
			saveNewUnknownSourceMessage(sender, message, onSuccess, onFailure);
		}
	}, onFailure);
};

var saveNewUnknownSourceMessage = function(subject, body, onSuccess, onFailure) {
	g2gUsersDao.createNewMessage(-1, subject, body, onSuccess, onFailure);
	g2gNotificationsBusiness.notifyNewMessageFromUnknownSourceReceived(subject, body);
};

var saveNewUserMessage = function(user, subject, body, onSuccess, onFailure) {
	g2gUsersDao.createNewMessage(user.id, subject, body, onSuccess, onFailure);
	g2gNotificationsBusiness.notifyNewMessageFromKnownUserReceived(user, subject, body);
};

var markUserEligibileForLifetimeFreeDelivery = function(userId, onSuccess, onFailure) {
	g2gUsersDao.updateUserEligibilityForLifetimeFreeDelivery(userId, true, onSuccess, onFailure);
};
var markUserUnEligibileForLifetimeFreeDelivery = function(userId, onSuccess, onFailure) {
	g2gUsersDao.updateUserEligibilityForLifetimeFreeDelivery(userId, false, onSuccess, onFailure);
};
var markUserEligibileForFreeDelivery = function(userId, onSuccess, onFailure) {
	g2gUsersDao.updateUserEligibilityForFreeDelivery(userId, true, onSuccess, onFailure);
};
var markUserUnEligibileForFreeDelivery = function(userId, onSuccess, onFailure, onUserHasLifetimeEligibility) {
	g2gUsersDao.getUserById(userId, function(user) {
		// success
		if (user !=  null) { // if there's a user with that ID
			if (user.eligibleForLifetimeFreeDelivery == true) { // if this user is eligible for a lifetime free delivery
				// don't update him
				onUserHasLifetimeEligibility();
			} else { // this user is not eligible for a life time free delivery
				// update his eligibility for free delivery
				g2gUsersDao.updateUserEligibilityForFreeDelivery(userId, false, onSuccess, onFailure);
			}
		} else {
			onFailure("No user found with ID: " + userId);
		}
	}, onFailure);
};

var getUserById = function(id, onSuccess, onFailure) {
	g2gUsersDao.getUserById(id, onSuccess, onFailure);
};

var getUserByActivationNumber = function(activationNumner, onSuccess, onFailure) {
	g2gUsersDao.getUserByActivationNumber(activationNumner, onSuccess, onFailure);
};
var activateUser = function(userId, onSuccess, onFailure) {
	g2gUsersDao.setUserStatus(userId, 'ACTIVE', onSuccess, onFailure);
};
var lockUser = function(userId, onSuccess, onFailure) {
	g2gUsersDao.setUserStatus(userId, 'LOCKED', onSuccess, onFailure);
};

var getAllUsersByCreationDate = function(fromDate, toDate, onSuccess, onFailure) {
	g2gUsersDao.getAllUsersByCreationDate(fromDate, toDate, onSuccess, onFailure);
};

var getPendingUserMessages = function(onSuccess, onFailure) {
	g2gUsersDao.getPendingUserMessages(onSuccess, onFailure);
};
var getPendingSystemMessages = function(onSuccess, onFailure) {
	g2gUsersDao.getPendingSystemMessages(onSuccess, onFailure);
};

var markMessageRead = function(messageId, onSuccess, onFailure) {
	g2gUsersDao.setMessageReadStatus(messageId, true, onSuccess, onFailure);
};
var markMessageUnRead = function(messageId, onSuccess, onFailure) {
	g2gUsersDao.setMessageReadStatus(messageId, false, onSuccess, onFailure);
};

var getMessagesBetweenDates = function(messagesFrom, messagesTo, onSuccess, onFailure) {
	g2gUsersDao.getMessagesBetweenDates(messagesFrom, messagesTo, onSuccess, onFailure);
};

var updateUserProfileAfterPlacingAnOrder = function(userId, onSuccess, onFailure) {
	// update the count
	g2gUsersDao.updateOrdersCountInUserProfile(userId, function() {
		// after placing the order, set the users eligibility for free delivery to false
		markUserUnEligibileForFreeDelivery(userId, onSuccess, onFailure, function() {
			// user has a lifetime eligibility for free delivery
			console.log("User with ID: " + userId + " who has a lifetime eligibility for free delivery has just placed an order.");
			onSuccess(); // success
		});
	}, onFailure);
};

var updateUserProfileAfterRefundingAnOrder = function(userId, onSuccess, onFailure) {
	// update the count
	g2gUsersDao.updateOrdersCountInUserProfile(userId, onSuccess, onFailure);
};

var assignPlanToUser = function(userId, plan, onSuccess, onFailure) {
	// update the count
	g2gUsersDao.updatePlanOfUserProfile(userId, plan, onSuccess, onFailure);
};

var searchUsers = function(userSearchCriteria, onSuccess, onFailure) {
	g2gUsersDao.searchUsers(userSearchCriteria, onSuccess, onFailure);
};

exports.login = login;
exports.getUserByUsername = getUserByUsername;
exports.getUserById = getUserById;
exports.getUserByPhoneNumber = getUserByPhoneNumber;
exports.checkUsernameAvailability = checkUsernameAvailability;
exports.checkEmailAddressAvailability = checkEmailAddressAvailability;
exports.registerNewUser = registerNewUser;
exports.updateExistingUser = updateExistingUser;
exports.countAllUsers = countAllUsers;
exports.countAllActiveUsers = countAllActiveUsers;
exports.countAllAwaitingActivationUsers = countAllAwaitingActivationUsers;
exports.countAllLockedUsers = countAllLockedUsers;
exports.countAllSilentUsers = countAllSilentUsers;
exports.countAllReturningUsers = countAllReturningUsers;
exports.countAllOneTimeUsers = countAllOneTimeUsers;
exports.countAllCoveredUsers = countAllCoveredUsers;
exports.saveNewUserMessage = saveNewUserMessage;
exports.saveNewSMS = saveNewSMS;
exports.resetPassword = resetPassword;
exports.markUserEligibileForFreeDelivery = markUserEligibileForFreeDelivery;
exports.markUserUnEligibileForFreeDelivery = markUserUnEligibileForFreeDelivery;
exports.markUserEligibileForLifetimeFreeDelivery = markUserEligibileForLifetimeFreeDelivery;
exports.markMessageRead = markMessageRead;
exports.markUserUnEligibileForLifetimeFreeDelivery = markUserUnEligibileForLifetimeFreeDelivery;
exports.getUserByActivationNumber = getUserByActivationNumber;
exports.activateUser = activateUser;
exports.lockUser = lockUser;
exports.getAllUsersByCreationDate = getAllUsersByCreationDate;
exports.getPendingUserMessages = getPendingUserMessages;
exports.getPendingSystemMessages = getPendingSystemMessages;
exports.markMessageRead = markMessageRead;
exports.markmessageUnRead = markMessageUnRead;
exports.getMessagesBetweenDates = getMessagesBetweenDates;
exports.updateUserProfileAfterPlacingAnOrder = updateUserProfileAfterPlacingAnOrder;
exports.updateUserProfileAfterRefundingAnOrder = updateUserProfileAfterRefundingAnOrder;
exports.assignPlanToUser = assignPlanToUser;
exports.searchUsers = searchUsers;