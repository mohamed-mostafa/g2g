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
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/currency",
	"dojo/query"
    ], function(declare, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, on, SimpleDialog, Button, has, iconUtils, dom,domClass, domStyle, currency, query) {
        return declare([SimpleDialog], {
        	
        g2gRating: null,
        currentOrderId: null,
        messageDialogView: null,
		loadingDialog: null,
		repeatingHandler: null,
        
		
		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.g2gRating = registry.byId("orderRating");
			this.messageDialogView = registry.byId("messageDialog");
			this.loadingDialog = registry.byId("loadingDialog");
		},
		open: function(orderSummary) {
			this.loadingDialog.show("Refreshing order status ...");
			Utilities.hideKeyboard();
			this.currentOrderId = orderSummary.id;
			dom.byId("trackedOrderRestaurantImage").src = "data:image/png;base64," + GlobalObjects.logosMap[orderSummary.restaurant.id];
			dom.byId("trackedOrderRestaurantName").innerHTML = orderSummary.restaurant.name;
			this.resetAllStyles();
			this.repeating(); // this will also .show()
			this.repeatingHandler = setInterval(lang.hitch(this, this.repeating), 30 * 1000);
			
		},
		hide: function() {
			clearInterval(this.repeatingHandler);
			this.inherited(arguments);
		},
		repeating: function() {
			promise = request.get(GlobalObjects.serverURL + '/order/' + this.currentOrderId, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response) {
				
				this.resetAllStyles();
				var order = response.data;
				
				if (order.status == "REFUNDED") { // refunded is handled independently
					domStyle.set(dom.byId("refundedOrder"), "display", "inline");
					domStyle.set(dom.byId("onTrackOrder"), "display", "none");
					
					dom.byId("estimatedTimeOfArrivalDiv").innerHTML = "Order Cancelled";
					dom.byId("estimatedTimeOfArrivalMsgDiv").innerHTML = order.etaMessage;
					dom.byId("orderDriverDiv").innerHTML = "";
				} else if (order.status == "REFUNDED_ARCHIVED" || order.status == "DELIVERED_ARCHIVED") {
					// if it happens that the order was archived while the tracking screen was open, close it :P
					this.hide();
				} else { // placed, received, being prepared, picked up and delivered
					domStyle.set(dom.byId("refundedOrder"), "display", "none");
					domStyle.set(dom.byId("onTrackOrder"), "display", "inline");
					
					if (order.status == "PLACED") {
						this.markPlaced();
					} else if (order.status == "RECEIVED") {
						this.markReceived();
					} else if (order.status == "BEING_PREPARED") {
						this.markBeingPrepared();		
					} else if (order.status == "PICKED_UP") {
						this.markPickedUp();
					} else if (order.status == "DELIVERED") {
						this.markDelivered();
					}
					
					if ((order.driver != null && order.driver.fullName != null && order.driver.fullName != "") && (order.status == "PICKED_UP" || order.status == "DELIVERED")) {
						dom.byId("driverField").innerHTML = "By G2G Driver: " + order.driver.fullName;
						dom.byId("orderDriverDiv").innerHTML = "Driver: " +  order.driver.fullName + " - " +  order.driver.phone;
					} else {
						dom.byId("driverField").innerHTML = "By G2G Driver";
						dom.byId("orderDriverDiv").innerHTML = "";
					}
					if (order.restaurant != null && order.restaurant.name != null && order.restaurant.name != "") {
						dom.byId("restaurantField").innerHTML = "By " + order.restaurant.name;
					} else {
						dom.byId("restaurantField").innerHTML = "By the restaurant";
					}
					
					// if the order is in progress, display the ETA information
					if (order.status != 'DELIVERED') {
						// display the difference between NOW and the ETA, if the order has an ETA
						if (order.eta != null) {
							// calculate the difference, in minutes, between now and the ETA
							var difference = (new Date(order.eta).getTime() - new Date().getTime()); // milliseconds between now & eta
							if (difference >= 0) {
								var differenceInString = Utilities.millisToString(difference);
								dom.byId("estimatedTimeOfArrivalDiv").innerHTML = "Expected at your doorstep in " + differenceInString;
							} else {
								dom.byId("estimatedTimeOfArrivalDiv").innerHTML = "Expected at your doorstep very soon ...";
							}
							// display the message of the ETA if the order is not on time
							if (order.onTime == false) {
								dom.byId("estimatedTimeOfArrivalMsgDiv").innerHTML = order.etaMessage;
							}
						} else {
							// if the order doesn't have an ETA
							dom.byId("estimatedTimeOfArrivalDiv").innerHTML = difference + "Your order will arrive as soon as possible";
						}
					} else {
						dom.byId("estimatedTimeOfArrivalDiv").innerHTML = "";
					}
				}
				
				// initialize the rating
				registry.byId("orderRating").initG2GRating(lang.hitch(this, this.userRating));
				registry.byId("orderRating").setRating(order.rating);
				
				// list the items, regardless the status
				var trackOrderItemsRoundRectList = registry.byId("trackOrderItemsRoundRectList");
				trackOrderItemsRoundRectList.destroyDescendants();
				array.forEach(order.items, lang.hitch(this, function (orderItem) {
					// Create a new ListItem at the end of the list
					var listItem = new ListItem({}).placeAt(trackOrderItemsRoundRectList, "last");
					
					// attach the restaurantId to the listItem (add a new attribute to listItem named 'orderItem' and its index (to be able to get it from the list))
					listItem.orderItem = orderItem;
					// create and insert content from template and JSON response
					listItem.containerNode.innerHTML = this.substitute(this.orderItemTemplate, {
						orderItemName: orderItem.name,
						orderItemQuantity: orderItem.quantity,
						orderItemSpecialInstructions: orderItem.sides,
						
					});
				}));
				this.loadingDialog.hide();
				this.show();
			}), lang.hitch(this, function(err) {
				this.loadingDialog.hide();
				this.hide();
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
		userRating: function(rating) {
			this.loadingDialog.show("Rating your order ...");
			promise = request.post(GlobalObjects.serverURL + '/order/rating', {handleAs:'json', data: JSON.stringify({orderId: this.currentOrderId, rating: rating}), headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function() {
				// remove progress indicator
				this.loadingDialog.hide();
				if (rating > 2) {
					this.messageDialogView.show("Thank You For Your Feedback");
				} else {
					registry.byId("yesNoDialog").show("Oops! Would you like to tell us more about this order ?", lang.hitch(this, function(){
						// yes
						registry.byId("contactUs").openDialog();
						registry.byId("yesNoDialog").hide();
						this.hide();
					}), lang.hitch(this, function() {
						// no
						registry.byId("yesNoDialog").hide();
					}), "This will help us improve our service"); // sub message
					
				}
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
		},
		resetAllStyles: function() {
			
			domClass.add(dom.byId("placedTimelineHeading"), "timeline-heading");
			domClass.add(dom.byId("receivedTimelineHeading"), "timeline-heading");
			domClass.add(dom.byId("beingPreparedTimelineHeading"), "timeline-heading");
			domClass.add(dom.byId("pickedUpTimelineHeading"), "timeline-heading");
			domClass.add(dom.byId("deliveredTimelineHeading"), "timeline-heading");
			domClass.add(dom.byId("placedTimelineImage"), "timeline-image");
			domClass.add(dom.byId("receivedTimelineImage"), "timeline-image");
			domClass.add(dom.byId("beingPreparedTimelineImage"), "timeline-image");
			domClass.add(dom.byId("pickedUpTimelineImage"), "timeline-image");
			domClass.add(dom.byId("deliveredTimelineImage"), "timeline-image");
			domClass.add(dom.byId("placedTimelinePanel"), "timeline-panel");
			domClass.add(dom.byId("receivedTimelinePanel"), "timeline-panel");
			domClass.add(dom.byId("beingPreparedTimelinePanel"), "timeline-panel");
			domClass.add(dom.byId("pickedUpTimelinePanel"), "timeline-panel");
			domClass.add(dom.byId("deliveredTimelinePanel"), "timeline-panel");
			
			domClass.remove(dom.byId("placedTimelineHeading"), "timeline-heading-selected");
			domClass.remove(dom.byId("receivedTimelineHeading"), "timeline-heading-selected");
			domClass.remove(dom.byId("beingPreparedTimelineHeading"), "timeline-heading-selected");
			domClass.remove(dom.byId("pickedUpTimelineHeading"), "timeline-heading-selected");
			domClass.remove(dom.byId("deliveredTimelineHeading"), "timeline-heading-selected");
			domClass.remove(dom.byId("placedTimelineImage"), "timeline-image-selected");
			domClass.remove(dom.byId("receivedTimelineImage"), "timeline-image-selected");
			domClass.remove(dom.byId("beingPreparedTimelineImage"), "timeline-image-selected");
			domClass.remove(dom.byId("pickedUpTimelineImage"), "timeline-image-selected");
			domClass.remove(dom.byId("deliveredTimelineImage"), "timeline-image-selected");
			
			domClass.remove(dom.byId("placedTimelineImage"), "heartbeating");
			domClass.remove(dom.byId("receivedTimelineImage"), "heartbeating");
			domClass.remove(dom.byId("beingPreparedTimelineImage"), "heartbeating");
			domClass.remove(dom.byId("pickedUpTimelineImage"), "heartbeating");
			domClass.remove(dom.byId("deliveredTimelineImage"), "heartbeating");
			
			domClass.remove(dom.byId("placedTimelinePanel"), "timeline-panel-selected");
			domClass.remove(dom.byId("receivedTimelinePanel"), "timeline-panel-selected");
			domClass.remove(dom.byId("beingPreparedTimelinePanel"), "timeline-panel-selected");
			domClass.remove(dom.byId("pickedUpTimelinePanel"), "timeline-panel-selected");
			domClass.remove(dom.byId("deliveredTimelinePanel"), "timeline-panel-selected");
			
			domStyle.set(dom.byId("placedImage"), "display", "none");
			domStyle.set(dom.byId("receivedImage"), "display", "none");
			domStyle.set(dom.byId("beingPreparedImage"), "display", "none");
			domStyle.set(dom.byId("pickedUpImage"), "display", "none");
			domStyle.set(dom.byId("deliveredImage"), "display", "none");
			
			domStyle.set(dom.byId("placedImageSelected"), "display", "none");
			domStyle.set(dom.byId("receivedImageSelected"), "display", "none");
			domStyle.set(dom.byId("beingPreparedImageSelected"), "display", "none");
			domStyle.set(dom.byId("pickedUpImageSelected"), "display", "none");
			domStyle.set(dom.byId("deliveredImageSelected"), "display", "none");
			
			dom.byId("estimatedTimeOfArrivalDiv").innerHTML = "";
			dom.byId("estimatedTimeOfArrivalMsgDiv").innerHTML = "";
			dom.byId("orderDriverDiv").innerHTML = "";
			
			domStyle.set(dom.byId("refundedOrder"), "display", "none");
			domStyle.set(dom.byId("onTrackOrder"), "display", "inline");
			dom.byId("driverField").innerHTML = "By G2G Driver";
			dom.byId("orderDriverDiv").innerHTML = "";
			dom.byId("restaurantField").innerHTML = "By the restaurant";
			registry.byId("orderRating").initG2GRating(lang.hitch(this, this.userRating));
			registry.byId("orderRating").setRating(0);
			var trackOrderItemsRoundRectList = registry.byId("trackOrderItemsRoundRectList");
			trackOrderItemsRoundRectList.destroyDescendants();
		},
		markPlaced: function() {
			domClass.add(dom.byId("placedTimelineHeading"), "timeline-heading-selected");
			domClass.add(dom.byId("placedTimelineImage"), "timeline-image-selected");
			domClass.add(dom.byId("placedTimelineImage"), "heartbeating");
			
			domClass.add(dom.byId("placedTimelinePanel"), "timeline-panel-selected");
			
			domStyle.set(dom.byId("placedImageSelected"), "display", "inline");
		},
		markReceived: function() {
			domClass.add(dom.byId("receivedTimelineHeading"), "timeline-heading-selected");
			domClass.add(dom.byId("receivedTimelineImage"), "timeline-image-selected");
			domClass.add(dom.byId("receivedTimelinePanel"), "timeline-panel-selected");
			domClass.add(dom.byId("receivedTimelineImage"), "heartbeating");
			
			domStyle.set(dom.byId("placedImage"), "display", "inline");
			domStyle.set(dom.byId("receivedImageSelected"), "display", "inline");
		},
		markBeingPrepared: function() {
			domClass.add(dom.byId("beingPreparedTimelineHeading"), "timeline-heading-selected");
			domClass.add(dom.byId("beingPreparedTimelineImage"), "timeline-image-selected");
			domClass.add(dom.byId("beingPreparedTimelinePanel"), "timeline-panel-selected");
			domClass.add(dom.byId("beingPreparedTimelineImage"), "heartbeating");
			
			domStyle.set(dom.byId("placedImage"), "display", "inline");
			domStyle.set(dom.byId("receivedImage"), "display", "inline");
			domStyle.set(dom.byId("beingPreparedImageSelected"), "display", "inline");
		},
		markPickedUp: function() {
			domClass.add(dom.byId("pickedUpTimelineHeading"), "timeline-heading-selected");
			domClass.add(dom.byId("pickedUpTimelineImage"), "timeline-image-selected");
			domClass.add(dom.byId("pickedUpTimelinePanel"), "timeline-panel-selected");
			domClass.add(dom.byId("pickedUpTimelineImage"), "heartbeating");
			
			domStyle.set(dom.byId("placedImage"), "display", "inline");
			domStyle.set(dom.byId("receivedImage"), "display", "inline");
			domStyle.set(dom.byId("beingPreparedImage"), "display", "inline");
			domStyle.set(dom.byId("pickedUpImageSelected"), "display", "inline");
		},
		markDelivered: function() {
			domClass.add(dom.byId("deliveredTimelineHeading"), "timeline-heading-selected");
			domClass.add(dom.byId("deliveredTimelineImage"), "timeline-image-selected");
			domClass.add(dom.byId("deliveredTimelinePanel"), "timeline-panel-selected");
			
			domStyle.set(dom.byId("placedImage"), "display", "inline");
			domStyle.set(dom.byId("receivedImage"), "display", "inline");
			domStyle.set(dom.byId("beingPreparedImage"), "display", "inline");
			domStyle.set(dom.byId("pickedUpImage"), "display", "inline");
			domStyle.set(dom.byId("deliveredImageSelected"), "display", "inline");
		},
		markRefunded: function() {
			
		},
		// list item template
		orderItemTemplate:
			'<div class="orderItem">' +
				'<div class="orderItemContainer">' +
					'<div class="trackedOrderItemQuantity">${orderItemQuantity}</div>' +
					'<div class="trackedOrderItemXSymbol">X</div>' +
					'<div class="trackedOrderItemName ellipsisText">${orderItemName}</div> <br/>' +
					'<div class="trackedOrderItemSpecialInstructions ellipsisText">${orderItemSpecialInstructions}</div>' +
				'</div>' + 
			'</div>',
			// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		},
    });
});