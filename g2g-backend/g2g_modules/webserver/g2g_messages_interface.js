var g2gSMSAdapter = require('../adapters/g2g_sms_adapter.js');
var g2gUsersBusiness = require('../business/g2g_users_business.js');

var saveNewSMS = function(req, res) {
	try {
		// call the business function and give it a callback function
		var from = req.body.From;
		var message = req.body.Text;
		g2gUsersBusiness.saveNewSMS(from, message,
				function() {
					res.end();
				},
				function(err) {
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
	} catch (error) {
		console.log("An error occured in /sms");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};
	
var sendSMS = function(req, res) {
	var to = req.body.to;
	var text = req.body.text;
	g2gSMSAdapter.sendSMS(to, text, function(response) {
		res.end();
	}, function(err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	});
};
	
var getPendingSystemMessages = function(req, res) {
	g2gUsersBusiness.getPendingSystemMessages(function(response) {
		res.json(response);
	}, function(err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	});
};
	
var getPendingUserMessages = function(req, res) {
	g2gUsersBusiness.getPendingUserMessages(function(response) {
		res.json(response);
	}, function(err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	});
};
	
var markMessageRead = function(req, res) {
	var messageId = req.params.messageId;
	g2gUsersBusiness.markMessageRead(messageId, function() {
		res.end();
	}, function(err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	});
};
var markMessageUnread = function(req, res) {
	var messageId = req.params.messageId;
	g2gUsersBusiness.markMessageUnRead(messageId, function() {
		res.end();
	}, function(err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	});
};
	
	// get messages filtered by dates
var getMessagesBetweenDates =  function(req, res) {
	try {
		var messagesFrom = new Date(req.query.messagesFrom);
		var messagesTo = new Date(req.query.messagesTo);
		g2gUsersBusiness.getMessagesBetweenDates(messagesFrom, messagesTo, function(messages) {
			res.json(messages);
		}, function(err) {
			console.log(JSON.stringify(err));
			res.status(500).send(JSON.stringify(err));
		});
	} catch (err) {
		console.log(JSON.stringify(err));
		res.status(500).send(JSON.stringify(err));
	}
};

exports.getMessagesBetweenDates = getMessagesBetweenDates;
exports.markMessageUnread = markMessageUnread;
exports.markMessageRead = markMessageRead;
exports.getPendingUserMessages = getPendingUserMessages;
exports.getPendingSystemMessages = getPendingSystemMessages;
exports.sendSMS = sendSMS;
exports.saveNewSMS = saveNewSMS;