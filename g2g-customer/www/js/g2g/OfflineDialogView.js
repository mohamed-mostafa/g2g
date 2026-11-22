define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom",
	"dojo/_base/lang",
    ], function(declare, registry, on, SimpleDialog, dom, lang) {
        return declare([SimpleDialog], {
        	
        // references
        offlineMessageParagraph: null,
//		dismissOfflineMessageBtn: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.offlineMessageParagraph = dom.byId("offlineMessageParagraph");

//			this.dismissOfflineMessageBtn = registry.byId("dismissOfflineMessageBtn");
//			this.dismissOfflineMessageBtn.on("click", lang.hitch(this, this.dismiss));
		},
		// when the dialog is shown
		show: function(message) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.offlineMessageParagraph.innerHTML = message;
		},
		dismiss: function() {
			this.hide();
		}
    });
});