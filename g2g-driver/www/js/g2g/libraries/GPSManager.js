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
        	
        	initialized: false,
        	watchId: null, // a handle for the watchLocation native plugin method
        	locatoinChangeListener: null,

        	
        	init: function(onSuccess, onFailure, listener) {
        		this.locatoinChangeListener = listener; // location change listener registratoin
        		if (this.initialized) {
        			onSuccess();
        		} else {
    				// call the native plugin at least once, to get the permission popup appear for the user
    				navigator.geolocation.getCurrentPosition(lang.hitch(this, function(position) {
    					this.initialized = true;
    					onSuccess();
    				}), lang.hitch(this, function(error) {
    					// error getting GPS coordinates
    					if (error.code == 1) { //PositionError.PERMISSION_DENIED
    						onFailure("The location service permission is essential for G2G Driver to run");
    					} else if (error.code == 2) { //PositionError.POSITION_UNAVAILABLE 
    						onFailure("The location service is essential for G2G Driver to run. Make sure you're connected to GPS or a 3G network");
    					} else { // PositionError.TIMEOUT
    						onFailure("The location service is essential for G2G Driver to run. Make sure the location service is turned on, you're connected to GPS or a 3G network, and G2G has the permission to use location service");
    					}
    				}));
        		}
        	}, 
        	getLocation: function(onLocationRetrieved, onLocationError) {
        		if (this.initialized) {
        			navigator.geolocation.getCurrentPosition(lang.hitch(this, function(position) {
        				// just to show how to access latitute and longitude
        				var location = [position.coords.latitude, position.coords.longitude];
        				onLocationRetrieved(location);
        			}), lang.hitch(this, function(error) {
        				// error getting GPS coordinates
        				if (error.code == 1) { //PositionError.PERMISSION_DENIED
        					onLocationError("The location service permission is essential for G2G Driver to run");
    					} else if (error.code == 2) { //PositionError.POSITION_UNAVAILABLE 
    						onLocationError("The location service is essential for G2G Driver to run. Make sure you're connected to GPS or a 3G network");
    					} else { // PositionError.TIMEOUT
    						onLocationError("The location service is essential for G2G Driver to run. Make sure the location service is turned on, you're connected to GPS or a 3G network, and G2G has the permission to use location service");
    					}
        			}), { enableHighAccuracy: false, maximumAge: 3000, timeout: 10000 });
        		} else {
        			onLocationError("The location service is not ready. Please restart the application");
        		}
        	},
        	watchLocation: function(onSuccess, onFailure, onProgress) {
        		if (this.initialized) {
        			if (this.watchId == null) {
        				this.watchId = navigator.geolocation.watchPosition(lang.hitch(this, function(position) {
        					// just to show how to access latitute and longitude
        					var location = [position.coords.latitude, position.coords.longitude];
        					this.locationChanged(location);
        				}), lang.hitch(this, function(error) {
        					// should not happen, as we initialized and tested before
        					// even if it happens, I won't handle it !
        				}), { enableHighAccuracy: false, maximumAge: 3000, timeout: 10000 });
        				onSuccess();
        			} else { // already watching
        				onSuccess();
        			}
        		} else {
        			onFailure("The location service is not ready. Please restart the application");
        		}
        	},
        	stopWatchingLocation: function(onSuccess, onFailure, onProgress) {
        		if (this.initialized) {
        			if (this.watchId) {
        				navigator.geolocation.clearWatch(this.watchId); // stop normal service
        				onSuccess();
        			} else {
        				onSuccess();
        			}
        		} else {
        			onSuccess(); // no need to annoy anyone now !
        		}
        	},
        	locationChanged: function(location) { // will be called in the case of foreground location change (iOS and Android)
    			var latlng = new google.maps.LatLng(location[0], location[1]);
    			this.locatoinChangeListener.onLocationChanged(latlng);
        	}
      });
});