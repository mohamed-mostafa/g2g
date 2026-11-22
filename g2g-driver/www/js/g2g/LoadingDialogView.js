define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom",
	"dojox/mobile/ProgressIndicator",
    ], function(declare, registry, on, SimpleDialog, dom, ProgressIndicator) {
        return declare([SimpleDialog], {
        	
        // references
		messageField: null,
//		progressIndicator: null,
//		progressIndicatorContainer: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.messageField = dom.byId("loadingMessageField");
//			this.progressIndicator = ProgressIndicator.getInstance();
//			this.progressIndicatorContainer = dom.byId("progressIndicatorContainer");
		},
		// when the dialog is shown
		show: function(message) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.messageField.innerHTML = message;
//			this.progressIndicatorContainer.appendChild(this.progressIndicator.domNode);
//			this.progressIndicator.start();
		},
		// when the dialog is hidden
		hide: function() {
			this.inherited(arguments);
//			this.progressIndicator.stop();
		}
    });
});