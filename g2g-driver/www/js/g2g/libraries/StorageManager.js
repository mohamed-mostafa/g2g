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
        	savePaymentMethodsToDB: function(onSuccess, onFailure) {
        		try {
        			var paymentMethodsJSON = JSON.stringify(GlobalObjects.currentUser.paymentMethods);
        			window.localStorage.setItem(GlobalObjects.currentUser.id, paymentMethodsJSON);
        		} catch (err) {
        			onFailure(err);
        		}
        		onSuccess();
        		
        	},
        	saveCredentials: function(username, password ,onSuccess, onFailure) {
        		try {
        			window.localStorage.setItem("g2gusername", username);
        			window.localStorage.setItem("g2gpassword", password);
        			onSuccess();
        		} catch (err) {
        			onFailure(err);
        		}
        	},
        	getPaymentMethodsOfCurrentUser: function(onSuccess, onFailure) {
        		var paymentMethods = {paymentMethods: []};
        		try {
        			var paymentMethodsJSON = window.localStorage.getItem(GlobalObjects.currentUser.id);
        			if (paymentMethodsJSON != null && paymentMethodsJSON != "") {
        				paymentMethods.paymentMethods = JSON.parse(paymentMethodsJSON);
        			} 
        		} catch (err) {
        			alert(err);
        			onFailure(err);
        		}
        		onSuccess(paymentMethods);
        	},
        	getCredentials: function(onSuccess, onFailure) {
        		try {
        			var username = window.localStorage.getItem("g2gusername");
        			var password = window.localStorage.getItem("g2gpassword");
        			onSuccess(username, password);
        		} catch (err) {
        			alert(err);
        			onFailure(err);
        		}
        	}
      });
});