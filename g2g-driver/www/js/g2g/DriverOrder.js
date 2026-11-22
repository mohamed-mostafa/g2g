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
	"dojo/currency",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom",
	"dojo/_base/window"
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, currency, domStyle, domAttr, dom, win){
        return declare([View], {
		
		progressIndicator: null,
		messageDialogView: null,
		yesNoDialog: null,
		storageManager: null,
		doubleButtonDialog: null,
		itemsRoundRectList: null,
		statusButtonsRoundRect: null,
		loadingDialog: null,
		gpsManager: null,
		googleMapView: null,
		
		orderIdField: null,
		orderStatusField: null,
		orderETAField: null,
		orderRestaurantNameField: null,
		orderRestaurantLogoImg: null,
		customerNameField: null,
		customerAddress1Field: null,
		customerAddress2Field: null,
		customerOrderAddressSpecialInstructionsField: null,
		customerProfileAddressSpecialInstructionsField: null,
		customerPhoneField: null,
		customerCityField1: null,
        customerCityField2: null,
        customerZipCodeField: null,
        orderRestaurantAddressField: null,
        
        markBeingPreparedBtn: null,
        markPickedUpBtn: null,
        markDeliveredBtn: null,
        
        itemsField: null,
		
		order: null,

		// init variables and handlers
		startup: function () {
			this.messageDialogView = registry.byId("messageDialog");
			this.doubleButtonDialog = registry.byId("doubleButtonDialog");
			this.progressIndicator = ProgressIndicator.getInstance();
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.storageManager = registry.byId("storageManager");
			this.loadingDialog = registry.byId("loadingDialog");
			this.gpsManager = registry.byId("gpsManager");
			this.googleMapView = registry.byId("mapTabView");
			
			this.orderIdField = dom.byId("orderIdField");
			this.orderStatusField = dom.byId("orderStatusField");
			this.orderETAField = dom.byId("orderETAField");
			this.orderRestaurantNameField = dom.byId("orderRestaurantNameField");
			this.orderRestaurantLogoImg = dom.byId("orderRestaurantLogoImg");
			this.customerNameField = dom.byId("customerNameField");
			this.customerAddress1Field = dom.byId("customerAddress1Field");
			this.customerOrderAddressSpecialInstructionsField = dom.byId("customerOrderAddressSpecialInstructionsField");
			this.customerProfileAddressSpecialInstructionsField = dom.byId("customerProfileAddressSpecialInstructionsField");
			this.customerPhoneField = dom.byId("customerPhoneField");
			this.customerCityField1 = dom.byId("customerCityField1");
			this.customerCityField2 = dom.byId("customerCityField2");
			this.orderRestaurantAddressField = dom.byId("orderRestaurantAddressField");
			
					
			this.itemsField = dom.byId("itemsField");
			this.itemsRoundRectList = registry.byId("itemsRoundRectList");
			this.statusButtonsRoundRect = registry.byId("statusButtonsRoundRect");
			
			this.inherited(arguments);
		},
		markBeingPrepared: function() {
			this.loadingDialog.show("Plase wait ...");
			if (LocationObject.isInRangeOfRestaurant()) {
				promise = request.post(GlobalObjects.serverURL + '/order/status/beingprepared', {data: JSON.stringify({orderId: this.order.id}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.markBeingPreparedBtn.set("disabled", 'disabled');
					this.loadingDialog.hide();
				}), lang.hitch(this, function(error) {
					this.loadingDialog.hide();
					this.messageDialogView.show("Failed to update order status");
				}));
			} else {
				this.loadingDialog.hide();
				this.messageDialogView.show("You have to be around the restaurant before marking the order as being prepared");
			}
		},
		markPickedUp: function() {
			this.loadingDialog.show("Plase wait ...");
			if (LocationObject.isInRangeOfRestaurant()) {
				promise = request.post(GlobalObjects.serverURL + '/order/status/pickedup', {data: JSON.stringify({orderId: this.order.id}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.markPickedUpBtn.set("disabled", 'disabled');
					this.loadingDialog.hide();
				}), lang.hitch(this, function(error) {
					this.loadingDialog.hide();
					this.messageDialogView.show("Failed to update order status");
				}));
			} else {
				this.loadingDialog.hide();
				this.messageDialogView.show("You have to be around the restaurant before marking the order as picked up");
			}
		},
		markDelivered: function() {
			this.loadingDialog.show("Plase wait ...");
			if (LocationObject.isInRangeOfCustomer()) {
				promise = request.post(GlobalObjects.serverURL + '/order/status/delivered', {data: JSON.stringify({orderId: this.order.id}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.markDeliveredBtn.set("disabled", 'disabled');
					this.loadingDialog.hide();
				}), lang.hitch(this, function(error) {
					this.loadingDialog.hide();
					this.messageDialogView.show("Failed to update order status");
				}));
			} else {
				this.loadingDialog.hide();
				this.messageDialogView.show("You have to be around the customer before marking the order as delivered");
			}
		},
		refreshOrder: function() {
			this.loadingDialog.show("Refreshing order");
			promise = request.get(GlobalObjects.serverURL + '/order/' + this.order.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response) {
				this.setOrder(response.data);
				GlobalObjects.currentOrder = response.data;
				this.loadingDialog.hide();
			}), lang.hitch(this, function(err) {
				// remove progress indicator
				this.loadingDialog.hide();
				// display error message
				if (err.response.status == 0) {
					this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
				} else if (err.response.status == 404) {
					this.messageDialogView.show("G2G servers are unable to process your request at this time");
				} else {
					this.messageDialogView.show(err.response.text);
				}
			}));
		},
		setOrder: function(order) {
			this.order = order;
			this.itemsRoundRectList.destroyDescendants();
			this.statusButtonsRoundRect.destroyDescendants();
			
			// re-init buttons
			this.markBeingPreparedBtn = new dojox.mobile.ToggleButton({label: "Preparing", duration: 100, ckeched: false, class: "statusToggleButton", onClick: lang.hitch(this, this.markBeingPrepared)});
			this.markPickedUpBtn = new dojox.mobile.ToggleButton({label: "Picked", duration: 100, ckeched: false, class: "statusToggleButton", onClick: lang.hitch(this, this.markPickedUp)});
			this.markDeliveredBtn = new dojox.mobile.ToggleButton({label: "Delivered", duration: 100, ckeched: false, class: "statusToggleButton", onClick: lang.hitch(this, this.markDelivered)});
			
			this.markBeingPreparedBtn.placeAt(this.statusButtonsRoundRect, "last");
			this.markPickedUpBtn.placeAt(this.statusButtonsRoundRect, "last");
			this.markDeliveredBtn.placeAt(this.statusButtonsRoundRect, "last");
			
			var difference = (new Date(order.eta).getTime() - new Date().getTime());
			if (difference >= 0) {
				var differenceInString = Utilities.millisToString(difference);
			} else {
				differenceInString = "Overdue";
			}
			
			this.orderIdField.innerHTML = "#" + order.id;
			this.orderStatusField.innerHTML = order.status;
			this.orderETAField.innerHTML = "Due in " + differenceInString;
			this.orderRestaurantNameField.innerHTML = order.restaurant.name;
			this.orderRestaurantLogoImg.src = "data:image/png;base64," + GlobalObjects.logosMap[order.restaurantId];
			this.customerNameField.innerHTML = order.deliveryUserFullName;
			var address = order.deliveryStreetAddress1;
			if (order.deliveryStreetAddress2 != "") address += " " + order.deliveryStreetAddress2
			address += ", " + order.deliveryCity;
			address += ", " + order.deliveryZipCode;
			this.customerAddress1Field.innerHTML = address;
			if (order.specialInstructions)
				this.customerOrderAddressSpecialInstructionsField.innerHTML = order.specialInstructions;
			else
				this.customerOrderAddressSpecialInstructionsField.innerHTML = "";
			if (order.deliveryAddressDetails)
				this.customerProfileAddressSpecialInstructionsField.innerHTML = order.deliveryAddressDetails;
			else
				this.customerProfileAddressSpecialInstructionsField.innerHTML = "";
			this.customerPhoneField.innerHTML = order.deliveryUserPhone;
			this.customerCityField1.innerHTML = order.deliveryCity;
			this.orderRestaurantAddressField.innerHTML = order.restaurantStreetAddress + ", " + order.restaurantCity + " - " + order.restaurantZipCode;
			
			if (order.status == "PLACED" || order.status == "RECEIVED") {
			} else if (order.status == "BEING_PREPARED") {
				this.markBeingPreparedBtn.set("checked", 'checked');
				this.markBeingPreparedBtn.set("disabled", 'disabled');
			} else if (order.status == "PICKED_UP") {
				this.markBeingPreparedBtn.set("checked", 'checked');
				this.markPickedUpBtn.set("checked", 'checked');
				this.markBeingPreparedBtn.set("disabled", 'disabled');
				this.markPickedUpBtn.set("disabled", 'disabled');
			} else if (order.status == "DELIVERED") {
				this.markBeingPreparedBtn.set("checked", 'checked');
				this.markPickedUpBtn.set("checked", 'checked');
				this.markDeliveredBtn.set("checked", 'checked');
				this.markBeingPreparedBtn.set("disabled", 'disabled');
				this.markPickedUpBtn.set("disabled", 'disabled');
				this.markDeliveredBtn.set("disabled", 'disabled');
			} else { // archived, refunded
				this.markBeingPreparedBtn.set("disabled", 'disabled');
				this.markPickedUpBtn.set("disabled", 'disabled');
				this.markDeliveredBtn.set("disabled", 'disabled');
			}
			this.createItemsSection();
			this.googleMapView.locateRestaurantAndCustomerOnMap(order);
		},
		createItemsSection: function() {
			for (var i = 0 ; i < this.order.items.length; i++) {
				var newSide = this.itemTemplate.concat(""); // to crate a copy
				var sides = "";
				var specialInstructions = "";
				
				if (this.order.items[i].sides != "") {
					sides = "Sides: " + this.order.items[i].sides;
				}
				if (this.order.items[i].specialInstructions != "") {
					specialInstructions = "Special Instructions: " + this.order.items[i].specialInstructions;
				}
				newSide = this.substitute(newSide, {
					itemNameAndQuantity : this.order.items[i].quantity + " X " + this.order.items[i].name + " (" + this.order.items[i].categoryName + ")",
					itemSides : sides,
					itemSpecialInstructions : specialInstructions
				});
				var listItem = new ListItem({}).placeAt(this.itemsRoundRectList, "last");
				listItem.containerNode.innerHTML = newSide;
			}
		},
		fixScrollablePanelHeight: function() {
			var orderItemsScrollablePane = dom.byId("orderItemsScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 60 + 5 + 100); // the bottom tab bar and the upper header and the upper tab bar and the restaurant part and a margin
			domStyle.set(orderItemsScrollablePane, "height", height);
		},
		onAfterTransitionIn: function() {
			this.fixScrollablePanelHeight();
		},
		itemTemplate: 
			'<div class="driverOrderItem">' +
				'<div id="driverOrderItemNameAndQuantity" style="font-size: 11px; font-weight:bold;">${itemNameAndQuantity}</div>' +
				'<div id="driverOrderItemSides" style="font-size: 10px;">${itemSides}</div>' +
				'<div id="driverOrderItemSpecialInstructions" style="font-size: 10px;">${itemSpecialInstructions}</div>' +
				'</div>' + 
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
}); 