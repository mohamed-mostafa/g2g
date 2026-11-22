define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dijit/registry",
	"dojo/_base/lang",
    ], function(declare, View, request, domForm, JSON, registry, lang){
        return declare([View], {
        	
        startup: function() {
        	this.inherited(arguments);
        },
        onAfterTransitionIn: function() {
			this.inherited(arguments);
			// as soon as the user opens the 'Profile' tab, change the main header's title
			Utilities.updateMainHeader("My Orders");
			
			// also, force moving to the first tab in the my ordres tabs
			var currentOrderTabBarBtn = registry.byId("currentOrderTabBarBtn");
			currentOrderTabBarBtn.set("selected", true);
			var orderView = registry.byId("order");
			orderView.show();
		}
    });
});