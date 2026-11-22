/**
 * 
 */

g2gControlCenterApplication.controller("AdvertisementsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.adsList = [];
	$scope.loading0 = false;
	$scope.loading1 = false;
	$scope.loading2 = false;
	
	
	$scope.initialize = function() {
		$http.get($rootScope.serverURL + "/allAds").success(
			function(response) {
				for (var i = 0; i < response.length; i++) {
				    $scope.adsList.push({image: response[i].image, id: response[i].id, active: response[i].active});
				}
			}
		).error(function(err) {
			$scope.adsList = [];
		});
	};
	
	$scope.updateImage = function(idx) {
		if (idx == 0) $scope.loading0 = true; else if (idx == 1) $scope.loading1 = true; else if (idx == 2) $scope.loading2 = true;
		$http.post($rootScope.serverURL + "/ad", {image: $scope.adsList[idx].image, id: $scope.adsList[idx].id}).success(function() {
			if (idx == 0) $scope.loading0 = false; else if (idx == 1) $scope.loading1 = false; else if (idx == 2) $scope.loading2 = false;
		}).error(function(err) {
			if (idx == 0) $scope.loading0 = false; else if (idx == 1) $scope.loading1 = false; else if (idx == 2) $scope.loading2 = false;
			alert("Failed to update ad: " + JSON.stringify(err));
		});
	};
	
	$scope.disableAd = function(idx) {
		$http.post($rootScope.serverURL + "/ad/disable", {id: $scope.adsList[idx].id}).success(function() {
			$scope.adsList[idx].active = 0;
			$scope.loading1 = false;
		}).error(function(err) {
			alert("Failed to disable ad: " + JSON.stringify(err));
		});
	};
	
	$scope.enableAd = function(idx) {
		$http.post($rootScope.serverURL + "/ad/enable", {id: $scope.adsList[idx].id}).success(function() {
			$scope.adsList[idx].active = 1;
		}).error(function(err) {
			alert("Failed to enable ad: " + JSON.stringify(err));
		});
	};
	
	$scope.initialize();
}]);