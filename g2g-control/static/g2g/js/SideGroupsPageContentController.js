/**
 * 
 */

g2gControlCenterApplication.controller("SideGroupsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.sideGroups = [];
	$scope.categoryItems = [];
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
	$scope.sideGroupNameMissing = false;
	$scope.sideGroupMaximumAllowedItemsMissing = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	// form fields
	$scope.newSideGroup = {restaurantMenuCategoryItemId: $scope.itemId, active: true};
	$scope.editMode = false;
    // functions
	$scope.resetValidationFlags = function() {
		$scope.sideGroupNameMissing = false;
		$scope.sideGroupMaximumAllowedItemsMissing = false;
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
	};
	$scope.newSideGroupIsValid = function() {
		$scope.resetValidationFlags();
		if ($scope.newSideGroup.name == null || $scope.newSideGroup.name == "") {
			$scope.sideGroupNameMissing = true;
		}
		if ($scope.newSideGroup.maximumAllowedItems == null || $scope.newSideGroup.maximumAllowedItems == "") {
			$scope.sideGroupMaximumAllowedItemsMissing = true;
		}
		
		return $scope.sideGroupNameMissing == false &&
			$scope.sideGroupMaximumAllowedItemsMissing == false;
	};
	$scope.loadSideGroups = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/categories/items/" + $scope.itemId + "/sidegroups")
		.success(
				function(response) {
					$scope.sideGroups = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.sideGroups = [];
			$scope.loading = false;
		});
	};
	$scope.addSideGroup = function(close) {
		if ($scope.newSideGroupIsValid()) {
			$scope.saving = true;
			$http.put($rootScope.serverURL + "/restaurants/categories/items/sidegroup", {sideGroup: $scope.newSideGroup}
			).success(
					function(response) {
						$scope.saving = false;
						$scope.newSideGroups = {restaurantMenuCategoryItemId: $scope.itemId, active: true};
						$scope.sideGroups.push(response);
						if (close) {
							$('#addSideGroupModal').modal('hide');
						}
					}
			).error(function(err){
				$scope.saving = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.editSideGroup = function(id) {
		$scope.resetValidationFlags();
		if ($scope.newSideGroupIsValid()) {
			$scope.saving = true;
			$http.post($rootScope.serverURL + "/restaurants/categories/items/sidegroup", {sideGroup: $scope.newSideGroup}
			).success(
					function(response) {
						for (var i = 0; i < $scope.sideGroups.length; i++) {
							if ($scope.sideGroups[i].id == $scope.newSideGroup.id) {
								$scope.sideGroups[i] = $scope.newSideGroup;
								break;
							}
						}
						$scope.saving = false;
						$scope.editMode = false;
						$scope.newSideGroup = {restaurantMenuCategoryItemId: $scope.itemId, active: true};
						$('#addSideGroupModal').modal('hide');
					}
			).error(function(err){
				$scope.newSideGroup = {restaurantMenuCategoryItemId: $scope.itemId, active: true};
				$scope.saving = false;
				$scope.editMode = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = "An error occured at the server side: " + err;
			});
		}
	};
	$scope.toggleActivation = function(id) {
		// find the clicked item
		$scope.currentId = id;
		for (var i = 0; i < $scope.sideGroups.length; i++) {
			if ($scope.sideGroups[i].id == id) {
				$scope.newSideGroup = $scope.sideGroups[i];
				break;
			}
		}
		// toggle its active attribute
		$scope.newSideGroup.active = !$scope.newSideGroup.active;
		// call the edit function
		$scope.editSideGroup(id);
	};
	$scope.openEditDialog = function (id) {
		$scope.editMode = true;
		for (var i = 0; i < $scope.sideGroups.length; i++) {
			if ($scope.sideGroups[i].id == id) {
				$scope.newSideGroup = $scope.sideGroups[i];
			}
		}
		$('#addSideGroupModal').modal('show');
	};
	$scope.openCopyToOtherItemsDialog = function(sideGroup) {
		$('#copySideGroupModal').modal('show');
		$scope.newSideGroup = sideGroup;
	};
	$scope.copyToSelectedItems = function() {
		$scope.saving = true;
		var itemIds = [];
		for (var i = 0; i < $scope.categoryItems.length; i++) {
			if ($scope.categoryItems[i].selected) {
				itemIds.push($scope.categoryItems[i].id);
			}
		}
		$http.post($rootScope.serverURL + "/restaurants/categories/items/sidegroup/copy", {sideGroup: $scope.newSideGroup, restaurantMenuCategoryId: $scope.categoryId, itemIds: itemIds}
		).success(
				function(response) {
					$scope.saving = false;
					alert("Copy completed");
				}
		).error(function(err){
			$scope.saving = false;
			alert("An error occured at the server side: " + JSON.stringify(err));
		});
	};
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#sideGroupsTable').dataTable({
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
		$scope.loadSideGroups();
		$scope.loadCategoryItems();
	};
	$scope.loadCategoryItems = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/restaurants/categories/" + $scope.categoryId + "/items")
		.success(
				function(response) {
					for (var i = 0; i < response.length; i++) {
						if (response[i].id != $scope.itemId) {
							$scope.categoryItems.push(response[i]);
						}
					}
					$scope.loading = false;
				})
		.error(function(err){
			$scope.categoryItems = [];
			$scope.loading = false;
		});
	};
	
	$scope.initialize();
}]);