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
        	saveCredentials: function(username, password ,onSuccess, onFailure) {
        		try {
        			window.localStorage.setItem("g2gdriverusername", username);
        			window.localStorage.setItem("g2gdriverpassword", password);
        			onSuccess();
        		} catch (err) {
        			onFailure(err);
        		}
        	},
        	getCredentials: function(onSuccess, onFailure) {
        		try {
        			var username = window.localStorage.getItem("g2gdriverusername");
        			var password = window.localStorage.getItem("g2gdriverpassword");
        			onSuccess(username, password);
        		} catch (err) {
        			alert(err);
        			onFailure(err);
        		}
        	}
      });
});