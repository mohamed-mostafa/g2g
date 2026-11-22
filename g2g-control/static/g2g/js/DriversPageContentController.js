/**
 * 
 */

g2gControlCenterApplication.controller("DriversPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.drivers = [];
	
	// validation flags
	$scope.usernameMissing = false;
	$scope.passwordMissing = false;
	$scope.fullNameMissing = false;
	$scope.phoneMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newDriver = {active: true};
	$scope.editMode = false;
	
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	
    // functions
	$scope.resetValidationFlags = function() {
		$scope.usernameMissing = false;
		$scope.passwordMissing = false;
		$scope.fullNameMissing = false;
		$scope.phoneMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newDriverIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newDriver.username == null || $scope.newDriver.username == "") {
			$scope.usernameMissing = true;
		}
		if ($scope.newDriver.password == null || $scope.newDriver.password == "") {
			$scope.passwordMissing = true;
		}
		if ($scope.newDriver.fullName == null || $scope.newDriver.fullName == "") {
			$scope.fullNameMissing = true;
		}
		if ($scope.newDriver.phone == null || $scope.newDriver.phone == "") {
			$scope.phoneMissing = true;
		}
		
		return $scope.usernameMissing == false &&
			$scope.passwordMissing == false &&
			$scope.fullNameMissing == false &&
			$scope.phoneMissing == false;
	};
	$scope.loadDrivers = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/drivers")
		.success(
				function(response) {
					$scope.drivers = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.drivers = [];
			$scope.loading = false;
		});
	};
	$scope.addDriver = function(close) {
		if ($scope.newDriverIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/drivers", {driver: $scope.newDriver}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newDriver = {active: true};
						$scope.drivers.push(response);
						if (close) {
							$('#addDriverModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editDriver = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newDriverIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/drivers", {driver: $scope.newDriver}
			).success(
					function(response) {
						for (var i = 0; i < $scope.drivers.length; i++) {
							if ($scope.drivers[i].id == $scope.newDriver.id) {
								$scope.drivers[i] = $scope.newDriver;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newDriver = {active: true};
						$('#addDriverModal').modal('hide');
					}
			).error(function(err){
				$scope.newDriver = {};
				$scope.editMode = false;
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.toggleActivation = function(id) {
		// find the clicked item
		$scope.currentId = id;
		for (var i = 0; i < $scope.drivers.length; i++) {
			if ($scope.drivers[i].id == id) {
				$scope.newDriver = $scope.drivers[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newDriver.active = !$scope.newDriver.active;
		// call the edit function
		$scope.editDriver(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.drivers.length; i++) {
			if ($scope.drivers[i].id == id) {
				$scope.newDriver = $scope.drivers[i];
			}
		}
		$('#addDriverModal').modal('show');
	};
	$scope.openAddDialog = function (id) {
		$scope.editMode = false;
		$('#addDriverModal').modal('show');
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#driversTable').dataTable({
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
		$scope.loadDrivers();
	};
	
	$scope.initialize();
}]);