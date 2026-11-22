/**
 * 
 */

var request = require('request');

var sendSMS = function(to, body, onSuccess, onFailure) {
	// send request to https://api.plivo.com/v1/Account/{auth_id}/Message/
	
	var options = {
	  uri: 'https://api.plivo.com/v1/Account/MAMZM3MJLINDY2YMU1ZT/Message/',
	  method: 'POST',
	  json: {
		  src: "14242469700",
		  dst: to,
		  text: body,
	  },
	  auth: {
		    user: 'MAMZM3MJLINDY2YMU1ZT',
		    pass: 'OTAyMGZhZDFlOTAyZmVkODEyZDQ4OGJkMjhkYWUz',
		    sendImmediately: false
	  }
	};
	
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 202) {
			// we're good
			console.log("SMS Sent to: " + options.json.dst);
			onSuccess(response);
		} else {
			onFailure(response.body.error);
		}
	});
};

exports.sendSMS = sendSMS;
