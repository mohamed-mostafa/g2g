/**
 * 
 */

g2gControlCenterApplication.controller("HomePageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
    $scope.newOrdersCount = 0;
    $scope.inProgressOrdersCount = 0;
    $scope.completedOrdersCount = 0;
    $scope.registeredUsersCount = 0;
    $scope.currentOrders = [];
    $scope.drivers = [];
    $scope.restaurants = [];
    $scope.statuses = [{id: "PLACED", name: "Placed"}, {id: "RECEIVED", name: "Received"}, {id: "BEING_PREPARED", name: "Being Prepared"}, {id: "PICKED_UP", name: "Picked Up"}, {id: "DELIVERED", name:"Delivered"}, {id: "REFUNDED", name:"Refunded"}];
    $scope.ratings = [{id: 1, name:"1 Star"}, {id: 2, name:"2 Stars"}, {id: 3, name:"3 Stars"}, {id: 4, name:"4 Stars"}, {id: 5, name:"5 Stars"}];
    $scope.refreshingNewOrdersCount = false;
    $scope.refreshingCompletedOrdersCount = false;
    $scope.refreshingInProgressOrdersCount = false;
    $scope.refreshingRegisteredUsersCount = false;
    $scope.refreshingOrders = false;
	$scope.markingOrder = false;
	$scope.currentOrder = null;
	$scope.currentDriver = null;
	$scope.sms = "";
	$scope.refundReason = "";
	$scope.moreTime = {minutes: 0, reason: ""};
	$scope.searchCriteria = {
			restaurant: null,
			driver: null,
			customerName: null,
			customerZipCode: null,
			customerCity: null,
			placedAtRange: {from: null, to: null},
			status: null,
			rating: null,
			onTime: false,
			excludeArchived: false,
	};
	$scope.newRestaurantStreetAddress = "";
	$scope.newRestaurantCity = "";
	$scope.newRestaurantZipCode = "";
	$scope.loading = false;
	$scope.sendingSMS = false;
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	$scope.map = null;
	$scope.availableDrivers = [];
    // functions
	$scope.refreshNewOrdersCount = function() {
		$scope.refreshingNewOrdersCount = true;
		$http.get($rootScope.serverURL + "/order/status/placed/count").success(
			function(response) {
				$scope.newOrdersCount = response.count;
				$scope.refreshingNewOrdersCount = false;
			}
		).error(function(err){
			$scope.newOrdersCount = "N/A";
			$scope.refreshingNewOrdersCount = false;
		});
	};
	$scope.refreshInProgressOrdersCount = function() {
		$scope.refreshingInProgressOrdersCount = true;
		$http.get($rootScope.serverURL + "/order/status/inprogress/count").success(
			function(response) {
				$scope.inProgressOrdersCount = response.count;
				$scope.refreshingInProgressOrdersCount = false;
			}
		).error(function(err){
			$scope.inProgressOrdersCount = "N/A";
			$scope.refreshingInProgressOrdersCount = false;
		});
	};
	$scope.refreshCompletedOrdersCount = function() {
		$scope.refreshingCompletedOrdersCount = true;
		$http.get($rootScope.serverURL + "/order/status/delivered/count").success(
			function(response) {
				$scope.completedOrdersCount = response.count;
				$scope.refreshingCompletedOrdersCount = false;
			}
		).error(function(err){
			$scope.completedOrdersCount = "N/A";
			$scope.refreshingCompletedOrdersCount = false;
		});
	};
	$scope.refreshRegisteredUsersCount = function() {
		$scope.refreshingRegisteredUsersCount = true;
		$http.get($rootScope.serverURL + "/user/users/count").success(
			function(response) {
				$scope.registeredUsersCount = response.registeredUsersIds;
				$scope.refreshingRegisteredUsersCount = false;
			}
		).error(function(err){
			$scope.registeredUsersCount = "N/A";
			$scope.refreshingRegisteredUsersCount = false;
		});
	};
	$scope.collapseAdvancedSearchIfExpanded = function() {
		var advancedSearchBoxExpanded = $('#collapseExpandIcon').hasClass('fa-minus');
		if (advancedSearchBoxExpanded) {
			$('#collapseExpandBtn').trigger('click');
		}
	};
	$scope.refreshNewOrders = function() {
		$scope.refreshingOrders = true;
		$scope.collapseAdvancedSearchIfExpanded();
		$http.get($rootScope.serverURL + "/order/status/placed").success(
				function(response) {
					$scope.currentOrders = response;
					$scope.refreshingOrders = false;
				}
		).error(function(err){
			$scope.currentOrders = [];
			$scope.refreshingOrders = false;
		});
	};
	$scope.refreshInProgressOrders = function() {
		$scope.collapseAdvancedSearchIfExpanded();
		$scope.refreshingOrders = true;
		$http.get($rootScope.serverURL + "/order/status/inprogress").success(
				function(response) {
					$scope.currentOrders = response;
					$scope.refreshingOrders = false;
				}
		).error(function(err){
			$scope.currentOrders = [];
			$scope.refreshingOrders = false;
		});
	};
	$scope.refreshCompletedOrders = function() {
		$scope.collapseAdvancedSearchIfExpanded();
		$scope.refreshingOrders = true;
		$http.get($rootScope.serverURL + "/order/status/delivered").success(
				function(response) {
					$scope.currentOrders = response;
					$scope.refreshingOrders = false;
				}
		).error(function(err){
			$scope.currentOrders = [];
			$scope.refreshingOrders = false;
		});
	};
	$scope.searchOrders = function() {
		$scope.refreshingOrders = true;
		$http.post($rootScope.serverURL + "/orders/search", {searchCriteria: $scope.searchCriteria}).success(
				function(response) {
					$scope.currentOrders = response;
					$scope.refreshingOrders = false;
				}
		).error(function(err){
			$scope.currentOrders = [];
			$scope.refreshingOrders = false;
		});
	};
	$scope.searchOrdersAndExport = function() {
		$scope.refreshingOrders = true;
		$http.post($rootScope.serverURL + "/orders/search", {searchCriteria: $scope.searchCriteria}).success(
				function(response) {
					$scope.currentOrders = response;
					$scope.refreshingOrders = false;
					window.location = $rootScope.serverURL + "/orders/searchAndExport" + "?searchCriteria=" + JSON.stringify($scope.searchCriteria);
				}
		).error(function(err){
			$scope.currentOrders = [];
			$scope.refreshingOrders = false;
		});
	};
	$scope.markOrderDelivered = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/delivered", {orderId: order.id}).success(
			function() {
				order.status = 'DELIVERED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderReceived = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/received", {orderId: order.id}).success(
			function() {
				order.status = 'RECEIVED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderArchived = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/archive", {orderId: order.id}).success(
			function() {
				if (order.status == 'DELIVERED')
					order.status = 'DELIVERED_ARCHIVED';
				else if (order.status = 'REFUNDED')
					order.status = 'REFUNDED_ARCHIVED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderUnArchived = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/unarchive", {orderId: order.id}).success(
			function() {
				if (order.status == 'DELIVERED_ARCHIVED')
					order.status = 'DELIVERED';
				else if (order.status = 'REFUNDED_ARCHIVED')
					order.status = 'REFUNDED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderPlaced = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/placed", {orderId: order.id}).success(
			function() {
				order.status = 'PLACED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderBeingPrepared = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/beingprepared", {orderId: order.id}).success(
			function() {
				order.status = 'BEING_PREPARED';
				$scope.markingOrder = false;
				$scope.refreshContent();
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.markOrderPickedUp = function(order) {
		$scope.markingOrder = true;
		$http.post($rootScope.serverURL + "/order/status/pickedup", {orderId: order.id}).success(
			function() {
				order.status = 'PICKED_UP';
				$scope.markingOrder = false;
				$scope.refreshContent();
				
				
				// load the order itself, and set it to 'currentOrder' variable
				$http.get($rootScope.serverURL + "/order/" + order.id).success(
						function(response) {
							$scope.loading = false;
							$scope.currentOrder = response;
							$scope.openSendDriverSMSAtPickedUpDialog($scope.currentOrder);
						}
					).error(function(err) {
						$scope.serverError = true;
						$scope.serverErrorMessage = err;
						$scope.loading = false;
					});
				
			}
		).error(function(err) {
			$scope.markingOrder = false;
		});
	};
	$scope.refreshContent = function() {
		$scope.refreshNewOrdersCount();
		$scope.refreshInProgressOrdersCount();
		$scope.refreshCompletedOrdersCount();
		$scope.refreshRegisteredUsersCount();
	};
	$scope.openFullDetailsDialog = function(orderId) {
		$scope.loading = true;
		$scope.serverError = false;
		$('#orderDetailsModal').modal('show');
		$http.get($rootScope.serverURL + "/order/" + orderId).success(
				function(response) {
					$scope.loading = false;
					$scope.currentOrder = response;
					
					// set some extra calculated values in the order
					var diff = new Date($scope.currentOrder.eta).getTime() - new Date().getTime();
					var minutes = diff / (1000 * 60);
					if (minutes > 0)
						$scope.currentOrder.remainingTime = parseInt(minutes);
					else
						$scope.currentOrder.remainingTime = "ETA has passed " + parseInt(minutes) * -1 + " minutes ago.";
				}
			).error(function(err) {
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
				$scope.loading = false;
			});
	};
	$scope.openAssignDriverDialog = function(order) {
		$scope.currentOrder = order;
		$('#assignDriverModal').modal('show');
	};
	$scope.openUpdateRestaurantAddressDialog = function(order) {
		$scope.currentOrder = order;
		$scope.newRestaurantStreetAddress = order.restaurantStreetAddress;
		$scope.newRestaurantCity = order.restaurantCity;
		$scope.newRestaurantZipCode = order.restaurantZipCode;
		$('#updateRestaurantAddressrModal').modal('show');
	};
	$scope.updateRestaurantAddress = function() {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/order/restaurantaddress", {orderId: $scope.currentOrder.id, newRestaurantStreetAddress: $scope.newRestaurantStreetAddress, newRestaurantCity: $scope.newRestaurantCity, newRestaurantZipCode: $scope.newRestaurantZipCode }).success(
				function() {
					$scope.loading = false;
					$('#updateRestaurantAddressrModal').modal('hide');
					$scope.openAssignDriverDialog($scope.currentOrder);
				}
			).error(function(err) {
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
				$scope.loading = false;
			});
	};
	$scope.skipUpdateRestaurantAddress = function() {
		$('#updateRestaurantAddressrModal').modal('hide');
		$scope.openAssignDriverDialog($scope.currentOrder);
	};
	$scope.openSMSCustomer = function(order) {
		$scope.currentOrder = order;
		$('#sendCustomerSMS').modal('show');
	};
	$scope.openSendDriverSMSAtAssignDialog = function(order) {
		$scope.sms = "Dear " + $scope.currentDriver.fullName + "\r" + 
		"Please Pickup order: " + order.id;
		for (var i = 0; i < order.items.length; i++) {
			$scope.sms += "\r- " + order.items[i].quantity + " x " + order.items[i].name;
			if (order.items[i].sides != null && order.items[i].sides != "") {
				$scope.sms += "\r-- Sides: " + order.items[i].sides;
			}
			if (order.items[i].specialInstructions != null && order.items[i].specialInstructions != "") {
				$scope.sms += "\r--   Special Instructions: " + order.items[i].specialInstructions;
			}
		}
		$scope.sms += "\rFrom:\r";
		$scope.sms += "- " + order.restaurant.name + ", ";
		$scope.sms += order.restaurant.streetAddress + ", " + order.restaurant.zipCode;
		$('#sendDriverSMS').modal('show');
	};
	$scope.openSendDriverSMSAtPickedUpDialog = function(order) {
		$scope.sms = "Please Deliver order: " + order.id;
		$scope.sms += "\rTo: " + order.deliveryUserFullName;
		$scope.sms += "\r" + order.deliveryStreetAddress1;
		if (order.deliveryStreetAddress2 != null && order.deliveryStreetAddress2 != "") $scope.sms += " " + order.deliveryStreetAddress2;
		$scope.sms += " " + order.deliveryCity;
		$scope.sms += " " + order.deliveryZipCode;
		if (order.specialInstructions != null && order.specialInstructions != "") $scope.sms += "\rSpecial Instructions: " + order.specialInstructions;
		if (order.deliveryAddressDetails != null && order.deliveryAddressDetails != "") $scope.sms += "\rMore Address Details: " + order.deliveryAddressDetails;
		$scope.sms += "\r" + order.deliveryUserPhone;
		$('#sendDriverSMS').modal('show');
	};
	$scope.sendSMS = function() {
		$scope.sendingSMS = true;
		$http.put($rootScope.serverURL + "/sms", {to: $scope.currentDriver.phone, text: $scope.sms}).success(
				function(response) {
					$scope.sendingSMS = false;
					$('#sendDriverSMS').modal('hide');
				}
			).error(function(err) {
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
				$scope.sendingSMS = false;
			});
	};
	$scope.sendSMSToCustomer = function() {
		$scope.sendingSMS = true;
		$http.put($rootScope.serverURL + "/sms", {to: $scope.currentOrder.deliveryUserPhone, text: $scope.sms}).success(
				function(response) {
					$scope.sendingSMS = false;
					$('#sendCustomerSMS').modal('hide');
				}
			).error(function(err) {
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
				$scope.sendingSMS = false;
			});
	};
	$scope.assignDriver = function() {
		$scope.loading = true;
		$scope.serverError = false;
		$http.post($rootScope.serverURL + "/order/" + $scope.currentOrder.id + "/driver", {driverId: $scope.currentDriver.id}).success(
			function(response) {
				$scope.loading = false;
				
				// load the order itself, and set it to 'currentOrder' variable
				$http.get($rootScope.serverURL + "/order/" + $scope.currentOrder.id).success(
						function(response) {
							$scope.loading = false;
							$scope.currentOrder = response;
							$('#assignDriverModal').modal('hide');
							
							$scope.openSendDriverSMSAtAssignDialog($scope.currentOrder);
						}
					).error(function(err) {
						$scope.serverError = true;
						$scope.serverErrorMessage = err;
						$scope.loading = false;
					});
				
			}
		).error(function(err) {
			$scope.serverError = true;
			$scope.serverErrorMessage = err;
			$scope.loading = false;
		});
	};
	$scope.loadDrivers = function() {
		$http.get($rootScope.serverURL + "/drivers/active"
		).success(
			function(response) {
				$scope.drivers = response;
			}
		).error(function(err){
			$scope.drivers = [];
		});
	};
	$scope.loadRestaurants = function() {
		$http.get($rootScope.serverURL + "/restaurants"
		).success(
			function(response) {
				$scope.restaurants = response;
			}
		).error(function(err){
			$scope.restaurants = [];
		});
	};
	$scope.refundOrder = function() {
		if ($scope.refundReason == "") {
			$scope.serverError = true;
			$scope.serverErrorMessage = "Please provide a reason for the refund";
			return;
		}
		$scope.loading = true;
		$scope.serverError = false;
		$http.post($rootScope.serverURL + "/order/" + $scope.currentOrder.id + "/refund",{refundReason: $scope.refundReason}).success(
			function(response) {
				$scope.loading = false;
				 $scope.currentOrder.status = 'REFUNDED';
				 $('#refundOrderDialog').modal('hide');
				 
			}
		).error(function(err) {
			$scope.serverError = true;
			$scope.serverErrorMessage = err;
			$scope.loading = false;
		});
	};
	$scope.openRefundOrder = function(order) {
		$('#refundOrderDialog').modal('show');
	};
	$scope.showAddMoreTimeDialog = function() {
		$('#addMoreTime').modal('show');
	};
	$scope.submitAddMoreTime = function() {
		$scope.loading = true;
		$scope.serverError = false;
		$http.post($rootScope.serverURL + "/order/eta", {orderId: $scope.currentOrder.id, minutes: $scope.moreTime.minutes, message: $scope.moreTime.reason}).success(
				function(response) {
					$scope.openFullDetailsDialog($scope.currentOrder.id);
					$scope.loading = false;
					$('#addMoreTime').modal('hide');
				}
			).error(function(err) {
				$scope.loading = false;
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
			});
	};	
	
	$scope.initializeMap = function() {
		$scope.map = new google.maps.Map(document.getElementById('googleMap'), {
			zoom: 11,
			center: new google.maps.LatLng(37.333274,-121.883364),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		});
	};
	
	$scope.socket = null;
	$scope.initializeWebSocket = function() {
		$scope.socket = io.connect($rootScope.serverURL + ":8000");
		$scope.socket.emit("reportLocationsRequested", {});
		$scope.socket.on('reportLocationsRecieved', function (data) {
			alert(JSON.stringify(data));
			$scope.socket.emit("reportLocationsRequested", {});
		});
	};
	
	$scope.refreshLocations = function() {
		$http.get($rootScope.serverURL + "/drivers/clockedin").success(
			function(drivers) {
				$scope.clearMarkers();
				$scope.availableDrivers = drivers;
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0; i < $scope.availableDrivers.length; i++) {
					var diff = new Date().getTime() - new Date($scope.availableDrivers[i].location.time).getTime();
					var minutes = diff / (1000 * 60);
					var marker = new google.maps.Marker({
					    map: $scope.map,
					    position: new google.maps.LatLng($scope.availableDrivers[i].location.lat,$scope.availableDrivers[i].location.lng),
					    title: $scope.availableDrivers[i].fullName + " (" + parseInt(minutes) + " minutes ago)",
					    label: $scope.availableDrivers[i].fullName[0]
					});
					$scope.availableDrivers[i].marker = marker;
					bounds.extend(marker.getPosition());
				}
				if ($scope.availableDrivers.length > 0) {
					$scope.map.panToBounds(bounds);
				}
			}
			).error(function(err) {
				console.log(err);
				// update dates of coordinates
				for (var i = 0; i < $scope.availableDrivers.length; i++) {
					var diff = new Date().getTime() - new Date($scope.availableDrivers[i].location.time).getTime();
					var minutes = diff / (1000 * 60);
					$scope.availableDrivers[i].marker.setTitle($scope.availableDrivers[i].fullName + " (" + parseInt(minutes) + " minutes ago) - Error updating location");
				}
		});
	};
	
	$scope.clearMarkers = function() {
		for (var i = 0; i < $scope.availableDrivers.length; i++) {
			$scope.availableDrivers[i].marker.setMap(null);
		}
	};
	$scope.bounceMarker = function(driver) {
		driver.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
		      driver.marker.setAnimation(null);
		    }, 200);
	};
	// initialize the date range picker
	var format = 'MM/DD/YYYY h:mm A';
	var from = moment().subtract('days', 30);
	var to = moment();
	$('#placedTime')[0].value = from.format(format) + " - " + to.format(format);
	$('#placedTime').daterangepicker({timePicker: true, timePickerIncrement: 30, format: format,startDate: from.format(format),
        endDate: to.format(format)},function (start, end) {
      $scope.searchCriteria.placedAtRange.from = start.toDate();
      $scope.searchCriteria.placedAtRange.to = end.toDate();
    });
	$scope.searchCriteria.placedAtRange.from = from.toDate();
    $scope.searchCriteria.placedAtRange.to = to.toDate();
	
	// refresh the numbers every 30 seconds
	$scope.refreshContent(); // refresh once
	$scope.refreshNewOrders();
	$scope.loadDrivers();
	$scope.loadRestaurants();
	$scope.initializeMap();
	$scope.refreshLocations();
//	$scope.initializeWebSocket();
	window.setInterval($scope.refreshContent, 30000); // set the timer
	window.setInterval($scope.refreshLocations, 5000); // set the timer
}]);