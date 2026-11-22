cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-mauron85-background-geolocation-phonegapbuild/www/backgroundGeoLocation.js",
        "id": "cordova-plugin-mauron85-background-geolocation-phonegapbuild.backgroundGeoLocation",
        "pluginId": "cordova-plugin-mauron85-background-geolocation-phonegapbuild",
        "clobbers": [
            "backgroundGeoLocation"
        ]
    },
    {
        "file": "plugins/nl.x-services.plugins.insomnia/www/Insomnia.js",
        "id": "nl.x-services.plugins.insomnia.Insomnia",
        "pluginId": "nl.x-services.plugins.insomnia",
        "clobbers": [
            "window.plugins.insomnia"
        ]
    },
    {
        "file": "plugins/onesignal-cordova-plugin/www/OneSignal.js",
        "id": "onesignal-cordova-plugin.OneSignal",
        "pluginId": "onesignal-cordova-plugin",
        "clobbers": [
            "OneSignal"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "pluginId": "org.apache.cordova.splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
        "id": "org.apache.cordova.statusbar.statusbar",
        "pluginId": "org.apache.cordova.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/src/browser/DeviceProxy.js",
        "id": "cordova-plugin-device.DeviceProxy",
        "pluginId": "cordova-plugin-device",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-googleplayservices": "19.0.3",
    "cordova-plugin-mauron85-background-geolocation-phonegapbuild": "0.9.4",
    "cordova-plugin-whitelist": "1.2.1",
    "nl.x-services.plugins.insomnia": "4.1.0",
    "onesignal-cordova-plugin": "1.12.3",
    "org.apache.cordova.geolocation": "0.3.12",
    "org.apache.cordova.splashscreen": "1.0.0",
    "org.apache.cordova.statusbar": "0.1.10",
    "cordova-plugin-device": "2.0.3"
}
// BOTTOM OF METADATA
});