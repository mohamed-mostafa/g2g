/**
 * 
 */
define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array"
    ], function(declare, View, JSON, lang, array) {
        return declare([View], {
        	getLocation: function() {
        		
        	},
        	startup: function() {
        		this.getLocation();
        	}
      });
});