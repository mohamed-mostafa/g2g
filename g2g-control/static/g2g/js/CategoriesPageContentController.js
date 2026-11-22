/**
 * 
 */

g2gControlCenterApplication.controller("CategoriesPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	
	
	// fields
	$scope.categories = [];
	$scope.restaurantId = $location.search().restaurantId;
	$scope.restaurantName = $location.search().restaurantName;
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	// validation flags
	$scope.categoryNameMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newCategory = {restaurantId: $scope.restaurantId, active: true};
	$scope.editMode = false;
    // functions
	$scope.resetValidationFlags = function() {
		$scope.categoryNameMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newCategoryIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newCategory.name == null || $scope.newCategory.name == "") {
			$scope.categoryNameMissing = true;
		}
		
		return $scope.categoryNameMissing == false;
	};
	$scope.loadCategories = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/" + $scope.restaurantId  + "/restaurantMenuCategories")
		.success(
				function(response) {
					$scope.categories = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.categories = [];
			$scope.loading = false;
		});
	};
	$scope.addCategory = function(close) {
		if ($scope.newCategoryIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/restaurants/category", {category: $scope.newCategory}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newCategory = {restaurantId: $scope.restaurantId, active: true};
						$scope.categories.push(response);
						if (close) {
							$('#addCategoryModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editCategory = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newCategoryIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/restaurants/category", {category: $scope.newCategory}
			).success(
					function(response) {
						for (var i = 0; i < $scope.categories.length; i++) {
							if ($scope.categories[i].id == $scope.newCategory.id) {
								$scope.categories[i] = $scope.newCategory;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newCategory = {restaurantId: $scope.restaurantId, active: true};
						$('#addCategoryModal').modal('hide');
					}
			).error(function(err){
				$scope.newCategory = {restaurantId: $scope.restaurantId, active: true};
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
		for (var i = 0; i < $scope.categories.length; i++) {
			if ($scope.categories[i].id == id) {
				$scope.newCategory = $scope.categories[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newCategory.active = !$scope.newCategory.active;
		// call the edit function
		$scope.editCategory(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.categories.length; i++) {
			if ($scope.categories[i].id == id) {
				$scope.newCategory = $scope.categories[i];
			}
		}
		$('#addCategoryModal').modal('show');
		return false;
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#categoriesTable').dataTable({
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
		$scope.loadCategories();
	};
	
	$scope.initialize();
}]);