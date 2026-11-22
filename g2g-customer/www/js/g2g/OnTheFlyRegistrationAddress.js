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
		addressNicknameField: null,
		streetAddress1Field: null,
		streetAddress2Field: null,
		cityField: null,
		zipCodeField: null,
		stateField: null,
		addressDetailsField: null,
		messageDialogView: null,
		registrationFinalizationCallback: null,
		finalBtnName: null,
		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("onTheFlyRegistrationAddressNextBtn");
			this.addressNicknameField = registry.byId("onTheFlyRegistrationAddressNickname");
			this.streetAddress1Field = registry.byId("onTheFlyRegistrationNewStreetAddress");
			this.streetAddress2Field = registry.byId("onTheFlyRegistrationNewStreetAddress2");
			this.cityField = registry.byId("onTheFlyRegistrationNewCity");
			this.stateField = registry.byId("onTheFlyRegistrationNewState");
			this.zipCodeField = registry.byId("onTheFlyRegistrationNewZipCode");
			this.addressDetailsField = registry.byId("onTheFlyRegistrationNewAddressDetails");
			if (this.addressDetailsField) this.addressDetailsField.set("value", "");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialogView = registry.byId("messageDialog");
		},
		show: function(registrationFinalizationCallback, finalBtnName) {
			this.zipCodeField.set("value", GlobalObjects.anonymousUserZipCode);
			this.registrationFinalizationCallback = registrationFinalizationCallback;
			this.finalBtnName = finalBtnName;
			Utilities.hideKeyboard();
			this.inherited(arguments);
		},
		next: function next() {
			// hide the keyboard
			Utilities.hideKeyboard();
			// we need to validate, as either there're no addresses for the user, or there are addresses, but the user has input some values in the fields
			if (this.validateStreetAddress() && 
					this.validateState() &&
					this.validateCity() &&
					this.validateNickname() &&
					this.validateZipCode()) {
				// page is valid
				
				// add address to user's addresses
				this.addAddressToList();
				
				this.hide();
				registry.byId("onTheFlyRegistrationPayment").show(this.registrationFinalizationCallback, this.finalBtnName);
				
			} else {
				// do nothing, form is invalid
			}
			return false;// prevent the form from submitting
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
			GlobalObjects.onTheFlyUser.addresses.push(newAddress);
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

