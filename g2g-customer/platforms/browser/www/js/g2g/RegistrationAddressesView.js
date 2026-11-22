define([
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/request"
    ], function(declare, ScrollableView, registry, lang,ProgressIndicator, win, dom, domStyle, request) {
        return declare([ScrollableView], {

		nextBtn: null,
		addAnotherAddressBtn: null,
		progressIndicator: null,	
		addressNicknameField: null,
		streetAddress1Field: null,
		streetAddress2Field: null,
		cityField: null,
		zipCodeField: null,
		stateField: null,
		addressDetailsField: null,
		messageDialogView: null,
		loadingDialog: null,
		
		lastAddressAdded: false, // a flag to be used before adding the address to the list of addresses when the user clicks the next button

		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("registrationAddressesNextBtn");
			this.addAnotherAddressBtn = registry.byId("addAnotherAddressBtn");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.addAnotherAddressBtn.on("click", lang.hitch(this, this.addAnotherAddress));
			this.progressIndicator = ProgressIndicator.getInstance();
			this.addressNicknameField = registry.byId("registrationAddressNickname");
			this.streetAddress1Field = registry.byId("newStreetAddress");
			this.streetAddress2Field = registry.byId("newStreetAddress2");
			this.cityField = registry.byId("newCity");
			this.stateField = registry.byId("newState");
			this.zipCodeField = registry.byId("newZipCode");
			this.addressDetailsField = registry.byId("newAddressDetails");
			this.addressDetailsField.set("value", "");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
		},
		show: function() {
			this.inherited(arguments);
		},
		allFieldsAreEmpty: function() {
			return (this.streetAddress1Field.get("value") == null || this.streetAddress1Field.get("value") == "") &&
					(this.streetAddress2Field.get("value") == null || this.streetAddress2Field.get("value") == "") &&
					(this.cityField.get("value") == null || this.cityField.get("value") == "") &&
					(this.stateField.get("value") == null || this.stateField.get("value") == "") &&
					(this.addressDetailsField.get("value") == null || this.addressDetailsField.get("value") == "") &&
					(this.addressNicknameField.get("value") == null || this.addressNicknameField.get("value") == "") &&
					(this.zipCodeField.get("value") == null || this.zipCodeField.get("value") == "");
		},
		next: function next() {
			if (GlobalObjects.currentUser.addresses.length > 0 && this.allFieldsAreEmpty()) {
				// we have at least one address, and now all the fields are empty, we can move on, skip validation
				this.moveToNextScreen();
			} else {
				// we need to validate, as either there're no addresses for the user, or there are addresses, but the user has input some values in the fields
				if (this.validateStreetAddress() && 
						this.validateState() &&
						this.validateCity() &&
						this.validateNickname() &&
						this.validateZipCode()) {
					
					if (!this.lastAddressAdded) { // the button was not clicked before for the current address, so add it
						// since the address is valid, add it to the list of addresses of the user
						this.addAddressToList(); // or should I always replace the last address with the current one ?
						this.lastAddressAdded = true; // 
					}
					this.moveToNextScreen();
				} else {
					// do nothing, form is invalid
				}
			}
			return false;// prevent the form from submitting
		},
		moveToNextScreen: function() {
			
			// register
			this.register();
			// hide the keyboard
			Utilities.hideKeyboard();
		},
		register: function() {
			this.loadingDialog.show("Registring with G2G ...");
			// the registration function, sends the GlobalObjects.currentUser as a JSON object to the server, where it is registered
			// the callback functions will have access to the error or the response
			promise = request.post(GlobalObjects.serverURL + '/user/register', {data: JSON.stringify({user:GlobalObjects.currentUser}), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.then(lang.hitch(this, this.registrationSuccessCallback), lang.hitch(this, this.registrationFailureCallback));
		},
		registrationSuccessCallback: function(response) {
			// registration succeeded, set the username and password to the login screen
//			this.storageManager.saveCredentials(GlobalObjects.currentUser.username, GlobalObjects.currentUser.password, function() {}, function() {});
			registry.byId("username").set("value", GlobalObjects.currentUser.username);
			registry.byId("password").set("value", GlobalObjects.currentUser.password);
			// when registration responds successfully, save the payment methods to the device
			// we have the response object, which is a user object, save it to the current user
			GlobalObjects.currentUser = response.user;
			GlobalObjects.selectedAddress = GlobalObjects.currentUser.addresses[0];
			GlobalObjects.selectedPaymentMethod = null;
			
			this.loadingDialog.hide();
			
			// move to that's it screen
			var registrationPaymentsTabBarButton = registry.byId("registrationThatsItTabBarButton");
			registrationPaymentsTabBarButton.set("selected", true);
			var thisView = registry.byId("registrationAddressesView");
			thisView.performTransition("#registrationThatsItView", 1, null, null);
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
		addAnotherAddress: function() {
			if (this.validateStreetAddress() && 
					this.validateCity() &&
					this.validateState() &&
					this.validateNickname() &&
					this.validateZipCode()) {
				
				// add the current values to the list
				this.addAddressToList();
				// clear values
				this.addressNicknameField.set("value", ""),
				this.streetAddress1Field.set("value", "");
				this.streetAddress2Field.set("value", "");
				this.stateField.set("value", "");
				this.cityField.set("value", "");
				this.zipCodeField.set("value", "");
				this.addressDetailsField.set("value", "");
				// reset the flag, when the user clicks the next button, the address should be added
				this.lastAddressAdded = false;
			}
			return false;
		},
		addAddressToList: function() {
			// move the fields to the object
			var newAddress = {
				nickname: this.addressNicknameField.get("value"),
				streetAddress1: this.streetAddress1Field.get("value"),
				streetAddress2: this.streetAddress2Field.get("value"),
				state: this.stateField.get("value"),
				city: this.cityField.get("value"),
				zipCode: this.zipCodeField.get("value"),
				addressDetails: this.addressDetailsField.get("value")
			};
			GlobalObjects.currentUser.addresses.push(newAddress);
		},
		validateStreetAddress: function() {
			// check if street address is provided
			if ((this.streetAddress1Field.get("value") == null || this.streetAddress1Field.get("value") == '') && (this.streetAddress2Field.get("value") == null || this.streetAddress2Field.get("value") == '')) {
				// show alert and move the focus to the streedAddress1Field text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("Street address is required");
				this.streetAddress1Field.focus();
				return false;
			}
			return true;
		},
		validateState: function() {
			// check if state is provided
			if (this.stateField.get("value") == null || this.stateField.get("value") == '') {
				// show alert and move the focus to the state text box
				Utilities.hideKeyboard();
				this.messageDialogView.show("State is required");
				this.stateField.focus();
				return false;
			}
			return true;
		},
		validateCity: function() {
			// check if city is provided
			if (this.cityField.get("value") == null || this.cityField.get("value") == '') {
				// show alert and move the focus to the city text box
				this.messageDialogView.show("City is required");
				this.cityField.focus();
				return false;
			}
			return true;
		},
		validateZipCode: function() {
			// check if zip code is provided
			if (this.zipCodeField.get("value") == null || this.zipCodeField.get("value") == '') {
				// show alert and move the focus to the zip code text box
				this.messageDialogView.show("Zip Code is required");
				this.zipCodeField.focus();
				return false;
			}
			return true;
		},
		validateNickname: function() {
			// check if nickname is provided
			if (this.addressNicknameField.get("value") == null || this.addressNicknameField.get("value") == '') {
				// show alert and move the focus to the addressNicknameField text box
				this.messageDialogView.show("Nickname is required");
				this.addressNicknameField.focus();
				return false;
			}
			return true;
		}
    });
});

