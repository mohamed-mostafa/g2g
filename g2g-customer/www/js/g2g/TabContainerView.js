define([
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/on"
    ], function(declare, ScrollableView, request, domForm, JSON, registry, lang, ProgressIndicator, on){
        return declare([ScrollableView], {
        	
		show: function() {
			this.inherited(arguments);
//			this.show();
			// as soon as the user opens the 'Profile' tab, change the main header's title
			Utilities.updateMainHeader("Restaurants");
			
			// also, force moving to the first tab in the tabs
			var restaurantsTabBarBtn = registry.byId("restaurantsTabBarBtn");
			restaurantsTabBarBtn.set("selected", true);
			var homeView = registry.byId("home");
			homeView.show();
		},
    });
});