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
		usernameTextBox: null,
		passwordTextBox: null,
		confirmPasswordTextBox: null,
		firstNameTextField: null,
		lastNameTextField: null,
		phoneNumberField: null,
		messageDialogView: null,
		registrationFinalizationCallback: null,
		finalBtnName: null,
		
		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("onTheFlyRegistrationAccountNextBtn");
			this.usernameTextBox = registry.byId("onTheFlyRegistrationNewUsername");
			this.passwordTextBox = registry.byId("onTheFlyRegistrationNewPassword");
			this.confirmPasswordTextBox = registry.byId("onTheFlyRegistrationConfirmNewPassword");
			this.firstNameField = registry.byId("onTheFlyRegistrationNewFirstName");
			this.lastNameField = registry.byId("onTheFlyRegistrationNewLastName");
			this.phoneNumberField = registry.byId("onTheFlyRegistrationNewPhoneNumber");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialogView = registry.byId("messageDialog");
		},
		show: function(registrationFinalizationCallback, finalBtnName) {
			this.inherited(arguments);
			this.usernameTextBox.focus();
			Utilities.hideKeyboard();
			this.registrationFinalizationCallback = registrationFinalizationCallback;
			this.finalBtnName = finalBtnName;
			Utilities.hideKeyboard();
		},
		next: function() {
			// hide the keyboard
			Utilities.hideKeyboard();
			this.validatePage(lang.hitch(this, function(){
				// page is valid
				// move the values in the fields to the object
				GlobalObjects.onTheFlyUser.username = this.usernameTextBox.get("value");
				GlobalObjects.onTheFlyUser.password = this.passwordTextBox.get("value");
				GlobalObjects.onTheFlyUser.emailAddress = this.usernameTextBox.get("value");
				GlobalObjects.onTheFlyUser.firstName = this.firstNameField.get("value");
				GlobalObjects.onTheFlyUser.lastName = this.lastNameField.get("value");
				GlobalObjects.onTheFlyUser.phone = this.phoneNumberField.get("value");
				// the form is valid, move to the next screen
				this.hide();
				registry.byId("onTheFlyRegistrationAddress").show(this.registrationFinalizationCallback, this.finalBtnName);
			}),
			lang.hitch(this, function(invalidationMessage){
				// page is invalid
				this.messageDialogView.show(invalidationMessage);
			}));
			return false;// prevent the form from submitting
		},
		validatePage: function(onPageValid, onPageInvalid) {
			// check if username is provided
			if (this.usernameTextBox.get("value") == null || this.usernameTextBox.get("value") == '') {
				// show alert and move the focus to the username text box
				this.usernameTextBox.focus();
				onPageInvalid("Email Address is required");
				return;
			} else {
				// remove any spaces at the beginning or end of the username
				this.usernameTextBox.set("value", this.usernameTextBox.get("value").trim());
			}
			// check if username is available
			this.loadingDialog.show("Validating Email Address ...");
			var promise = request.get(GlobalObjects.serverURL + '/user/checkUsernameAvailability/' + this.usernameTextBox.get("value"), {handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response){
				this.loadingDialog.hide();
				var usernameAvailable = response.data.usernameAvailability;
				if (!usernameAvailable) {
					// show alert and move the focus to the username text box
					this.usernameTextBox.focus();
					onPageInvalid("Email address is already in use by a fellow G2G client");
					return;
				}
				
				// check if email is in a correct format
				var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    if(!emailRegex.test(this.usernameTextBox.get("value"))) {
			    	this.usernameTextBox.focus();
			    	onPageInvalid("Email address is not valid");
			    	return;
			    }
				
				// check if password is provided
				if (this.passwordTextBox.get("value") == null || this.passwordTextBox.get("value") == '') {
					// show alert and move the focus to the password text box
					this.passwordTextBox.focus();
					onPageInvalid("Password is required");
					return;
				}
				
				// check if password is 8 characters
				if (this.passwordTextBox.get("value").length < 8) {
					// show alert and move the focus to the password text box
					this.passwordTextBox.focus();
					onPageInvalid("Password has to be at least 8 characters long");
					return;
				}
				
				// check if both passwords are identical
				if (this.passwordTextBox.get("value") != this.confirmPasswordTextBox.get("value")) {
					// show alert and move the focus to the confirm password text box
					this.confirmPasswordTextBox.focus();
					onPageInvalid("The password and the confirmation don't match");
					return;
				}
				// check if first name is provided
				if (this.firstNameField.get("value") == null || this.firstNameField.get("value") == '') {
					// show alert and move the focus to the firstname text box
					this.firstNameField.focus();
					onPageInvalid("First name is required");
					return;
				}
				// check if last name is provided
				if (this.lastNameField.get("value") == null || this.lastNameField.get("value") == '') {
					// show alert and move the focus to the firstname text box
					this.lastNameField.focus();
					onPageInvalid("Last name is required");
					return;
				}
				// check if phone number is provided
				if (this.phoneNumberField.get("value") == null || this.phoneNumberField.get("value") == '') {
					// show alert and move the focus to the emailField text box
					this.phoneNumberField.focus();
					onPageInvalid("Phone number is required");
					return;
				}
				onPageValid();
				return true;
			}), lang.hitch(this, function(error){
				this.loadingDialog.hide();
				if (error.response.status == 0) {
					onPageInvalid("Failed to communicate with G2G servers. Please make sure you're connected to the internet");
				} else if (error.response.status == 404) {
					onPageInvalid("G2G servers are unable to process your request at this time");
				} else {
					onPageInvalid(error.response.text);
				}
			}));
		}
    });
});

