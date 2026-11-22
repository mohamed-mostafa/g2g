/**
 * 
 */

g2gControlCenterApplication.controller("CustomersInsightsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
    $scope.registeredUsersCount = 0;
    $scope.lockedUsersCount = 0;
    $scope.activeUsersCount = 0;
    $scope.awaitingActivationUsersCount = 0;
    $scope.silentUsersCount = 0;
    $scope.returningUsersCount = 0;
    $scope.oneTimeUsersCount = 0;
    $scope.coveredUsersCount = 0;
    $scope.uncoveredUsersCount = 0;
    $scope.multipleTimesUsersCount = 0;
    
	$scope.serverError = false;
	$scope.serverErrorMessage = null;
    // functions
	$scope.refreshRegisteredUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/count").success(
			function(response) {
				$scope.registeredUsersCount = response.registeredUsersIds;
			}
		).error(function(err){
			$scope.registeredUsersCount = null;
		});
	};
	$scope.refreshLockedUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/lockedcount").success(
			function(response) {
				$scope.lockedUsersCount = response.lockedUsersIds;
			}
		).error(function(err){
			$scope.lockedUsersCount = null;
		});
	};
	$scope.refreshAwaitingActivationUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/awaitingactivationcount").success(
			function(response) {
				$scope.awaitingActivationUsersCount = response.awaitingActivationUsersIds;
			}
		).error(function(err){
			$scope.awaitingActivationUsersCount = null;
		});
	};
	$scope.refreshCoveredUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/coveredcount").success(
			function(response) {
				$scope.coveredUsersCount = response.coveredUsersIds;
			}
		).error(function(err){
			$scope.coveredUsersCount = null;
		});
	};
	$scope.refreshUnCoveredUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/uncoveredcount").success(
			function(response) {
				$scope.uncoveredUsersCount = response.uncoveredUsersIds;
			}
		).error(function(err){
			$scope.uncoveredUsersCount = null;
		});
	};
	$scope.refreshSilentUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/silentcount").success(
			function(response) {
				$scope.silentUsersCount = response.silentUsersIds;
			}
		).error(function(err){
			$scope.silentUsersCount = null;
		});
	};
	$scope.refreshOneTimeUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/onetimecount").success(
			function(response) {
				$scope.oneTimeUsersCount = response.oneTimeUsersIds;
			}
		).error(function(err){
			$scope.registeredUsersCount = null;
		});
	};
	$scope.refreshMultipleTimersUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/multipletimescount").success(
			function(response) {
				$scope.multipleTimesUsersCount = response.multipleTimersUsersIds;
			}
		).error(function(err){
			$scope.multipleTimesUsersCount = null;
		});
	};
	$scope.refreshActiveUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/activecount").success(
			function(response) {
				$scope.activeUsersCount = response.activeUsersIds;
			}
		).error(function(err){
			$scope.activeUsersCount = null;
		});
	};
	$scope.refreshReturningUsersCount = function() {
		$http.get($rootScope.serverURL + "/user/users/returningcount").success(
			function(response) {
				$scope.returningUsersCount = response.returningUsersIds;
			}
		).error(function(err){
			$scope.returningUsersCount = null;
		});
	};
	$scope.refreshContent = function() {
		$scope.refreshRegisteredUsersCount();
		$scope.refreshLockedUsersCount();
		$scope.refreshAwaitingActivationUsersCount();
		$scope.refreshCoveredUsersCount();
		$scope.refreshUnCoveredUsersCount();
		$scope.refreshSilentUsersCount();
		$scope.refreshOneTimeUsersCount();
		$scope.refreshActiveUsersCount();
		$scope.refreshReturningUsersCount();
		$scope.refreshMultipleTimersUsersCount();
	};
	// refresh the numbers every 30 seconds
	$scope.refreshContent(); // refresh once
	window.setInterval($scope.refreshContent, 30000); // set the timer
}]);