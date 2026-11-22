/**
 * 
 */

/**
 * 
 */
define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/request",
    ], function(declare, View, JSON, lang, array, request) {
        return declare([View], {
        	
        	push: null,
        	
        	
        	init: function() {
        		this.push = PushNotification.init({
        		    android: {
        		        senderID: "12345679"
        		    },
        		    ios: {
        		    	senderID: "123456789",
        		        alert: "true",
        		        badge: true,
        		        sound: 'true'
        		    },
        		    windows: {}
        		});
        		
        		this.push.on('registration', lang.hitch(this, this.onRegistration));
        		this.push.on('notification', lang.hitch(this, this.onNotification));
        		this.push.on('error', lang.hitch(this, this.onError));
        	},
        	onRegistration: function(data) {
        		alert("Registration ID: " + data.registrationId);
        	},
        	onNotification: function(data) {
        		alert("Notification: " + JSON.stringify(data));
        	},
        	onError: function(data) {
        		alert("Error: " + JSON.stringify(data));
        	},
      });
});