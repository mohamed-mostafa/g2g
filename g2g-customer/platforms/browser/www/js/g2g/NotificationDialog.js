define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom",
	"dojox/mobile/ProgressIndicator",
	"dojo/touch",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/request",
	"dojo/query",
    ], function(declare, registry, on, SimpleDialog, dom, ProgressIndicator, touch, lang, domStyle, request, query) {
        return declare([SimpleDialog], {
        	
        beingMoved: false,
        clickEventHandler: null,
        dismissedUntilRestart: false,
        notificationsDialogBody: null,
        
        resetDismissedUntilRestart: function() {
        	this.dismissedUntilRestart = false;
        },
        dismissUntilRestart: function() {
        	this.dismissedUntilRestart = true;
        },
		startup: function() {
			this.set("modal", false);
			this.inherited(arguments);
			this.notificationsDialogBody = query(".mblSimpleDialogContainer", this.domNode)[0];
			
			
			domStyle.set(this.domNode, 'top', 120);
			domStyle.set(this.domNode, 'left', 20);
			
			// 3 events for moving
			touch.press(this.notificationsDialogBody, lang.hitch(this, function(e) {
				this.beingMoved = true;
			}));
			touch.move(this.notificationsDialogBody, lang.hitch(this, function(e) {
				if (this.beingMoved == true) {
					domStyle.set(this.domNode, 'top', e.pageY - 50);
					domStyle.set(this.domNode, 'left', e.pageX - 25);
				}
			}));
			touch.release(this.notificationsDialogBody, lang.hitch(this, function(e) {
				this.beingMoved = false;
			}));
			
			setInterval(lang.hitch(this, this.monitorUserOrders), 30 * 1000); // every 30 seconds, check for a new order
		},
		
		// a function that is called every minute
		// also, can be called on purpose at any time
		monitorUserOrders: function() {
			// don't execute if in anonymous mode
			if (GlobalObjects.currentUser == null || (GlobalObjects.currentUser != null && GlobalObjects.currentUser.id == 0)) {
				return;
			}
			// don't execute if the user has closed it 
			if (this.dismissedUntilRestart == true) {
				return;
			}
			promise = request.get(GlobalObjects.serverURL + '/order/inprogress/' + GlobalObjects.currentUser.id, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response) {
				var orders = response.data;
				var hasActiveOrders = (orders.length >= 1);
				if (hasActiveOrders) {
					
					// modify the text on the notifications popup
					if (orders.length == 1) {
						dom.byId("ongoingOrdersCount").innerHTML = "1";
						dom.byId("ongoingOrdersText").innerHTML = "Active Order";
					} else {
						dom.byId("ongoingOrdersCount").innerHTML = orders.length;
						dom.byId("ongoingOrdersText").innerHTML = "Active Orders";
					}
					
					// register the click event on the notifications popup
					if (this.clickEventHandler) this.clickEventHandler.remove(); // remove the previous event , then register the new event
					this.clickEventHandler = on(this.notificationsDialogBody, "click", lang.hitch(this, function(e) {
						if (orders.length == 1) {
							registry.byId("trackOrderView").open(orders[0]);
						} else {
							// open a window to select which order to open
							registry.byId("activeOrders").show(orders);	
						}
					}));
					
					// show the notification popup
					this.show();
				} else {
					this.hide(true);
				}
			}), lang.hitch(this, function(err) {
				this.hide(true);
				// do nothing ... this thing wont work until the request works fine !!!
			}));
		},
		hide: function(unconditionalClosure) {
			if (unconditionalClosure) { // this variable will only exist when this function is called programatically (i.e not when it is called by clicking the X button on the UI)
				// hide normally
				this.inherited(arguments);
			} else { // not an explicit normal hide, this means its a hide that happened by Dojo (clicking the X button)
				// ask the user if he wants to dismiss
				registry.byId("yesNoDialog").show("Do you want to dismiss this notification?", lang.hitch(this, function(){
					// yes
					registry.byId("yesNoDialog").hide();
					this.dismissedUntilRestart = true;
					this.hide(true);
				}), lang.hitch(this, function() {
					// no, don't call the inherited :P
					registry.byId("yesNoDialog").hide();
				}), "You can always track your active orders in 'My Orders' tab ..."); // sub message
			}
		}
    });
});