/**
 * 
 */

// stripe's secret key
var stripe = require("stripe") (
//	"sk_live_U5qQKlwBgPiJsshyN1lsLIzR" // live
//	"sk_test_ISdKcA1TpBVw3jVSmLr5JXMX" // test
	"#STRIPE_PRIVATE_KEY#"	
);

// accepts all the information needed to 
var chargeCreditCard = function(paymentTokenId, amount, emailAddress, onSuccess, onTechnicalError, onUserError) {
	stripe.charges.create({
		source: paymentTokenId, // obtained with Stripe.js at client side
		amount: amount, // in cents
		currency: "usd",
		capture: true, // charge the credit card immediately. false will only put a lock on the amount
		receipt_email: emailAddress // an email will be sent when the charge is captured
		// capture: true // this is the default value, charge is immediately captured
		}, function(err, charge) {
		  // asynchronously called
			if (err) {
				// translate error
				console.log("An error occured while chargin with token: " + paymentTokenId + " an amount of: " + amount + " cents");
				console.log("An error occurred in chargeCreditCard method. Error details below");
				console.log(err);
				if (err.type == 'card_error' || err.type == 'StripeCardError')
					onUserError(err.message);
				else
					onTechnicalError(err);
			} else {
				onSuccess(charge);
			}
		});
};

var refundCreditCard = function(chargeId, onSuccess, onTechnicalError, onUserError) {
	stripe.charges.createRefund(chargeId, {}
		, function(err, refund) {
		  // asynchronously called
			if (err) {
				// translate error
				console.log("An error occured while refunding with token: " + chargeId);
				console.log("An error occurred in refundCreditCard method. Error details below");
				console.log(err);
				if (err.type == 'card_error' || err.type == 'StripeCardError')
					onUserError(err.message);
				else
					onTechnicalError(err);
			} else {
				onSuccess(refund);
			}
		});
};

exports.chargeCreditCard = chargeCreditCard;
exports.refundCreditCard = refundCreditCard;