/**
 * 
 */

g2gControlCenterApplication.controller("HeaderContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields
	$scope.userMessages = [];
	$scope.systemMessages = [];
	
	$scope.currentMessageTime = null;
	$scope.currentMessageText = null;
	$scope.currentMessageSource = null;
	$scope.destination = "";
	$scope.nesSmsText = "";
	
	$scope.notification = true;
	$scope.notificationMessage = null;
	
	$scope.sendingSMS = false;
	
	$scope.currentMessage = null;
	
	$scope.viewUserMessage = function(message) {
		$scope.currentMessage = message;
		$scope.currentMessageTime = message.messageTime;
		$scope.currentMessageText = message.subject + ": " + message.message;
		$scope.currentMessageSource = message.userFirstName + " " + message.userLastName;
		
		$('#viewMessageModal').modal('show');
		
	};
	$scope.viewSystemMessage = function(message) {
		$scope.currentMessage = message;
		$scope.currentMessageTime = message.messageTime;
		$scope.currentMessageText = message.message;
		$scope.currentMessageSource = message.subject;
		
		$('#viewMessageModal').modal('show');
	};
	$scope.openSendMessageDiaolg = function(message) {
		$scope.destination = "";
		$scope.nesSmsText = "";
		$scope.serverError = false;
		$scope.serverErrorMessage = "";
		$scope.sendingSMS = false;
		$('#sendMessageModal').modal('show');
	};
	$scope.openRespondDialog = function() {
		var message = $scope.currentMessage;
		$scope.destination = "";
		$scope.nesSmsText = "";
		$scope.serverError = false;
		$scope.notification = false;
		$scope.serverErrorMessage = "";
		$scope.sendingSMS = false;
		
		
		if (message.userId >= 0) { // user message, or anonymous user message
			// get the user
			$http.get($rootScope.serverURL + "/user/id/" + message.userId)
			.success(
					function(customer) {
						if (customer.phone.length == 10) { // american number without a country code
							// add the country code
							$scope.destination = "1" + customer.phone;
							$scope.notification = true;
							$scope.notificationMessage = "Country code was added to this number";
						} else if (customer.phone.length == 11 && customer.phone[0] == "1") {
							// american number with the country code
							$scope.destination = customer.phone;
						} else {
							$scope.destination = customer.phone;
							$scope.notification = true;
							$scope.notificationMessage = "IMPORTANT ! This might not be an american phone number !";
						}
			})
			.error(function(err){
				$scope.serverError = false;
				$scope.serverErrorMessage = "";
			});
		} else if (message.userId == -2) {
			alert("This message was sent from an anonymous user in the app. We don't have any way to respond.");
			return;
		} else { // sms that we didn't know its sender
			// n.b these type of messages are saved so that the subject is the phone number
			if (message.subject.length == 10) { // american number without a country code
				// add the country code
				$scope.destination = "1" + message.subject;
				$scope.notification = true;
				$scope.notificationMessage = "Country code was added to this number";
			} else if (message.subject.length == 11 && message.subject[0] == "1") {
				// american number with the country code
				$scope.destination = message.subject;
			} else {
				$scope.destination = message.subject;
				$scope.notification = true;
				$scope.notificationMessage = "IMPORTANT ! This might not be an american phone number !";
			}
		}
		$('#sendMessageModal').modal('show');
	};
	
	$scope.markCurrentMessageAsRead = function() {
		$http.post($rootScope.serverURL + "/message/" + $scope.currentMessage.id + "/status/read"
		).success(
			function(response) {
				var indexToDelete = -1;
				for (var i = 0; i < $scope.userMessages.length; i++) {
					if ($scope.userMessages[i].id == $scope.currentMessage.id) indexToDelete = i;
				}
				if (indexToDelete != -1) $scope.userMessages.splice(indexToDelete, 1);
				
				indexToDelete = -1;
				for (var i = 0; i < $scope.systemMessages.length; i++) {
					if ($scope.systemMessages[i].id == $scope.currentMessage.id) indexToDelete = i;
				}
				if (indexToDelete != -1) $scope.systemMessages.splice(indexToDelete, 1);
				
				$('#viewMessageModal').modal('hide');
			}
		).error(function(err){
		});
	};
	
	$scope.sendSMSToDestination = function() {
		$scope.sendingSMS = true;
		$http.put($rootScope.serverURL + "/sms", {to: $scope.destination, text: $scope.nesSmsText}).success(
				function(response) {
					$scope.sendingSMS = false;
					$('#sendMessageModal').modal('hide');
				}
			).error(function(err) {
				$scope.serverError = true;
				$scope.serverErrorMessage = err;
				$scope.sendingSMS = false;
			});
	};
	
	$scope.refreshContent = function() {
		$http.get($rootScope.serverURL + "/pendingsystemmessages"
		).success(
			function(response) {
				$scope.systemMessages = response;
			}
		).error(function(err){
			$scope.systemMessages = [];
		});
		
		
		$http.get($rootScope.serverURL + "/pendingusermessages"
		).success(
			function(response) {
				$scope.userMessages = response;
			}
		).error(function(err){
			$scope.userMessages = [];
		});
	};
	
	$scope.refreshContent();
	window.setInterval($scope.refreshContent, 10000); // set the timer to 1 seconds
}]);