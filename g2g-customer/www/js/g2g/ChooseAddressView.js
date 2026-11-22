define([
    "dojo/_base/declare",
	"dojox/mobile/RoundRectList",
	"dijit/registry",
	"dojox/mobile/ListItem",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom"
    ], function(declare, RoundRectList, registry, ListItem, JSON, lang, array, on, SimpleDialog, dom) {
        return declare([SimpleDialog], {
		
        addressesRect: null,
        checkoutView: null,
        title: null,
        onAddressSelected: null, // a callback method to be called when an address is selected, to notify the caller
		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.addressesRect = registry.byId("addressesRect");
			this.checkoutView = registry.byId("checkout");
			this.title = dom.byId("chooseAddressViewTitle");
		},
		// when the dialog is shown
		show: function(title, onAddressSelectedHandler) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			
			this.title.innerHTML = title;
			this.onAddressSelected = onAddressSelectedHandler;
			
			this.addressesRect.destroyDescendants();
			array.forEach(GlobalObjects.currentUser.addresses, lang.hitch(this, function (address) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.addressesRect, "last");
				
				// attach the address to the listItem (add a new attribute to listItem named 'address')
				listItem.address = address;
				listItem.containerNode.innerHTML = this.substitute(this.addressTemplate, {
					streetAddress1: address.streetAddress1,
					streetAddress2: address.streetAddress2,
					city: address.city,
					state: address.state,
					zipCode: address.zipCode,
					nickname: address.nickname
				});
				listItem.onClick = lang.hitch(this, function() {
					// notify the caller (if any)
					if (this.onAddressSelected) {
						this.onAddressSelected(listItem.address);
					}
					// close the dialog
					this.hide();
				});
				listItem.set("moveTo","#");
			}));
		},
		// list item template
		addressTemplate:
			'<div class="addressListItem">' +
				'<div class="streetAddress underlined">${nickname} | ${zipCode}</div>' +
				'<div class="addressDetails">${streetAddress1} ${streetAddress2}</div>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});