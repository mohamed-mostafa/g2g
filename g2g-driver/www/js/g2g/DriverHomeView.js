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
	"dojo/dom-style",
	"dojo/dom-class"
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, win, dom, domStyle, domClass){
        return declare([View], {
		
		restaurantsRoundRectList: null,
		messageDialogView: null,
		loadingDialog: null,
		chooseAddressView: null,
		offlineDialog: null,
		driverWelcomeField: null,
		eventHandler: null,
		gpsManager: null,
		driverShiftDurationDialog: null,
		driverHomeIcon: null,
		
		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.clockInClockOutBtn = registry.byId("clockInClockOutBtn");
			this.loadingDialog = registry.byId("loadingDialog");
			this.offlineDialog = registry.byId("offlineDialog");
			this.driverWelcomeField = dom.byId("driverWelcomeField");
			this.driverStatusField = dom.byId("driverStatusField");
			this.driverDurationField = dom.byId("driverDurationField");
			this.gpsManager = registry.byId("gpsManager");
			this.driverShiftDurationDialog = registry.byId("driverShiftDurationDialog");
			this.driverHomeIcon = dom.byId("driverHomeIcon");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.refreshSession();
			this.driverWelcomeField.innerHTML = "Welcome, " + GlobalObjects.currentDriver.fullName;
		},
		clockOut: function() {
			// stop tracking the driver's location
			this.loadingDialog.show("Stopping the location service ...");
			this.gpsManager.stopWatchingLocation(lang.hitch(this, function() {
				this.loadingDialog.show("Clocking-out ...");
				promise = request.post(GlobalObjects.serverURL + '/driver/clockout', {data: JSON.stringify({driverId: GlobalObjects.currentDriver.id}), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function() {
					if (this.eventHandler) this.eventHandler.remove();
					this.eventHandler = this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockIn));
					this.clockInClockOutBtn.set("label", "Clock-in");
					this.driverStatusField.innerHTML = "You're clocked-out";
					this.driverDurationField.innerHTML = "";
					
					this.loadingDialog.hide();
					
				}), lang.hitch(this, function(err) {
					if (err.response.status == 0) {
						this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
					} else if (err.response.status == 404) {
						this.messageDialogView.show("G2G servers are unable to process your request at this time");
					} else {
						this.messageDialogView.show(err.response.text);
					}
					this.loadingDialog.hide();
				}));
			}), lang.hitch(this, function(error) { // failed to stop the location service
				this.messageDialogView.show(error);
				this.loadingDialog.hide();
			}), lang.hitch(this, function(progressMessage) { // reporting progress
				this.loadingDialog.show(progressMessage);
			}));
		},
		clockIn: function() {
			var plannedDurationInMinutes = 6 * 60;
			
			this.loadingDialog.show("Starting the location service ...");
			// start tracking the driver's location
			this.gpsManager.watchLocation(lang.hitch(this, function() {
				this.loadingDialog.show("Retrieving the current location ...");
				this.gpsManager.getLocation(lang.hitch(this, function(location) {
					this.loadingDialog.show("Clocking-in ...");
					promise = request.post(GlobalObjects.serverURL + '/driver/clockin', {data: JSON.stringify({driverId: GlobalObjects.currentDriver.id, lng: location[1], lat: location[0], plannedDuration: plannedDurationInMinutes }), handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
					promise.response.then(lang.hitch(this, function(response) {
						if (this.eventHandler) this.eventHandler.remove();
						this.eventHandler = this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockOut));
						this.clockInClockOutBtn.set("label", "Clock-out");
						this.driverStatusField.innerHTML = "You're clocked-in"
							this.driverDurationField.innerHTML = this.calculateDuration(response.data.startTime, response.data.plannedDuration);
						this.loadingDialog.hide();
					}), lang.hitch(this, function(err) {
						this.loadingDialog.hide();
						if (err.response.status == 0) {
							this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
						} else if (err.response.status == 404) {
							this.messageDialogView.show("G2G servers are unable to process your request at this time");
						} else {
							this.messageDialogView.show(err.response.text);
						}
					}));
				}), lang.hitch(this, function(error) {
					this.loadingDialog.hide();
					this.messageDialogView.show("Please ensure that your location service is turned on");
				}));
				
			}), lang.hitch(this, function(error) {
				this.messageDialogView.show(error);
				this.loadingDialog.hide();
			}), lang.hitch(this, function(progressMessage) { // reporting progress
				this.loadingDialog.show(progressMessage);
			}));
		},
		refreshSession: function() {
			this.loadingDialog.show("Refreshing driver's sessions ...");
			promise = request.get(GlobalObjects.serverURL + '/driver/' + GlobalObjects.currentDriver.id + '/activesession', {handleAs:'json', headers: {"Content-Type": "application/json", "g2g-version": GlobalObjects.g2gVersion}});
			promise.response.then(lang.hitch(this, function(response) {
				if (response.data != null) { // i'm clocked in
					
					// start tracking the driver's location
					this.loadingDialog.show("Starting the location service ...");
					this.gpsManager.watchLocation(lang.hitch(this, function() {
						this.clockInClockOutBtn.set("label", "Clock-out");
						if (this.eventHandler) this.eventHandler.remove();
						this.eventHandler = this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockOut));
						this.driverStatusField.innerHTML = "You're clocked-in";
						this.driverDurationField.innerHTML = this.calculateDuration(response.data.startTime, response.data.plannedDuration);
						
						this.loadingDialog.hide();
					}), lang.hitch(this, function(error) {
						this.messageDialogView.show(error);
						this.loadingDialog.hide();
					}), lang.hitch(this, function(progressMessage) {
						this.loadingDialog.show(progressMessage);
					}));
					
					
				} else {
					// clocked out
					
					// stop tracking the driver's location
					this.loadingDialog.show("Stopping the location service ...");
					this.gpsManager.stopWatchingLocation(lang.hitch(this, function() {
						this.clockInClockOutBtn.set("label", "Clock-in");
						if (this.eventHandler) this.eventHandler.remove();
						this.eventHandler = this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockIn));
						this.driverDurationField.innerHTML = "";
						this.driverStatusField.innerHTML = "You're clocked-out";
						
						this.loadingDialog.hide();
					}), lang.hitch(this, function(error) {
						this.messageDialogView.show(error);
						this.loadingDialog.hide();
					}), lang.hitch(this, function(progressMessage) {
						this.loadingDialog.show(progressMessage);
					}));
					
				}
			}), lang.hitch(this, function(err) { // failed to refresh sessions
				if (err.response.status == 0) {
					this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
				} else if (err.response.status == 404) {
					this.messageDialogView.show("G2G servers are unable to process your request at this time");
				} else {
					this.messageDialogView.show(err.response.text);
				}
				this.loadingDialog.hide();
			}));
		},
		calculateDuration: function(st, pd) {
			var startTime = new Date(st);
			var now = new Date();
			
			var plannedDurationInMillis = pd * 60 * 1000;
			var timeClockedInInMillis = now.getTime() - startTime.getTime();
			
			var result = Utilities.millisToString(timeClockedInInMillis) + " has passed of your planned shift of " + Utilities.millisToString(plannedDurationInMillis);
			return result;
		}
    });
});