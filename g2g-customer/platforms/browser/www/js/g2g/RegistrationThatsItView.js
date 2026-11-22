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
		messageDialogView: null,

		startup: function () {
			this.inherited(arguments);
			this.nextBtn = registry.byId("registrationThatsItNextBtn");
			this.messageDialogView = registry.byId("messageDialog");
			// register events on the button
			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
		},
		show: function() {
			this.inherited(arguments);
		},
		next: function next() {
			// move to next screen
			this.moveToNextScreen();
			return false; // prevent the form from submitting
		},
		moveToNextScreen: function() {
			// next screen is the logn. it should show the usrename and password, since the username & password were written to the login screen fields in the RegistrationPaymentsView
			registry.byId("login").show();
		},
		
    });
});

