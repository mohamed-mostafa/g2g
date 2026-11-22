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
		firstNameTextField: null,
		lastNameTextField: null,
		dateOfBirthField: null,
//		emailField: null,
		phoneNumberField: null,
		messageDialogView: null,

		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("profilePersonalNextBtn");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
			
			this.firstNameField = registry.byId("profileFirstName");
			this.lastNameField = registry.byId("profileLastName");
			this.dateOfBirthField = registry.byId("profileDateOfBirth");
//			this.emailField = registry.byId("profileEmail");
			this.phoneNumberField = registry.byId("profilePhoneNumber");
			this.messageDialogView = registry.byId("messageDialog");
			
		},
		fixScrollablePanelHeight: function() {
			var scrollablePane = dom.byId("profilePersonalScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			console.log("New Height: " + height);
			domStyle.set(scrollablePane, "height", height);
		},
		onAfterTransitionIn: function() {
			this.firstNameField.set("value", GlobalObjects.currentUser.firstName);
			this.lastNameField.set("value", GlobalObjects.currentUser.lastName);
			var birthDate = new Date(GlobalObjects.currentUser.dateOfBirth);
			var yyyy = birthDate.getFullYear().toString();
			var mm = (birthDate.getMonth()+1).toString(); // getMonth() is zero-based
			var dd  = birthDate.getDate().toString();
			var finalDate = yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
			this.dateOfBirthField.set("value", finalDate);
//			this.emailField.set("value", GlobalObjects.currentUser.emailAddress);
			this.phoneNumberField.set("value", GlobalObjects.currentUser.phone);
		},
		next: function next() {
			if (this.validateFirstName() && 
					this.validateLastName() && 
					this.validateDateOfBirth() && 
					this.validateEmail() && 
					this.validatePhoneNumber()) {
				
				// move the fields' values to the object
				GlobalObjects.currentUser.firstName = this.firstNameField.get("value");
				GlobalObjects.currentUser.lastName = this.lastNameField.get("value");
				GlobalObjects.currentUser.emailAddress = GlobalObjects.currentUser.username;
				GlobalObjects.currentUser.phone = this.phoneNumberField.get("value");
				GlobalObjects.currentUser.dateOfBirth = this.dateOfBirthField.get("value");
				
				Utilities.hideKeyboard();
				
				var registrationAddressesTabBarButton = registry.byId("profileAddressesTabBarButton");
				registrationAddressesTabBarButton.set("selected", true);
				var thisView = registry.byId("profilePersonalView");
				thisView.performTransition("#profileAddressesView", 1, null, null);
			}
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
		validateEmail: function() {
			// check if email address is provided
//			if (this.emailField.get("value") == null || this.emailField.get("value") == '') {
//				// show alert and move the focus to the emailField text box
//				this.messageDialogView.show("Email address is required");
//				this.emailField.focus();
//				return false;
//			}
//			
//			// check if email is in a correct format
//			var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//		    if(!emailRegex.test(this.emailField.get("value"))) {
//		    	this.messageDialogView.show("Email address is not valid");
//		    	this.emailField.focus();
//		    	return false;
//		    }
		    return true;
		},
		validatePhoneNumber: function() {
			// check if phone number is provided
			if (this.phoneNumberField.get("value") == null || this.phoneNumberField.get("value") == '') {
				// show alert and move the focus to the phoneNumberField text box
				this.messageDialogView.show("Phone number is required");
				this.phoneNumberField.focus();
				return false;
			}
			return true;
		}
    });
});

