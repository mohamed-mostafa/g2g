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
		yesBtn: null,
		noBtn: null,
		yesBtnHandler: null,
		noBtnHandler: null,
		
		// init variables and handlers
		startup: function() {
			this.inherited(arguments);
			this.questionField = dom.byId("yesNoQuestionFieldField");
			this.subtitleField = dom.byId("yesNoSubtitleField");
			this.yesBtn = registry.byId("yesBtn");
			this.noBtn = registry.byId("noBtn");
		},
		// when the dialog is shown
		show: function(question, onYes, onNo, subtitle) {
			Utilities.hideKeyboard();
			this.inherited(arguments);
			this.questionField.innerHTML = question;
			this.subtitleField.innerHTML = subtitle;
			
			if (this.yesBtnHandler) this.yesBtnHandler.remove();
			if (this.noBtnHandler) this.noBtnHandler.remove();
			
			this.yesBtnHandler = this.yesBtn.on("click", onYes);
			this.noBtnHandler = this.noBtn.on("click", onNo);
		}
    });
});