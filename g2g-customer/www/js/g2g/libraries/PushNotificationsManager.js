/**
 * 
 */

function notificationOpenedCallback (jsonData) {
	try {
		if (Utilities != null && jsonData != null) {
			Utilities.notificationOpenedCallback(jsonData);
		}
	} catch (err) {
		console.log(JSON.stringify(err));
	}
};

function registerAnonymousUser() {
	register();
};

function registerG2GCustomer(customerUsername) {
	try {
		window.plugins.OneSignal.sendTags({
			"Customer" : "Yes",
			"CustomerUsername" : customerUsername,
		});
	} catch (error) {
		console.log("Failed to send tags toh OneSignal. See error below");
		console.log(error);
	}
};

function registerG2GDriver(driverUsername) {
	try {
		window.plugins.OneSignal.sendTags(
				{
					"Driver": "Yes",
					"DriverUsername": driverUsername,
				});
	} catch (error) {
		console.log("Failed to send tags toh OneSignal. See error below");
		console.log(error);
	}
};

function register() {
	try {
		window.plugins.OneSignal.init("#ONE_SIGNAL_APP_ID#", {googleProjectNumber: "#GOOGLE_PROJECT_NUMBER#"}, notificationOpenedCallback);
		window.plugins.OneSignal.enableNotificationsWhenActive(true);
//		window.plugins.OneSignal.enableInAppAlertNotification(true);
		
		// will send tag as anonymous only once in the applicatoin's life time - a value is saved in the applications cache as a flag
		var pnTypeIdentified = window.localStorage.getItem("pnTypeIdentified");
		if (pnTypeIdentified == null || pnTypeIdentified == "") {
			window.plugins.OneSignal.sendTags(
				{
					"Driver": "No",
					"Customer" : "No",
				});
			window.localStorage.setItem("pnTypeIdentified", true);
		}
	} catch (error) {
		console.log("Failed to subscribe with OneSignal. See error below");
		console.log(error);
	}
};

