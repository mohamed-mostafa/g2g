define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom",
	"dojox/mobile/ProgressIndicator",
	"dojo/touch",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/request",
	"dojo/query",
	"dojo/dom-construct",
    ], function(declare, registry, on, SimpleDialog, dom, ProgressIndicator, touch, lang, domStyle, request, query, domConstruct) {
        return declare([SimpleDialog], {
        	
        adsDialogReady: false,	 // a flag to prevent showing the dialog, even if .show is called
        	
        init: function() {
        	// discard if the ads are not loaded yet .. we're unlucky, or actually, the restaurants are unlucky
			if (GlobalObjects.adsList == null || GlobalObjects.adsList.length == 0) {
				this.adsDialogReady = false;
				return;
			} else {
				if (GlobalObjects.adsList.length == 1 ) {
					registry.byId("swapView1").destroy();
					registry.byId("swapView2").destroy();
					// remove the last swap item
					dom.byId("ad0").src = "data:image/png;base64," + GlobalObjects.adsList[0].image;
				} else if (GlobalObjects.adsList.length == 2) {
					registry.byId("swapView2").destroy();
					// remove the 2 last swap items
					dom.byId("ad0").src = "data:image/png;base64," + GlobalObjects.adsList[0].image;
					dom.byId("ad1").src = "data:image/png;base64," + GlobalObjects.adsList[1].image;
				} else {
					dom.byId("ad0").src = "data:image/png;base64," + GlobalObjects.adsList[0].image;
					dom.byId("ad1").src = "data:image/png;base64," + GlobalObjects.adsList[1].image;
					dom.byId("ad2").src = "data:image/png;base64," + GlobalObjects.adsList[2].image;
				}
				registry.byId("adsPageIndicator").reset();
				this.adsDialogReady = true;
			}
        },
        show: function() {
        	if (this.adsDialogReady) {
        		this.inherited(arguments);
        	} else {
        		return;
        	}
        },
    });
});