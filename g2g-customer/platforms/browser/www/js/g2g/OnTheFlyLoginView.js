define([
    "dojo/_base/declare",
    "dojox/mobile/SimpleDialog",
	"dijit/registry",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/on",
	"dojo/dom"
    ], function(declare, SimpleDialog, registry, request, domForm, JSON, lang,ProgressIndicator, win, on, dom) {
        return declare([SimpleDialog], {

		loginBtn: null,
		progressIndicator: null,	
		messageDialogView: null,
		storageManager: null,
		loadingDialog: null,
		usernameField: null,
		signUpLink: null,
		forgotPasswordLink: null,
		chooseAddressView: null,
		tabContainer: null,
		yesNoDialog: null,
		onTheFlyRegistrationAccount: null,
		onSuccessfulLogin: null,
		startup: function () {
			this.inherited(arguments);
			this.onTheFlyRegistrationAccount = registry.byId("onTheFlyRegistrationAccount");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.signUpLink = dom.byId("onTheFlyLoginSignUpLink");
			this.loginBtn = registry.byId("onTheFlyLoginLoginBtn");
			this.storageManager = registry.byId("storageManager");
			this.usernameField = registry.byId("onTheFlyLoginUsername");
			this.passwordField = registry.byId("onTheFlyLoginPassword");
			this.forgotPasswordLink = dom.byId("onTheFlyLoginForgotPasswordLink");
			this.chooseAddressView = registry.byId("chooseAddressView");
			this.tabContainer = registry.byId('tabContainer');
			this.yesNoDialog = registry.byId("yesNoDialog");
			// register an event on the login button
			this.loginBtn.on("click", lang.hitch(this, this.login));
			on(this.signUpLink, "click", lang.hitch(this, this.signUp));
			on(this.forgotPasswordLink, "click", lang.hitch(this, this.forgotPassword));
			this.updateSavedInput();
		},
		show: function(onSuccessfulLoginCallback) {
			Utilities.hideKeyboard();
			this.onSuccessfulLogin = onSuccessfulLoginCallback;
			this.inherited(arguments);
			this.updateSavedInput();
			Utilities.hideKeyboard();
		},
		updateSavedInput: function() {
			this.storageManager.getCredentials(lang.hitch(this, function(username, password) {
				if (username != null && username != "" && password != null && password != "") {
					console.log("found credentials in store: " + username + " " + password);
					this.usernameField.set("value", username);
					this.passwordField.set("value", password);
				}
			}), function(err) {
				// do nothing, otherwise, don't forget to lang.hitch
			});
		},
		forgotPassword: function() {
			var forgotPasswordView = registry.byId("forgotPassword");
			forgotPasswordView.show();
			this.hide();
		},
		signUp: function() {
			this.hide();
			// open the onTheFlyRegistration
			this.onTheFlyRegistrationAccount.show(lang.hitch(this, function() {
				this.yesNoDialog.show("You're now registered with G2G. Do you want to remember your username & password ?", lang.hitch(this, function(){
					// yes, remember the password
					this.yesNoDialog.hide();
					this.storageManager.saveCredentials(GlobalObjects.onTheFlyUser.username, GlobalObjects.onTheFlyUser.password, function() {}, function() {});
					
					// go to checkout
					var thisView = registry.byId("order");
					thisView.performTransition("#checkout", 1, "slide", null);
					
				}), lang.hitch(this, function() {
					// no, don't remember password
					this.yesNoDialog.hide();
					
					// go to checkout
					var thisView = registry.byId("order");
					thisView.performTransition("#checkout", 1, "slide", null);
				}), "");
			}), "Sign Up & Checkout");
		},
		login: function login() {
			Utilities.hideKeyboard();
			// send a login request to the server, with the username/password, and wait for the response
			this.hide();
			this.loadingDialog.show("Signing In ...");
			var promise = request.post(GlobalObjects.serverURL + '/user/login', {data: JSON.stringify(domForm.toObject('onTheFlyLoginForm')) ,handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, this.onLoginResponse), lang.hitch(this, this.onLoginError));
		},
		onLoginError: function(err) {
			this.loadingDialog.hide();
			// display error message
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialogView.show(err.response.text);
			}
		},
		onLoginResponse: function(response) {
			// set the current user globally. All other consequent calls are depending on it
			this.loadingDialog.hide();
			this.hide();
			GlobalObjects.currentUser = response.data.user;
			
			// function exists in PushNotificationManager.js
	    	registerG2GCustomer(GlobalObjects.currentUser.username);
			
			// immediately check for active orders for the user
			registry.byId("notificationDialog").monitorUserOrders();

			// login succeeded, let's save the username/password (if they're changed)
			this.storageManager.getCredentials(lang.hitch(this, function(username, password) {
				var newUsername = this.usernameField.get("value");
				var newPassword = this.passwordField.get("value");
				// ask the user to save his credentials only if they are changed from the saved ones (so will work with the first login as well)
				if (username != newUsername || password != newPassword) {
					this.yesNoDialog.show("Do you want G2G to remember your username and password ?", lang.hitch(this, function() {
						// yes
						this.yesNoDialog.hide();
						this.storageManager.saveCredentials(newUsername, newPassword, function() {}, function() {});
						this.storageManager.getPaymentMethodsOfCurrentUser(lang.hitch(this, this.paymentMethodsRetrieved), lang.hitch(this, this.paymentMethodsFailed));
					}),
					lang.hitch(this, function() {
						// no
						this.yesNoDialog.hide();
						this.storageManager.getPaymentMethodsOfCurrentUser(lang.hitch(this, this.paymentMethodsRetrieved), lang.hitch(this, this.paymentMethodsFailed));
					}), "");
				} else {
					this.storageManager.getPaymentMethodsOfCurrentUser(lang.hitch(this, this.paymentMethodsRetrieved), lang.hitch(this, this.paymentMethodsFailed));
				}
			}), lang.hitch(this, function(err) {
				// do nothing if we couldn't get the saved username/password
				this.storageManager.getPaymentMethodsOfCurrentUser(lang.hitch(this, this.paymentMethodsRetrieved), lang.hitch(this, this.paymentMethodsFailed));
			}));
			// we retrieved all user info from the server, now, load the payment methods from the device
//			this.storageManager.getPaymentMethodsOfCurrentUser(lang.hitch(this, this.paymentMethodsRetrieved), lang.hitch(this, this.paymentMethodsFailed));
		},
		paymentMethodsRetrieved: function(paymentMethods) {
			// copy the response to the current user
			if (paymentMethods.paymentMethods.length == 0) {
				console.log("G2G was able to query the payment methods of the user, but none was found");
			}
			GlobalObjects.currentUser.paymentMethods = paymentMethods.paymentMethods;
			// move to next screen
			this.moveToNextScreen();
		},
		paymentMethodsFailed: function(err) {
			// do nothing ... user will be alerted later to provide payment methods
			// now, move to next screen
			this.moveToNextScreen();
		},
		moveToNextScreen: function() {
			this.loadingDialog.hide();
			Utilities.updateMainHeader("Restaurants");
			
			// ask the user where he is now, and set the currentAddress accordingly
			// and anyway, set the first payment method as the default
			if (GlobalObjects.currentUser.paymentMethods.length > 0)  {
				GlobalObjects.selectedPaymentMethod = GlobalObjects.currentUser.paymentMethods[0];
			}
			if (GlobalObjects.currentUser.addresses.length > 1)  {
				this.chooseAddressView.show("Select your location to get the restaurants nearby", lang.hitch(this, function(address) {
					GlobalObjects.selectedAddress = address;
					this.onSuccessfulLogin();
					
				}));
			} else {
				GlobalObjects.selectedAddress = GlobalObjects.currentUser.addresses[0];
				this.onSuccessfulLogin();
			}
		},
    });
});

