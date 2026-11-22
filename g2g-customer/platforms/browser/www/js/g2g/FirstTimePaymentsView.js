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
		finishCallback: null,
		
		lastPaymentMethodAdded: false,

		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("registrationPaymentsNextBtn");
			this.creditCardNumberField = registry.byId("newCardNumber");
			this.creditCardExpirationMonthField = registry.byId("newCardExpirationMonth");
			this.creditCardExpirationYearField = registry.byId("newCardExpirationYear");
			this.creditCardCCVField = registry.byId("newCardCCV");
			this.creditCardNicknameField = registry.byId("newCardNickname");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialogView = registry.byId("messageDialog");
			this.storageManager = registry.byId("storageManager");
		},
		show: function(finishCallbackRef) {
			this.inherited(arguments);
			this.finishCallback = finishCallbackRef;
		},
		next: function () {
			if (this.validateCreditCardNumber() &&
					this.validateCreditCardExpirationDate() &&
					this.validateCreditCardCCV() &&
					this.validateCreditCardNickname()) {
				// add the payment method to the list of users payment methods
				this.addPaymentMethodsToList();
				
				// save the payment methods of the user
				this.storageManager.savePaymentMethodsToDB(lang.hitch(this, this.savePaymentMethodsSucceeded), lang.hitch(this, this.savePaymentMethodsFailed));
			} else {
					// do nothing, the form is invalid
			}
			return false;// prevent the form from submitting
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
			
			this.hide();
			this.finishCallback();
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

