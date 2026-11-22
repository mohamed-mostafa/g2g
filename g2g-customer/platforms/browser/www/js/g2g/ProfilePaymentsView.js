define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/request",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/on",
	"dojo/_base/window",
    ], function(declare, View, registry, lang,ProgressIndicator, request, dom, domStyle, on, win) {
        return declare([View], {

		nextBtn: null,
		creditCardNumberField: null,
		creditCardExpirationMonthField: null,
		creditCardExpirationYearField: null,
		creditCardCCVField: null,
		creditCardNicknameField: null,
		messageDialogView: null,
		addAnotherPaymentMethodBtn: null,
		nextPaymentMethodBtn: null,
		previousPaymentMethodBtn: null,
		addAnotherPaymentMethodImg: null,
		nextPaymentMethodImg: null,
		previousPaymentMethodImg: null,
		deletePaymentMethodBtn: null,
		storageManager: null,
		loadingDialog: null,
		chooseAddressView: null,
		checkoutView: null,
		
		currentPaymentMethodIndex: 0,
		lastPaymentMethodAdded: true, // a flag to be used before adding the payment method to the list of payment methods when the user clicks the next button
		
		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("profilePaymentsNextBtn");
			this.creditCardNumberField = registry.byId("profileCardNumber");
			this.creditCardExpirationMonthField = registry.byId("profileCardExpirationMonth");
			this.creditCardExpirationYearField = registry.byId("profileCardExpirationYear");
			this.creditCardCCVField = registry.byId("profileCardCCV");
			this.creditCardNicknameField = registry.byId("profileCardNickname");
			this.addAnotherPaymentMethodBtn = registry.byId("profileAddAnotherPaymentMethodBtn");
			this.addAnotherPaymentMethodImg = dom.byId("profileAddAnotherPaymentMethodImg");
			this.nextPaymentMethodBtn = registry.byId("profileNextPaymentMethodBtn");
			this.nextPaymentMethodImg = dom.byId("profileNextPaymentMethodImg");
			this.previousPaymentMethodBtn = registry.byId("profilePreviousPaymentMethodBtn");
			this.previousPaymentMethodImg = dom.byId("profilePreviousPaymentMethodImg");
			this.deletePaymentMethodBtn = registry.byId("profileDeletePaymentMethodBtn");
			this.loadingDialog = registry.byId("loadingDialog");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.nextPaymentMethodBtn.on("click", lang.hitch(this, this.nextPaymentMethod));
			on(this.nextPaymentMethodImg, "click", lang.hitch(this, this.nextPaymentMethod));
			this.previousPaymentMethodBtn.on("click", lang.hitch(this, this.previousPaymentMethod));
			on(this.previousPaymentMethodImg, "click", lang.hitch(this, this.previousPaymentMethod));
			this.addAnotherPaymentMethodBtn.on("click", lang.hitch(this, this.addAnother));
			on(this.addAnotherPaymentMethodImg, "click", lang.hitch(this, this.addAnother));
			this.deletePaymentMethodBtn.on("click", lang.hitch(this, this.deletePaymentMethod));
			this.messageDialogView = registry.byId("messageDialog");
			this.storageManager = registry.byId("storageManager");
			this.chooseAddressView = registry.byId("chooseAddressView");
			this.checkoutView = registry.byId("checkout");
		},
		deletePaymentMethod: function() {
			if (GlobalObjects.currentUser.paymentMethods.length != 0) {
				// remove the item at the current index
				GlobalObjects.currentUser.paymentMethods.splice(this.currentPaymentMethodIndex, 1);
				this.currentPaymentMethodIndex --;
				
				if (GlobalObjects.currentUser.paymentMethods.length == 0) {
					// if the list is now empty, clear
					this.clearValues();
					this.lastPaymentMethodAdded = false;
				} else {
					if (this.currentPaymentMethodIndex < 0) {
						this.currentPaymentMethodIndex = 0;
					}
					this.displayPaymentMethodsOfIndex(this.currentPaymentMethodIndex);
					this.lastPaymentMethodAdded = true;
				}
			}
		},
		fixScrollablePanelHeight: function() {
			var scrollablePane = dom.byId("profilePaymentsScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			console.log("New Height: " + height);
			domStyle.set(scrollablePane, "height", height);
		},
		onAfterTransitionIn: function() {
			this.currentPaymentMethodIndex = 0;
			this.displayPaymentMethodsOfIndex(this.currentPaymentMethodIndex);
			this.lastPaymentMethodAdded= true;
		},
		show: function() {
			this.inherited(arguments);
			this.onAfterTransitionIn();
		},
		nextPaymentMethod: function() {
			// if you clicked next after adding a new payment method, add it then stop
			if (!this.lastPaymentMethodAdded) {
				if (this.validateCreditCardNumber() && 
						this.validateCreditCardExpirationDate() && 
						this.validateCreditCardCCV() && 
						this.validateCreditCardNickname()) {
					
					// add the current values to the list
					this.addPaymentMethodsToList();
					this.lastPaymentMethodAdded = true;
					this.currentPaymentMethodIndex ++; // new item has the new index, and it is the current now
				}
			} else {
				// clicking next means that you might have updated the values in the 'current' payment method
				this.copyValuesToObject(this.currentPaymentMethodIndex);
				if (this.currentPaymentMethodIndex < GlobalObjects.currentUser.paymentMethods.length -1 ) {
					this.currentPaymentMethodIndex++;
					this.displayPaymentMethodsOfIndex(this.currentPaymentMethodIndex);
				}
			}
		},
		previousPaymentMethod: function() {
			//if you clicked previous after adding a new payment method, add it then go to the previous one
			if (!this.lastPaymentMethodAdded) {
				if (this.validateCreditCardNumber() && 
						this.validateCreditCardExpirationDate() && 
						this.validateCreditCardCCV() && 
						this.validateCreditCardNickname()) {
					
					// add the current values to the list
					this.addPaymentMethodsToList();
					this.lastPaymentMethodAdded = true;
					
					this.currentPaymentMethodIndex = GlobalObjects.currentUser.paymentMethods.length - 2;
					this.displayPaymentMethodsOfIndex(this.currentPaymentMethodIndex);
				}
			} else {
				// clicking previous means that you might have updated the values in the 'current' payment method
				this.copyValuesToObject(this.currentPaymentMethodIndex);
				if (this.currentPaymentMethodIndex > 0) {
					this.currentPaymentMethodIndex--;
					this.displayPaymentMethodsOfIndex(this.currentPaymentMethodIndex);
				}
			}
		},
		copyValuesToObject: function(index) {
			var paymentMethod = {
					cardNumber: this.creditCardNumberField.get("value"),
					cardCCV: this.creditCardCCVField.get("value"),
					cardExpirationMonth: this.creditCardExpirationMonthField.get("value"),
					cardExpirationYear: this.creditCardExpirationYearField.get("value"),
					cardNickname: this.creditCardNicknameField.get("value")
			};
			if (GlobalObjects.currentUser.paymentMethods.length == 0 && index == 0) { // if for some reason, no payment methods exists, keep the index at 0
				GlobalObjects.currentUser.paymentMethods.push(paymentMethod);
			} else { // the normal case, some payment methods will exist
				GlobalObjects.currentUser.paymentMethods[index] = paymentMethod;
			}
		},
		addAnother: function() {
			
			if (GlobalObjects.currentUser.paymentMethods.length == 0) {
				// user is clicking add another while the list is empty, he must have written something 
				if (this.validateCreditCardNumber() && 
						this.validateCreditCardExpirationDate() && 
						this.validateCreditCardCCV() && 
						this.validateCreditCardNickname()) {
					// if valid, add it to list, and mark as last one is added
					this.addPaymentMethodsToList();
					this.lastPaymentMethodAdded = true;
					// don't increment the counter, it is already at 0
				}
			}
			
			// should be done anyway
			if (this.lastPaymentMethodAdded) {
				// clear values
				this.clearValues();
				// reset the flag, when the user clicks the next button, the payment method should be added
				this.lastPaymentMethodAdded = false;
			}
		},
		clearValues: function() {
			// clear values
			this.creditCardNumberField.set("value", "");
			this.creditCardCCVField.set("value", "");
			this.creditCardExpirationMonthField.set("value", "");
			this.creditCardExpirationYearField.set("value", "");
			this.creditCardNicknameField.set("value", "");
		},
		displayPaymentMethodsOfIndex: function(index) {
			// if the payment methods are empty (not a common situation) ... then display nothing
			if (GlobalObjects.currentUser.paymentMethods.length == 0) {
				return;
			}
			this.creditCardNumberField.set("value", GlobalObjects.currentUser.paymentMethods[index].cardNumber);
			this.creditCardExpirationMonthField.set("value", GlobalObjects.currentUser.paymentMethods[index].cardExpirationMonth);
			this.creditCardExpirationYearField.set("value", GlobalObjects.currentUser.paymentMethods[index].cardExpirationYear);
			this.creditCardCCVField.set("value", GlobalObjects.currentUser.paymentMethods[index].cardCCV);
			this.creditCardNicknameField.set("value", GlobalObjects.currentUser.paymentMethods[index].cardNickname);
		},
		next: function next() {
			if (GlobalObjects.currentUser.paymentMethods.length > 0 && this.allFieldsAreEmpty()) {
				// no need to validate, user already has a payment method, and all the fields are empty now
				this.update();
			} else {
				// we need to validate, the user either don't have any payment methods, or he has entered some data to the fields
				if (this.validateCreditCardNumber() && 
						this.validateCreditCardExpirationDate() && 
						this.validateCreditCardCCV() && 
						this.validateCreditCardNickname()) {
					
					if (!this.lastPaymentMethodAdded) { // the button was not clicked before for the current payment method, so add it
						// since the payment method is valid, add it to the list of payment methods of the user
						this.addPaymentMethodsToList(); // or should I always replace the last payment method with the current one ?
						this.lastPaymentMethodAdded = true;
					} else {
						// you might have updated the values in the 'current' payment method, and we're sure they are valid
						this.copyValuesToObject(this.currentPaymentMethodIndex);
					}
					
					// send the update request
					this.update();
				} else {
					// do nothing, form is invalid
				}
			}
		},
		allFieldsAreEmpty: function() {
			return (this.creditCardNumberField.get("value") == null || this.creditCardNumberField.get("value") == "") &&
					(this.creditCardExpirationMonthField.get("value") == null || this.creditCardExpirationMonthField.get("value") == "") &&
					(this.creditCardExpirationYearField.get("value") == null || this.creditCardExpirationYearField.get("value") == "") &&
					(this.creditCardCCVField.get("value") == null || this.creditCardCCVField.get("value") == "") &&
					(this.creditCardNicknameField.get("value") == null || this.creditCardNicknameField.get("value") == "");
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
		update: function() {
			this.loadingDialog.show("Updating Your Profile ...");
			
			// the update function, sends the GlobalObjects.currentUser as a JSON object to the server, where it is registered
			// the callback functions will have access to the error or the response
			promise = request.post(GlobalObjects.serverURL + '/user/update', {data: JSON.stringify({user:GlobalObjects.currentUser, updatePassword: GlobalObjects.userChangedHisPassword}), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.then(lang.hitch(this, this.updateSuccessCallback), lang.hitch(this, this.updateFailureCallback));
		},
		updateSuccessCallback: function(response) {
			// set the returned user to the current user
			GlobalObjects.currentUser = response.user;
			GlobalObjects.userChangedHisPassword = false;
			
			// updating at the server succeeded, then update the payment methods on the device
			this.storageManager.savePaymentMethodsToDB(lang.hitch(this, this.savePaymentMethodsSucceeded), lang.hitch(this, this.savePaymentMethodsFailed));
		},
		onChooseAddress: function(address) {
			// if there're any items in the current order
			if (GlobalObjects.currentOrder.orderItems.length == 0) {
				GlobalObjects.selectedAddress = address;
				this.moveToNext();
			} else {
				// check if the restaurant can deliver to the new address new address
				this.loadingDialog.show("Checking if " + GlobalObjects.currentOrder.restaurant.name + " can deliver to this address ...");
				var promise = request.get(GlobalObjects.serverURL + '/restaurants/' + GlobalObjects.currentOrder.restaurant.id + '/verfiyZipCodeAvailability/' + address.zipCode, {handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.loadingDialog.hide();
					if (response.data.availability == true) {
						GlobalObjects.selectedAddress = address;
						this.moveToNext();
					} else {
						// show a dialog box saying that you can't choose this address
						this.messageDialogView.show("Your " + GlobalObjects.currentOrder.restaurant.name + " order can't be delivered to this address. Your order will be cleared");
						GlobalObjects.currentOrder.orderItems = [];
						GlobalObjects.selectedAddress = address;
						Utilities.updateMyOrderButtonName();
						this.moveToNext();
					}
				})),lang.hitch(this, function(err) {
					// when we can't retrieve the availability, stop
					this.loadingDialog.hide();
					// display error message
					if (err.response.status == 0) {
						this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
					} else if (err.response.status == 404) {
						this.messageDialogView.show("G2G servers are unable to process your request at this time");
					} else {
						this.messageDialogView.show(err.response.text);
					}
				});
			}
		},
		savePaymentMethodsSucceeded: function() {
			this.loadingDialog.hide();
			GlobalObjects.selectedPaymentMethod = GlobalObjects.currentUser.paymentMethods[0];
			if (GlobalObjects.currentUser.addresses.length > 1)  {
				this.chooseAddressView.show("Select your location to get the restaurants nearby", lang.hitch(this, this.onChooseAddress));
			} else {
				GlobalObjects.selectedAddress = GlobalObjects.currentUser.addresses[0];
				this.onChooseAddress(GlobalObjects.selectedAddress);
			}
			
			this.checkoutView.reflectSelectedAddress();
			this.checkoutView.reflectSelectedPaymentMethod();
		},
		moveToNext: function() {
			Utilities.hideKeyboard();
			var profilePaymentsView = registry.byId("profilePaymentsView");
			profilePaymentsView.performTransition("#profileThatsItView", 1, null, null);
			var profileThatsItTabBarButton = registry.byId("profileThatsItTabBarButton");
			profileThatsItTabBarButton.set("selected", true);
		},
		savePaymentMethodsFailed: function(err) {
			this.loadingDialog.hide();
			console.log(JSON.stringify(err));
	    	this.messageDialogView.show("Failed to save payment methods to the device. Please make sure your device is supported by G2G.");
		},
		updateFailureCallback: function(err) {
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
		validateCreditCardNumber: function() {
			// check if credit card number is provided
			if (this.creditCardNumberField.get("value") == null || this.creditCardNumberField.get("value") == '') {
				// show alert and move the focus to the creditCardNumber text box
				this.messageDialogView.show("Credit Card Number is required");
				this.creditCardNumberField.focus();
				return false;
			}
			
			// check if creditCardNumberField is 16 valid
			if (!Stripe.card.validateCardNumber(this.creditCardNumberField.get("value"))) {
				// show alert and move the focus to the creditCardNumberField text box
				this.messageDialogView.show("Credit card number is invalid");
				this.creditCardNumberField.focus();
				return false;
			}
			return true;
		}, 
		validateCreditCardExpirationDate: function() {
			// check if credit card month is provided
			if (this.creditCardExpirationMonthField.get("value") == null || this.creditCardExpirationMonthField.get("value") == '') {
				// show alert and move the focus to the creditCardExpirationDate text box
				this.messageDialogView.show("Credit Card Expiration Month is required");
				this.creditCardExpirationMonthField.focus();
				return false;
			}
			if (this.creditCardExpirationYearField.get("value") == null || this.creditCardExpirationYearField.get("value") == '') {
				// show alert and move the focus to the creditCardExpirationDate text box
				this.messageDialogView.show("Credit Card Expiration Year is required");
				this.creditCardExpirationYearField.focus();
				return false;
			}
			
			if (!Stripe.card.validateExpiry(this.creditCardExpirationMonthField.get("value"), this.creditCardExpirationYearField.get("value"))) {
				// show alert and move the focus to the creditCardExpirationDate text box
				this.messageDialogView.show("Credit Card Expiration Date is invalid");
				this.creditCardExpirationYearField.focus();
				return false;
			}
			return true;
		},
		validateCreditCardCCV: function() {
			// check if credit card ccv is provided
			if (this.creditCardCCVField.get("value") == null || this.creditCardCCVField.get("value") == '') {
				// show alert and move the focus to the creditCardCCV text box
				this.messageDialogView.show("Credit Card CCV is required");
				this.creditCardCCVField.focus();
				return false;
			}
			
			// check if ccv is 3 characters
			if (!Stripe.card.validateCVC(this.creditCardCCVField.get("value"))) {
				// show alert and move the focus to the creditCardCCVField text box
				this.messageDialogView.show("Credit card CCV in invalid");
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

