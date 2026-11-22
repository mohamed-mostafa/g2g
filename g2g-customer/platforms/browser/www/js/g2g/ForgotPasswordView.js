define([
    "dojo/_base/declare",
	"dojox/mobile/RoundRectList",
	"dijit/registry",
	"dojox/mobile/ListItem",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/request"
    ], function(declare, RoundRectList, registry, ListItem, JSON, lang, array, on, SimpleDialog, request) {
        return declare([SimpleDialog], {
		
        resetPasswordBtn: null,
        loadingDialog: null,
        messageDialogView: null, 
        resetPasswordEmail: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.resetPasswordBtn = registry.byId("resetPasswordBtn");
			this.resetPasswordBtn.on("click", lang.hitch(this, this.resetPassword));
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialogView = registry.byId("messageDialog");
			this.resetPasswordEmail = registry.byId("resetPasswordEmail");
		},
		// when the dialog is shown
		show: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
		},
		resetPassword: function() {
			
			Utilities.hideKeyboard();
			
			this.loadingDialog.show("Resetting your password ...");
			var data = {emailAddress: this.resetPasswordEmail.get("value")};
			promise = request.post(GlobalObjects.serverURL + '/user/passwordreset', {data: JSON.stringify(data), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, this.onResetPasswordResponse), lang.hitch(this, this.onResetPasswordError));
			this.hide();
		},
		onResetPasswordResponse: function() {
			this.loadingDialog.hide();
			this.messageDialogView.show("Your password has been reset. Check your email for details.");
			this.hide();
		},
		onResetPasswordError: function(err) {
			this.loadingDialog.hide();
			// display error message
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialogView.show(err.response.text);
			}
		}
    });
});