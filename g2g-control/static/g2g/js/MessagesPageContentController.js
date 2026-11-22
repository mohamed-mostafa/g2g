/**
 * 
 */

g2gControlCenterApplication.controller("MessagesPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.messages = [];
	$scope.messagesTo = new Date();
	$scope.messagesFrom = new Date();
	$scope.messagesFrom.setMonth($scope.messagesFrom.getMonth() - 12);
	$scope.loading = false;
	$scope.saving = false;

	// validation flags
	$scope.serverError = false;
	$scope.serverErrorMessage = "";
	$scope.loadMessages = function() {
		$scope.loading = true;
		$http.get($rootScope.serverURL + "/messages?messagesFrom=" + $scope.messagesFrom + "&messagesTo=" + $scope.messagesTo)
		.success(
				function(response) {
					$scope.messages = response;
					$scope.loading = false;
				})
		.error(function(err){
			$scope.messages = [];
			$scope.loading = false;
		});
	};
	
	$scope.buildTable = function() {
		// initialize the table
	      $(function () {
	        $('#messagesTable').dataTable({
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
		$scope.loadMessages();
	};
	
	$scope.initialize();
}]);