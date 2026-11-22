define([
    "dojo/_base/declare",
    "dojox/mobile/SimpleDialog",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/dom-form",
	"dojo/request",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style"
    ], function(declare, SimpleDialog, registry, lang,ProgressIndicator, domForm, request ,win, dom, domStyle) {
        return declare([SimpleDialog], {

		nextBtn: null,
		loadingDialog: null,	
		creditCardNumberField: null,
		creditCardExpirationMonthField: null,
		creditCardExpirationYearField: null,
		creditCardCCVField: null,
		creditCardNicknameField: null,
		messageDialogView: null,
		storageManager: null,
		registrationFinalizationCallback: null,
		onTheFlyRegistrationPaymentNextBtnTitle: null,
		finalBtnName: null,
		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("onTheFlyRegistrationPaymentNextBtn");
			this.creditCardNumberField = registry.byId("onTheFlyRegistrationNewCardNumber");
			this.creditCardExpirationMonthField = registry.byId("onTheFlyRegistrationNewCardExpirationMonth");
			this.creditCardExpirationYearField = registry.byId("onTheFlyRegistrationNewCardExpirationYear");
			this.creditCardCCVField = registry.byId("onTheFlyRegistrationNewCardCCV");
			this.creditCardNicknameField = registry.byId("onTheFlyRegistrationNewCardNickname");
			this.onTheFlyRegistrationPaymentNextBtnTitle = dom.byId("onTheFlyRegistrationPaymentNextBtnTitle");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialogView = registry.byId("messageDialog");
			this.storageManager = registry.byId("storageManager");
		},
		show: function(registrationFinalizationCallback, finalBtnName) {
			this.registrationFinalizationCallback = registrationFinalizationCallback;
			this.finalBtnName = finalBtnName;
			if (this.finalBtnName) {
				this.onTheFlyRegistrationPaymentNextBtnTitle.innerHTML = this.finalBtnName;
			}
			Utilities.hideKeyboard();
			this.inherited(arguments);
		},
		next: function () {
			// hide the keyboard
			Utilities.hideKeyboard();
			if (this.validateCreditCardNumber() &&
					this.validateCreditCardExpirationDate() &&
					this.validateCreditCardCCV() &&
					this.validateCreditCardNickname()) {
				
				// page is valid
				
				// register
				this.register();
				// on success, save payment methods to DB, and add them to user
				// on success, ask to save username/password
				// set current user, set default address and default payment method
				// move to checkout screen
				
			} else {
					// do nothing, the form is invalid
			}
			return false;// prevent the form from submitting
		},
		register: function() {
			this.loadingDialog.show("Registring with G2G ...");
			// the registration function, sends the GlobalObjects.currentUser as a JSON object to the server, where it is registered
			// the callback functions will have access to the error or the response
			promise = request.post(GlobalObjects.serverURL + '/user/register', {data: JSON.stringify({user:GlobalObjects.onTheFlyUser}), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.then(lang.hitch(this, this.registrationSuccessCallback), lang.hitch(this, this.registrationFailureCallback));
		},
		registrationSuccessCallback: function(response) {
			// registration succeeded, set the username and password to the login screen
//			this.storageManager.saveCredentials(GlobalObjects.currentUser.username, GlobalObjects.currentUser.password, function() {}, function() {});
			// when registration responds successfully, save the payment methods to the device
			// we have the response object, which is a user object, save it to the current user
			GlobalObjects.currentUser = response.user;
			// function exists in PushNotificationManager.js
	    	registerG2GCustomer(GlobalObjects.currentUser.username);
			
			// immediately check for active orders for the user
			registry.byId("notificationDialog").monitorUserOrders();
			
			GlobalObjects.selectedAddress = GlobalObjects.currentUser.addresses[0];
			this.addPaymentMethodsToList();
			
			// save the payment methods of the user
			this.storageManager.savePaymentMethodsToDB(lang.hitch(this, this.savePaymentMethodsSucceeded), lang.hitch(this, this.savePaymentMethodsFailed));
			this.loadingDialog.hide();
			
		},
		registrationFailureCallback: function(err) {
			this.loadingDialog.hide();
			// when registration responds with an error, show the error message
			// we have the error object
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialogView.show(err.response.text);
			}
		},
	    savePaymentMethodsFailed: function(err) {
	    	this.loadingDialog.hide();
	    	console.log(JSON.stringify(err));
	    	this.messageDialogView.show("Failed to save payment methods to the device. Please make sure your device is supported by G2G.");
	    }, 
	    savePaymentMethodsSucceeded: function() {
	    	this.loadingDialog.hide();
	    	// hide the keyboard
			Utilities.hideKeyboard();
			// set selected payment method
			GlobalObjects.selectedPaymentMethod = GlobalObjects.currentUser.paymentMethods[0];
			Utilities.showMyProfileButton();
			this.hide();
			
			this.registrationFinalizationCallback();
	    },
		addPaymentMethodsToList: function() {
			// move the fields to the object
			var newPaymentMethod = {
				cardNumber: this.creditCardNumberField.get("value"),
				cardCCV: this.creditCardCCVField.get("value"),
				cardExpirationMonth: this.creditCardExpirationMonthField.get("value"),
				cardExpirationYear: this.creditCardExpirationYearField.get("value"),
				cardNickname: this.creditCardNicknameField.get("value")
			};
			GlobalObjects.currentUser.paymentMethods.push(newPaymentMethod);
		},
		validateCreditCardNumber: function() {
			// check if credit card number is provided
			if (this.creditCardNumberField.get("value") == null || this.creditCardNumberField.get("value") == '') {
				// show alert and move the focus to the creditCardNumber text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Credit Card Number is required");
				this.creditCardNumberField.focus();
				return false;
			} else {
				this.creditCardNumberField.set("value", this.creditCardNumberField.get("value").trim());
			}
			
			// check if creditCardNumberField is 16 valid
			if (!Stripe.card.validateCardNumber(this.creditCardNumberField.get("value"))) {
				// show alert and move the focus to the creditCardNumberField text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Credit card number is invalid");
				this.creditCardNumberField.focus();
				return false;
			}
			return true;
		}, 
		validateCreditCardExpirationDate: function() {
			// check if credit card expiration date is provided
			if (this.creditCardExpirationMonthField.get("value") == null || this.creditCardExpirationMonthField.get("value") == '') {
				// show alert and move the focus to the creditCardExpirationDate text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Credit Card Expiration Month is required");
				this.creditCardExpirationMonthField.focus();
				return false;
			} else {
				this.creditCardExpirationMonthField.set("value", this.creditCardExpirationMonthField.get("value").trim());
			}
			if (this.creditCardExpirationYearField.get("value") == null || this.creditCardExpirationYearField.get("value") == '') {
				// show alert and move the focus to the creditCardExpirationDate text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Credit Card Expiration Year is required");
				this.creditCardExpirationYearField.focus();
				return false;
			} else {
				this.creditCardExpirationYearField.set("value", this.creditCardExpirationYearField.get("value").trim());
			}
			
			if (!Stripe.card.validateExpiry(this.creditCardExpirationMonthField.get("value"), this.creditCardExpirationYearField.get("value"))) {
				// show alert and move the focus to the creditCardExpirationDate text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Credit Card Expiration Date is invalid");
				this.creditCardExpirationYearField.focus();
				return false;
			}
			return true;
			return true;
		},
		validateCreditCardCCV: function() {
			// check if credit card ccv is provided
			if (this.creditCardCCVField.get("value") == null || this.creditCardCCVField.get("value") == '') {
				// show alert and move the focus to the creditCardCCV text box
				this.messageDialogView.show("Credit Card CCV is required");
				this.creditCardCCVField.focus();
				return false;
			} else {
				this.creditCardCCVField.set("value", this.creditCardCCVField.get("value").trim());
			}
			 
			// check if ccv is 3 characters
			if (!Stripe.card.validateCVC(this.creditCardCCVField.get("value"))) {
				// show alert and move the focus to the creditCardCCVField text box
				this.messageDialogView.show("Credit card CCV is invalid");
				this.creditCardCCVField.focus();
				return false;
			}
			return true;
		},
		validateCreditCardNickname: function() {
			// check if credit card nickname is provided
			if (this.creditCardNicknameField.get("value") == null || this.creditCardNicknameField.get("value") == '') {
				// show alert and move the focus to the creditCardNickname text box
				this.messageDialogView.show("Credit Card Nickname is required");
				this.creditCardNicknameField.focus();
				return false;
			}
			return true;
		}
    });
});

