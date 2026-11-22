/**
 * 
 */

g2gControlCenterApplication.controller("ConfigurationsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.configList = [];
	$scope.key = null;
	$scope.value = null;
	
	$scope.initialize = function() {
		$http.get($rootScope.serverURL + "/configuration").success(
			function(response) {
				for (var key in response.configurations) {
				    $scope.configList.push({key: key, value: response.configurations[key]});
				}
			}
		).error(function(err) {
			$scope.configList = [];
		});
	};
	
	$scope.updateConfiguration = function(key, value) {
		$http.post($rootScope.serverURL + "/configuration", {key: key, value: value}).success(function() {
			alert("Configuration saved successfully");
		}).error(function(err) {
			alert("Failed to save configuratoin: " + JSON.stringify(err));
		});
	};
	
	$scope.initialize();
}]);