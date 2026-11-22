var g2gWebServer = require("./g2g_modules/webserver/g2g_server.js");
var g2gJobsManager = require("./g2g_modules/jobs/g2g_jobs_manager.js");

// start the web server
g2gWebServer.start();

// start the daemons
var enableDaemons = "#ENABLE_DAEMONS#";
if ("TRUE" == enableDaemons.toUpperCase()) {
	g2gJobsManager.startG2GJobs();
	console.log("G2G Daemons Will Start ...")
} else {
	console.log("G2G Daemons Will NOT Start ...")
}