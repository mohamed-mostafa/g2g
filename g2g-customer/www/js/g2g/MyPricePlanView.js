define([
    "dojo/_base/declare",
	"dojox/mobile/View",
	"dojox/mobile/RoundRectList",
	"dijit/registry",
	"dojox/mobile/ProgressIndicator",
	"dojox/mobile/ListItem",
	"dojo/request",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/currency",
	"dojo/dom-style",
	"dojo/dom",
	"dojo/_base/window"
    ], function(declare, View, RoundRectList, registry, ProgressIndicator, ListItem, request, JSON, lang, array, currency, domStyle, dom, win){
        return declare([View], {
		
		myPricePlanRoundRectList: null,
		messageDialogView: null,
		loadingDialog: null,
		scrollablePaneHeightfixed: false,

		// init variables and handlers
		startup: function () {
			this.inherited(arguments);
			this.messageDialogView = registry.byId("messageDialog");
			this.myPricePlanRoundRectList = registry.byId("myPricePlanRoundRectList");
			this.loadingDialog = registry.byId("loadingDialog");
		},
		// when the 'in' transition starts
		onBeforeTransitionIn: function() {
			this.inherited(arguments);
		},
		// when the 'in' transition finishes
		onAfterTransitionIn: function() {
			this.inherited(arguments);
			this.myPricePlanRoundRectList.destroyDescendants();
			this.getPricePlan();
			Utilities.updateMainHeader("My Price Plan");
		},
		fixScrollablePanelHeight: function() {
			var myPricePlanScrollablePane = dom.byId("myPricePlanScrollablePane");
			var height = domStyle.get(win.body(), "height");
			height = height - (48 + 44 + 48 + 5); // the bottom tab bar and the upper header and the upper tab bar and a margin
			console.log("New Height: " + height);
			domStyle.set(myPricePlanScrollablePane, "height", height);
		},
		getPricePlan: function() {
			if (GlobalObjects.currentUser != null) {
				this.loadingDialog.show("Loading Your Price Plan Information ...");
				// clear everything
				this.myPricePlanRoundRectList.containerNode.innerHTML = "";
				this.myPricePlanRoundRectList.destroyDescendants();
				
				// call WS to retrieve the user
				var promise = request.get(GlobalObjects.serverURL + '/user/' + GlobalObjects.currentUser.username, {handleAs:'json', headers: {"Content-Type":"application/json", "g2g-version": GlobalObjects.g2gVersion}});
				promise.response.then(lang.hitch(this, function(response) {
					this.loadingDialog.hide();
					
					if (response.data.eligibleForFreeDelivery|| response.data.eligibleForLifetimeFreeDelivery) {
						this.myPricePlanRoundRectList.containerNode.innerHTML = this.substitute(this.pricePlanTemplateWithFreeDeliveryTemplate, {
							pricePlanName: response.data.plan.name,
							pricePlanDescription: response.data.plan.description
						});
					} else {
						this.myPricePlanRoundRectList.containerNode.innerHTML = this.substitute(this.pricePlanTemplateTemplate, {
							pricePlanName: response.data.plan.name,
							pricePlanDescription: response.data.plan.description
						});
					}
					
				}), lang.hitch(this, function(err) {
					this.loadingDialog.hide();
					// display error message
					if (err.response.status == 0) {
						this.messageDialogView.show("Failed to communicate with G2G servers. Please make sure you're connected to the internet ...");
					} else if (err.response.status == 404) {
						this.messageDialogView.show("G2G servers are unable to process your request at this time");
					} else {
						this.messageDialogView.show("Failed to get your price plan. Please contact G2G support for help. Error: " + err.response.text);
					}
				}));
			} else { // anonymous user
				// clear everything
				this.myPricePlanRoundRectList.containerNode.innerHTML = "";
				this.myPricePlanRoundRectList.destroyDescendants();
				
				this.myPricePlanRoundRectList.containerNode.innerHTML = this.noPricePlanTemplate;
				this.fixScrollablePanelHeight();
			}
			
		},
		// list item template
		pricePlanTemplateTemplate:
			'<div  class="pricePlan">' +
				'<p class="weareofflinemessage">Your Price Plan is' + 
				'</p>' +
				'<p class="weareoffline">${pricePlanName}' + 
				'</p>' +
				'<p class="weareofflinemessage">${pricePlanDescription}' + 
				'</p>' +
			'</div>' ,
		// list item template
		pricePlanTemplateWithFreeDeliveryTemplate:
			'<div  class="pricePlan">' +
				'<p class="weareofflinemessage">Your Price Plan is' + 
				'</p>' +
				'<p class="weareoffline">${pricePlanName}' + 
				'</p>' +
				'<p class="weareofflinemessage">${pricePlanDescription}' + 
				'</p>' +
				'<p class="freeDeliveryTag">Your next order is FREE of delivery charge!</p>' +
			'</div>' ,
		// no plan template
		noPricePlanTemplate:
				'<div  class="pricePlan">' +	
					'<p class="weareoffline">You are not registered !' + 
					'</p>' +
					'<p class="weareofflinemessage">Please register with G2G first, and you will be assigned a price plan' + 
					'</p>' +
				'</div>' ,
		// Pushes data into a template - primitive
		substitute: function(template,obj) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
				return obj[key];
			});
		}
    });
});