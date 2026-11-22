define([
    "dojo/_base/declare",
	"dijit/registry",
	"dojo/on",
	"dojox/mobile/SimpleDialog",
	"dojo/dom"
    ], function(declare, registry, on, SimpleDialog, dom) {
        return declare([SimpleDialog], {
        	
        // references
		questionField: null,
		subtitleField: null,
		leftButton: null,
		leftButtonHandler: null,
		rightButton: null,
		rightButtonHandler: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.questionField = dom.byId("doubleButtonQuestionField");
			this.subtitleField = dom.byId("doubleButtonSubtitleField");
			this.leftButton = registry.byId("leftButton");
			this.rightButton = registry.byId("rightButton");
		},
		// when the dialog is shown
		show: function(question, subtitle, leftButtonTitle, rightButtonTitle, onLeftBtnClick, onRightBtnClick) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.questionField.innerHTML = question;
			this.subtitleField.innerHTML = subtitle;
			this.leftButton.set("label", leftButtonTitle);
			this.rightButton.set("label", rightButtonTitle);
			
			if (this.rightButtonHandler) this.rightButtonHandler.remove();
			if (this.leftButtonHandler) this.leftButtonHandler.remove();
			
			this.leftButtonHandler = this.leftButton.on("click", onLeftBtnClick);
			this.rightButtonHandler = this.rightButton.on("click", onRightBtnClick);
		}
    });
});