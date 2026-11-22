define([
    "dojo/_base/declare",
    "dojox/mobile/View",
	"dojo/request",
	"dojo/dom-form",
	"dojo/json",
	"dijit/registry",
	"dojo/_base/lang",
	"dojox/mobile/ProgressIndicator",
    ], function(declare, View, request, domForm, JSON, registry, lang, ProgressIndicator){
        return declare([View], {
        	
        paymentsTabBarBtn: null,
        addressesTabBarBtn: null,
        accountTabBarBtn: null,
        personalTabBarBtn: null,
        thatsItTabBarBtn: null,
        
        startup: function() {
        	this.inherited(arguments);
        	
//        	this.paymentsTabBarBtn = registry.byId("registrationPaymentsTabBarButton");
//        	this.paymentsTabBarBtn.on("click", function() {return false;});
//        	this.paymentsTabBarBtn.on("touchStart", function() {return false;});
        	
        	this.addressesTabBarBtn = registry.byId("registrationAddressesTabBarButton");
        	this.addressesTabBarBtn.on("click", function() {return false;});
        	this.addressesTabBarBtn.on("touchStart", function() {return false;});
        	
        	this.accountTabBarBtn = registry.byId("registrationAccountTabBarButton");
        	this.accountTabBarBtn.on("click", function() {return false;});
        	this.accountTabBarBtn.on("touchStart", function() {return false;});
        	
        	this.personalTabBarBtn = registry.byId("registrationPersonalTabBarButton");
        	this.personalTabBarBtn.on("click", function() {return false;});
        	this.personalTabBarBtn.on("touchStart", function() {return false;});

        	this.thatsItTabBarBtn = registry.byId("registrationThatsItTabBarButton");
        	this.thatsItTabBarBtn.on("click", function() {return false;});
        	this.thatsItTabBarBtn.on("touchStart", function() {return false;});
        }
    });
});