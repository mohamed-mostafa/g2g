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

    	submitBtn: null,
		progressIndicator: null,
		fullNameField: null,
		dateOfBirthField: null,
		phoneNumberField: null,
		cityField: null,
		emailAddressField: null,
		messageDialogView: null,
		loadingDialog: null,

		startup: function () {
			this.inherited(arguments);
			this.submitBtn = registry.byId("newDriverSubmitBtn");
			// register events on the button
			this.submitBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
			this.fullNameField = registry.byId("newDriverFullName");
			this.emailAddressField = registry.byId("newDriverEmailAddress");
			this.dateOfBirthField = registry.byId("newDriverDateOfBirth");
			this.phoneNumberField = registry.byId("newDriverPhoneNumber");
			this.cityField = registry.byId("newDriverCity");
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
			if (this.validateName() && 
					this.validateEmailAddress() &&
					this.validateDateOfBirth() && 
					this.validateCity() &&
					this.validatePhoneNumber()) {
				this.loadingDialog.show("Sending your request to become a driver to G2G ...");
				
				var data = {userId: -2,
						subject: this.fullNameField.get("value") +  "requested to become a driver", 
						message: "Name: " + this.fullNameField.get("value") + ", City: " + this.cityField.get("value") + ", Phone: " + this.phoneNumberField.get("value")
						};
				promise = request.put(GlobalObjects.serverURL + '/user/contact', {data: JSON.stringify(data), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onSendMessageResponse), lang.hitch(this, this.onSendMessageError));
			} else {
				// do nothing, invalid form
			}
			return false;// prevent the form from submitting
		},
		onSendMessageResponse: function() {
			this.loadingDialog.hide();
			this.messageDialogView.show("Thank you for applying at G2G. We will get in touch with you as soon as possible ...");
			
			var splash = registry.byId("driverRegistration");
			splash.performTransition("#driverSplash", 1, null);
		},
		onSendMessageError: function(err) {
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
		validateName: function() {
			// check if first name is provided
			if (this.fullNameField.get("value") == null || this.fullNameField.get("value") == '') {
				// show alert and move the focus to the firstname text box
				this.messageDialogView.show("Full name is required");
				this.fullNameField.focus();
				return false;
			}
			return true;
		},
		validateCity: function() {
			// check if last name is provided
			if (this.cityField.get("value") == null || this.cityField.get("value") == '') {
				// show alert and move the focus to the firstname text box
				this.messageDialogView.show("City is required");
				this.cityField.focus();
				return false;
			}
			return true;
		},
		validateEmailAddress: function() {
			// check if last name is provided
			if (this.emailAddressField.get("value") == null || this.emailAddressField.get("value") == '') {
				// show alert and move the focus to the firstname text box
				this.messageDialogView.show("Email Address is required");
				this.emailAddressField.focus();
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

