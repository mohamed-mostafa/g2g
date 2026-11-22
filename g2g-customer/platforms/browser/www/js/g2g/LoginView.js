define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/on",
	"dojo/dom"
    ], function(declare, View, registry, request, domForm, JSON, lang,ProgressIndicator, win, on, dom) {
        return declare([View], {

		loginBtn: null,
		progressIndicator: null,	
		messageDialogView: null,
		storageManager: null,
		loadingDialog: null,
		usernameField: null,
		loginAsDriverLink: null,
		forgotPasswordLink: null,
		chooseAddressView: null,
		tabContainer: null,
		yesNoDialog: null,
		customerLoginBackBtn: null,
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.loginAsDriverLink = dom.byId("loginAsDriverLink");
			this.loginBtn = registry.byId("loginBtn");
			this.storageManager = registry.byId("storageManager");
			this.usernameField = registry.byId("username");
			this.passwordField = registry.byId("password");
			this.forgotPasswordLink = dom.byId("forgotPasswordLink");
			this.chooseAddressView = registry.byId("chooseAddressView");
			this.tabContainer = registry.byId('tabContainer');
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.customerLoginBackBtn = registry.byId("customerLoginBackBtn");
			// register an event on the login button
			this.loginBtn.on("click", lang.hitch(this, this.login));
			on(this.loginAsDriverLink, "click", lang.hitch(this, this.loginAsDriver));
			on(this.forgotPasswordLink, "click", lang.hitch(this, this.forgotPassword));
			on(this.customerLoginBackBtn, "click", lang.hitch(this, this.customerLoginBack));
			GlobalObjects.currentPage = 'login';
			this.updateSavedInput();
		},
		customerLoginBack: function() {
			Utilities.hideKeyboard();
			var thisView = registry.byId("login");
			thisView.performTransition("#customerSplash", -1, null);
			Utilities.addBackgroundToBody();
			Utilities.hideKeyboard();
		},
		onAfterTransitionIn: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			Utilities.hideKeyboard();
		},
		onBeforeTransitionIn: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			Utilities.hideKeyboard();
		},
		show: function() {
			Utilities.hideKeyboard();
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
		},
		loginAsDriver: function() {
			Utilities.hideKeyboard();
			var thisView = registry.byId("login");
			thisView.performTransition("#driverLogin", -1, 'slide');
			Utilities.removeBackgroundFromBody();
			Utilities.hideKeyboard();
		},
		login: function login() {
			Utilities.hideKeyboard();
			if (GlobalObjects.testMode) {
				console.log("Logging-in in testMode");
				this.onLoginResponse("Logging-in in testMode");
			} else {
				// send a login request to the server, with the username/password, and wait for the response
				this.loadingDialog.show("Signing In ...");
				var promise = request.post(GlobalObjects.serverURL + '/user/login', {data: JSON.stringify(domForm.toObject('loginForm')) ,handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoginResponse), lang.hitch(this, this.onLoginError));
			}
		},
		onLoginError: function(err) {
			Utilities.hideKeyboard();
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
			Utilities.hideKeyboard();
			this.loadingDialog.hide();
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
			Utilities.hideKeyboard();
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
					this.tabContainer.show();
					Utilities.removeBackgroundFromBody();
				}));
			} else {
				GlobalObjects.selectedAddress = GlobalObjects.currentUser.addresses[0];
				this.tabContainer.show();
				Utilities.removeBackgroundFromBody();
			}
			Utilities.hideKeyboard();
		},
    });
});

