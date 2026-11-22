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
		
		orderItemsRoundRectList: null,
		progressIndicator: null,
		modifyOrderItemDialog: null,
		messageDialogView: null,
		addOrderItemSides: null,
		firstTimePaymentsView: null,
		onTheFlyRegistrationAccount: null,
		yesNoDialog: null,
		storageManager: null,
		doubleButtonDialog: null,
		onTheFlyLoginView: null,

		// init variables and handlers
		startup: function () {
			this.messageDialogView = registry.byId("messageDialog");
			this.doubleButtonDialog = registry.byId("doubleButtonDialog");
			this.orderItemsRoundRectList = registry.byId("orderItemsRoundRectList");
			this.progressIndicator = ProgressIndicator.getInstance();
			this.modifyOrderItemDialog = registry.byId("modifyOrderItem");
			this.addOrderItemSides = registry.byId("addOrderItemSides");
			this.firstTimePaymentsView = registry.byId("firstTimePaymentsView");
			this.onTheFlyRegistrationAccount = registry.byId("onTheFlyRegistrationAccount");
			this.addOrderItemSides.openMe = lang.hitch(this, this.openAddOrderItemSidesDialog);
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.storageManager = registry.byId("storageManager");
			this.onTheFlyLoginView = registry.byId("onTheFlyLoginView");
			this.inherited(arguments);
			
			// disable tab bar buttons of on the fly registration
			this.disableTabBarButtonsOfOnTheFlyRegistration();
		},
		disableTabBarButtonsOfOnTheFlyRegistration: function() {
			registry.byId("onTheFlyAccountRegistrationAccountTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAccountRegistrationAddressTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAccountRegistrationPaymentTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationAccountTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationAddressTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationPaymentTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationAccountTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationAddressTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationPaymentTabBarButton").on("click", function() {return false;});
			registry.byId("onTheFlyAccountRegistrationAccountTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyAccountRegistrationAddressTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyAccountRegistrationPaymentTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationAccountTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationAddressTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyAddressRegistrationPaymentTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationAccountTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationAddressTabBarButton").on("touchStart", function() {return false;});
			registry.byId("onTheFlyPaymentRegistrationPaymentTabBarButton").on("touchStart", function() {return false;});
		},
		openAddOrderItemSidesDialog: function() {
			this.addOrderItemSides.show();
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.orderItemsRoundRectList.destroyDescendants();
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.fillOrderItems();
			Utilities.updateMainHeader("My Orders");
		},
		show: function() {
			this.fillOrderItems();
			Utilities.updateMainHeader("My Orders");
			this.inherited(arguments);
		},
		fixScrollablePanelHeight: function() {
			var orderItemsScrollablePane = dom.byId("driverOrderItemsScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 48 + 5); // the bottom tab bar and the upper header and the upper tab bar and a margin
			domStyle.set(orderItemsScrollablePane, "height", height);
		},
		fillOrderItems: function() {
			// clear everything
			this.orderItemsRoundRectList.containerNode.innerHTML = "";
			this.orderItemsRoundRectList.destroyDescendants();
			
			if (GlobalObjects.currentOrder.orderItems.length > 0) { // if there are items, display them
				this.progressIndicator.start();
				// populate the list
				var orderItemIndex = 0;
				array.forEach(GlobalObjects.currentOrder.orderItems, lang.hitch(this, function (orderItem) {
					// Create a new ListItem at the end of the list
					var listItem = new ListItem({}).placeAt(this.orderItemsRoundRectList, "last");
					
					// attach the restaurantId to the listItem (add a new attribute to listItem named 'orderItem' and its index (to be able to get it from the list))
					listItem.orderItem = orderItem;
					listItem.orderItemIndex = orderItemIndex;
					// create and insert content from template and JSON response
					listItem.containerNode.innerHTML = this.substitute(this.orderItemTemplate, {
						orderItemName: orderItem.restaurantMenuCategoryItem.name,
						orderItemQuantity: orderItem.quantity,
						orderItemPrice: "$" + currency.format(orderItem.price, 'd.dd'),
						orderItemSpecialInstructions: orderItem.specialInstructions
					});
					listItem.onClick = lang.hitch(this, function() {
						GlobalObjects.currentOrderItem = listItem.orderItem;
						GlobalObjects.currentOrderItemIndex = listItem.orderItemIndex;
						this.modifyOrderItemDialog.show();
					});
					listItem.set("moveTo","#");
					orderItemIndex++; // keep the orderItemIndex updated
					this.fixScrollablePanelHeight();
				}));
				this.updateTotalOrderValue();
			} else { // if there're no items, display the empty page
				this.orderItemsRoundRectList.containerNode.innerHTML = this.emptyOrderTemplate;
				this.fixScrollablePanelHeight();
			}
		},
		updateTotalOrderValue: function() {
			// calculate order values in order to have the total value
			Utilities.reCalculateOrderValue(); // this calculates the order value only
			// add the total order value list item
			var totalOrderValueListItem = new ListItem({}).placeAt(this.orderItemsRoundRectList, "last");
			totalOrderValueListItem.containerNode.innerHTML = this.substitute(this.totalOrderValueTemplate, {
				totalOrderValue: "$" + GlobalObjects.currentOrder.value // the order value
			});
			totalOrderValueListItem.onClick = lang.hitch(this, function() {
				if (GlobalObjects.currentUser != null) {
					// check if the user has payment methods and addresses
					if (GlobalObjects.currentUser.paymentMethods.length > 0 && GlobalObjects.currentUser.addresses.length > 0) { // if yes, then proceed to checkout
						var thisView = registry.byId("order");
						thisView.performTransition("#checkout", 1, "slide", null);
					} else if (GlobalObjects.currentUser.paymentMethods.length == 0) { // if no, then show him a dialog, and go to profile page
						// show the add payment view
						this.firstTimePaymentsView.show(lang.hitch(this, function() {
							var thisView = registry.byId("order");
							thisView.performTransition("#checkout", 1, "slide", null);
						}));
					} else if (GlobalObjects.currentUser.addresses.length == 0) { // if no, then show him a dialog, and go to profile page
						this.messageDialogView.show("Warning: You don't have any addresses saved to your profile. Please go to 'My Profile' page to save at least one.");
						
						// go to profiles view
						var thisView = registry.byId("order");
						thisView.performTransition("#profileTabContainer", 1, "slide", null);
						
						var myProfileTabBarBtn = registry.byId("myProfileTabBarBtn");
						myProfileTabBarBtn.set("selected", true);
					}
				} else { // anonymous user, need to register first
					this.doubleButtonDialog.show("Ready to place an order ?",
							"Registration is just 3 simple steps ...",
							"Sign Up & Place Order",
							"Sign In & Place Order",
							lang.hitch(this, function(){
							// sign up and place order
							this.doubleButtonDialog.hide();
							// open the onTheFlyRegistration
							this.onTheFlyRegistrationAccount.show(lang.hitch(this, function() {
								this.yesNoDialog.show("You're now registered with G2G. Do you want to remember your username & password ?", lang.hitch(this, function(){
									// yes, remember the password
									this.yesNoDialog.hide();
									this.storageManager.saveCredentials(GlobalObjects.onTheFlyUser.username, GlobalObjects.onTheFlyUser.password, function() {}, function() {});
									
									// go to checkout
									var thisView = registry.byId("order");
									thisView.performTransition("#checkout", 1, "slide", null);
									
								}), lang.hitch(this, function() {
									// no, don't remember password
									this.yesNoDialog.hide();
									
									// go to checkout
									var thisView = registry.byId("order");
									thisView.performTransition("#checkout", 1, "slide", null);
								}), "");
							}), "Sign Up & Checkout");
					}), lang.hitch(this, function() {
						// sign in and place order
						this.doubleButtonDialog.hide();
						this.onTheFlyLoginView.show(lang.hitch(this, function() {
							
							Utilities.showMyProfileButton();
							this.onTheFlyLoginView.hide();

							
							// go to checkout
							var thisView = registry.byId("order");
							thisView.performTransition("#checkout", 1, "slide", null);
						}));
					}));
				}
			});
			totalOrderValueListItem.set("moveTo","#");
		},
		// list item template
		orderItemTemplate:
			'<div class="orderItem">' +
				'<div class="orderItemContainer">' +
					'<div class="orderItemInCartQuantity">${orderItemQuantity}</div>' +
					'<div class="orderItemInCartXSymbol">X</div>' +
					'<div class="orderItemInCartName">${orderItemName}</div> <br/>' +
					'<div class="orderItemInCartSpecialInstructions">${orderItemSpecialInstructions}</div>' +
				'</div>' + 
				'<div class="orderItemPriceContainer">' +
					'<div class="orderItemInCartPrice">${orderItemPrice}</div>' +
				'</div>' +
			'</div>',
		// empty order template
		emptyOrderTemplate:
			'<div>' + 
				'<img class="emptyOrderItemImg" src="img/cart_big.png"/>' + 
				'<p class="emptyOrderItemParagrapgh">No items in your order</p>' +
			'</div>',
		totalOrderValueTemplate:
			'<div class="totalOrderContainer">' + 
				'<div class="totalOrderLabel">Total</div>' +
				'<div class="totalOrderPrice">${totalOrderValue}</div>' +
			'</div>' +
			'<div class="totalOrderCheckout">Proceed to checkout ...</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});