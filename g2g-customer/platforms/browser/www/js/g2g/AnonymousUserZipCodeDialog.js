define([
    "dojo/_base/declare",
    "dojox/mobile/SimpleDialog",
	"dijit/registry",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/_base/lang",
	"dojo/request",
    ], function(declare, SimpleDialog, registry, dom, domStyle, lang, request) {
        return declare([SimpleDialog], {

		anonymousUserZipCodeDialogOkBtn: null,
		anonymousUserZipCodeField: null,
		messageDialogView: null,
		loadingDialog: null,
		tabContainer: null,
		startup: function () {
			this.inherited(arguments);
			this.anonymousUserZipCodeDialogOkBtn = registry.byId("anonymousUserZipCodeDialogOkBtn");
			this.anonymousUserZipCodeField = registry.byId("anonymousUserZipCodeField");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.tabContainer = registry.byId('tabContainer');
			// register events on the button
			this.anonymousUserZipCodeDialogOkBtn.on("click", lang.hitch(this, this.ok));
		},
		show: function(finishCallbackRef) {
			this.inherited(arguments);
			this.anonymousUserZipCodeField.focus();
		},
		ok: function () {
			var zipCode = this.anonymousUserZipCodeField.get("value");
			if (this.isNumeric(zipCode)) {
				this.hide();
				GlobalObjects.anonymousUserZipCode = zipCode;
				GlobalObjects.currentUser = null;
				
				Utilities.hideKeyboard();
				Utilities.hideMyProfileButton();
				
				Utilities.updateMainHeader("Restaurants");
				this.tabContainer.show();
				Utilities.removeBackgroundFromBody();
				
			} else {
				this.hide();
				this.anonymousUserZipCodeField.set("value", "");
				this.messageDialogView.show("Invalid zip code");
			}
			return false;// prevent the form from submitting
		},
		isNumeric: function (input) 		{
		    return (input - 0) == input && (''+input).trim().length > 0;
		}
    });
});

