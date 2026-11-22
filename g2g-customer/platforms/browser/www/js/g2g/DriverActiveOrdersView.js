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
		
        driverActiveOrdersRoundRectList: null,
		messageDialogView: null,
		loadingDialog: null,
		scrollablePaneHeightfixed: false,
		orderView: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.driverActiveOrdersRoundRectList = registry.byId("driverActiveOrdersRoundRectList");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
			this.orderView = registry.byId("orderView");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.driverActiveOrdersRoundRectList.destroyDescendants();
			this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
			
			if (GlobalObjects.clockedIn == true) {
				this.fillActiveOrders();
			} else {
				this.askForClocking();
			}
		},
		fixScrollablePanelHeight: function() {
			var driverActiveOrdersScrollablePane = dom.byId("driverActiveOrdersScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 48 + 5); // the bottom tab bar and the upper header and the upper tab bar and a margin
			domStyle.set(driverActiveOrdersScrollablePane, "height", height);
		},
		refreshActiveOrders: function() {
			if (GlobalObjects.clockedIn == true) {
				this.fillActiveOrders();
			} else {
				this.askForClocking();
			}
		},
		askForClocking: function() {
			this.driverActiveOrdersRoundRectList.destroyDescendants();
			this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
			this.messageDialogView.show("You don't have any assigned orders since you're not clocked-in");
			this.driverActiveOrdersRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
			this.fixScrollablePanelHeight();
		},
		fillActiveOrders: function() {
			if (GlobalObjects.currentDriver != null) {
				this.loadingDialog.show("Loading Your active Orders ...");
				// clear everything
				this.driverActiveOrdersRoundRectList.destroyDescendants();
				this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
				// call WS to retrieve pending orders of user
				promise = request.get(GlobalObjects.serverURL + '/orders/assignedundelivered/' + GlobalObjects.currentDriver.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, this.onLoadDriverActiveOrdersResponse), lang.hitch(this, this.onLoadDriverActiveOrdersError));
			} else { // anonymous user
				// clear everything
				this.driverActiveOrdersRoundRectList.destroyDescendants();
				this.driverActiveOrdersRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
				this.fixScrollablePanelHeight();
			}
		},
		// error handler
		onLoadDriverActiveOrdersError: function(err) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.driverActiveOrdersRoundRectList.destroyDescendants();
			this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
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
		onLoadDriverActiveOrdersResponse: function(result) {
			// remove progress indicator
			this.loadingDialog.hide();
			this.driverActiveOrdersRoundRectList.destroyDescendants();
			this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
			// populate the list
			if (result.data.length > 0) { // if there are items, display them
				// populate the list
				var orderIndex = 0;
				
				array.forEach(result.data, lang.hitch(this, function (activeOrder) {
					// Create a new ListItem at the end of the list
					var listItem = new ListItem({}).placeAt(this.driverActiveOrdersRoundRectList, "last");
					
					// attach the pending to the listItem (add a new attribute to listItem named 'activeOrder' and its index (to be able to get it from the list))
					listItem.activeOrder = activeOrder;
					listItem.orderIndex = orderIndex;
					// create and insert content from template and JSON response
					
					var difference = (new Date(activeOrder.eta).getTime() - new Date().getTime());
					if (difference >= 0) {
						var differenceInString = "Due in " + Utilities.millisToString(difference);
					} else {
						differenceInString = "Overdue";
					}
					
					listItem.containerNode.innerHTML = this.substitute(this.activeOrderTemplate, {
						restaurantLogo: GlobalObjects.logosMap[activeOrder.restaurant.id],
						restaurantName: activeOrder.restaurant.name,
						id: "Order #" + activeOrder.id,
						customerCity: "To " + activeOrder.deliveryCity,
						activeOrderStatus: activeOrder.status.replace("_", " "),
						eta: differenceInString,
					});
					listItem.onClick = lang.hitch(this, function() {
						this.loadingDialog.show("Loading order data ...");
						// call WS to retrieve the status of the order
						promise = request.get(GlobalObjects.serverURL + '/order/' + activeOrder.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
						promise.response.then(lang.hitch(this, function(response) {
							this.loadingDialog.hide();
							GlobalObjects.currentOrder = response.data;
							this.orderView.setOrder(response.data);
							this.performTransition('orderView');
						}), lang.hitch(this, function(err) {
							// remove progress indicator
							this.loadingDialog.hide();
							this.driverActiveOrdersRoundRectList.destroyDescendants();
							this.driverActiveOrdersRoundRectList.containerNode.innerHTML = "";
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
				this.driverActiveOrdersRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
				this.fixScrollablePanelHeight();
			}
			
		},
		// list item template
		activeOrderTemplate:
			'<div class="leftFloatedField" style="width: 100%">' +
				'<div class="driverOrdersRestaurantImgDiv" style="float: right;">' + 
					'<img class="driverOrdersRestaurantImg" src="data:image/png;base64,${restaurantLogo}"/>' +
				'</div>' +
				'<div class="driverOrdersRestaurantName">${restaurantName}</div>' +
			'</div>' +
			'<div class="leftFloatedField" style="width: 100%">' +
				'<div class="driverOrdersStatus" style="float: left">${id}</div>' +
				'<div class="driverOrdersStatus" style="float:right;">${activeOrderStatus}</div>' +
			'</div>'+
			'<div class="leftFloatedField" style="width: 100%">' +
				'<div class="driverOrdersCustomerCity" style="float: left;">${customerCity}</div>' +
				'<div class="driverOrdersCustomerCity" style="float:right;">${eta}</div>' +
			'</div>',
		// empty order template
		emptyOrderTemplate:
			'<div>' + 
				'<img class="emptyOrderItemImg" src="img/cart_big.png"/>' + 
				'<p class="emptyOrderItemParagrapgh">No orders assigned to you</p>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});