define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom"
    ], function(declare, registry, on, SimpleDialog, dom) {
        return declare([SimpleDialog], {
        	
        // references
		messageField: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.messageField = dom.byId("messageField");
		},
		// when the dialog is shown
		show: function(message) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.messageField.innerHTML = message;
		}
    });
});