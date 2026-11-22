define([
        
    "dojo/_base/declare",
	"dojox/mobile/View",
	"dojox/mobile/RoundRectList",
	"dijit/registry",
	"dojox/mobile/ProgressIndicator",
	"dojox/mobile/ListItem",
	"dojo/request",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-style"
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, win, dom, domStyle){
        return declare([View], {
		
		// init variables and handlers
    	messageDialogView: null,

        startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.fixMapHeight();
		},
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			LocationObject.fitBounds();
			
			if (GlobalObjects.currentOrder.status == "PLACED" || GlobalObjects.currentOrder.status == "RECEIVED")
				LocationObject.drawDriverToRestaurantRoute();
			else if (GlobalObjects.currentOrder.status == "PICKED_UP")
				LocationObject.drawDriverToCustomerRoute();
			else if (GlobalObjects.currentOrder.status == "BEING_PREPARED") {
				// clear the directions
				LocationObject.removeRoutes();
			}
		},
		
		drawRoutes: function() {
				if (GlobalObjects.currentOrder.status == "PLACED" || GlobalObjects.currentOrder.status == "RECEIVED")
					LocationObject.drawDriverToRestaurantRoute();
				else if (GlobalObjects.currentOrder.status == "PICKED_UP")
					LocationObject.drawDriverToCustomerRoute();
				else if (GlobalObjects.currentOrder.status == "BEING_PREPARED")
					LocationObject.removeRoutes(); // clear the directions
		},
		onLocationChanged: function(latlng) {
			promise = request.post(GlobalObjects.serverURL + '/driver/location', {data: JSON.stringify({driverId: GlobalObjects.currentDriver.id, lat: latlng.lat(), lng: latlng.lng()}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function() {
				// location reported successfully
			}), lang.hitch(this, function(error) {
				// error reporting location
			}));
			
			LocationObject.setMyLocation(latlng);
		},
		locateRestaurantAndCustomerOnMap: function(order) {
			LocationObject.codeAddress(order.restaurantStreetAddress + " " + order.restaurantCity, lang.hitch(this, function(restaurantLatLng) {
				LocationObject.setRestaurantLocation(restaurantLatLng);
				LocationObject.codeAddress(order.deliveryStreetAddress1 + " " + order.deliveryCity, lang.hitch(this, function(customerLatLng) {
					LocationObject.setCustomerLocation(customerLatLng);
					this.drawRoutes();
				}), lang.hitch(this, function(error) {
					this.messageDialogView.show("Failed to locate the customer's address on the map");
				}));
			}), lang.hitch(this, function(error) {
				this.messageDialogView.show("Failed to locate " + order.restaurant.name + " on the map");
				LocationObject.codeAddress(order.deliveryStreetAddress1 + " " + order.deliveryCity, lang.hitch(this, function(customerLatLng) {
					LocationObject.setCustomerLocation(customerLatLng);
				}), lang.hitch(this, function(error) {
					this.messageDialogView.show("Failed to locate the customer's address on the map");
				}));
			}));
		},
		fixMapHeight: function() {
			var map = registry.byId("mapTabView");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 44); // the bottom tab bar and the upper header and the upper tab bar
			domStyle.set(map.containerNode, "height", height);
		},
    });
});