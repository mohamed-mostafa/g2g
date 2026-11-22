/**
 * 
 */

g2gControlCenterApplication.controller("ZipCodesPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.zipCodes = [];
	$scope.restaurantId = $location.search().restaurantId;
	$scope.loading = false;
	$scope.saving = false;

	// validation flags
	$scope.zipCodeMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newZipCode = "";
	$scope.oldZipCode = "";
	$scope.editMode = false;
    // functions
	$scope.resetValidationFlags = function() {
		$scope.zipCodeMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newZipCodeIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newZipCode == null || $scope.newZipCode == "") {
			$scope.zipCodeMissing = true;
		}
		
		return $scope.zipCodeMissing == false;
	};
	$scope.loadZipCodes = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/" + $scope.restaurantId + "/zipcodes")
		.success(
				function(response) {
					$scope.zipCodes = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.zipCodes = [];
			$scope.loading = false;
		});
	};
	$scope.addZipCode = function(close) {
		if ($scope.newZipCodeIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/restaurants/zipcode", {restaurantId: $scope.restaurantId, zipCode: $scope.newZipCode}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.zipCodes.push($scope.newZipCode);
						$scope.newZipCode = "";
						if (close) {
							$('#addZipCodeModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editZipCode = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newZipCodeIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/restaurants/zipcode", {restaurantId: $scope.restaurantId, oldZipCode: $scope.oldZipCode, zipCode: $scope.newZipCode}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newZipCode = "";
						$('#addRestaurantModal').modal('hide');
					}
			).error(function(err){
				$scope.saving = false;
				$scope.newZipCode = "";
				$scope.editMode = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.openEditDialog = function (zipCode) {
		$scope.editMode = true;
		$scope.oldZipCode = zipCode;
		$('#addZipCodeModal').modal('show');
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#zipCodesTable').dataTable({
	          "bPaginate": true,
	          "bLengthChange": false,
	          "bFilter": false,
	          "bSort": true,
	          "bInfo": true,
	          "bAutoWidth": false
	        });
	      });
	};
	$scope.initialize = function() {
		$scope.loadZipCodes();
	};
	
	$scope.initialize();
}]);