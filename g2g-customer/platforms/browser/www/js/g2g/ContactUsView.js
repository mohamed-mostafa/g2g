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
		
        sendMessageBtn: null,
        contactUsSubjectField: null,
        contactUsMessageField: null,
        loadingDialog: null,
        messageDialog: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.sendMessageBtn = registry.byId("sendMessageBtn");
			this.sendMessageBtn.on("click", lang.hitch(this, this.sendMessage));
			this.contactUsMessageField = registry.byId("contactUsMessageField");
			this.contactUsSubjectField = registry.byId("contactUsSubjectField");
			this.loadingDialog = registry.byId("loadingDialog");
			this.messageDialog = registry.byId("messageDialog");
		},
		// when the dialog is shown
		openDialog: function(subject, body) {
			Utilities.hideKeyboard();
			this.show();
			
			if (subject) {
				this.contactUsSubjectField.set("value", subject);
			}
			if (body) {
				this.contactUsMessageField.set("value", body);
			}
		},
		sendMessage: function() {
			
			Utilities.hideKeyboard();
			var userId = null;
			if (GlobalObjects.currentUser == null) { // anonymous mode
				userId = -2; // ID of the anonymous user in the backend
			} else {
				userId = GlobalObjects.currentUser.id;
			}
			this.loadingDialog.show("Sending your message ...");
			var data = {userId: userId,
					subject: this.contactUsSubjectField.get("value"), 
					message: this.contactUsMessageField.get("value")
					};
			promise = request.put(GlobalObjects.serverURL + '/user/contact', {data: JSON.stringify(data), handleAs:'json', headers:{"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, this.onSendMessageResponse), lang.hitch(this, this.onSendMessageError));
			
		},
		onSendMessageResponse: function() {
			this.loadingDialog.hide();
			this.messageDialog.show("Your message has been sent ...");
			this.hide();
		},
		onSendMessageError: function(err) {
			this.loadingDialog.hide();
			// display error message
			if (err.response.status == 0) {
				this.messageDialog.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialog.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialog.show(err.response.text);
			}
		}
    });
});