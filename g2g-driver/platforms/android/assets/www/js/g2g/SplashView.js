define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/_base/window",
	"dojo/dom-class"
    ], function(declare, View, registry, lang,ProgressIndicator, win, domClass) {
        return declare([View], {

		signInBtn: null,
		signUpBtn: null,
		justLetMeInBtn: null,
		progressIndicator: null,	
		messageDialogView: null,
		emptyScreen: null,
		anonymousUserZipCodeDialog: null,

		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.signInBtn = registry.byId("signInBtn");
			this.signUpBtn = registry.byId("signUpBtn");
			this.emptyScreen = registry.byId("emptyScreen");
			
			// register events on the buttons
			this.signInBtn.on("click", lang.hitch(this, this.signIn));
			this.signUpBtn.on("click", lang.hitch(this, this.signUp));
			this.progressIndicator = ProgressIndicator.getInstance();
			Utilities.addBackgroundToBody();
			
			Utilities.getAndCacheRestaurantsLogos();
		},
		signIn: function signIn() {
			var splash = registry.byId("splash");
			Utilities.removeBackgroundFromBody();// will be removed after the login screen
			splash.performTransition("#login", -1, null);
		},
		signUp: function signUp() {
			this.messageDialogView.show("This feature is not enabled yet")
		},
		show: function() {
			this.inherited(arguments);
			Utilities.addBackgroundToBody();
		},
	    initializeDbFailureCallback: function(err) {
	    	console.log(JSON.stringify(err));
	    	this.messageDialogView.on("closeButtonClick", function() {
	    		// do nothing to keep the box shown
	    	});
	    	this.messageDialogView.show("Failed to initialize G2G. Please make sure your device is supported by G2G.");
	    } 
    });
});

