/**
 * 
 */

var applicationVersionMiddleware = function (req, res, next) {
	var app_version = req.headers["g2g-version"];
	if (app_version == null) { // version 1
		res.status(500).send("You're using an outdated version of G2G mobile app. Please visit your app store to upgrade to the latest version.");
	} else {
		next();
	}
}

exports.applicationVersionMiddleware = applicationVersionMiddleware;