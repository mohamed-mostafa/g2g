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
		
		pendingOrdersRoundRectList: null,
		messageDialogView: null,
		loadingDialog: null,
		scrollablePaneHeightfixed: false,
		trackOrderView: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.pendingOrdersRoundRectList = registry.byId("pendingOrdersRoundRectList");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.trackOrderView = registry.byId("trackOrderView");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.pendingOrdersRoundRectList.destroyDescendants();
			this.fillPendingOrders();
			Utilities.updateMainHeader("Placed Orders");
		},
		fixScrollablePanelHeight: function() {
			var pendingOrdersScrollablePane = dom.byId("pendingOrdersScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 48 + 5); // the bottom tab bar and the upper header and the upper tab bar and a margin
			domStyle.set(pendingOrdersScrollablePane, "height", height);
		},
		fillPendingOrders: function() {
			if (GlobalObjects.currentUser != null) {
				this.loadingDialog.show("Loading Your Pending Orders ...");
				// clear everything
				this.pendingOrdersRoundRectList.containerNode.innerHTML = "";
				this.pendingOrdersRoundRectList.destroyDescendants();
				
				// call WS to retrieve pending orders of user
				promise = request.get(GlobalObjects.serverURL + '/v2/order/pending/' + GlobalObjects.currentUser.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoadPendingOrdersResponse), lang.hitch(this, this.onLoadPendingOrdersError));
			} else { // anonymous user
				// clear everything
				this.pendingOrdersRoundRectList.containerNode.innerHTML = "";
				this.pendingOrdersRoundRectList.destroyDescendants();
				
				this.pendingOrdersRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
				this.fixScrollablePanelHeight();
			}
			
		},
		// error handler
		onLoadPendingOrdersError: function(err) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.pendingOrdersRoundRectList.destroyDescendants();
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
		onLoadPendingOrdersResponse: function(result) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.pendingOrdersRoundRectList.destroyDescendants();
			// populate the list
			if (result.data.pendingOrders.length > 0) { // if there are items, display them
				// populate the list
				var orderIndex = 0;
				array.forEach(result.data.pendingOrders, lang.hitch(this, function (pendingOrder) {
					// Create a new ListItem at the end of the list
					var listItem = new ListItem({}).placeAt(this.pendingOrdersRoundRectList, "last");
					
					// attach the pending to the listItem (add a new attribute to listItem named 'pendingOrder' and its index (to be able to get it from the list))
					listItem.pendingOrder = pendingOrder;
					listItem.orderIndex = orderIndex;
					// create and insert content from template and JSON response
					listItem.containerNode.innerHTML = this.substitute(this.pendingOrderTemplate, {
						restaurantLogo: GlobalObjects.logosMap[pendingOrder.restaurant.id],
						restaurantName: pendingOrder.restaurant.name,
						restaurantCuisine: pendingOrder.restaurant.cuisine,
						restaurantLocation: pendingOrder.restaurant.location,
						pendingOrderCount: pendingOrder.itemsCount,
						pendingOrderPrice: "$" + currency.format(pendingOrder.totalValue, 'd.dd'),
						pendingOrderStatus: pendingOrder.status.replace("_", " ")
					});
					listItem.onClick = lang.hitch(this, function() {
						this.loadingDialog.show("Refreshing Order Status ...");
						// call WS to retrieve the status of the order
						this.trackOrderView.open(pendingOrder);
						promise = request.get(GlobalObjects.serverURL + '/order/' + pendingOrder.id + '/status', {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
						promise.response.then(lang.hitch(this, function(response) {
							listItem.containerNode.innerHTML = this.substitute(this.pendingOrderTemplate, {
								restaurantLogo: GlobalObjects.logosMap[pendingOrder.restaurant.id],
								restaurantName: pendingOrder.restaurant.name,
								restaurantCuisine: pendingOrder.restaurant.cuisine,
								restaurantLocation: pendingOrder.restaurant.location,
								pendingOrderCount: pendingOrder.itemsCount,
								pendingOrderPrice: "$" + currency.format(pendingOrder.totalValue, 'd.dd'),
								pendingOrderStatus: response.data.status.replace("_", " ")
							});
							this.loadingDialog.hide();
						}), lang.hitch(this, function(err) {
							// remove progress indicator
							this.loadingDialog.hide();
							this.pendingOrdersRoundRectList.destroyDescendants();
							// display error message
							if (err.response.status == 0) {
								this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
							} else if (err.response.status == 404) {
								this.messageDialogView.show("G2G servers are unable to process your request at this time");
							} else {
								this.messageDialogView.show(err.response.text);
							}
						}));
					});
					listItem.set("moveTo","#");
					orderIndex++; // keep the orderItemIndex updated
					this.fixScrollablePanelHeight();
				}));
			} else { // if there're no items, display the empty page
				this.pendingOrdersRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
				this.fixScrollablePanelHeight();
			}
			
		},
		// list item template
		pendingOrderTemplate:
			'<div class="pendingOrdersListItem">' +
			'<table>' +
			'<tr>' +
				'<td>' +
					'<div class="pendingOrderRestaurantImgDiv"><img class="restaurantImg" src="data:image/png;base64,${restaurantLogo}"/></div>' +
				'</td>' +
				'<td>' +
					'<div class="pendingOrderRestaurantDetails">' + 
						'<div class="ellipsisText pendingOrderRestaurantName">${restaurantName}</div>' +
						'<div class="pendingOrderRestaurantCuisine">${restaurantCuisine}</div>' +
						'<div class="pendingOrderRestaurantLocation">${restaurantLocation}</div>' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="pendingOrderDetails"><div class="pendingOrderCount">${pendingOrderCount} Items</div><div class="pendingOrderPrice">${pendingOrderPrice}</div></div>' +
				'</td>' +
			'</tr>' +
			'<tr>' +
				'<td colspan="2"> ' +
					'<div class="leftFloatedField pendingOrderStatus">' +
						'<div>${pendingOrderStatus}</div>' +
					'</div>' +
				'</td>' +
				'<td>' +
					'<div class="smallItalicText rightFloatedField tapToRefresh">Tap To Track</div>' +
				'</td>' +
			'</tr> ' +
			'</table>' +
		'</div>',
		// empty order template
		emptyOrderTemplate:
			'<div>' + 
				'<img class="emptyOrderItemImg" src="img/cart_big.png"/>' + 
				'<p class="emptyOrderItemParagrapgh">Track the status of your placed orders</p>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});