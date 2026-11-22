/**
 * 
 */

var fs = require('fs');

var readForgotPasswordFile = function(onSuccess, onFailure) {
	readFile("./static/forgot_password.html", onSuccess, onFailure);
};

var readActivateAccountFile = function(onSuccess, onFailure) {
	readFile("./static/activate_account.html", onSuccess, onFailure);
};

var readTermsAndConditionsFile  = function(onSuccess, onFailure) {
	readFile("./static/terms_and_conditions.html", onSuccess, onFailure);
};


var readFile = function(filePath, onSuccess, onFailure) {
	fs.readFile(filePath, {}, function(err, data) {
		if (err) {
			console.log("An error occured while reading a file: " + filePath);
			console.log(err);
			onFailure(err);
		} else {
			onSuccess(data);
		}
	});
};

exports.readForgotPasswordFile = readForgotPasswordFile;
exports.readActivateAccountFile = readActivateAccountFile;
exports.readTermsAndConditionsFile = readTermsAndConditionsFile;