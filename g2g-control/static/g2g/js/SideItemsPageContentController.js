/**
 * 
 */

g2gControlCenterApplication.controller("SideItemsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.sideItems = [];
	$scope.sideGroupId = $location.search().sideGroupId;
	$scope.sideGroupName = $location.search().sideGroupName;
	$scope.itemId = $location.search().itemId;
	$scope.itemName = $location.search().itemName;
	$scope.categoryId = $location.search().categoryId;
	$scope.categoryName = $location.search().categoryName;
	$scope.restaurantId = $location.search().restaurantId;
	$scope.restaurantName = $location.search().restaurantName;
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentId = 0;
	// validation flags
	$scope.sideItemNameMissing = false;
	$scope.sideItemDescriptionMissing = false;
	$scope.sideItemPriceMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newSideItem = {sideGroupId: $scope.sideGroupId, active: true, price: 0};
	$scope.editMode = false;
    // functions
	$scope.resetValidationFlags = function() {
		$scope.sideItemNameMissing = false;
		$scope.sideItemDescriptionMissing = false;
		$scope.sideItemPriceMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newSideItemIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newSideItem.name == null || $scope.newSideItem.name == "") {
			$scope.sideItemNameMissing = true;
		}
		if ($scope.newSideItem.description == null || $scope.newSideItem.description == "") {
			$scope.sideItemDescriptionMissing = true;
		}
		
		return $scope.sideItemNameMissing == false &&
			$scope.sideItemDescriptionMissing == false;
	};
	$scope.loadSideItems = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/categories/items/sidegroups/" + $scope.sideGroupId + "/items")
		.success(
				function(response) {
					$scope.sideItems = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.sideItems = [];
			$scope.loading = false;
		});
	};
	$scope.addSideItem = function(close) {
		if ($scope.newSideItemIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/restaurants/categories/items/sidegroups/sidegroupitem", {sideGroupItem: $scope.newSideItem}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newSideItem = {sideGroupId: $scope.sideGroupId, active: true, price: 0};
						$scope.sideItems.push(response);
						if (close) {
							$('#addSideItemModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editSideItem = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newSideItemIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/restaurants/categories/items/sidegroups/sideitem", {sideItem: $scope.newSideItem}
			).success(
					function(response) {
						for (var i = 0; i < $scope.sideItems.length; i++) {
							if ($scope.sideItems[i].id == $scope.newSideItem.id) {
								$scope.sideItems[i] = $scope.newSideItem;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newSideItem = {sideGroupId: $scope.sideGroupId, active: true, price: 0};
						$('#addSideItemModal').modal('hide');
					}
			).error(function(err){
				$scope.saving = false;
				$scope.newSideItem = {sideGroupId: $scope.sideGroupId, active: true, price: 0};
				$scope.editMode = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.toggleActivation = function(id) {
		// find the clicked item
		$scope.currentId = id;
		for (var i = 0; i < $scope.sideItems.length; i++) {
			if ($scope.sideItems[i].id == id) {
				$scope.newSideItem = $scope.sideItems[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newSideItem.active = !$scope.newSideItem.active;
		// call the edit function
		$scope.editSideItem(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.sideItems.length; i++) {
			if ($scope.sideItems[i].id == id) {
				$scope.newSideItem = $scope.sideItems[i];
			}
		}
		$('#addSideItemModal').modal('show');
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#sideItemsTable').dataTable({
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
		$scope.loadSideItems();
	};
	
	$scope.initialize();
}]);