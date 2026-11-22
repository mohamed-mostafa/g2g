/**
 * 
 */

g2gControlCenterApplication.controller("RestaurantsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.restaurants = [];
	
	// validation flags
	$scope.restaurantNameMissing = false;
	$scope.restaurantLocationMissing = false;
	$scope.restaurantCuisineMissing = false;
	$scope.restaurantStreetAddressMissing = false;
	$scope.restaurantCityMissing = false;
	$scope.restaurantStateMissing = false;
	$scope.restaurantZipCodeMissing = false;
	$scope.restaurantDeliveryChargeMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newRestaurant = {partner: false, active: true};
	$scope.editMode = false;
	
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	
	// working hours
	$scope.sundayWorkingHours = "";
	$scope.mondayWorkingHours = "";
	$scope.tuesdayWorkingHours = "";
	$scope.wednesdayWorkingHours = "";
	$scope.thursdayWorkingHours = "";
	$scope.fridayWorkingHours = "";
	$scope.saturdayWorkingHours = "";
	
    // functions
	$scope.resetValidationFlags = function() {
		$scope.restaurantNameMissing = false;
		$scope.restaurantLocationMissing = false;
		$scope.restaurantCuisineMissing = false;
		$scope.restaurantStreetAddressMissing = false;
		$scope.restaurantCityMissing = false;
		$scope.restaurantStateMissing = false;
		$scope.restaurantZipCodeMissing = false;
		$scope.restaurantDeliveryChargeMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newRestaurantIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newRestaurant.name == null || $scope.newRestaurant.name == "") {
			$scope.restaurantNameMissing = true;
		}
		if ($scope.newRestaurant.location == null || $scope.newRestaurant.location == "") {
			$scope.restaurantLocationMissing = true;
		}
		if ($scope.newRestaurant.cuisine == null || $scope.newRestaurant.cuisine == "") {
			$scope.restaurantCuisineMissing = true;
		}
		if ($scope.newRestaurant.streetAddress == null || $scope.newRestaurant.streetAddress == "") {
			$scope.restaurantStreetAddressMissing = true;
		}
		if ($scope.newRestaurant.city == null || $scope.newRestaurant.city == "") {
			$scope.restaurantCityMissing = true;
		}
		if ($scope.newRestaurant.state == null || $scope.newRestaurant.state == "") {
			$scope.restaurantStateMissing = true;
		}
		if ($scope.newRestaurant.zipCode == null || $scope.newRestaurant.zipCode == "") {
			$scope.restaurantZipCodeMissing = true;
		}
		if ($scope.newRestaurant.partner == true && ($scope.newRestaurant.deliveryCharge == null || $scope.newRestaurant.deliveryCharge == "")) {
			$scope.restaurantDeliveryChargeMissing = true;
		}
		
		return $scope.restaurantNameMissing == false &&
			$scope.restaurantLocationMissing == false &&
			$scope.restaurantCuisineMissing == false &&
			$scope.restaurantStreetAddressMissing == false &&
			$scope.restaurantCityMissing == false &&
			$scope.restaurantStateMissing == false &&
			$scope.restaurantDeliveryChargeMissing == false &&
			$scope.restaurantZipCodeMissing == false;
	};
	$scope.loadRestaurants = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants")
		.success(
				function(response) {
					$scope.restaurants = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.restaurants = [];
			$scope.loading = false;
		});
	};
	$scope.addRestaurant = function(close) {
		if ($scope.newRestaurantIsValid()) {
			$scope.saving = true;
			$scope.workingHoursVariablesToString();
			$http.put($rootScope.serverURL + "/restaurants", {restaurant: $scope.newRestaurant}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newRestaurant = {partner: false, active: true};
						$scope.restaurants.push(response);
						if (close) {
							$('#addRestaurantModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editRestaurant = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newRestaurantIsValid()) {
			$scope.saving = true;
			$scope.workingHoursVariablesToString();
			$http.post($rootScope.serverURL + "/restaurants", {restaurant: $scope.newRestaurant}
			).success(
					function(response) {
						for (var i = 0; i < $scope.restaurants.length; i++) {
							if ($scope.restaurants[i].id == $scope.newRestaurant.id) {
								$scope.restaurants[i] = $scope.newRestaurant;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newRestaurant = {partner: false, active: true};
						$('#addRestaurantModal').modal('hide');
					}
			).error(function(err){
				$scope.newRestaurant = {};
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
		for (var i = 0; i < $scope.restaurants.length; i++) {
			if ($scope.restaurants[i].id == id) {
				$scope.newRestaurant = $scope.restaurants[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newRestaurant.active = !$scope.newRestaurant.active;
		// call the edit function
		$scope.editRestaurant(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.restaurants.length; i++) {
			if ($scope.restaurants[i].id == id) {
				$scope.newRestaurant = $scope.restaurants[i];
				$scope.workingHoursStringToVariables();
			}
		}
		$('#addRestaurantModal').modal('show');
	};
	$scope.workingHoursStringToVariables = function() {
		var workingHours = $scope.newRestaurant.workingHours.split("|");
		$scope.sundayWorkingHours = workingHours[0];
		$scope.mondayWorkingHours = workingHours[1];
		$scope.tuesdayWorkingHours = workingHours[2];
		$scope.wednesdayWorkingHours = workingHours[3];
		$scope.thursdayWorkingHours = workingHours[4];
		$scope.fridayWorkingHours = workingHours[5];
		$scope.saturdayWorkingHours = workingHours[6];
	};
	$scope.exportRestaurantItems = function(restaurantId) {
		window.location = $rootScope.serverURL + "/restaurantitems/" + restaurantId;
	};
	$scope.workingHoursVariablesToString = function() {
		$scope.newRestaurant.workingHours = $scope.sundayWorkingHours + "|" + $scope.mondayWorkingHours + "|" + $scope.tuesdayWorkingHours + "|" + $scope.wednesdayWorkingHours + "|" + $scope.thursdayWorkingHours + "|" + $scope.fridayWorkingHours + "|" + $scope.saturdayWorkingHours;
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#restaurantsTable').dataTable({
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
		$scope.loadRestaurants();
	};
	
	$scope.initialize();
}]);