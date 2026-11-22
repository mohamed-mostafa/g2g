define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
	"dojo/dom",
	"dojo/request",
	"dojo/on",
	"dojo/_base/window",
	"dojo/dom-style",
	"dojo/dom"
    ], function(declare, View, registry, lang,ProgressIndicator,dom, request ,on, win, domStyle, dom) {
        return declare([View], {

		checkoutBtn: null,
		tenPercentTipButton: null,
		fifteenPercentTipButton: null,
		twentyPercentTipButton: null,
		tenPercentTipButtonSelected: null,
		fifteenPercentTipButtonSelected: null,
		twentyPercentTipButtonSelected: null,
		totalOrderValueField: null,
		taxField: null,
		deliveryChargeField: null,
		discountsField: null,
		totalWithoutTipsField: null,
		tipsPercentTextBox: null,
		tipAmountField: null,
		totalWithTipsField: null,
		specialInstructionsTextBox: null,
		messageDialogView: null,
		chooseAddressView: null,
		choosePaymentMethodView: null,
		selectAddressBtn: null,
		selectPaymentMethodBtn: null,
		selectAddressBigBtn: null,
		selectPaymentMethodBigBtn: null,
		loadingDialog: null,
		yesNoDialog: null,
		offlineDialog: null,
		doubleButtonDialog: null,
		discountsFieldContainer: null,
		tipsPercentTextBoxChangedHandler: null, // used to put/remove the change event on the tips amount textobx
		singleButtonDialog: null,

		startup: function () {
			this.inherited(arguments);
			
			// retrieve the controls on the screen
			this.singleButtonDialog = registry.byId("singleButtonDialog");
			this.checkoutBtn = registry.byId("checkoutBtn");
			this.tenPercentTipButton = registry.byId("tenPercentTipButton");
			this.fifteenPercentTipButton = registry.byId("fifteenPercentTipButton");
			this.twentyPercentTipButton = registry.byId("twentyPercentTipButton");
			this.tenPercentTipButtonSelected = registry.byId("tenPercentTipButtonSelected");
			this.fifteenPercentTipButtonSelected = registry.byId("fifteenPercentTipButtonSelected");
			this.twentyPercentTipButtonSelected = registry.byId("twentyPercentTipButtonSelected");
			
			this.discountsFieldContainer = dom.byId("discountsFieldContainer");
			
			this.yesNoDialog = registry.byId("yesNoDialog");
			this.totalOrderValueField = dom.byId("initialOrderValueField");
			this.taxField = dom.byId("taxField");
			this.deliveryChargeField = dom.byId("deliveryChargeField");
			this.offlineDialog = registry.byId("offlineDialog");
			this.doubleButtonDialog = registry.byId("doubleButtonDialog");
			this.discountsField = dom.byId("discountsField");
			this.totalWithoutTipsField = dom.byId("totalWithoutTipsField");
			this.tipsPercentTextBox = registry.byId("tipsPercentTextBox");
			this.tipAmountField = dom.byId("tipsAmountField");
			this.totalWithTipsField = dom.byId("totalWithTipsField");
			this.specialInstructionsTextBox = registry.byId("specialInstructionsField");
			this.messageDialogView = registry.byId("messageDialog");
			this.chooseAddressView = registry.byId("chooseAddressView");
			this.choosePaymentMethodView = registry.byId("choosePaymentMethodView");
			this.selectAddressBtn = dom.byId("selectAddressBtn");
			this.selectPaymentMethodBtn = dom.byId("selectPaymentMethodBtn");
			this.selectAddressBigBtn = dom.byId("selectAddressBigBtn");
			this.selectPaymentMethodBigBtn = dom.byId("selectPaymentMethodBigBtn");
			this.loadingDialog = registry.byId("loadingDialog");
			// register events on the buttons
			this.checkoutBtn.on("click", lang.hitch(this, this.checkoutButtonClicked));
			this.tenPercentTipButton.on("click", lang.hitch(this, this.tenPercentTipButtonClicked));
			this.fifteenPercentTipButton.on("click", lang.hitch(this, this.fifteenPercentTipButtonClicked));
			this.twentyPercentTipButton.on("click", lang.hitch(this, this.twentyPercentTipButtonClicked));
			on(this.selectAddressBigBtn, "click", lang.hitch(this, this.onChooseAddress));
			on(this.selectPaymentMethodBigBtn, "click", lang.hitch(this, this.onChoosePaymentMethod));
			
			// register events on the tips textbox
			this.tipsPercentTextBoxChangedHandler = this.tipsPercentTextBox.on("change", lang.hitch(this, this.tipsPercentTextBoxChanged));
		},
		// when the 'in' transition finishes
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			// update header name
			Utilities.updateMainHeader("Check out", "order");
			// calculate order values and display them
			// reload the user, to get its profile and its plan
			this.loadingDialog.show("Calculating cost ...");
			
			// apply the price plan
			GlobalObjects.currentOrder.username = GlobalObjects.currentUser.username;
			var promise = request.post(GlobalObjects.serverURL + '/order/valuate', {data: JSON.stringify({order: GlobalObjects.currentOrder}), handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response) {
				// since payment methods are saved on the device, keep them in a temp variable, reset the user, then return them to the user again
				var tempPaymentMethods = GlobalObjects.currentUser.paymentMethods;
				GlobalObjects.currentUser = response.data.user;
				GlobalObjects.currentUser.paymentMethods = tempPaymentMethods;
				
				GlobalObjects.currentOrder = response.data.valuatedOrder;
				Utilities.reCalculateOrderTips();
				
				// reflect order's values on the screen
				this.updateOrderFields();
				this.reflectSelectedAddress();
				this.reflectSelectedPaymentMethod();
				this.loadingDialog.hide();
				
				if (response.data.valuationMessage) {
					this.messageDialogView.show(response.data.valuationMessage);
				}
				
			}), lang.hitch(this, function(err) {
				this.loadingDialog.hide();
				// go to order view
				var thisView = registry.byId("checkout");
				thisView.performTransition("#order", 1, "slide", null);
				// display error message
				if (err.response.status == 0) {
					this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
				} else if (err.response.status == 404) {
					this.messageDialogView.show("G2G servers are unable to process your request at this time");
				} else {
					this.messageDialogView.show("Failed to get your price plan. Please contact G2G support for help. Error: " + err.response.text);
				}
			}));
			// end apply the price plan
			
		},
		onAfterTransitionIn: function() {
			this.fixScrollablePanelHeight();
		},
		fixScrollablePanelHeight: function() {
			var checkoutViewScrollablePane = dom.byId("checkoutViewScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 48 + 5); // the bottom tab bar and the upper header and the upper tab bar and a margin
			domStyle.set(checkoutViewScrollablePane, "height", height);
		},
		reflectSelectedAddress: function() {
			// seleted address is set at the login screen, and can be changed in the checkout screen
			this.selectAddressBtn.innerHTML = "Deliver to: " + GlobalObjects.selectedAddress.nickname;
		},
		reflectSelectedPaymentMethod: function() {
			// selected payment method is set at the login screen, and can be changed in the checkout screen
			this.selectPaymentMethodBtn.innerHTML = "Use card: " + GlobalObjects.selectedPaymentMethod.cardNickname;// ending " + GlobalObjects.selectedPaymentMethod.cardNumber.substr(GlobalObjects.selectedPaymentMethod.cardNumber.length - 4);
		},		
		onChooseAddress: function() {
			this.chooseAddressView.show("Which address should G2G use ?", lang.hitch(this, function(address) {
				// check if the restaurant can deliver to the new address new address
				this.loadingDialog.show("Checking if " + GlobalObjects.currentOrder.restaurant.name + " can deliver to this address ...");
				var promise = request.get(GlobalObjects.serverURL + '/restaurants/' + GlobalObjects.currentOrder.restaurant.id + '/verfiyZipCodeAvailability/' + address.zipCode, {handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.loadingDialog.hide();
					if (response.data.availability == true) {
						GlobalObjects.selectedAddress = address;
						this.reflectSelectedAddress();
					} else {
						// show a dialog box saying that you can't choose this address
						this.messageDialogView.show("Your " + GlobalObjects.currentOrder.restaurant.name + " order can't be delivered to this address");
					}
				})),lang.hitch(this, function(err) {
					// when we can't retrieve the availability, stop
					this.loadingDialog.hide();
					// display error message
					if (err.response.status == 0) {
						this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
					} else if (err.response.status == 404) {
						this.messageDialogView.show("G2G servers are unable to process your request at this time");
					} else {
						this.messageDialogView.show(err.response.text);
					}
				});
			}));
		},
		onChoosePaymentMethod: function() {
			this.choosePaymentMethodView.show("Which payment method should G2G use ?", lang.hitch(this, function(paymentMethod) {
				GlobalObjects.selectedPaymentMethod = paymentMethod;
				this.reflectSelectedPaymentMethod();
			}));
		},
		checkoutButtonClicked: function () {
			this.loadingDialog.show("Placing Your Order ...");
			// check if both the restaurant of the order, and G2G itself are open at this time ...
			checkPromise = request.get(GlobalObjects.serverURL + '/restaurants/restaurant/' + GlobalObjects.currentOrder.restaurant.id + '/availability', {handleAs: "json", headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			checkPromise.then(lang.hitch(this, function(response) {
				if (response.g2gIsOpen && response.restaurantIsOpen) { // successfully retrieved availablilty of g2g and restaurant
					this.loadingDialog.show("Making the payment ...");
					this.moveFieldsToOrder();
					// GENERATE STRIPE PAYMENT TOKEN HERE
					Stripe.card.createToken({
						number: GlobalObjects.selectedPaymentMethod.cardNumber,
						cvc: GlobalObjects.selectedPaymentMethod.cardCCV,
						exp_month: GlobalObjects.selectedPaymentMethod.cardExpirationMonth,
						exp_year: GlobalObjects.selectedPaymentMethod.cardExpirationYear
					}, lang.hitch(this, function(status, response) {
						console.log("Stripe.card.createToken status: " + JSON.stringify(status));
						// place the ordre
						if (response.error) {
							// an error at stripe
							this.loadingDialog.hide();
							this.messageDialogView.show(response.error.message);
						} else {
							this.loadingDialog.hide();
							this.loadingDialog.show("Placing Your Order ...");
							GlobalObjects.currentOrder.paymentTokenId = response.id; // stripe token
							promise = request.post(GlobalObjects.serverURL + '/v2/order/place', {data: JSON.stringify({order: GlobalObjects.currentOrder}), handleAs: "json", headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
							promise.then(lang.hitch(this, this.placeOrderSuccessCallback), lang.hitch(this, this.placeOrderFailureCallback));
						}
					}));
				} else if (!response.g2gIsOpen) {
					// g2g is closed
					this.offlineDialog.show(response.offlineMessage);
					this.loadingDialog.hide();
				} else if (!response.restaurantIsOpen) {
					// restaurant is closed
					this.doubleButtonDialog.show(GlobalObjects.currentOrder.restaurant.name + " has closed!",
							"Unfortunately, while you were preparing your order, " + GlobalObjects.currentOrder.restaurant.name + " has closed. You can still browse the other restaurants on our list and prepare another order.",
							"Clear Order",
							"Dismiss", lang.hitch(this, function() {
								// clear the order
								this.clearOrder();
								this.doubleButtonDialog.hide();
								
								// return to orders view
								var thisView = registry.byId("checkout");
								thisView.performTransition("#order", 1, null, null);
								var currentOrderTabBarBtn = registry.byId("currentOrderTabBarBtn");
								currentOrderTabBarBtn.set("selected", true);
								
							}), lang.hitch(this, function() {
								// dismiss
								this.doubleButtonDialog.hide();
							}));
					this.loadingDialog.hide();
				}
			}), lang.hitch(this, function(err) { // error of checking if G2G and restaurant are open or not
				this.loadingDialog.hide();
				if (err.response.status == 0) {
					this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
				} else if (err.response.status == 500) {
					this.messageDialogView.show(err.response.text);
				} else {
					this.messageDialogView.show("Something went wrong. G2G servers are unable to process your request at this time.");
				}
			}));
		},	
		moveFieldsToOrder: function() {
			// copy the address and user info to the order
			GlobalObjects.currentOrder.deliveryStreetAddress1 = GlobalObjects.selectedAddress.streetAddress1;
			GlobalObjects.currentOrder.deliveryStreetAddress2 = GlobalObjects.selectedAddress.streetAddress2;
			GlobalObjects.currentOrder.deliveryCity = GlobalObjects.selectedAddress.city;
			GlobalObjects.currentOrder.deliveryState = GlobalObjects.selectedAddress.state;
			GlobalObjects.currentOrder.deliveryZipCode = GlobalObjects.selectedAddress.zipCode;
			GlobalObjects.currentOrder.deliveryAddressDetails = GlobalObjects.selectedAddress.addressDetails;
			GlobalObjects.currentOrder.deliveryUserFullName = GlobalObjects.currentUser.firstName + " " + GlobalObjects.currentUser.lastName;
			GlobalObjects.currentOrder.deliveryUserPhone = GlobalObjects.currentUser.phone;
			GlobalObjects.currentOrder.deliveryUserEmailAddress = GlobalObjects.currentUser.emailAddress;
			GlobalObjects.currentOrder.paymentToken = "";
			// copy the special instructions
			GlobalObjects.currentOrder.specialInstructions = this.specialInstructionsTextBox.get("value");
			// the user id
			GlobalObjects.currentOrder.userId = GlobalObjects.currentUser.id;
		},
		unselectAllTipsButtons: function() {
			// reset buttons
			domStyle.set(this.tenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.tenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.fifteenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.fifteenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.twentyPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.twentyPercentTipButtonSelected.domNode, "display", "none");
		},
		placeOrderSuccessCallback: function(response) {
			this.loadingDialog.hide();

			this.clearOrder();
			// user is not eligible anymore for free delivery
			GlobalObjects.currentUser.eligibleForFreeDelivery = false;
			
			// immediately check for active orders for the user
			registry.byId("notificationDialog").resetDismissedUntilRestart() // if it was dismissed before, override that
			registry.byId("notificationDialog").monitorUserOrders();
			
			// return to pending orders view
			var thisView = registry.byId("checkout");
			thisView.performTransition("#pendingOrders", 1, null, null);
			var pendingOrdersTabBarBtn = registry.byId("pendingOrdersTabBarBtn");
			pendingOrdersTabBarBtn.set("selected", true);
		},
		clearOrder: function() {
			this.unselectAllTipsButtons();
			
			// clear the current order
			Utilities.clearOrder();
			
			// update the badge on the order button
			Utilities.updateMyOrderButtonName();
			
			// clear fields entered by user
			this.specialInstructionsTextBox.set("value", "");
			this.tipsPercentTextBox.set("value", "");
		},
		placeOrderFailureCallback: function(err) {
			this.loadingDialog.hide();
			// when placeOrder responds with an error, handle the error
			if (err.response.status == 0) {
				this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
			} else if (err.response.status == 420) { // failed card
				this.yesNoDialog.show("Your card was rejected! Would you like to take a look at your payment methods ?", lang.hitch(this, function(){
					// yes
					this.goToPaymentMethodsView();
					this.yesNoDialog.hide();
				}), lang.hitch(this, function() {
					// no
					this.yesNoDialog.hide();
				}), "Reason: " + err.response.text);
			} else if (err.response.status == 404) {
				this.messageDialogView.show("G2G servers are unable to process your request at this time");
			} else {
				this.messageDialogView.show(err.response.text);
			}
		},
		goToPaymentMethodsView: function() {
//			// go to profiles view
			
			var profileTabContainer = registry.byId("profileTabContainer");
			profileTabContainer.initialView = "profilePaymentsView";
			profileTabContainer.initialTab = "profilePaymentsTabBarButton";
			
			var thisView = registry.byId("orderTabContainer");
			thisView.performTransition("#profileTabContainer", 1, "slide", null);
			
			var myProfileTabBarBtn = registry.byId("myProfileTabBarBtn");
			myProfileTabBarBtn.set("selected", true);
			
		},
		clearTipsPercentTextboxValue: function() {
			this.tipsPercentTextBoxChangedHandler.remove();
			this.tipsPercentTextBox.set("value", "");
			this.tipsPercentTextBoxChangedHandler = this.tipsPercentTextBox.on("change", lang.hitch(this, this.tipsPercentTextBoxChanged));
		},
		tenPercentTipButtonClicked: function () {
			this.clearTipsPercentTextboxValue();
			GlobalObjects.currentOrder.tipsPercent = 10;
			// calculate order values and display them
			Utilities.reCalculateOrderTips();
			this.updateOrderFields();
			domStyle.set(this.tenPercentTipButton.domNode, "display", "none");
			domStyle.set(this.tenPercentTipButtonSelected.domNode, "display", "inline");
			
			domStyle.set(this.fifteenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.fifteenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.twentyPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.twentyPercentTipButtonSelected.domNode, "display", "none");
		},		
		fifteenPercentTipButtonClicked: function () {
			this.clearTipsPercentTextboxValue();
			GlobalObjects.currentOrder.tipsPercent = 15;
			// calculate order values and display them
			Utilities.reCalculateOrderTips();
			this.updateOrderFields();
			
			domStyle.set(this.tenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.tenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.fifteenPercentTipButton.domNode, "display", "none");
			domStyle.set(this.fifteenPercentTipButtonSelected.domNode, "display", "inline");
			
			domStyle.set(this.twentyPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.twentyPercentTipButtonSelected.domNode, "display", "none");
		},		
		twentyPercentTipButtonClicked: function () {
			this.clearTipsPercentTextboxValue();
			GlobalObjects.currentOrder.tipsPercent = 20;
			// calculate order values and display them
			Utilities.reCalculateOrderTips();
			this.updateOrderFields();
			
			domStyle.set(this.tenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.tenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.fifteenPercentTipButton.domNode, "display", "inline");
			domStyle.set(this.fifteenPercentTipButtonSelected.domNode, "display", "none");
			
			domStyle.set(this.twentyPercentTipButton.domNode, "display", "none");
			domStyle.set(this.twentyPercentTipButtonSelected.domNode, "display", "inline");
		},
		// when the textbox value changes
		tipsPercentTextBoxChanged: function() {
			var newTextBoxValue = this.tipsPercentTextBox.get("value");
			if (newTextBoxValue) {
				newTextBoxValue = newTextBoxValue.replace(/\D/g,'');
				this.tipsPercentTextBox.set("value", newTextBoxValue);
				GlobalObjects.currentOrder.tipsAmount = parseInt(newTextBoxValue);
			} else {
				GlobalObjects.currentOrder.tipsAmount = 0;
			}
			// all ways, tips percent is -1 here
			GlobalObjects.currentOrder.tipsPercent = -1;
			
			// unselect all tips buttons
			this.unselectAllTipsButtons();
			
			// calculate order values and display them
			Utilities.reCalculateOrderTips();
			this.updateOrderFields();
		},
		updateOrderFields: function() {
			// update the fields
			this.totalOrderValueField.innerHTML = "$" + GlobalObjects.currentOrder.value;
			this.taxField.innerHTML = "$" + GlobalObjects.currentOrder.tax;
			if (GlobalObjects.currentUser.eligibleForFreeDelivery || GlobalObjects.currentOrder.deliveryCharge == 0) {
				this.deliveryChargeField.innerHTML = "FREE";
			} else {
				this.deliveryChargeField.innerHTML = "$" + GlobalObjects.currentOrder.deliveryCharge;
			}
			this.discountsField.innerHTML = "$" + GlobalObjects.currentOrder.discounts;
			this.totalWithoutTipsField.innerHTML = "$" + GlobalObjects.currentOrder.totalWithoutTips;
			this.tipAmountField.innerHTML = "$" + GlobalObjects.currentOrder.tipsAmount;
			this.totalWithTipsField.innerHTML = "$" + GlobalObjects.currentOrder.totalWithTips;
			
			if (GlobalObjects.currentOrder.discounts != 0) {
				domStyle.set(this.discountsFieldContainer, "display", "inline");
			} else {
				domStyle.set(this.discountsFieldContainer, "display", "none");
			}
		}
    });
});

