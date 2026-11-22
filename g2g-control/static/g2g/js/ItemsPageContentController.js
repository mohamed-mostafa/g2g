/**
 * 
 */

g2gControlCenterApplication.controller("ItemsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.items = [];
	$scope.categoryId = $location.search().categoryId;
	$scope.categoryName = $location.search().categoryName;
	$scope.restaurantId = $location.search().restaurantId;
	$scope.restaurantName = $location.search().restaurantName;
	$scope.editMode = false;
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	// validation flags
	$scope.itemNameMissing = false;
	$scope.itemDescriptionMissing = false;
	$scope.itemPriceMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newItem = {restaurantMenuCategoryId: $scope.categoryId, active: true};
	
    // functions
	$scope.resetValidationFlags = function() {
		$scope.itemNameMissing = false;
		$scope.itemDescriptionMissing = false;
		$scope.itemPriceMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newItemIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newItem.name == null || $scope.newItem.name == "") {
			$scope.itemNameMissing = true;
		}
		if ($scope.newItem.description == null || $scope.newItem.description == "") {
			$scope.itemDescriptionMissing = true;
		}
		
		return $scope.itemNameMissing == false &&
			$scope.itemDescriptionMissing == false &&
			$scope.itemPriceMissing == false;
	};
	$scope.loadItems = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/categories/" + $scope.categoryId + "/items")
		.success(
				function(response) {
					$scope.items = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.items = [];
			$scope.loading = false;
		});
	};
	$scope.addItem = function(close) {
		if ($scope.newItemIsValid()) {
			if ($scope.newItem.price == null || $scope.newItem.price == "") {
				$scope.newItem.price = 0;
			}
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/restaurants/categories/item", {item: $scope.newItem}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newItem = {restaurantMenuCategoryId: $scope.categoryId, active: true};
						$scope.items.push(response);
						if (close) {
							$('#addItemModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editItem = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newItemIsValid()) {
			if ($scope.newItem.price == null || $scope.newItem.price == "") {
				$scope.newItem.price = 0;
			}
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/restaurants/categories/item", {item: $scope.newItem}
			).success(
					function(response) {
						for (var i = 0; i < $scope.items.length; i++) {
							if ($scope.items[i].id == $scope.newItem.id) {
								$scope.items[i] = $scope.newItem;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newItem = {restaurantMenuCategoryId: $scope.categoryId, active: true};
						$('#addItemModal').modal('hide');
					}
			).error(function(err){
				$scope.saving = false;
				$scope.newItem = {restaurantMenuCategoryId: $scope.categoryId, active: true};
				$scope.editMode = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.toggleActivation = function(id) {
		// find the clicked item
		$scope.currentId = id;
		for (var i = 0; i < $scope.items.length; i++) {
			if ($scope.items[i].id == id) {
				$scope.newItem = $scope.items[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newItem.active = !$scope.newItem.active;
		// call the edit function
		$scope.editItem(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.items.length; i++) {
			if ($scope.items[i].id == id) {
				$scope.newItem = $scope.items[i];
			}
		}
		$('#addItemModal').modal('show');
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#itemsTable').dataTable({
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
		$scope.loadItems();
	};
	
	$scope.initialize();
}]);