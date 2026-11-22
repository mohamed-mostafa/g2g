define([
    "dojo/_base/declare",
    "dojox/mobile/SimpleDialog",
	"dijit/registry",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/_base/lang",
	"dojo/request",
    ], function(declare, SimpleDialog, registry, dom, domStyle, lang, request) {
        return declare([SimpleDialog], {

    	driverShiftDurationOkBtn: null,
    	driverShiftDurationField: null,
    	finishCallbackRef: null,
		startup: function () {
			this.inherited(arguments);
			this.driverShiftDurationOkBtn = registry.byId("driverShiftDurationOkBtn");
			this.driverShiftDurationValuePickerTimePicker = registry.byId("driverShiftDurationValuePickerTimePicker");
			this.driverShiftDurationValuePickerTimePicker.getSlots()[1].set("step", 30);
			// register events on the button
			this.driverShiftDurationOkBtn.on("click", lang.hitch(this, this.ok));
		},
		show: function(finishCallbackRef) {
			this.inherited(arguments);
			this.finishCallbackRef = finishCallbackRef;
		},
		ok: function () {
			var values = this.driverShiftDurationValuePickerTimePicker.get("values");
			if (this.finishCallbackRef) this.finishCallbackRef(values[0], values[1]);
		}
    });
});

