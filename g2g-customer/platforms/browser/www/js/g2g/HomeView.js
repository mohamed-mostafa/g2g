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
		
		restaurantsRoundRectList: null,
		messageDialogView: null,
		loadingDialog: null,
		chooseAddressView: null,
		offlineDialog: null,
		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.restaurantsRoundRectList = registry.byId("restaurantsRoundRectList");
			this.loadingDialog = registry.byId("loadingDialog");
			this.chooseAddressView = registry.byId("chooseAddressView");
			this.offlineDialog = registry.byId("offlineDialog");
			
			Utilities.updateMainHeader("Restaurants");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.restaurantsRoundRectList.destroyDescendants();
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			Utilities.updateMainHeader("Restaurants");
			Utilities.updateRestaurantTitleLink(lang.hitch(this, this.onUserChangedLocation));
			this.loadRestaurants();
		},
		show: function() {
			this.inherited(arguments);
			Utilities.updateMainHeader("Restaurants");
//			this.loadRestaurants();
		},
		fixScrollablePanelHeight: function() {
			var restaurantsScrollablePane = dom.byId("restaurantsScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 16); // the bottom tab bar and the upper header and the change location header
			domStyle.set(restaurantsScrollablePane, "height", height);
		},
		onUserChangedLocation: function() {
			this.chooseAddressView.show("Select your location to get the restaurants nearby", lang.hitch(this, function(address) {
				GlobalObjects.selectedAddress = address;
				Utilities.updateRestaurantTitleLink(lang.hitch(this, this.onUserChangedLocation));
				this.loadRestaurants();
			}));
		},
		// load restaurants
		loadRestaurants: function() {
			var zipCode = null;
			if (GlobalObjects.currentUser != null) { // if not anonymous
				if (GlobalObjects.selectedAddress) { // we don't load anything unless the user has logged in, and has specified an address
					zipCode = GlobalObjects.selectedAddress.zipCode;
				}
			} else  {
				zipCode = GlobalObjects.anonymousUserZipCode;
			}
			
			if (zipCode != null) {
				var url = GlobalObjects.serverURL + '/v2/restaurants/' + zipCode;
				this.loadingDialog.show("Loading nearby restaurants ...");
				promise = request.get(url, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoadRestaurantsResponse), lang.hitch(this, this.onLoadRestaurantsError));
			}
		},
		// error handler
		onLoadRestaurantsError: function(err) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.restaurantsRoundRectList.destroyDescendants();
			this.restaurantsRoundRectList.containerNode.innerHTML = "";
			// display error message
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else if (err.response.status == 503) { // G2G is closed, but we still have a list of restaurants ...
				// in 503 case, data is returned as JSON
				
				// show a message (if this is the first time to view the page after the
				if (GlobalObjects.isG2GClosed == false) {
					this.offlineDialog.show(err.response.data.offlineMessage);
				}
				
				// then, show the restaurants anyway
				this.onLoadRestaurantsResponse(err.response);
				
				GlobalObjects.isG2GClosed = true; // to prevent the message from appearing again, unless when the user opens G2G when its open at least once
			} else if (err.response.status == 500) {
				this.restaurantsRoundRectList.containerNode.innerHTML = this.g2gSomethingWrong;
			} else {
				this.restaurantsRoundRectList.containerNode.innerHTML = this.g2gSomethingWrong;
			}
		},
		//  response handler
		onLoadRestaurantsResponse: function(result) {
			// remove progress indicator
			this.loadingDialog.hide();
			
			// show the ads
			if (!GlobalObjects.adShown) {
				registry.byId("adsDialog").show();
				GlobalObjects.adShown = true;
			}
			
			GlobalObjects.isG2GClosed = false; // to prevent the message from appearing again, unless when the user opens G2G when its open at least once
			this.restaurantsRoundRectList.destroyDescendants();
			this.restaurantsRoundRectList.containerNode.innerHTML = "";
			// populate the list
			if (result.data.restaurants.length > 0) { // if there are restaurants, render them
				array.forEach(result.data.restaurants, lang.hitch(this, function (restaurant) {
					// Create a new ListItem at the end of the list
					var listItem = new ListItem({}).placeAt(this.restaurantsRoundRectList, "last");
					
					// attach the restaurant to the listItem (add a new attribute to listItem named 'restaurant'
					listItem.restaurant = restaurant;
					// create and insert content from template and JSON response
					if (restaurant.isOpen) {
						listItem.containerNode.innerHTML = this.substitute(this.restaurantListItemTemplate, {
							restaurantName: restaurant.name,
							restaurantCuisine: restaurant.cuisine,
							restaurantLogo: GlobalObjects.logosMap[restaurant.id],
							restaurantLocation: restaurant.location
						});
						listItem.onClick = lang.hitch(this, function(){
							GlobalObjects.currentRestaurant = listItem.restaurant;
							listItem.set("transition","slide");
							listItem.transitionTo('#restaurantMenuCategories');
						});
					} else { // restaurant is closed now
						listItem.containerNode.innerHTML = this.substitute(this.closedRestaurantListItemTemplate, {
							restaurantName: restaurant.name,
							restaurantCuisine: restaurant.cuisine,
							restaurantLogo: GlobalObjects.logosMap[restaurant.id],
							restaurantLocation: restaurant.location
						});
					}
					listItem.set("moveTo","#");
					this.fixScrollablePanelHeight();
				}));
			} else { // if there're no restaurants for this zip code, 
				this.restaurantsRoundRectList.containerNode.innerHTML = this.emptyRestaurantsTemplate;
			}
			// move the scroll to the very top
			var restaurantsScrollablePane = registry.byId("restaurantsScrollablePane");
			restaurantsScrollablePane.scrollTo({x: 0, y:0});
		},
		// list item template
		restaurantListItemTemplate:
			'<div class="restaurantListItem">' +
				'<div class="restaurantContainer">' +
					'<div class="restaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
					'<div class="restaurantDetails">' + 
						'<div class="restaurantName">${restaurantName}</div>' +
						'<div class="restaurantCuisine">${restaurantCuisine}</div>' +
						/*'<div class="restaurantLocation">${restaurantLocation}</div>' +*/
					'</div>' +
				'</div>' + 
				'<div class="nextBtnContainer">' + 
					'<div class="nextBtn"></div>' +
				'</div>' + 
			'</div>',
		closedRestaurantListItemTemplate:
			'<div class="restaurantListItem">' +
				'<div class="closedRestaurantContainer">' +
					'<div class="restaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
					'<div class="closedRestaurantDetails">' + 
						'<div class="restaurantNameClosed">${restaurantName}</div>' +
						'<div class="restaurantCuisine">${restaurantCuisine}</div>' +
						/*'<div class="restaurantLocation">${restaurantLocation}</div>' +*/
					'</div>' +
				'</div>' + 
				/*'<div class="nextBtnContainer">' + */
					'<div class="closedWordContainer">Closed</div>' +
				/*'</div>' + */
			'</div>',
		emptyRestaurantsTemplate:
			'<div  class="emptyRestaurant">' +
				'<p>Our go getters have not reached your area yet !' + 
				'</p>' +
				'<button class="requestDeliveryBtn baseBtn" onClick="Utilities.requestDelivery();">Ask G2G to consider your area</button>' +
			'</div>' ,
		g2gClosedTemplate:
			'<div  class="emptyRestaurant">' +
				'<p class="weareoffline">We are offline !' + 
				'</p>' +
				'<p class="weareofflinemessage">${g2gClosedMessage}' + 
				'</p>' +
			'</div>' ,
		g2gSomethingWrong:
			'<div  class="emptyRestaurant">' +
				'<p class="weareoffline">Something went wrong !' + 
				'</p>' +
				'<p class="weareofflinemessage">Please refresh the view to recover ...' + 
				'</p>' +
				'<button class="requestDeliveryBtn baseBtn" onClick="Utilities.reloadRestaurants();">Refresh</button>' +
			'</div>' ,
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});