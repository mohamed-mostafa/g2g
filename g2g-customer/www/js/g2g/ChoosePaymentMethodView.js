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
		
        	paymentMethodsRect: null,
        	checkoutView: null,
        	title: null,
        	onPaymentMethodSelected: null,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.paymentMethodsRect = registry.byId("paymentMethodsRect");
			this.checkoutView = registry.byId("checkout");
			this.title = dom.byId("choosePaymentmethodViewTitle");
		},
		// when the dialog is shown
		show: function(title, onPaymentMethodSelectedEventHandler) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			
			this.title.innerHTML = title;
			this.onPaymentMethodSelected = onPaymentMethodSelectedEventHandler;
			
			this.paymentMethodsRect.destroyDescendants();
			array.forEach(GlobalObjects.currentUser.paymentMethods, lang.hitch(this, function (paymentMethod) {
				// Create a new ListItem at the end of the list
				var listItem = new ListItem({}).placeAt(this.paymentMethodsRect, "last");
				
				// attach the paymentMethod to the listItem (add a new attribute to listItem named 'paymentMethod')
				listItem.paymentMethod = paymentMethod;
				listItem.containerNode.innerHTML = this.substitute(this.paymentMethodTemplate, {
					nickname: paymentMethod.cardNickname,
					cardNumber: paymentMethod.cardNumber,
					cardExpirationMonth: paymentMethod.cardExpirationMonth,
					cardExpirationYear: paymentMethod.cardExpirationYear
				});
				listItem.onClick = lang.hitch(this, function(){
					// notify the caller (if any)
					if (this.onPaymentMethodSelected) {
						this.onPaymentMethodSelected(listItem.paymentMethod);
					}
					// close the dialog
					this.hide();
				});
				listItem.set("moveTo","#");
			}));
		
		},
		// list item template
		paymentMethodTemplate:
			'<div class="paymentMethodListItem">' +
				'<div class="cardNickname underlined">${nickname}</div>' +
				'<div class="cardNumber">${cardNumber} | ${cardExpirationMonth}/${cardExpirationYear}</div>' +
			'</div>',
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});