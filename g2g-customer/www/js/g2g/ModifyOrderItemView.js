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
		
		orderItemToModifyRestaurantMenuCategoryItem: null,
		orderItemToModifySpecialInstructionsTextArea: null,
		modifyOrderItemViewHeading: null,
		modifyOrderItemBtn: null,
		deleteOrderItemBtn: null,
		plusBtn: null,
		minusBtn: null,
		modifyOrderItemLabel: null,
		modifyOrderItemItemLabel: null,
		orderView: null,
		messageDialogView: null,
		modifyOrderItemSides: null,
		
		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.orderItemToModifyRestaurantMenuCategoryItem = registry.byId('orderItemToModifyRestaurantMenuCategoryItem');
			this.orderItemToModifySpecialInstructionsTextArea = registry.byId('orderItemToModifySpecialInstructionsTextArea');
			this.modifyOrderItemViewHeading = registry.byId('modifyOrderItemViewHeading');
			this.modifyOrderItemLabel = registry.byId("modifyOrderItemLabel");
			this.modifyOrderItemItemLabel = registry.byId("modifyOrderItemItemLabel");
			this.modifyOrderItemSides = registry.byId("modifyOrderItemSides");
			// register the click event to the button
			this.modifyOrderItemBtn = registry.byId('modifyOrderItemBtn');
			this.deleteOrderItemBtn = registry.byId('deleteOrderItemBtn');
			this.deleteOrderItemBtn.on("click", lang.hitch(this, this.onDeleteOrderItem));
			this.orderView = registry.byId("order");
			// // create the plus and minus buttons
			this.plusBtn = iconUtils.createDomButton(dom.byId("modifyOrderItemPlusBtn"));
			this.minusBtn = iconUtils.createDomButton(dom.byId("modifyOrderItemMinusBtn"));
			this.plusBtn.onclick = lang.hitch(this, this.onPlus);
			this.minusBtn.onclick = lang.hitch(this, this.onMinus);
		},
		// when the dialog is shown
		show: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			
			// change the name and behavior of the save button depending on whether the item has sides or not
			if (GlobalObjects.currentOrderItem.restaurantMenuCategoryItem.sideGroups.length > 0) {
				GlobalObjects.currentSideGroupIndex = 0;
				this.modifyOrderItemBtn.on("click", lang.hitch(this, this.onVerifySides));
				this.modifyOrderItemBtn.set("label", "Review sides");
			} else {
				this.modifyOrderItemBtn.on("click", lang.hitch(this, this.onModifyOrderItem));
				this.modifyOrderItemBtn.set("label", "Save");
			}
			
			// set the restaurant category item label to the current 
			this.modifyOrderItemLabel.containerNode.innerHTML = this.substitute(this.restaurantCategoryItemListItemTemplate, {
				restaurantName: GlobalObjects.currentOrder.restaurant.name,
				restaurantCuisine: GlobalObjects.currentOrder.restaurant.cuisine,
				restaurantLogo: GlobalObjects.logosMap[GlobalObjects.currentOrder.restaurant.id],
				restaurantLocation: GlobalObjects.currentOrder.restaurant.location,
				restaurantCategory: GlobalObjects.currentOrderItem.restaurantMenuCategory.name
			});
			this.modifyOrderItemItemLabel.containerNode.innerHTML = this.substitute(this.itemTemplate, {
				restaurantMenuCategoryItemName: GlobalObjects.currentRestaurantCategoryItem.name,
				restaurantMenuCategoryItemDescription: GlobalObjects.currentRestaurantCategoryItem.description,
				restaurantMenuCategoryItemPrice: "$" + currency.format(GlobalObjects.currentRestaurantCategoryItem.price * GlobalObjects.currentOrderItem.quantity, 'd.dd')
			});
			
			// initialize the quantity (currentOrderItem is initialized from the previous screen)
			var quantitySpan = document.getElementById("modifyOrderItemQuantity");
			quantitySpan.innerHTML = GlobalObjects.currentOrderItem.quantity;
			// initialize the special instructions (currentOrderItem is initialized from the previous screen)
			this.orderItemToModifySpecialInstructionsTextArea.set("value", GlobalObjects.currentOrderItem.specialInstructions);
		},
		modifyOrderItem: function() {
			// update the values in the 'currentOrderItem' global variable
			var quantitySpan = document.getElementById("modifyOrderItemQuantity");
			GlobalObjects.currentOrderItem.quantity = parseInt(quantitySpan.innerHTML);
			GlobalObjects.currentOrderItem.specialInstructions = this.orderItemToModifySpecialInstructionsTextArea.get("value");
			// modify the 'currentOrderItem' to the currentOrder
			GlobalObjects.currentOrder.orderItems[GlobalObjects.currentOrderItemIndex] = GlobalObjects.currentOrderItem;
			console.log("Modified order item: " + JSON.stringify(GlobalObjects.currentOrderItem));
			
			// re-render the orders view
			this.orderView.fillOrderItems();
		},
		onVerifySides: function() {
			Utilities.hideKeyboard();
			this.modifyOrderItemSides.show();
			this.hide();
		},
		onModifyOrderItem: function() {
			Utilities.hideKeyboard();
			this.modifyOrderItem();
			// close the dialog
			this.hide();
		},
		onDeleteOrderItem: function() {
			// delete the item using its index
			GlobalObjects.currentOrder.orderItems.splice(GlobalObjects.currentOrderItemIndex, 1) ;
			console.log("deleted order item: " + JSON.stringify(GlobalObjects.currentOrderItem));
			
			Utilities.updateMyOrderButtonName();
			
			// re-render the orders view
			this.orderView.fillOrderItems();
			
			if (GlobalObjects.currentOrder.orderItems.length == 0) { // if the order is now empty
				// clear the order's restaurant
				GlobalObjects.currentOrder.restaurant = {};
			}
			// close the dialog
			this.hide();
		}, onPlus: function() {
			var quantitySpan = document.getElementById("modifyOrderItemQuantity");
			var modifyItemPriceDiv = document.getElementById("modifyItemPriceDiv");
			var quantity = parseInt(quantitySpan.innerHTML);
			if (quantity < 99 ) {
				quantity = quantity + 1;
				quantitySpan.innerHTML = quantity;
			}
			modifyItemPriceDiv.innerHTML = "$" + currency.format(GlobalObjects.currentRestaurantCategoryItem.price * quantity, 'd.dd');
		}, onMinus: function() {
			var quantitySpan = document.getElementById("modifyOrderItemQuantity");
			var modifyItemPriceDiv = document.getElementById("modifyItemPriceDiv");
			var quantity = parseInt(quantitySpan.innerHTML);
			if (quantity > 1) {
				quantity = quantity - 1;
				quantitySpan.innerHTML = quantity;
			}
			modifyItemPriceDiv.innerHTML = "$" + currency.format(GlobalObjects.currentRestaurantCategoryItem.price * quantity, 'd.dd');
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
			'<div class="categoryItemContainer">' +
				'<div class="categoryItemDetails">' +
					'<div class="restaurantMenuCategoryAddItemName">${restaurantMenuCategoryItemName}</div>' +
					'<div class="restaurantMenuCategoryAddItemDescription">${restaurantMenuCategoryItemDescription}</div>' +
					'<div class="restaurantMenuCategoryAddItemPrice" id="modifyItemPriceDiv">${restaurantMenuCategoryItemPrice}</div>' +
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