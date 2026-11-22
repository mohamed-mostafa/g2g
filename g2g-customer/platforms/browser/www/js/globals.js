var GlobalObjects = {
	// business objects
//	serverURL: "http://services.g2gapp.net", //  live
//	serverURL: "http://10.0.2.2:8080", // test on android emulator
	serverURL: "http://localhost:8080", // test on browser
	// serverURL: "#G2G_BACKEND_SERVER_URL#", // test on browser
	g2gVersion: 3.1,
	currentConfigurations: null,
	currentRestaurant: null,
	currentRestaurantMenuCategory: null,
	currentRestaurantCategoryItem: null,
	currentOrderItem: null,
	selectedAddress: null,
	selectedPaymentMethod: null,
	currentSideGroupIndex: 0,
	isG2GClosed: false, // flag that indicates if we're open or closed
	adShown: false, // a flag that is used to display the ads only once
	offlineMessage: "",
	logosMap: null, // caching for restaurant logos. a key/value pair ... ID of the restaurant/logo
	currentDriver: null,
	adsList: null, // caching for ads images
	clockedIn: false,
	overrideCustomerLocationToMyLocation: "DONTOVERRIDE",
	overrideRestaurantLocationToMyLocation: "DONTOVERRIDE",
	currentOrder: {
		status: 'DRAFT',
		placedAt: null,
		pickedUpAt: null,
		deliveredAt: null,
		value: 0.00,
		tax: 0.00,
		deliveryCharge: 0.00,
		discounts: 0.00,
		totalWithoutTips: 0.00,
		tipsPercent: 0,
		tipsAmount: 0.00,
		totalWithTips: 0.00,
		specialInstructions: "",
		deliveryStreetAddress1: "",
		deliveryStreetAddress2: "",
		deliveryState: "",
		deliveryCity: "",
		deliveryZipCode: "",
		deliveryAddressDetails: "",
		deliveryUserFullName :"",
		deliveryUserEmailAddress: "",
		deliveryUserPhone: "",
		paymentTokenId: "",
		paymentChargeId: "",
		eligibileForFreeDelivery: "",
		restaurant: {},
		orderItems:[],
		userId: 0
	},
	currentUser: {
		id: 0,
		firstName: "",
		lastName: "",
		username: "",
		password: "",
		plainPassword: "",
		emailAddress: "",
		phone: "",
		dateOfBirth: null,
		status: "",
		paymentMethods: [],
		addresses: []
	},
	onTheFlyUser: {
		id: 0,
		firstName: "",
		lastName: "",
		username: "",
		password: "",
		plainPassword: "",
		emailAddress: "",
		phone: "",
		dateOfBirth: null,
		status: "",
		paymentMethods: [],
		addresses: []
	},
	anonymousUserZipCode: null,
	testMode: false,
	registry: null,
	userChangedHisPassword: false, // a flag used when updating the profile. The profile account page sets it, the proflie payment page reads it then resets it
	currentPage: 'login' // initially, the login page
};

var LocationObject = {
	directionsService: null,
	
	codeAddress: function(address, onSuccess, onFailure) {
		try {
			var geocoder = new google.maps.Geocoder();
		    geocoder.geocode({'address': address}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
	    	    	onSuccess(results[0].geometry.location);
	    	    } else {
	    	    	onFailure(status);
	    	    }
		    });
		} catch (err) {
			console.log(err);
		}
	},
	isInRangeOfRestaurant: function(myLocation, restaurantLocation) {
		try {
			if (myLocation.equals(restaurantLocation))
				return true;
			
			var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(myLocation, restaurantLocation);
			if (distanceInMeters < 400)
				return true;
			else 
				return false;
		} catch (err) {
			console.log(err);
			return false;
		}
	},
	isInRangeOfCustomer: function(myLocation, customerLocation) {
		try {
			if (myLocation.equals(customerLocation))
				return true;
			
			var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(myLocation, customerLocation);
			if (distanceInMeters < 400)
				return true;
			else 
				return false;
		} catch (err) {
			console.log(err);
			return false;
		}
	},
	init: function() {
		LocationObject.directionsService = new google.maps.DirectionsService();
	},
};

