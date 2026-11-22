define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dijit/registry",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojox/mobile/ProgressIndicator",
    ], function(declare, View, registry, win, lang,ProgressIndicator) {
        return declare([View], {

//		nextBtn: null,
		progressIndicator: null,	

		startup: function () {
			this.inherited(arguments);
//			this.nextBtn = registry.byId("profileThatsItNextBtn");
			// register events on the button
//			this.nextBtn.on("click", lang.hitch(this, this.next));
			this.progressIndicator = ProgressIndicator.getInstance();
		},
		fixScrollablePanelHeight: function() {
			var scrollablePane = dom.byId("profileThatsItScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (44 + 60 + 5); // the bottom tab bar and the upper header and the area of the restaurant name and a padding
			console.log("New Height: " + height);
			domStyle.set(scrollablePane, "height", height);
		}
    });
});

