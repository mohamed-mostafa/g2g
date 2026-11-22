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
		
		restaurantMenuCategoriesRoundRectList: null,
		loadingDialog: null,
		restaurantLabel: null,
		messageDialogView: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.restaurantMenuCategoriesRoundRectList = registry.byId("restaurantMenuCategoriesRoundRectList");
			this.loadingDialog = registry.byId("loadingDialog");
			this.restaurantLabel = registry.byId("restaurantLabel");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.restaurantMenuCategoriesRoundRectList.destroyDescendants();

			// show progress
			this.loadingDialog.show("Loading " + GlobalObjects.currentRestaurant.name + " Menu ...");
			
			// set the restaurant menu categories label to the current restaurant
			this.restaurantLabel.containerNode.innerHTML = this.substitute(this.restaurantListItemTemplate, {
				restaurantName: GlobalObjects.currentRestaurant.name,
				restaurantCuisine: GlobalObjects.currentRestaurant.cuisine,
				restaurantLogo: GlobalObjects.logosMap[GlobalObjects.currentRestaurant.id],
				restaurantLocation: GlobalObjects.currentRestaurant.location
			});
			Utilities.updateMainHeader(GlobalObjects.currentRestaurant.name, "home");
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.loadRestaurantMenuCategories(GlobalObjects.currentRestaurant);
			
			// move the scroll to the very top
			var restaurantMenuCategoriesScrollablePane = registry.byId("restaurantMenuCategoriesScrollablePane");
			restaurantMenuCategoriesScrollablePane.scrollTo({x: 0, y:0});
		},
		fixScrollablePanelHeight: function() {
			var restaurantMenuCategoriesScrollablePane = dom.byId("restaurantMenuCategoriesScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			domStyle.set(restaurantMenuCategoriesScrollablePane, "height", height);
		},
		// load restaurants
		loadRestaurantMenuCategories: function(currentRestaurant) {
			if (GlobalObjects.testMode) {
				this.onLoadRestaurantMenuCategoriesResponse(TestData.restaurantMenuCategories);
			} else {
				promise = request.get(GlobalObjects.serverURL + '/restaurants/restaurantMenuCategories/' + currentRestaurant.id , {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoadRestaurantMenuCategoriesResponse), lang.hitch(this, this.onLoadRestaurantMenuCategoriesError));
			}
		},
		// error handler
		onLoadRestaurantMenuCategoriesError: function(err) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.restaurantMenuCategoriesRoundRectList.destroyDescendants();
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
		onLoadRestaurantMenuCategoriesResponse: function(result) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.restaurantMenuCategoriesRoundRectList.destroyDescendants();
			// populate the list
			array.forEach(result.data.restaurantMenuCategories, lang.hitch(this, function (restaurantMenuCategory) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.restaurantMenuCategoriesRoundRectList, "last");
				
				// attach the restaurantId to the listItem (add a new attribute to listItem named 'restaurantId'
				listItem.restaurantMenuCategory = restaurantMenuCategory;
				// create and insert content from template and JSON response
				listItem.containerNode.innerHTML = this.substitute(this.restaurantMenuCategoryListItemTemplate, {
					restaurantMenuCategoryName: restaurantMenuCategory.name,
					restaurantMenuCategoryDescription: (restaurantMenuCategory.description != undefined ? restaurantMenuCategory.description : "")
				});
				listItem.onClick = lang.hitch(this, function(){
					GlobalObjects.currentRestaurantMenuCategory = listItem.restaurantMenuCategory;
					listItem.set("transition","slide");
					listItem.transitionTo('#restaurantMenuCategoryItems');
				});
				listItem.set("moveTo","#");
				this.fixScrollablePanelHeight();
			}));
		},
		// restaurant menu category list item template
		restaurantMenuCategoryListItemTemplate:
			'<div class="restaurantMenuCategory">' +
				'<div class="restaurantMenuCategoryContainer">' +
					'<div class="restaurantMenuCategory">${restaurantMenuCategoryName}</div>' +
					'<div class="restaurantMenuCategoryDescription">${restaurantMenuCategoryDescription}</div>' +
				'</div>' +
				'<div class="categoriesNextBtnContainer">' + 
					'<div class="nextBtn"></div>' +
				'</div>' + 
			'</div>',
		// restaurant label template
		restaurantListItemTemplate:
			'<div class="restaurantListItem">' +
				'<div class="restaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
				'<div class="restaurantDetails">' + 
					'<div class="restaurantName">${restaurantName}</div>' +
					'<div class="restaurantCuisine">${restaurantCuisine}</div>' +
					'<div class="restaurantLocation">${restaurantLocation}</div>' +
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