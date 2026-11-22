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
	"dojo/dom",
	"dojo/_base/window"
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, currency, domStyle, dom, win){
        return declare([View], {
		
		progressIndicator: null,
		messageDialogView: null,
		yesNoDialog: null,
		storageManager: null,
		doubleButtonDialog: null,
		itemsRoundRectList: null,
		
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
        
        itemsField: null,
		
		order: null,

		// init variables and handlers
		startup: function () {
			this.messageDialogView = registry.byId("messageDialog");
			this.doubleButtonDialog = registry.byId("doubleButtonDialog");
			this.progressIndicator = ProgressIndicator.getInstance();
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.storageManager = registry.byId("storageManager");
			
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
			
			this.inherited(arguments);
		},
		setOrder: function(order) {
			this.order = order;
			
			var difference = (new Date(order.eta).getTime() - new Date().getTime());
			if (difference >= 0) {
				var differenceInString = Utilities.millisToString(difference);
			} else {
				differenceInString = "0 minutes";
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
			this.customerOrderAddressSpecialInstructionsField.innerHTML = order.specialInstructions;
			this.customerProfileAddressSpecialInstructionsField.innerHTML = order.deliveryAddressDetails;
			this.customerPhoneField.innerHTML = order.deliveryUserPhone;
			this.customerCityField1.innerHTML = order.deliveryCity;
			this.orderRestaurantAddressField.innerHTML = order.restaurant.streetAddress + ", " + order.restaurant.zipCode;
			
			this.itemsRoundRectList.destroyDescendants();
			this.createItemsSection();
			
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