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

		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.customerBtn = registry.byId("iAmCustomerBtn");
			this.driverBtn = registry.byId("iAmDriverBtn");
			this.emptyScreen = registry.byId("emptyScreen");
			
			// register events on the buttons
			this.driverBtn.on("click", lang.hitch(this, this.driverBtnClicked));
			this.customerBtn.on("click", lang.hitch(this, this.customerBtnClicked));
			this.progressIndicator = ProgressIndicator.getInstance();
			Utilities.addBackgroundToBody();
			
			// cache asynchron
			Utilities.getAndCacheRestaurantsLogos();
			Utilities.getAndCacheAds();
			
		},
		driverBtnClicked: function () {
			var splash = registry.byId("splash");
			splash.performTransition("#driverSplash", 1, 'slide');
		},
		customerBtnClicked: function () {
			var splash = registry.byId("splash");
			splash.performTransition("#customerSplash", 1, 'slide');
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

