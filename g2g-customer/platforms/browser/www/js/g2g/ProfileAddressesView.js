define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/on"
    ], function(declare, View, registry, lang,ProgressIndicator, win, dom, domStyle,on) {
        return declare([View], {

		nextBtn: null,
		progressIndicator: null,	
		addressNicknameField: null,
		streetAddress1Field: null,
		streetAddress2Field: null,
		cityField: null,
		zipCodeField: null,
		stateField: null,
		messageDialogView: null,
		nextAddressBtn: null,
		addAnotherAddressBtn: null,
		previousAddressBtn: null,
		nextAddressImg: null,
		addAnotherAddressImg: null,
		previousAddressImg: null,
		deleteAddressBtn: null,
        
		currentAddressIndex: 0,
		lastAddressAdded: true, // a flag to be used before adding the address to the list of addresses when the user clicks the next button
		
		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("profileAddressesNextBtn");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
			this.addressNicknameField = registry.byId("profileAddressNickname");
			this.streetAddress1Field = registry.byId("profileStreetAddress");
			this.streetAddress2Field = registry.byId("profileStreetAddress2");
			this.cityField = registry.byId("profileCity");
			this.stateField = registry.byId("profileState");
			this.zipCodeField = registry.byId("profileZipCode");
			this.addressDetailsField = registry.byId("profileAddressDetails");
			this.messageDialogView = registry.byId("messageDialog");
			this.addAnotherAddressBtn = registry.byId("profileAddAnotherAddressBtn");
			this.addAnotherAddressImg = dom.byId("profileAddAnotherAddressImg");
			this.nextAddressBtn = registry.byId("profileNextAddressBtn");
			this.nextAddressImg = dom.byId("profileNextAddressImg");
			this.previousAddressBtn = registry.byId("profilePreviousAddressBtn");
			this.previousAddressImg = dom.byId("profilePreviousAddressImg");
			this.deleteAddressBtn = registry.byId("profileDeleteAddressBtn");
			// events
			this.addAnotherAddressBtn.on("click", lang.hitch(this, this.addAnother));
			on(this.addAnotherAddressImg, "click", lang.hitch(this, this.addAnother));
			this.nextAddressBtn.on("click", lang.hitch(this, this.nextAddress));
			on(this.nextAddressImg ,"click", lang.hitch(this, this.nextAddress));
			this.previousAddressBtn.on("click", lang.hitch(this, this.previousAddress));
			on(this.previousAddressImg, "click", lang.hitch(this, this.previousAddress));
			this.deleteAddressBtn.on("click", lang.hitch(this, this.deleteAddress));
		},
		deleteAddress: function() {
			if (GlobalObjects.currentUser.addresses.length != 0) {
				// remove the item at the current index
				GlobalObjects.currentUser.addresses.splice(this.currentAddressIndex, 1);
				this.currentAddressIndex --;
				
				if (GlobalObjects.currentUser.addresses.length == 0) {
					// if the list is now empty, clear
					this.clearValues();
					this.lastAddressAdded = false;
				} else {
					if (this.currentAddressIndex < 0) {
						this.currentAddressIndex = 0;
					}
					this.displayAddressesOfIndex(this.currentAddressIndex);
					this.lastAddressAdded = true;
				}
			}
		},
		copyValuesToObject: function(index) {
			var address = {
					nickname: this.addressNicknameField.get("value"),
					streetAddress1: this.streetAddress1Field.get("value"),
					streetAddress2: this.streetAddress2Field.get("value"),
					state: this.stateField.get("value"),
					city: city = this.cityField.get("value"),
					zipCode: this.zipCodeField.get("value"),
					addressDetails:this.addressDetailsField.get("value")
			};
			if (GlobalObjects.currentUser.addresses.length == 0 && index == 0) { // if for some reason, no addresses exists, keep the index at 0
				GlobalObjects.currentUser.addresses.push(address);
			} else { // the normal case, some addresses will exist
				GlobalObjects.currentUser.addresses[index] = address;
			}
		},
		fixScrollablePanelHeight: function() {
			var scrollablePane = dom.byId("profileAddressesScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			console.log("New Height: " + height);
			domStyle.set(scrollablePane, "height", height);
		},
		onAfterTransitionIn: function() {
			this.currentAddressIndex = 0;
			this.displayAddressesOfIndex(this.currentAddressIndex);
			this.lastAddressAdded= true;
		},
		nextAddress: function() {
			// if you clicked next after adding a new address, add it then stop
			if (!this.lastAddressAdded) {
				if (this.validateStreetAddress() && 
						this.validateCity() &&
						this.validateState() &&
						this.validateNickname() &&
						this.validateZipCode()) {
					// add the current values to the list
					this.addAddressToList();
					this.lastAddressAdded = true;
					this.currentAddressIndex ++;// new item has the new index, and it is the current now
				}
			} else {
				// clicking previous means that you might have updated the values in the 'current' address
				this.copyValuesToObject(this.currentAddressIndex);
				if (this.currentAddressIndex < GlobalObjects.currentUser.addresses.length -1 ) {
					this.currentAddressIndex++;
					this.displayAddressesOfIndex(this.currentAddressIndex);
				}
			}
		},
		previousAddress: function() {
			// if you clicked previous after adding a new address, add it then go to the previous one
			if (!this.lastAddressAdded) {
				if (this.validateStreetAddress() && 
						this.validateCity() &&
						this.validateState() &&
						this.validateNickname() &&
						this.validateZipCode()) {
					// add the current values to the list
					this.addAddressToList();
					this.lastAddressAdded = true;
					
					this.currentAddressIndex = GlobalObjects.currentUser.addresses.length - 2;
					this.displayAddressesOfIndex(this.currentAddressIndex); 
				}
			} else {
				// clicking previous means that you might have updated the values in the 'current' address
				this.copyValuesToObject(this.currentAddressIndex);
				if (this.currentAddressIndex > 0) {
					this.currentAddressIndex--;
					this.displayAddressesOfIndex(this.currentAddressIndex);
				}
			}
		},
		addAnother: function() {
			
			if (GlobalObjects.currentUser.addresses.length == 0) {
				// user is clicking add another while the list is empty, he must have written something 
				if (this.validateStreetAddress() && 
						this.validateCity() &&
						this.validateState() &&
						this.validateNickname() &&
						this.validateZipCode()) {
					// if valid, add it to list, and mark as last one is added
					this.addAddressToList();
					this.lastAddressAdded = true;
					// don't increment the counter, it is already at 0
				}
			}
			
			if (this.lastAddressAdded) {
				this.clearValues();
				// reset the flag, when the user clicks the next button, the address should be added
				this.lastAddressAdded = false;
			}
		},
		clearValues: function() {
			// clear values
			this.addressNicknameField.set("value", ""),
			this.streetAddress1Field.set("value", "");
			this.streetAddress2Field.set("value", "");
			this.stateField.set("value", "");
			this.cityField.set("value", "");
			this.zipCodeField.set("value", "");
			this.addressDetailsField.set("value", "");
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
		displayAddressesOfIndex: function(index) {
			// if the addresses are empty (not a common situation) ... then display nothing
			if (GlobalObjects.currentUser.addresses.length == 0) {
				return;
			}
			this.addressNicknameField.set("value", GlobalObjects.currentUser.addresses[index].nickname);
			this.streetAddress1Field.set("value", GlobalObjects.currentUser.addresses[index].streetAddress1);
			this.streetAddress2Field.set("value", GlobalObjects.currentUser.addresses[index].streetAddress2);
			this.cityField.set("value", GlobalObjects.currentUser.addresses[index].city);
			this.stateField.set("value", GlobalObjects.currentUser.addresses[index].state);
			this.zipCodeField.set("value", GlobalObjects.currentUser.addresses[index].zipCode);
			this.addressDetailsField.set("value", GlobalObjects.currentUser.addresses[index].addressDetails);
		},
		next: function next() {
			if (GlobalObjects.currentUser.addresses.length > 0 && this.allFieldsAreEmpty()) {
				// no need to validate, the user already has some addresses
				this.moveToNextScreen();
			} else {
				// we need to validate
				if (this.validateStreetAddress() && 
						this.validateCity() &&
						this.validateState() &&
						this.validateZipCode()) {
					
					if (!this.lastAddressAdded) { // the button was not clicked before for the current address, so add it
						// since the address is valid, add it to the list of addresses of the user
						this.addAddressToList(); // or should I always replace the last address with the current one ?
						this.lastAddressAdded = true;
					} else {
						// you might have updated the values in the 'current' address, and we're sure they are valid
						this.copyValuesToObject(this.currentAddressIndex);
					}
					this.moveToNextScreen();
				}
			}
		},
		moveToNextScreen: function()  {
			
			Utilities.hideKeyboard();
			
			var registrationPaymentsTabBarButton = registry.byId("profilePaymentsTabBarButton");
			registrationPaymentsTabBarButton.set("selected", true);
			var thisView = registry.byId("profileAddressesView");
			thisView.performTransition("#profilePaymentsView", 1, null, null);
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
		validateStreetAddress: function() {
			// check if street address is provided
			if ((this.streetAddress1Field.get("value") == null || this.streetAddress1Field.get("value") == '') && (this.streetAddress2Field.get("value") == null || this.streetAddress2Field.get("value") == '')) {
				// show alert and move the focus to the streedAddress1Field text box
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

