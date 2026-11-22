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
	"dojo/dom-style",
	"dojo/currency",
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, win,dom, domStyle, currency){
        return declare([View], {
		
		restaurantMenuCategoryItemsRoundRectList: null,
		loadingDialog: null,
		restaurantMenuCategoryItemsOrderBtn: null,
		restaurantCategoryLabel: null,
		addOrderItemDialog: null,
		messageDialogView: null,
		addOrderItemSides: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.restaurantMenuCategoryItemsRoundRectList = registry.byId("restaurantMenuCategoryItemsRoundRectList");
			this.loadingDialog = registry.byId("loadingDialog");
			this.restaurantMenuCategoryItemsOrderBtn = registry.byId("restaurantMenuCategoryItemsOrderBtn");
			this.restaurantCategoryLabel = registry.byId("restaurantCategoryLabel");
			this.addOrderItemDialog = registry.byId("addOrderItem");
			this.addOrderItemSides = registry.byId("addOrderItemSides");
			this.addOrderItemDialog.openSidesView = function() {this.addOrderItemSides.show();};
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.restaurantMenuCategoryItemsRoundRectList.destroyDescendants();
			
			// show progress
			this.loadingDialog.show("Loading " + GlobalObjects.currentRestaurant.name + " " + GlobalObjects.currentRestaurantMenuCategory.name);
			
			// set the restaurant category label to the current restaurant
			this.restaurantCategoryLabel.containerNode.innerHTML = this.substitute(this.restaurantCategoryListItemTemplate, {
				restaurantName: GlobalObjects.currentRestaurant.name,
				restaurantCuisine: GlobalObjects.currentRestaurant.cuisine,
				restaurantLogo: GlobalObjects.logosMap[GlobalObjects.currentRestaurant.id],
				restaurantLocation: GlobalObjects.currentRestaurant.location,
				restaurantCategory: GlobalObjects.currentRestaurantMenuCategory.name
			});
			Utilities.updateMainHeader(GlobalObjects.currentRestaurant.name, "restaurantMenuCategories");
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.loadRestaurantMenuCategoryItems(GlobalObjects.currentRestaurantMenuCategory);
			
			// move the scroll to the very top
			var restaurantMenuCategoryItemsScrollablePane = registry.byId("restaurantMenuCategoryItemsScrollablePane");
			restaurantMenuCategoryItemsScrollablePane.scrollTo({x: 0, y:0});
		},
		fixScrollablePanelHeight: function() {
			var restaurantMenuCategoryItemsScrollablePane = dom.byId("restaurantMenuCategoryItemsScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			domStyle.set(restaurantMenuCategoryItemsScrollablePane, "height", height);
		},
		// load restaurants
		loadRestaurantMenuCategoryItems: function(currentRestaurantMenuCategory) {
			if (GlobalObjects.testMode) {
				console.log("Using test restaurant menu category items: " + JSON.stringify(TestData.restaurantMenuCategoryItems));
				this.onLoadRestaurantMenuCategoryItemsResponse(TestData.restaurantMenuCategoryItems);
			} else {
				promise = request.get(GlobalObjects.serverURL + '/restaurants/restaurantMenuCategoryItems/' + currentRestaurantMenuCategory.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoadRestaurantMenuCategoryItemsResponse), lang.hitch(this, this.onLoadRestaurantMenuCategoryItemsError));
			}
		},
		// error handler
		onLoadRestaurantMenuCategoryItemsError: function(err) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.restaurantMenuCategoryItemsRoundRectList.destroyDescendants();
			// display error message
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialogView.show(err.response.text);
			}
		},
		//  response handler
		onLoadRestaurantMenuCategoryItemsResponse: function(result) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.restaurantMenuCategoryItemsRoundRectList.destroyDescendants();
			// populate the list
			array.forEach(result.data.restaurantMenuCategoryItems, lang.hitch(this, function (restaurantMenuCategoryItem) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.restaurantMenuCategoryItemsRoundRectList, "last");
				
				// attach the restaurantId to the listItem (add a new attribute to listItem named 'restaurantId'
				listItem.restaurantMenuCategoryItem = restaurantMenuCategoryItem;
				// create and insert content from template and JSON response
				var price = "";
				if (restaurantMenuCategoryItem.price > 0) {
					price = '$' + currency.format(restaurantMenuCategoryItem.price, 'd.dd');
				}
				listItem.containerNode.innerHTML = this.substitute(this.restaurantListItemTemplate, {
					restaurantMenuCategoryItemName: restaurantMenuCategoryItem.name,
					restaurantMenuCategoryItemDescription: restaurantMenuCategoryItem.description,
					restaurantMenuCategoryItemPrice: price
				});
				listItem.onClick = lang.hitch(this, function() {
					// when you click on an item, set the currentOrderItem to a new object
					GlobalObjects.currentOrderItem = {restaurantMenuCategoryItem: listItem.restaurantMenuCategoryItem, quantity: 1, specialInstructions: '', restaurantMenuCategory: GlobalObjects.currentRestaurantMenuCategory, sides: []};
					GlobalObjects.currentRestaurantCategoryItem = listItem.restaurantMenuCategoryItem;
					// show the add order item dialog
					this.addOrderItemDialog.show();
				});
				listItem.set("moveTo","#");
				this.fixScrollablePanelHeight();
				
			}));
			
		},
		// restaurant and category label template
		restaurantCategoryListItemTemplate:
			'<div class="restaurantListItem">' +
				'<div class="restaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
				'<div class="headerRestaurantDetails">' + 
					'<div class="headerRestaurantNameShort">${restaurantName}</div>' +
					'<div class="restaurantCuisine">${restaurantCuisine}</div>' +
					'<div class="restaurantLocation">${restaurantLocation}</div>' +
				'</div>' +
				'<div class="headerRestaurantCategoryDetails"><div class="restaurantCategoryName">${restaurantCategory}</div></div>' +
			'</div>',
		// list item template
		restaurantListItemTemplate:
			'<div class="restaurantMenuCategoryItem">' +
				'<div class="restaurantMenuCategoryItemContainer">' +
						'<div class="restaurantMenuCategoryItemName">${restaurantMenuCategoryItemName}</div>' +
						'<div class="restaurantMenuCategoryItemPrice">${restaurantMenuCategoryItemPrice}</div>' +
						'<div class="restaurantMenuCategoryItemDescription">${restaurantMenuCategoryItemDescription}</div>' +	
				'</div>' + 
				'<div class="nextBtnContainer">' + 
					'<div class="nextBtn"></div>' +
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