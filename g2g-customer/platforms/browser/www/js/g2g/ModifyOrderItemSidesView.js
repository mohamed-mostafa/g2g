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
		
		modifyOrderItemLabel: null,
		messageDialogView: null,
		restaurantMenuCategoryItemSidesRoundRectList: null,
		modifyOrderItemView: null, // the previous dialog box
		onAddToOrderAfterChoosingSidesHandler: null,
		title: null,
		numberOfSelectedSides: 0,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.inherited(arguments);
			this.modifyOrderItemLabel = registry.byId("modifyOrderItemSideLabel");
			this.modifyOrderItemView = registry.byId("modifyOrderItem");
			this.restaurantMenuCategoryItemSidesRoundRectList = registry.byId("restaurantMenuCategoryItemSidesToModifyRoundRectList");
			// register the click event to the button
			this.modifyToOrderAfterChoosingSidesBtn = registry.byId('modifyToOrderAfterChoosingSidesBtn');
			this.title = dom.byId("orderItemSideToModifyRestaurantMenuCategoryItem");
		},
		// when the dialog is shown
		show: function() {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			
			// remove the previous event handler, if any
			if (this.onAddToOrderAfterChoosingSidesHandler) {
				this.onAddToOrderAfterChoosingSidesHandler.remove();
			}
			if ((GlobalObjects.currentSideGroupIndex + 1) < GlobalObjects.currentRestaurantCategoryItem.sideGroups.length) { // if this is not yet the last side group
				this.onAddToOrderAfterChoosingSidesHandler = this.modifyToOrderAfterChoosingSidesBtn.on("click", lang.hitch(this, this.onMoveToNextSide));
				this.modifyToOrderAfterChoosingSidesBtn.set("label", "Review next side");
			} else {
				this.onAddToOrderAfterChoosingSidesHandler = this.modifyToOrderAfterChoosingSidesBtn.on("click", lang.hitch(this, this.onModifyToOrderAfterChoosingSides));
				this.modifyToOrderAfterChoosingSidesBtn.set("label", "Save");
			}
			this.title.innerHTML = "Choose " + GlobalObjects.currentRestaurantCategoryItem.sideGroups[GlobalObjects.currentSideGroupIndex].maximumAllowedItems + " of " + GlobalObjects.currentRestaurantCategoryItem.sideGroups[GlobalObjects.currentSideGroupIndex].name;
			
			this.numberOfSelectedSides = 0; // reset, used in case of showing this dialog multiple times for multiple side groups
			
			// set the restaurant category item label to the current 
			this.modifyOrderItemLabel.containerNode.innerHTML = this.substitute(this.restaurantCategoryItemListItemTemplate, {
				restaurantName: GlobalObjects.currentOrder.restaurant.name,
				restaurantCuisine: GlobalObjects.currentOrder.restaurant.cuisine,
				restaurantLogo: GlobalObjects.logosMap[GlobalObjects.currentOrder.restaurant.id],
				restaurantLocation: GlobalObjects.currentOrder.restaurant.location,
//				restaurantCategory: GlobalObjects.currentRestaurantMenuCategory.name
			});
			
			
			this.restaurantMenuCategoryItemSidesRoundRectList.destroyDescendants();
			// populate the list
			array.forEach(GlobalObjects.currentOrderItem.restaurantMenuCategoryItem.sideGroups[GlobalObjects.currentSideGroupIndex].sideGroupItems, lang.hitch(this, function (side) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.restaurantMenuCategoryItemSidesRoundRectList, "last");
				
				// attach the restaurantId to the listItem (add a new attribute to listItem named 'restaurantId'
				listItem.side = side;
				listItem.sideSelected = false;
				// create and insert content from template and JSON response, consider it not selected by default
				var price = '$' + currency.format(side.price, 'd.dd');
				if (side.price == 0) price = '';
				listItem.containerNode.innerHTML = this.substitute(this.sideTemplate, {
					sideName: side.name,
					sideDescription: side.description,
					sidePrice: price
				});
				// decide if it is selected or not
				array.forEach(GlobalObjects.currentOrderItem.sides, lang.hitch(this, function (itemSide) {
					if (itemSide.id == side.id) { // if the list item should be selected
						// mark the list item as selected
						listItem.sideSelected = true;
						this.numberOfSelectedSides ++;
						// replace the HTML of the container node
						var price = '$' + currency.format(side.price, 'd.dd');
						if (side.price == 0) price = '';
						listItem.containerNode.innerHTML = this.substitute(this.selectedSideTemplate, {
							sideName: side.name,
							sideDescription: side.description,
							sidePrice: price
						});
					}
				}));
				listItem.onClick = lang.hitch(this, function() {
					// when you click on an item, set the green class to a new object, and set a flag to the item, and add the side to the item's sides
					if (listItem.sideSelected == false) { // if we're adding a new side
						if (this.numberOfSelectedSides == GlobalObjects.currentRestaurantCategoryItem.sideGroups[GlobalObjects.currentSideGroupIndex].maximumAllowedItems) {
							// do nothing
						} else {
							// mark the list item as selected
							listItem.sideSelected = true;
							this.numberOfSelectedSides ++;
							// replace the HTML of the container node
							var price = '$' + currency.format(side.price, 'd.dd');
							if (side.price == 0) price = '';
							listItem.containerNode.innerHTML = this.substitute(this.selectedSideTemplate, {
								sideName: side.name,
								sideDescription: side.description,
								sidePrice: price
							});
							// add the side to the current order item
							GlobalObjects.currentOrderItem.sides.push(listItem.side);
						}
					} else { // if we're removing an existing side
						// mark the list item as not selected
						listItem.sideSelected = false;
						this.numberOfSelectedSides --;
						// replace the HTML of the container node
						var price = '$' + currency.format(side.price, 'd.dd');
						if (side.price == 0) price = '';
						listItem.containerNode.innerHTML = this.substitute(this.sideTemplate, {
							sideName: side.name,
							sideDescription: side.description,
							sidePrice: price
						});
						// remove the side from the current order item
						for (var i = 0; i < GlobalObjects.currentOrderItem.sides.length; i++) {
							if (GlobalObjects.currentOrderItem.sides[i].id == listItem.side.id) {
								GlobalObjects.currentOrderItem.sides.splice(i, 1);
								break;
							}
						}
					}
				});
				listItem.set("moveTo","#");
			}));
		},
		onModifyToOrderAfterChoosingSides: function() {
			// we have put the sides in the item, we can use the method in the previous screen that pushes the item in the order
			this.modifyOrderItemView.modifyOrderItem();
			// close the dialog
			this.hide();
		},
		onMoveToNextSide: function() {
			// increment the pointer the the current group index
			GlobalObjects.currentSideGroupIndex ++;
			this.show(); // show will re render
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
			sideTemplate: 
			'<div class="restaurantMenuCategoryItemSide">' +
				'<div class="restaurantMenuCategoryItemSideContainer">' +
					'<div class="restaurantMenuCategoryItemSideName">${sideName}</div>' +
					'<div class="restaurantMenuCategoryItemSidePrice">${sidePrice}</div>' +
				'</div>' + 
				'<div class="nextBtnContainer">' + 
				'</div>' + 
			'</div>',
			selectedSideTemplate: 
			'<div class="restaurantMenuCategoryItemSide">' +
				'<div class="restaurantMenuCategoryItemSideContainer">' +
					'<div class="restaurantMenuCategoryItemSideName">${sideName}</div>' +
					'<div class="restaurantMenuCategoryItemSidePrice">${sidePrice}</div>' +
				'</div>' + 
				'<div class="selectedBtn"></div>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});