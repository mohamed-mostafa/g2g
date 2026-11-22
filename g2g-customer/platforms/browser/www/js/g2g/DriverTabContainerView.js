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
			// also, force moving to the first tab in the tabs
			var driverHomeTabBarBtn = registry.byId("driverHomeTabBarBtn");
			driverHomeTabBarBtn.set("selected", true);
			
			var driverHome = registry.byId("driverHome");
			driverHome.show();
		},
    });
});