var Utilities = {
	reportDriverLocation: function(lng, lat) {
		try {
			if (GlobalObjects != null && GlobalObjects.currentDriver != null) {
			require([
					"dojo/ready",
					"dijit/registry",
					"dojo/_base/lang",
					"dojo/request"
				], function(ready, registry, lang, request) {
					ready(function(){
						promise = request.post(GlobalObjects.serverURL + '/driver/location', {data: JSON.stringify({driverId: GlobalObjects.currentDriver.id, lat: lat, lng: lng}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
						promise.response.then(lang.hitch(this, function() {
							// location reported successfully
						}), lang.hitch(this, function(error) {
							// error reporting location, do nothing
						}));
					})
				});
			} else {
				console.log("Apparently, you're not a driver ?");
			}
		} catch (err) {
			console.log("Failed to reportDriverLocation");
			console.log(err);
		}
	},
	sendErrorReport: function(error, onSuccess, onFailure) {
		require([ "dojo/_base/window", "dojo/ready", "dijit/registry", "dojo/dom", "dojo/dom-class", "dojo/request", "dojo/_base/lang",], 
		function(win, ready, registry, dom, domClass, request, lang) {
			
			var url = GlobalObjects.serverURL + "/error/" + error;
			promise = request.get(url, {
				handleAs : 'json',
				headers : {
					"Content-Type" : "application/json",
					"g2g-version" : GlobalObjects.g2gVersion
				}
			});
			promise.response.then(lang.hitch(this, function() {
				// location reported successfully
				if (onSuccess) onSuccess();
			}), lang.hitch(this, function(error) {
				if (onFailure) onFailure();
			}));
		});
	}, 
	notificationOpenedCallback: function(jsonData) {
		if (jsonData != null && jsonData.message != null) {
			require([
			         "dijit/registry",
			         ], function(registry){
				if (registry != null) {
					registry.byId("messageDialog").show(jsonData.message);	
				}
			});
		}
	},
	reloadRestaurants: function() {
		require([
					"dijit/registry",
				], function(registry){
					registry.byId("home").loadRestaurants();				
				});
	},
	millisToString: function(t) {
		var cd = 24 * 60 * 60 * 1000,
		    ch = 60 * 60 * 1000,
		    d = Math.floor(t / cd),
		    h = Math.floor( (t - d * cd) / ch),
		    m = Math.round( (t - d * cd - h * ch) / 60000),
		    pad = function(n){ return n < 10 ? '0' + n : n; };
		  if( m === 60 ){
		    h++;
		    m = 0;
		  }
		  if( h === 24 ){
		    d++;
		    h = 0;
		  }
		  if (h > 0) {
			  if (h == 1) {
				  if (m == 0)
					  return h + " hour";
				  else if (m == 1)
					  return h + " hour, " + m + " minute";
				  else
					  return h + " hour, " + m + " minutes";
			  } else {
				  if (m == 0)
					  return h + " hours";
				  else if (m == 1)
					  return h + " hours, " + m + " minute";
				  else
					  return h + " hours, " + m + " minutes";
			  }
		  } else {
			  if (m == 1)
				  return m + " minute";
			  else
				  return m + " minutes";
		  }
//		  return [pad(h), pad(m)].join(':');
	},
	getAndCacheRestaurantsLogos: function() {
		require([
					"dojo/request",
					"dijit/registry",
				], function(request, registry){
					var url = GlobalObjects.serverURL + '/v2/restaurants/logos';
					promise = request.get(url, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
					promise.response.then(function(response) {
						GlobalObjects.logosMap = response.data;
					}, function(err) {
//						console.log(JSON.stringify(err));
						registry.byId("messageDialog").show("Something went wrong while communicating with G2G Servers. G2G app might need a restart.");
					});
				});
	},
	getAndCacheAds: function() {
		require([
					"dojo/request",
					"dijit/registry",
				], function(request, registry){
					var url = GlobalObjects.serverURL + '/ads';
					promise = request.get(url, {handleAs:'json', headers: {"g2g-version": GlobalObjects.g2gVersion}});
					promise.response.then(function(response) {
						GlobalObjects.adsList = response.data;
						registry.byId("adsDialog").init();
					}, function(err) {
						console.log(err);
						// no problem, ads won't work, and that's it
					});
				});
	},	
	addBackgroundToBody: function() {
			require([
				"dojo/_base/window",
				"dojo/ready",
				"dijit/registry",
				"dojo/dom",
				"dojo/dom-class"
			], function(win, ready, registry, dom, domClass){
				domClass.add(win.body(), "g2gBody");				
			});
	},
	removeBackgroundFromBody: function() {
		require([
			"dojo/_base/window",
			"dojo/ready",
			"dijit/registry",
			"dojo/dom",
			"dojo/dom-class"
		], function(win, ready, registry, dom, domClass){
			domClass.remove(win.body(), "g2gBody");
		});
},
	updateMyOrderButtonName: function() {
		require([
			"dojo/_base/window",
			"dojo/ready",
			"dijit/registry",
			"dojox/mobile/Badge",
			"dojox/mobile",
			"dojox/mobile/parser"
		], function(win, ready, registry, Badge){
			var numberOfItemsInOrder = GlobalObjects.currentOrder.orderItems.length;	
			var orderTabBarBtn = registry.byId("orderTabBarBtn");
			orderTabBarBtn.set("badge", numberOfItemsInOrder);
		});
	},
	updateProfileMainHeader: function() {
		require([
					"dojo/_base/window",
					"dojo/ready",
					"dijit/registry",
					"dojox/mobile/ToolBarButton",
					"dojo/_base/lang",
					"dojox/mobile",
					"dojox/mobile/parser",
				], function(win, ready, registry, ToolBarButton, lang){
					ready(function(){
						
						var tabContainerHeader = registry.byId("tabContainerHeader"); 
						tabContainerHeader.destroyDescendants();
						
						var heading = new dojox.mobile.Heading ({label:"Profile", fixed:"top"});
					    var tb = new dojox.mobile.ToolBarButton({icon:"img/email-icon.png", class:"contactUsToolBarButton"});
					    var tb2 = new dojox.mobile.ToolBarButton({icon:"img/sign-out.png", class:"signoutToolBarButton"});
					    heading.addChild(tb);
					    heading.addChild(tb2);
					    tabContainerHeader.addChild(heading);
					    tb.on("click", function() {
					    	registry.byId("contactUs").openDialog();
					    });
					    tb2.on("click", function() {
					    	registry.byId("yesNoDialog").show("Are you sure you want to sign out?", lang.hitch(this, function() {
								// yes
					    		registry.byId("yesNoDialog").hide();
					    		// clear the username/password fields. when the user opens the login screen again, they might appear again if he has choosen to remember them
					    		registry.byId("username").set("value", "");
								registry.byId("password").set("value", "");
								GlobalObjects.currentDriver = null;
								GlobalObjects.currentUser = {
							    		id: 0,
							    		firstName: "",
							    		lastName: "",
							    		username: "",
							    		password: "",
							    		plainPassword: "",
							    		emailAddress: "",
							    		phone: "",
							    		dateOfBirth: null,
							    		status: "",
							    		paymentMethods: [],
							    		addresses: []
							    	};
								GlobalObjects.onTheFlyUser= {
									id: 0,
									firstName: "",
									lastName: "",
									username: "",
									password: "",
									plainPassword: "",
									emailAddress: "",
									phone: "",
									dateOfBirth: null,
									status: "",
									paymentMethods: [],
									addresses: []
								};
								GlobalObjects.currentOrder = {
										status: 'DRAFT',
										placedAt: null,
										pickedUpAt: null,
										deliveredAt: null,
										value: 0.00,
										tax: 0.00,
										deliveryCharge: 0.00,
										discounts: 0.00,
										totalWithoutTips: 0.00,
										tipsPercent: 0,
										tipsAmount: 0.00,
										totalWithTips: 0.00,
										specialInstructions: "",
										deliveryStreetAddress1: "",
										deliveryStreetAddress2: "",
										deliveryState: "",
										deliveryCity: "",
										deliveryZipCode: "",
										deliveryAddressDetails: "",
										deliveryUserFullName :"",
										deliveryUserEmailAddress: "",
										deliveryUserPhone: "",
										paymentTokenId: "",
										paymentChargeId: "",
										restaurant: {},
										orderItems:[],
										userId: GlobalObjects.currentUser.id
									};
								Utilities.addBackgroundToBody();
								Utilities.updateMyOrderButtonName();
							    registry.byId("tabContainer").performTransition('splash');
							}),
							lang.hitch(this, function() {
								// no
								registry.byId("yesNoDialog").hide();
							}), "");
					    	
					    });
					});
				});
			},
	updateMainHeader: function(name, backTarget) {
		require([
			"dojo/_base/window",
			"dojo/ready",
			"dijit/registry",
			"dojox/mobile/ToolBarButton",
			"dojox/mobile",
			"dojox/mobile/parser",
		], function(win, ready, registry, ToolBarButton){
			ready(function(){
				
				var tabContainerHeader = registry.byId("tabContainerHeader"); 
				tabContainerHeader.destroyDescendants();
				if (backTarget) {
					var heading = new dojox.mobile.Heading ({label:name, fixed:"top", back:"", moveTo:"#" + backTarget});
					heading.set("class", "backBtnImg");
				    var tb = new dojox.mobile.ToolBarButton({icon:"img/email-icon.png", class:"contactUsToolBarButton"});
				    heading.addChild(tb);
				    tabContainerHeader.addChild(heading);
				    tb.on("click", function() {
			    	registry.byId("contactUs").openDialog();
			    });
				} else {
					var heading = new dojox.mobile.Heading ({label:name, fixed:"top"});
				    var tb = new dojox.mobile.ToolBarButton({icon:"img/email-icon.png", class:"contactUsToolBarButton"});
				    heading.addChild(tb);
				    tabContainerHeader.addChild(heading);
				    tb.on("click", function() {
				    	registry.byId("contactUs").openDialog();
				    });
				}
			});
		});
	},
	updateRestaurantTitleLink: function(callback) {
		require([
			"dojo/_base/window",
			"dojo/ready",
			"dijit/registry",
			"dojox/mobile/ToolBarButton",
			"dojo/_base/lang",
			"dojox/mobile/parser",
		], function(win, ready, registry, ToolBarButton, lang){
			ready(function(){
				var homeTabHeader = registry.byId("homeTabHeader"); 
				homeTabHeader.destroyDescendants();
				// if not anonymous mode
				if (GlobalObjects.currentUser != null) {
					var heading = new dojox.mobile.Heading ({label:"Currently at " + GlobalObjects.selectedAddress.nickname + " - Switch Location", fixed:"top"});
					heading.set("class", "homeTabContainer");
					homeTabHeader.addChild(heading);
					heading.on("click", function() {
						callback();
					});
				} else { // anonymous mode
					var heading = new dojox.mobile.Heading ({label:"Currently at " + GlobalObjects.anonymousUserZipCode + " - Register", fixed:"top"});
					heading.set("class", "homeTabContainer");
					homeTabHeader.addChild(heading);
					heading.on("click", function() { // on click, register
						registry.byId("onTheFlyRegistrationAccount").show(lang.hitch(this, function() {
							Utilities.updateRestaurantTitleLink(callback);
							
							registry.byId("yesNoDialog").show("You're now registered with G2G. Do you want to remember your username & password ?", lang.hitch(this, function(){
								// yes, remember the password
								registry.byId("yesNoDialog").hide();
								registry.byId("storageManager").saveCredentials(GlobalObjects.onTheFlyUser.username, GlobalObjects.onTheFlyUser.password, function() {}, function() {});
								
							}), lang.hitch(this, function() {
								// no, don't remember password
								registry.byId("yesNoDialog").hide();
							}), "");
						}), "Sign Up");
					});
					// don't call the callback, it is now attached to the new link
				}
			});
		});
	},
	reCalculateOrderValue: function() {
		require([
		     	"dojo/currency",
		    	"dojo/_base/array"
		], function(currency, array){
			GlobalObjects.currentOrder.value = 0.00;
			for (var i = 0; i < GlobalObjects.currentOrder.orderItems.length; i++) {
				// first, set the price of the order item (quantity * menu item price)
				GlobalObjects.currentOrder.orderItems[i].price = GlobalObjects.currentOrder.orderItems[i].restaurantMenuCategoryItem.price;
				
				// then, update this price to include sides
				for (var j = 0; j < GlobalObjects.currentOrder.orderItems[i].sides.length; j++) {
					GlobalObjects.currentOrder.orderItems[i].price += GlobalObjects.currentOrder.orderItems[i].sides[j].price;
				}
				// then, multiply by quantity
				GlobalObjects.currentOrder.orderItems[i].price *= GlobalObjects.currentOrder.orderItems[i].quantity; 
				// then, update the total order value
				GlobalObjects.currentOrder.value += GlobalObjects.currentOrder.orderItems[i].price;
			}
			
			GlobalObjects.currentOrder.value = currency.format(GlobalObjects.currentOrder.value, 'd.dd');
		});
	},
	refreshCurrentOrder: function() {
		require([
				"dijit/registry",
				], function(registry){
			registry.byId('orderView').refreshOrder();
		});
	},
	refreshActiveOrders: function() {
		require([
				"dijit/registry",
				], function(registry){
			registry.byId('driverActiveOrders').refreshActiveOrders();
		});
	},
	refreshDriverHome: function() {
		require([
				"dijit/registry",
				], function(registry){
			registry.byId('driverHome').refreshSession();
		});
	},
	returnToSplashFromDriverSplash: function() {
		require(["dijit/registry",
			],
			function(registry) {
					registry.byId("driverSplash").performTransition('splash', -1, 'slide');
			});
	},
	returnToSplashFromCustomerSplash: function() {
		require(["dijit/registry",
			],
			function(registry) {
					registry.byId("customerSplash").performTransition('splash', -1, 'slide');
			});
	},
	reCalculateOrderTips: function() {
		require([
		     	"dojo/currency",
		    	"dojo/_base/array"
		], function(currency, array) {
			
			if (GlobalObjects.currentOrder.tipsPercent == -1) {
				// GlobalObjects.currentOrder.tipsAmount should stay the same, it is not calculated
			} else {
				// GlobalObjects.currentOrder.tipsAmount should be calculated using tipsPercent
				GlobalObjects.currentOrder.tipsAmount = GlobalObjects.currentOrder.value * (GlobalObjects.currentOrder.tipsPercent / 100);
			}
			// parse the totalWithoutTips, because it is coming from the backend as string
			GlobalObjects.currentOrder.totalWithTips = parseFloat(GlobalObjects.currentOrder.totalWithoutTips) + GlobalObjects.currentOrder.tipsAmount;
			
			GlobalObjects.currentOrder.tipsAmount = currency.format(GlobalObjects.currentOrder.tipsAmount, 'd.dd');
			GlobalObjects.currentOrder.totalWithTips = currency.format(GlobalObjects.currentOrder.totalWithTips, 'd.dd');
		});
	},
	requestDelivery: function() {
		require([
			     "dijit/registry"
			], function(registry){
				var message = "Please consider my area";
				if (GlobalObjects.selectedAddress && GlobalObjects.selectedAddress.city && GlobalObjects.selectedAddress.zipCode) {
					message += ", " + GlobalObjects.selectedAddress.city + " - " + GlobalObjects.selectedAddress.zipCode;
				} else if (GlobalObjects.anonymousUserZipCode) {
					message += ", " + GlobalObjects.anonymousUserZipCode;
				}
				registry.byId("contactUs").openDialog("Hello, G2G!", message);
		});
	},
	hideKeyboard: function() {
		try {
			if (document.activeElement)
				document.activeElement.blur();
			if (cordova != null && cordova.plugins != null && cordova.plugins.Keyboard != null) {
				cordova.plugins.Keyboard.close();
			}
		} catch (err) {
			console.log(err);
			console.log("Apparently in development mode ?");
		}
	},
	hideMyProfileButton: function() {
		require([
			     	"dijit/registry",
			    	"dojo/dom-style"
			], function(registry, domStyle){
			// hide the 'my profile' button
			var myProfileTabBarBtn = registry.byId("myProfileTabBarBtn");
			var restaurantsTabBarBtn = registry.byId("restaurantsTabBarBtn");
			var orderTabBarBtn = registry.byId("orderTabBarBtn");
			domStyle.set(myProfileTabBarBtn.domNode, "display", "none");
			domStyle.set(restaurantsTabBarBtn.domNode, "width", "50%");
			domStyle.set(orderTabBarBtn.domNode, "width", "50%");
		});
	},
	showMyProfileButton: function() {
		require([
			     	"dijit/registry",
			    	"dojo/dom-style"
			], function(registry, domStyle){
			// hide the 'my profile' button
			var myProfileTabBarBtn = registry.byId("myProfileTabBarBtn");
			var restaurantsTabBarBtn = registry.byId("restaurantsTabBarBtn");
			var orderTabBarBtn = registry.byId("orderTabBarBtn");
			domStyle.set(myProfileTabBarBtn.domNode, "display", "block");
			domStyle.set(myProfileTabBarBtn.domNode, "width", "33.333%");
			domStyle.set(restaurantsTabBarBtn.domNode, "width", "33.333%");
			domStyle.set(orderTabBarBtn.domNode, "width", "33.333%");
		});
	},
	clearOrder: function () {
		GlobalObjects.currentOrder = {
				status: 'DRAFT',
				placedAt: null,
				pickedUpAt: null,
				deliveredAt: null,
				value: 0.00,
				tax: 0.00,
				deliveryCharge: 0.00,
				discounts: 0.00,
				totalWithoutTips: 0.00,
				tipsPercent: 0,
				tipsAmount: 0.00,
				totalWithTips: 0.00,
				specialInstructions: "",
				deliveryStreetAddress1: "",
				deliveryStreetAddress2: "",
				deliveryState: "",
				deliveryCity: "",
				deliveryZipCode: "",
				deliveryAddressDetails: "",
				deliveryUserFullName :"",
				deliveryUserEmailAddress: "",
				deliveryUserPhone: "",
				paymentTokenId: "",
				paymentChargeId: "",
				restaurant: {},
				orderItems:[],
				userId: GlobalObjects.currentUser.id
		};
	},
	signoutDriver : function() {
		require([ "dojo/_base/window", "dojo/ready", "dijit/registry",
				"dojox/mobile/Badge", "dojo/_base/lang", "dojox/mobile", "dojox/mobile/parser" ],
				function(win, ready, registry, Badge, lang) {
					registry.byId("yesNoDialog").show(
							"Are you sure you want to sign out?",
							lang.hitch(this, function() {
								// yes
								registry.byId("yesNoDialog").hide();
								GlobalObjects.currentDriver = null;
								registry.byId("driverHome").performTransition(
										'driverSplash');
							}), lang.hitch(this, function() {
								// no
								registry.byId("yesNoDialog").hide();
							}), "");
				});
	} 
};

// stripe publishable key
//Stripe.setPublishableKey('pk_live_z6C4fIsyAPSI4nvqxCiDGbkh'); // live
Stripe.setPublishableKey('pk_test_gHi6j3i7NuZfyydNVrmgfTtE'); // test
// Stripe.setPublishableKey('#STRIPE_PUBLISHABLE_KEY#'); // test