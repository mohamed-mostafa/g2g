/**
 * 
 */

g2gControlCenterApplication.controller("CustomersPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.customers = [];
	$scope.plans = [];
	$scope.currentCustomer = null;
	$scope.fromDate = null;
	$scope.toDate = null;
	$scope.loading = false;
	$scope.saving = false;
	$scope.currentCustomerPlan = null;
	$scope.sendingSMS = false;
	$scope.smsRecepient = null;
	$scope.sms = null;
	$scope.notificationMessage = null;
	$scope.notification = null;
	$scope.searchCriteria = {
			email: null,
			name: null,
			registrationDateRange: {from: null, to:null}, 
			city: null, 
			zipCode: null, 
			address:null, 
			phone: null,
			plan: "", 
			status: "", 
			eligibileForFreeDelivery: 0, 
			eligibileForLifetimeFreeDelivery: 0
	};
	// validation flags
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	
	$scope.loadCustomers = function() {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/users", {fromDate: $scope.fromDate, toDate: $scope.toDate})
		.success(
				function(response) {
					$scope.customers = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.customers = [];
			$scope.loading = false;
		});
	};
	$scope.searchCustomers = function() {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/users/search", {searchCriteria: $scope.searchCriteria})
		.success(
				function(response) {
					$scope.customers = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.customers = [];
			$scope.loading = false;
		});
	};
	$scope.searchCustomersAndExport = function() {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/users/search", {searchCriteria: $scope.searchCriteria})
		.success(
				function(response) {
					$scope.customers = response;
					$scope.loading = false;
					window.location = $rootScope.serverURL + "/users/searchAndExport?searchCriteria=" + JSON.stringify($scope.searchCriteria);
				})
		.error(function(err){
			$scope.customers = [];
			$scope.loading = false;
		});
	};
	$scope.loadPlans = function() {
		$http.get($rootScope.serverURL + "/plans", {})
		.success(
				function(response) {
					$scope.plans = response;
				})
		.error(function(err){
			$scope.plans = [];
		});
	};
	$scope.markUserEligibileForFreeDelivery = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/freedelivery/eligibility/true")
		.success(function() {
			$scope.loading = false;
			customer.eligibleForFreeDelivery = true;
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.markUserUnEligibileForFreeDelivery = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/freedelivery/eligibility/false")
		.success(function() {
			$scope.loading = false;
			customer.eligibleForFreeDelivery = false;
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.markUserEligibileForLifetimeFreeDelivery = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/freedelivery/lifetimeeligibility/true")
		.success(function() {
			$scope.loading = false;
			customer.eligibleForLifetimeFreeDelivery = true;
			customer.eligibleForFreeDelivery = true;
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.markUserUnEligibileForLifetimeFreeDelivery = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/freedelivery/lifetimeeligibility/false")
		.success(function() {
			$scope.loading = false;
			customer.eligibleForLifetimeFreeDelivery = false;
			customer.eligibleForFreeDelivery = false;
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.activateUser = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/activate")
		.success(function() {
			$scope.loading = false;
			customer.status = 'ACTIVE';
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.lockUser = function(customer) {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + customer.id + "/lock")
		.success(function() {
			customer.status = "LOCKED";
			$scope.loading = false;
		})
		.error(function(err){
			$scope.loading = false;
		});
	};
	$scope.openSMSCustomer = function(customer) {
		$scope.notification = false;
		if (customer.phone.length == 10) { // american number without a country code
			// add the country code
			$scope.smsRecepient = "1" + customer.phone;
			$scope.notification = true;
			$scope.notificationMessage = "Country code was added to this number";
		} else if (customer.phone.length == 11 && customer.phone[0] == "1") { // american number with country code
			// nothing, that's what we want
			$scope.smsRecepient = customer.phone;
		} else { // otherwise, time to panic ...
			// show a message box
			$scope.notification = true;
			$scope.notificationMessage = "IMPORTANT ! This might not be an american phone number !";
			$scope.smsRecepient = customer.phone;
		}
		$('#sendCustomerSMS').modal('show');
	};
	$scope.sendSMS = function() {
		$scope.sendingSMS = true;
		$http.put($rootScope.serverURL + "/sms", {to: $scope.smsRecepient, text: $scope.sms}).success(
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
	$scope.openCustomer = function(customer) {
		$http.get($rootScope.serverURL + "/user/" + customer.username)
		.success(
				function(response) {
					$scope.currentCustomer = response;
					$scope.currentCustomerPlan = $scope.currentCustomer.plan.name;

					// remove the spaces from the addresses nicknames
					for (var i = 0; i < $scope.currentCustomer.addresses.length; i++) {
						$scope.currentCustomer.addresses[i].nickname = $scope.currentCustomer.addresses[i].nickname.trim();
						$scope.currentCustomer.addresses[i].nickname = $scope.currentCustomer.addresses[i].nickname.replace(/ /g, "-");
					}
					
					$scope.loading = false;
					$('#customerModal').modal('show');
					$('#infoTabLink').click();
				})
		.error(function(err){
			$scope.currentCustomer = null;
			$scope.loading = false;
		});
	};
	$scope.updateCustomersPlan = function() {
		$scope.loading = true;
		$http.post($rootScope.serverURL + "/user/" + $scope.currentCustomer.id + "/plan/" + $scope.currentCustomer.plan.name)
		.success(
				function() {
					$scope.loading = false;
				})
		.error(function(err){
			alert(err);
			$scope.loading = false;
		});
	};
	$scope.initialize = function() {
		var now = new Date().getTime(); // millis
		var oneYearAgo = now - (12 * 30 * 24 * 60 * 60 * 1000); // one year ago
		$scope.fromDate = new Date(oneYearAgo);
		$scope.toDate = new Date(now);
		
		// initialize the date range picker
		var format = 'MM/DD/YYYY h:mm A';
		var from = moment().subtract('days', 30);
		var to = moment();
		$('#registrationTime')[0].value = from.format(format) + " - " + to.format(format);
		$('#registrationTime').daterangepicker({timePicker: true, timePickerIncrement: 30, format: format,startDate: from.format(format),
            endDate: to.format(format)},function (start, end) {
          $scope.searchCriteria.registrationDateRange.from = start.toDate();
          $scope.searchCriteria.registrationDateRange.to = end.toDate();
        });
		$scope.searchCriteria.registrationDateRange.from = from.toDate();
        $scope.searchCriteria.registrationDateRange.to = to.toDate();
		
		$scope.searchCustomers();
		$scope.loadPlans();
	};
	
	$scope.initialize();
}]);