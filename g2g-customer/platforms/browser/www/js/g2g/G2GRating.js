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
	"dojox/mobile/Rating",
	"dojo/query!g2g/libraries/sizzle" // use sizzle, which queries and returns the results in order
    ], function(declare, registry, on, SimpleDialog, dom, ProgressIndicator, touch, lang, domStyle, request, Rating, query) {
        return declare([Rating], {
        	
        starClickedCallback: null,
        	
		startup: function() {
			this.inherited(arguments);
		},
		
		setRating: function(rating) {
			this.set("value", rating);
			this.initG2GRating(this.starClickedCallback);
		},
        
		initG2GRating: function(starClickedCallbackFn) {
			// save the callback function
			this.starClickedCallback = starClickedCallbackFn;
			
        	var starsInOrder = query(".mblSpriteIconParent", this.domNode);
			on(starsInOrder[0], "click", lang.hitch(this, function(e) {
				this.set("value", 1);
				if (this.starClickedCallback) this.starClickedCallback(1);
				this.initG2GRating(this.starClickedCallback);
			}));
			on(starsInOrder[1], "click", lang.hitch(this, function(e) {
				this.set("value", 2);
				if (this.starClickedCallback) this.starClickedCallback(2);
				this.initG2GRating(this.starClickedCallback);
			}));
			on(starsInOrder[2], "click", lang.hitch(this, function(e) {
				this.set("value", 3);
				if (this.starClickedCallback) this.starClickedCallback(3);
				this.initG2GRating(this.starClickedCallback);
			}));
			on(starsInOrder[3], "click", lang.hitch(this, function(e) {
				this.set("value", 4);
				if (this.starClickedCallback) this.starClickedCallback(4);
				this.initG2GRating(this.starClickedCallback);
			}));
			on(starsInOrder[4], "click", lang.hitch(this, function(e) {
				this.set("value", 5);
				if (this.starClickedCallback) this.starClickedCallback(5);
				this.initG2GRating(this.starClickedCallback);
			}));
        }
    });
});