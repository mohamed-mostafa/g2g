define([
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"g2g/MessageDialogView",
	"dojo/request",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style"
    ], function(declare, ScrollableView, registry, lang, ProgressIndicator, MessageDialogView, request, win, dom, domStyle) {
        return declare([ScrollableView], {

		nextBtn: null,
		loadingDialog: null,
		usernameTextBox: null,
		passwordTextBox: null,
		confirmPasswordTextBox: null,
		messageDialogView: null,

		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.nextBtn = registry.byId("registrationAccountNextBtn");
			
			this.usernameTextBox = registry.byId("newUsername");
			this.passwordTextBox = registry.byId("newPassword");
			this.confirmPasswordTextBox = registry.byId("confirmNewPassword");
			
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.loadingDialog = registry.byId("loadingDialog");

		},
		show: function() {
			this.inherited(arguments);
		},
		onAfterTransitionIn: function() {
			this.inherited(arguments);
		},
		next: function() {
			this.validatePage(lang.hitch(this, function(){
				// page is valid
				// hide the keyboard
				Utilities.hideKeyboard();
				// move the values in the fields to the object
				GlobalObjects.currentUser.username = this.usernameTextBox.get("value");
				GlobalObjects.currentUser.password = this.passwordTextBox.get("value");
				GlobalObjects.currentUser.emailAddress = this.usernameTextBox.get("value");
				// the form is valid, move to the next screen
				var registrationPersonalTabBarButton = registry.byId("registrationPersonalTabBarButton");
				registrationPersonalTabBarButton.set("selected", true);
				var thisView = registry.byId("registrationAccountView");
				thisView.performTransition("#registrationPersonalView", 1, null, null);
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
				onPageValid();
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

