var GlobalObjects = {
	// business objects
//	serverURL: "http://services.g2gapp.net", //  live
	serverURL: "http://10.0.2.2:8080", // test on android emulator
//	serverURL: "http://localhost:8080", // test on browser
//	serverURL: "#G2G_BACKEND_SERVER_URL#", // test on browser
	g2gVersion: 2.5,
	isG2GClosed: false, // flag that indicates if we're open or closed
	offlineMessage: "",
	logosMap: null, // caching for restaurant logos. a key/value pair ... ID of the restaurant/logo
	currentDriver: null,
	registry: null,
};

var Utilities = {
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
				  if (m == 1)
					  return h + " hour, " + m + " minute";
				  else
					  return h + " hour, " + m + " minutes";
			  } else {
				  if (m == 1)
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
//						alert(JSON.stringify(err));
						registry.byId("messageDialog").show("Something went wrong while communicating with G2G Servers. G2G app might need a restart.");
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
								Utilities.addBackgroundToBody();
								Utilities.updateMyOrderButtonName();
							    registry.byId("driverTabContainer").performTransition('splash');
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
	hideKeyboard: function() {
//		cordova.plugins.Keyboard.close();
		document.activeElement.blur();
	},
};

