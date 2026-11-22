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
		singleButton: null,
		singleButtonHandler: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.questionField = dom.byId("singleButtonQuestionField");
			this.subtitleField = dom.byId("singleButtonSubtitleField");
			this.singleButton = registry.byId("singleButton");
		},
		// when the dialog is shown
		show: function(question, onSingleBtnClick, subtitle, buttonTitle) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.questionField.innerHTML = question;
			this.subtitleField.innerHTML = subtitle;
			this.singleButton.set("label", buttonTitle);
			
			if (this.singleButtonHandler) this.singleButtonHandler.remove();
			
			this.singleButtonHandler = this.singleButton.on("click", onSingleBtnClick);
		}
    });
});