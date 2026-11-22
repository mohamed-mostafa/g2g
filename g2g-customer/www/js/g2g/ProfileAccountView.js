define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style"
    ], function(declare, View, registry, lang,ProgressIndicator, win, dom, domStyle) {
        return declare([View], {

		nextBtn: null,
		progressIndicator: null,	
		usernameTextBox: null,
		passwordTextBox: null,
		confirmPasswordTextBox: null,
		messageDialogView: null,
		
		startup: function () {
			this.nextBtn = registry.byId("profileAccountNextBtn");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
			
			this.usernameTextBox = registry.byId("profileUsername");
			this.passwordTextBox = registry.byId("profilePassword");
			this.confirmPasswordTextBox = registry.byId("confirmProfilePassword");
			this.messageDialogView = registry.byId("messageDialog");
			this.inherited(arguments);
		},
		fixScrollablePanelHeight: function() {
			var scrollablePane = dom.byId("profileAccountScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			console.log("New Height: " + height);
			domStyle.set(scrollablePane, "height", height);
		},
		onAfterTransitionIn: function() {
			this.usernameTextBox.set("value", GlobalObjects.currentUser.username);
			this.passwordTextBox.set("value", GlobalObjects.currentUser.password);
			this.confirmPasswordTextBox.set("value", GlobalObjects.currentUser.password);
		},
		show: function() {
			this.usernameTextBox.set("value", GlobalObjects.currentUser.username);
			this.passwordTextBox.set("value", GlobalObjects.currentUser.password);
			this.confirmPasswordTextBox.set("value", GlobalObjects.currentUser.password);
			this.inherited(arguments);
		},
		next: function next() {
			if (this.validatePassword()) {
				
				// decide if we need to update the password
				if (this.passwordTextBox.get("value") != GlobalObjects.currentUser.password) {
					GlobalObjects.userChangedHisPassword = true;
				}
				
				// move the values in the fields to the object
				GlobalObjects.currentUser.username = this.usernameTextBox.get("value");
				GlobalObjects.currentUser.password = this.passwordTextBox.get("value");
				
				Utilities.hideKeyboard();
				
				var registrationPersonalTabBarButton = registry.byId("profilePersonalTabBarButton");
				registrationPersonalTabBarButton.set("selected", true);
				var thisView = registry.byId("profileAccountView");
				thisView.performTransition("#profilePersonalView", 1, null, null);
			}
		},
		validatePassword: function() {
			// check if password is provided
			if (this.passwordTextBox.get("value") == null || this.passwordTextBox.get("value") == '') {
				// show alert and move the focus to the password text box
				this.messageDialogView.show("Please provide your existing password or a new password");
				this.passwordTextBox.focus();
				return false;
			}
			
			// check if password is 8 characters
			if (this.passwordTextBox.get("value").length < 8) {
				// show alert and move the focus to the password text box
				this.messageDialogView.show("Password has to be at least 8 characters long");
				this.passwordTextBox.focus();
				return false;
			}
			
			// check if both passwords are identical
			if (this.passwordTextBox.get("value") != this.confirmPasswordTextBox.get("value")) {
				// show alert and move the focus to the confirm password text box
				this.messageDialogView.show("The password and the confirmation don't match");
				this.confirmPasswordTextBox.focus();
				return false;
			}
			return true;
		}
    });
});

