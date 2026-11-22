define([
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/request",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style"
    ], function(declare, ScrollableView, registry, lang,ProgressIndicator, request, win, dom, domStyle) {
        return declare([ScrollableView], {

		nextBtn: null,
		progressIndicator: null,
		firstNameTextField: null,
		lastNameTextField: null,
		dateOfBirthField: null,
		phoneNumberField: null,
		messageDialogView: null,
		loadingDialog: null,

		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("registrationPersonalNextBtn");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
			this.firstNameField = registry.byId("newFirstName");
			this.lastNameField = registry.byId("newLastName");
			this.dateOfBirthField = registry.byId("newDateOfBirth");
			this.phoneNumberField = registry.byId("newPhoneNumber");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
		},
		show: function() {
			this.inherited(arguments);
		},
		onAfterTransitionIn: function() {
			this.inherited(arguments);
		},
		next: function next() {
			if (this.validateFirstName() && 
					this.validateLastName() && 
					this.validateDateOfBirth() && 
					this.validatePhoneNumber()) {
				
				// now validate email address
				this.validateEmail(lang.hitch(this, function() { //onValid
					// move the fields' values to the object
					GlobalObjects.currentUser.firstName = this.firstNameField.get("value");
					GlobalObjects.currentUser.lastName = this.lastNameField.get("value");
					GlobalObjects.currentUser.phone = this.phoneNumberField.get("value");
					GlobalObjects.currentUser.dateOfBirth = this.dateOfBirthField.get("value");
					
					// hide the keyboard
					Utilities.hideKeyboard();
					var registrationAddressesTabBarButton = registry.byId("registrationAddressesTabBarButton");
					registrationAddressesTabBarButton.set("selected", true);
					var thisView = registry.byId("registrationPersonalView");
					thisView.performTransition("#registrationAddressesView", 1, null, null);
				}),
				lang.hitch(this, function() { // on inValid
					
				}));
			} else {
				// do nothing, invalid form
			}
			return false;// prevent the form from submitting
		},
		validateFirstName: function() {
			// check if first name is provided
			if (this.firstNameField.get("value") == null || this.firstNameField.get("value") == '') {
				// show alert and move the focus to the firstname text box
				this.messageDialogView.show("First name is required");
				this.firstNameField.focus();
				return false;
			}
			return true;
		},
		validateLastName: function() {
			// check if last name is provided
			if (this.lastNameField.get("value") == null || this.lastNameField.get("value") == '') {
				// show alert and move the focus to the firstname text box
				this.messageDialogView.show("Last name is required");
				this.lastNameField.focus();
				return false;
			}
			return true;
		},
		validateDateOfBirth: function() {
			// check if birth date is provided
			if (this.dateOfBirthField.get("value") == null || this.dateOfBirthField.get("value") == '') {
				// show alert and move the focus to the dateOfBirthField text box
				this.messageDialogView.show("Birthdate is required");
				this.dateOfBirthField.focus();
				return false;
			}
			return true;
		},
		validateEmail: function(onValid, onInvalid) {
			onValid();
		},
		validatePhoneNumber: function() {
			// check if phone number is provided
			if (this.phoneNumberField.get("value") == null || this.phoneNumberField.get("value") == '') {
				// show alert and move the focus to the emailField text box
				this.messageDialogView.show("Phone number is required");
				this.phoneNumberField.focus();
				return false;
			}
			return true;
		}
    });
});

