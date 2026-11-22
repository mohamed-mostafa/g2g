/**
 * 
 */

var sendNotificationToOneSignal = function(data, onSuccess, onFailure) {
  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic #ONE_SIGNAL_REST_API_AUTH#"
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
  var https = require('https');
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
      onSuccess();
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
    onFailure(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};

var sendNotification = function(messageBody, userType, userId, onSuccess, onFailure) {
	var message = { 
	  app_id: "#ONE_SIGNAL_APP_ID#",
	  contents: {"en": messageBody},
	};
	 if (userType == "customer" && userId == null) {
		// all customers
		 message.included_segments = ["Registered Customers"];
	} else if (userType == "customer" && userId != null) {
		message.tags = [{"key": "Customer", "relation": "=", "value": "Yes"}, {"key": "CustomerUsername", "relation": "=","value": userId}];
	} else if (userType == "customer" && userId == "anonymous") {
		message.included_segments = ["Anonymous Customers"];
	} else if (userType == "driver" && userId == null)  {
		message.included_segments = ["Drivers"];
	} else if (userType == "driver" && userId != null) {
		message.tags = [{"key": "Driver", "relation": "=", "value": "Yes"}, {"key": "DriverUsername", "relation": "=","value": userId}];
	} else {
		onFailure("Invalid filtration values - UserType: " + userType + ", userId: " + userId);
		return;
	}
	sendNotificationToOneSignal(message, onSuccess, onFailure);
};

exports.sendNotification = sendNotification;
