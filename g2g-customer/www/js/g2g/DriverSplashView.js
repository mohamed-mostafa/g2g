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
		progressIndicator: null,	
		messageDialogView: null,
		emptyScreen: null,
		loadingDialog: null,

		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.signInBtn = registry.byId("driverSignInBtn");
			this.signUpBtn = registry.byId("becomeADriverBtn");
			this.emptyScreen = registry.byId("emptyScreen");
			this.loadingDialog = registry.byId("loadingDialog");
			
			// register events on the buttons
			this.signInBtn.on("click", lang.hitch(this, this.signIn));
			this.signUpBtn.on("click", lang.hitch(this, this.signUp));
			this.progressIndicator = ProgressIndicator.getInstance();
			Utilities.addBackgroundToBody();
		},
		signIn: function() {
			Utilities.hideKeyboard();
			var splash = registry.byId("driverSplash");
			Utilities.removeBackgroundFromBody();// will be removed after the login screen
			splash.performTransition("#driverLogin", 1, null);
			Utilities.hideKeyboard();
		},
		signUp: function() {
			Utilities.hideKeyboard();
//			var splash = registry.byId("driverSplash");
//			splash.performTransition("#driverRegistration", 1, null);
			this.loadingDialog.show("Please wait ...");
			var ref = window.open('http://drive.g2gapp.com', '_blank', 'location=no,closebuttoncaption=Back,hidden=yes');
			ref.addEventListener('loadstop', lang.hitch(this, function() {
				ref.show();
				this.loadingDialog.hide();
			}));
//			Utilities.removeBackgroundFromBody();
			Utilities.hideKeyboard();
		},
		show: function() {
			this.inherited(arguments);
			Utilities.addBackgroundToBody();
			Utilities.hideKeyboard();
		},
    });
});

