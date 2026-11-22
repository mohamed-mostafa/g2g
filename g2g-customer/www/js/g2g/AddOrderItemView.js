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
	"dojo/currency"
    ], function(declare, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, on, SimpleDialog, Button, has, iconUtils, dom, currency) {
        return declare([SimpleDialog], {
		
		orderItemToAddRestaurantMenuCategoryItem: null,
		orderItemToAddSpecialInstructionsTextArea: null,
		addOrderItemSides: null,
		addOrderItemViewHeading: null,
		addToOrderBtn: null,
		plusBtn: null,
		minusBtn: null,
		addOrderItemLabel: null,
		addOrderItemItemLabel: null,
		messageDialogView: null,
		openSidesView: null, // a reference to a callback function, that will be provided by the RestaurantMenuCategoryItemsView.
		buttonEventHandler: null, // keeping a reference on the results of the 'on' method to be able to remove the event handler of the button

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.inherited(arguments);
			this.orderItemToAddRestaurantMenuCategoryItem = registry.byId('orderItemToAddRestaurantMenuCategoryItem');
			this.orderItemToAddSpecialInstructionsTextArea = registry.byId('orderItemToAddSpecialInstructionsTextArea');
			this.addOrderItemViewHeading = registry.byId('addOrderItemViewHeading');
			this.addOrderItemLabel = registry.byId("addOrderItemLabel");
			this.addOrderItemItemLabel = registry.byId("addOrderItemItemLabel");
			this.addOrderItemSides = registry.byId("addOrderItemSides");
			
			// get the button, its name and callback function will be changed in the 'show' event handler
			this.addToOrderBtn = registry.byId('addToOrderBtn');
			
			// // create the plus and minus buttons
			this.plusBtn = iconUtils.createDomButton(dom.byId("addOrderItemPlusBtn"));
			this.minusBtn = iconUtils.createDomButton(dom.byId("addOrderItemMinusBtn"));
			this.plusBtn.onclick = lang.hitch(this, this.onPlus);
			this.minusBtn.onclick = lang.hitch(this, this.onMinus);
		},
		// when the dialog is shown
		show: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			
			// set the name of the button and its callback function 
			if (this.buttonEventHandler) {
				this.buttonEventHandler.remove();
			}
			if (GlobalObjects.currentRestaurantCategoryItem.sideGroups.length > 0) {
				GlobalObjects.currentSideGroupIndex = 0; // set the first side group to be the selected one
				this.buttonEventHandler = this.addToOrderBtn.on("click", lang.hitch(this, this.onChooseSides));
				this.addToOrderBtn.set("label", "Choose Sides");
			} else {
				this.buttonEventHandler = this.addToOrderBtn.on("click", lang.hitch(this, this.onAddToOrder));
				this.addToOrderBtn.set("label", "Add to order");
			}
			
			// set the restaurant category item label to the current 
			this.addOrderItemLabel.containerNode.innerHTML = this.substitute(this.restaurantCategoryItemListItemTemplate, {
				restaurantName: GlobalObjects.currentRestaurant.name,
				restaurantCuisine: GlobalObjects.currentRestaurant.cuisine,
				restaurantLogo: GlobalObjects.logosMap[GlobalObjects.currentRestaurant.id],
				restaurantLocation: GlobalObjects.currentRestaurant.location,
				restaurantCategory: GlobalObjects.currentRestaurantMenuCategory.name
			});
			this.addOrderItemItemLabel.containerNode.innerHTML = this.substitute(this.itemTemplate, {
				restaurantMenuCategoryItemName: GlobalObjects.currentRestaurantCategoryItem.name,
				restaurantMenuCategoryItemDescription: GlobalObjects.currentRestaurantCategoryItem.description,
				restaurantMenuCategoryItemPrice: '$' + GlobalObjects.currentRestaurantCategoryItem.price
			});
			
			// initialize the quantity (currentOrderItem is initialized from the previous screen)
			var quantitySpan = document.getElementById("addOrderItemQuantity");
			quantitySpan.innerHTML = GlobalObjects.currentOrderItem.quantity;
			// initialize the special instructions (currentOrderItem is initialized from the previous screen)
			this.orderItemToAddSpecialInstructionsTextArea.set("value", GlobalObjects.currentOrderItem.specialInstructions);
		},
		addItemToOrder: function() {
			if (GlobalObjects.currentOrder.orderItems.length != 0) { // if the order is not empty
				// make sure the new item belongs to the same restaurant of the order
				if (GlobalObjects.currentRestaurant.id != GlobalObjects.currentOrder.restaurant.id) {
					// no, it doesn't belong to the order's restaurant, show a message and return
					this.messageDialogView.show("You can't add this item to your " + GlobalObjects.currentOrder.restaurant.name + " order");
					this.hide();
					return;
				}
			} else { // the order is still empty
				// This is the first item in the order, set the order's restaurant
				GlobalObjects.currentOrder.restaurant = GlobalObjects.currentRestaurant;
			}
			// add the item to the order
			
			// update the values in the 'currentOrderItem' global variable
			var quantitySpan = document.getElementById("addOrderItemQuantity");
			GlobalObjects.currentOrderItem.price = GlobalObjects.currentRestaurantCategoryItem.price;
			GlobalObjects.currentOrderItem.quantity = parseInt(quantitySpan.innerHTML);
			GlobalObjects.currentOrderItem.specialInstructions = this.orderItemToAddSpecialInstructionsTextArea.get("value");
			// add the 'currentOrderItem' to the currentOrder
			GlobalObjects.currentOrder.orderItems.push(GlobalObjects.currentOrderItem);

			// update the badge of the MyOrder button
			Utilities.updateMyOrderButtonName();
		},
		onChooseSides: function() {
			Utilities.hideKeyboard();
			this.openSidesView(); // call the reference to function. the provider of this function should open the sides view dialog
			this.hide();
		},
		onAddToOrder: function() {
			Utilities.hideKeyboard();
			// add the order 
			this.addItemToOrder();
			// close the dialog
			this.hide();
		}, onPlus: function() {
			var quantitySpan = document.getElementById("addOrderItemQuantity");
			var addItemPriceDiv = document.getElementById("addItemPriceDiv");
			var quantity = parseInt(quantitySpan.innerHTML);
			if (quantity < 99 ) {
				quantity = quantity + 1;
				quantitySpan.innerHTML = quantity;
			}
			addItemPriceDiv.innerHTML = "$" + currency.format(GlobalObjects.currentRestaurantCategoryItem.price * quantity, 'd.dd');
			
		}, onMinus: function() {
			var quantitySpan = document.getElementById("addOrderItemQuantity");
			var addItemPriceDiv = document.getElementById("addItemPriceDiv");
			var quantity = parseInt(quantitySpan.innerHTML);
			if (quantity > 1) {
				quantity = quantity - 1;
				quantitySpan.innerHTML = quantity;
			}
			addItemPriceDiv.innerHTML = "$" + currency.format(GlobalObjects.currentRestaurantCategoryItem.price * quantity, 'd.dd');
		},
		// restaurant category, and item label template
		restaurantCategoryItemListItemTemplate:
			'<div class="restaurantListItem">' +
				'<div class="restaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
				'<div class="restaurantDetails">' + 
					'<div class="restaurantName">${restaurantName}</div>' +
					'<div class="restaurantCuisine">${restaurantCuisine}</div>' +
					'<div class="restaurantLocation">${restaurantLocation}</div>' +
				'</div>' +
			'</div>',
		itemTemplate: 
			'<div class="categoryItemContainerCentered">' +
				'<div class="categoryItemDetails">' +
					'<div class="restaurantMenuCategoryAddItemName">${restaurantMenuCategoryItemName}</div>' +
					'<div class="restaurantMenuCategoryAddItemDescription">${restaurantMenuCategoryItemDescription}</div>' +
					'<div class="restaurantMenuCategoryAddItemPrice" id="addItemPriceDiv">${restaurantMenuCategoryItemPrice}</div>' +
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