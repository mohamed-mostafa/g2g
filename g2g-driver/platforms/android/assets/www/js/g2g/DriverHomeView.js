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
		driverWelcomeField: null,
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
			
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
			this.updateBtnNameAndLink();
			this.driverWelcomeField.innerHTML = "Welcome, " + GlobalObjects.currentDriver.fullName;
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.updateBtnNameAndLink();
			this.driverWelcomeField.innerHTML = "Welcome, " + GlobalObjects.currentDriver.fullName;
		},
		show: function() {
			this.inherited(arguments);
		},
		updateBtnNameAndLink: function() {
			if (GlobalObjects.currentDriver.isClockedIn == true) {
				this.clockInClockOutBtn.set("label", "Clock-out");
				this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockOut));
				this.driverStatusField.innerHTML = "You're clocked-in";
			} else {
				this.clockInClockOutBtn.set("label", "Clock-in");
				this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockIn));
				this.driverStatusField.innerHTML = "You're clocked-out";
			}
		},
		clockOut: function() {
			GlobalObjects.currentDriver.isClockedIn = false;
			this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockIn));
			this.clockInClockOutBtn.set("label", "Clock-in");
			this.driverStatusField.innerHTML = "You're clocked-out";
		},
		clockIn: function() {
			GlobalObjects.currentDriver.isClockedIn = true;
			this.clockInClockOutBtn.on("click", lang.hitch(this, this.clockOut));
			this.clockInClockOutBtn.set("label", "Clock-out");
			this.driverStatusField.innerHTML = "You're clocked-in";
		}
		
    });
});