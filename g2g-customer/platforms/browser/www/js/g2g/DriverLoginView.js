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
		loginAsCustomerLink: null,
		driverLoginBackBtn: null,
		chooseAddressView: null,
		tabContainer: null,
		yesNoDialog: null,
		gpsManager: null,
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.loginAsCustomerLink = dom.byId("loginAsCustomerLink");
			this.loginBtn = registry.byId("driverLoginBtn");
			this.storageManager = registry.byId("storageManager");
			this.usernameField = registry.byId("driverUsername");
			this.passwordField = registry.byId("driverPassword");
			this.tabContainer = registry.byId('driverTabContainer');
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.gpsManager = registry.byId("gpsManager");
			this.driverLoginBackBtn = registry.byId("driverLoginBackBtn");
			// register an event on the login button
			this.loginBtn.on("click", lang.hitch(this, this.login));
			this.driverLoginBackBtn.on("click", lang.hitch(this, this.driverLoginBack));
			on(this.loginAsCustomerLink, "click", lang.hitch(this, this.loginAsCustomer));
			this.updateSavedInput();
		},
		driverLoginBack: function() {
			Utilities.hideKeyboard();
			var thisView = registry.byId("driverLogin");
			thisView.performTransition("#driverSplash", -1, null);
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
			this.storageManager.getDriverCredentials(lang.hitch(this, function(username, password) {
				if (username != null && username != "" && password != null && password != "") {
					console.log("found credentials in store: " + username + " " + password);
					this.usernameField.set("value", username);
					this.passwordField.set("value", password);
				}
			}), function(err) {
				// do nothing, otherwise, don't forget to lang.hitch
			});
		},
		loginAsCustomer: function() {
			Utilities.hideKeyboard();
			var thisView = registry.byId("driverLogin");
			thisView.performTransition("#login", -1, 'slide');
			Utilities.removeBackgroundFromBody();
			Utilities.hideKeyboard();
		},
		login: function login() {
			Utilities.hideKeyboard();
			// send a login request to the server, with the username/password, and wait for the response
			this.loadingDialog.show("Signing In ...");
			var promise = request.post(GlobalObjects.serverURL + '/drivers/login', {data: JSON.stringify(domForm.toObject('driverLoginForm')) ,handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, this.onLoginResponse), lang.hitch(this, this.onLoginError));
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
			GlobalObjects.currentDriver = response.data.driver;
			
			// function exists in PushNotificationManager.js
			registerG2GDriver(GlobalObjects.currentDriver.username);
			
			// login succeeded, let's save the username/password (if they're changed)
			this.storageManager.getDriverCredentials(lang.hitch(this, function(username, password) {
				var newUsername = this.usernameField.get("value");
				var newPassword = this.passwordField.get("value");
				// ask the user to save his credentials only if they are changed from the saved ones (so will work with the first login as well)
				if (username != newUsername || password != newPassword) {
					this.yesNoDialog.show("Do you want G2G to remember your username and password ?", lang.hitch(this, function() {
						// yes
						this.yesNoDialog.hide();
						this.storageManager.saveDriverCredentials(newUsername, newPassword, function() {}, function() {});

						// initialize the location service
						this.gpsManager.init(lang.hitch(this, function() {
							// successfully initialized
							// move to next screen
							this.moveToNextScreen();
						}), lang.hitch(this,function(error) {
							this.messageDialogView.show(error);
							this.moveToNextScreen();
						}), null);
					}),
					lang.hitch(this, function() {
						// no
						this.yesNoDialog.hide();
						
						// initialize the location service
						this.gpsManager.init(lang.hitch(this, function() {
							// successfully initialized
							// move to next screen
							this.moveToNextScreen();
						}), lang.hitch(this,function(error) {
							this.messageDialogView.show(error);
							this.moveToNextScreen();
						}), null);
					}), "");
				} else {
					
					// initialize the location service
					this.gpsManager.init(lang.hitch(this, function() {
						// successfully initialized
						// move to next screen
						this.moveToNextScreen();
					}), lang.hitch(this,function(error) {
						this.messageDialogView.show(error);
						this.moveToNextScreen();
					}), null);
				}
			}), lang.hitch(this, function(err) {
				// do nothing if we couldn't get the saved username/password
				
				// initialize the location service
				this.gpsManager.init(lang.hitch(this, function() {
					// successfully initialized
					// move to next screen
					this.moveToNextScreen();
				}), lang.hitch(this,function(error) {
					this.messageDialogView.show(error);
					this.moveToNextScreen();
				}), null);
			}));
		},
		moveToNextScreen: function() {
			Utilities.hideKeyboard();
			this.loadingDialog.hide();
			this.tabContainer.show();
			Utilities.removeBackgroundFromBody();
			Utilities.hideKeyboard();
		},
    });
});

