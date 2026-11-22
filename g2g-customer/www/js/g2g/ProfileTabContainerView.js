define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
    ], function(declare, View, request, domForm, JSON, registry, lang, ProgressIndicator){
        return declare([View], {
        	
        paymentsTabBarBtn: null,
        addressesTabBarBtn: null,
        accountTabBarBtn: null,
        personalTabBarBtn: null,
        thatsItTabBarBtn: null,
        initialView: null, // variable resetted every time after use
        initialTab: null, // variable resetted every time after user
        
        startup: function() {
        	this.inherited(arguments);
        	this.paymentsTabBarBtn = registry.byId("profilePaymentsTabBarButton");
        	this.addressesTabBarBtn = registry.byId("profileAddressesTabBarButton");
        	this.accountTabBarBtn = registry.byId("profileAccountTabBarButton");
        	this.personalTabBarBtn = registry.byId("profilePersonalTabBarButton");
        	this.thatsItTabBarBtn = registry.byId("profileThatsItTabBarButton");
        	this.paymentsTabBarBtn.on("click", function() {return false;});
        	this.paymentsTabBarBtn.on("touchStart", function() {return false;});
        	this.addressesTabBarBtn.on("click", function() {return false;});
        	this.addressesTabBarBtn.on("touchStart", function() {return false;});
        	this.accountTabBarBtn.on("click", function() {return false;});
        	this.accountTabBarBtn.on("touchStart", function() {return false;});
        	this.personalTabBarBtn.on("click", function() {return false;});
        	this.personalTabBarBtn.on("touchStart", function() {return false;});
        	this.thatsItTabBarBtn.on("click", function() {return false;});
        	this.thatsItTabBarBtn.on("touchStart", function() {return false;});
        },
        show: function() {
        	this.initializeContent();
        },
		onAfterTransitionIn: function() {
			this.initializeContent();
		},
		initializeContent: function() {
			// as soon as the user opens the 'Profile' tab, change the main header's title
			Utilities.updateProfileMainHeader();
			
			// also, force moving to the first tab in the profile tabs
			if (this.initialTab) {
				var initialTab = registry.byId(this.initialTab);
				initialTab.set("selected", true);
			} else {
				var profileAccountTabBarButton = registry.byId("profileAccountTabBarButton");
				profileAccountTabBarButton.set("selected", true);
			}
			if (this.initialView) {
				var initialView = registry.byId(this.initialView);
				initialView.show();
			} else {
				var profileAccountView = registry.byId("profileAccountView");
				profileAccountView.show();
			}
			
			this.initialTab = null;
			this.initialView = null;
		}
    });
});