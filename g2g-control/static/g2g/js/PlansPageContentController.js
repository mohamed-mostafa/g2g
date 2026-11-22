/**
 * 
 */

g2gControlCenterApplication.controller("PlansPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.plans = [];
	
	// validation flags
	$scope.nameMissing = false;
	$scope.deliveryChargeMissing = false;
	$scope.firstTimeDeliveryChargeMissing = false;
	$scope.descriptionMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newPlan = {isDefault: false, deliveryCharge: 0, firstTimeDeliveryCharge: 0};
	$scope.editMode = false;
	
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	
    // functions
	$scope.resetValidationFlags = function() {
		$scope.nameMissing = false;
		$scope.deliveryChargeMissing = false;
		$scope.firstTimeDeliveryChargeMissing = false;
		$scope.descriptionMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newPlanIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newPlan.name == null || $scope.newPlan.name == "") {
			$scope.nameMissing = true;
		}
		
		$scope.resetValidationFlags();
		if ($scope.newPlan.description == null || $scope.newPlan.description == "") {
			$scope.descriptionMissing = true;
		}
//		if ($scope.newPlan.deliveryCharge == null || $scope.newPlan.deliveryCharge == "") {
//			$scope.deliveryChargeMissing = true;
//		}
//		if ($scope.newPlan.firstTimeDeliveryCharge == null || $scope.newPlan.firstTimeDeliveryCharge == "") {
//			$scope.firstTimeDeliveryChargeMissing = true;
//		}
		
		return $scope.nameMissing == false &&
			$scope.descriptionMissing == false &&
			$scope.deliveryChargeMissing == false &&
			$scope.firstTimeDeliveryChargeMissing == false;
	};
	$scope.loadPlans = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/plans")
		.success(
				function(response) {
					$scope.plans = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.plans = [];
			$scope.loading = false;
		});
	};
	$scope.addPlan = function(close) {
		if ($scope.newPlanIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/plans", {plan: $scope.newPlan}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newPlan = {isDefault: false, deliveryCharge: 0, firstTimeDeliveryCharge: 0};
						$scope.plans.push(response);
						if (close) {
							$('#addPlanModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editPlan = function(oldName, plan) {
		$scope.resetValidationFlags();
		if ($scope.newPlanIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/plans", {plan: $scope.newPlan}
			).success(
					function(response) {
						for (var i = 0; i < $scope.plans.length; i++) {
							if ($scope.plans[i].id == $scope.newPlan.id) {
								$scope.plans[i] = $scope.newPlan;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newPlan = {isDefault: false, deliveryCharge: 0, firstTimeDeliveryCharge: 0};
						$('#addPlanModal').modal('hide');
					}
			).error(function(err){
				$scope.newPlan = {isDefault: false, deliveryCharge: 0, firstTimeDeliveryCharge: 0};
				$scope.editMode = false;
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.markPlanDefault = function(planName) {
		$http.post($rootScope.serverURL + "/plan/" + planName + "/markdefault", {}
		).success(
				function() {
					for (var i = 0; i < $scope.plans.length; i++) {
						if ($scope.plans[i].name == planName) {
							$scope.plans[i].isDefault = true;
						} else {
							$scope.plans[i].isDefault = false;
						}
					}
				}
		).error(function(err){
			alert("An error occured at the server side: " + err);
		});
	};
	$scope.openEditDialog = function (plan) {
		$scope.editMode = true;
		$scope.newPlan = plan;
		$('#addPlanModal').modal('show');
	};
	$scope.openAddDialog = function (id) {
		$scope.editMode = false;
		$('#addPlanModal').modal('show');
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#plansTable').dataTable({
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
		$scope.loadPlans();
	};
	
	$scope.initialize();
}]);