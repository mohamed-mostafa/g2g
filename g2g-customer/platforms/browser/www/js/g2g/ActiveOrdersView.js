define([
    "dojo/_base/declare",
	"dojox/mobile/RoundRectList",
	"dijit/registry",
	"dojox/mobile/ProgressIndicator",
	"dojox/mobile/ListItem",
	"dojo/request",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojox/mobile/Button",
	"dojox/mobile/sniff",
	"dojox/mobile/iconUtils",
	"dojo/dom",
	"dojo/currency",
	"dojo/dom-class"
    ], function(declare, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, on, SimpleDialog, Button, has, iconUtils, dom, currency, domClass) {
        return declare([SimpleDialog], {
		
		addOrderItemViewHeading: null,
		addOrderItemLabel: null,
		addOrderItemItemLabel: null,
		messageDialogView: null,
		activeOrdersRoundRectList: null,
		title: null,

		// init variables and handlers
		startup: function () {
			this.messageDialogView = registry.byId("messageDialog");
			this.activeOrdersRoundRectList = registry.byId("activeOrdersRoundRectList");
			// register the click event to the button
			this.inherited(arguments);
		},
		// when the dialog is shown
		show: function(orderSummaries) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.activeOrdersRoundRectList.destroyDescendants();
			// populate the list
			array.forEach(orderSummaries, lang.hitch(this, function (orderSummary) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.activeOrdersRoundRectList, "last");
				
				// attach the restaurantId to the listItem (add a new attribute to listItem named 'restaurantId'
				listItem.orderSummary = orderSummary;
				// create and insert content from template and JSON response
				listItem.containerNode.innerHTML = this.substitute(this.pendingOrderTemplate, {
					restaurantLogo: GlobalObjects.logosMap[orderSummary.restaurant.id],
					restaurantName: orderSummary.restaurant.name,
//					restaurantCuisine: orderSummary.restaurant.cuisine,
//					restaurantLocation: orderSummary.restaurant.location,
//					pendingOrderCount: orderSummary.itemsCount,
//					pendingOrderPrice: orderSummary.totalValue,
//					pendingOrderStatus: orderSummary.status,
				});
				listItem.onClick = lang.hitch(this, function() {
					registry.byId("trackOrderView").open(orderSummary);
					this.hide();
				});
				listItem.set("moveTo","#");
			}));
		},
		pendingOrderTemplate:
			'<div>' +
				'<div class="activeOrderRestaurantImgDiv"><img class="activeOrderestaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
				'<div class="ellipsisText pendingOrderRestaurantName">${restaurantName}</div>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});