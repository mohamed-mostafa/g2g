/**
 * 
 */

g2gControlCenterApplication.controller("RestaurantsInsightsPageContentController", ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
	// fields

    // functions
	$scope.refreshRestaurantsActivityChart = function() {
		$http.get($rootScope.serverURL + "/restaurants/activitychart").success(
			function(ordersPerRestaurantsList) {
				var restaurants = [], restaurantOrders= [];
				for (var i = 0; i < ordersPerRestaurantsList.length; i++) {
					restaurants.push(ordersPerRestaurantsList[i].name);
					restaurantOrders.push(ordersPerRestaurantsList[i].count);
				}
				 var areaChartData = {
			          labels: restaurants,
			          datasets: [
			            {
			              label: "Orders",
			              fillColor: "rgba(210, 214, 222, 1)",
			              strokeColor: "rgba(210, 214, 222, 1)",
			              pointColor: "rgba(210, 214, 222, 1)",
			              pointStrokeColor: "#c1c7d1",
			              pointHighlightFill: "#fff",
			              pointHighlightStroke: "rgba(220,220,220,1)",
			              data: restaurantOrders
			            }
			          ]
				 	};
				$scope.renderRestaurantsActivityChart(areaChartData);
			}
		).error(function(err){
			alert(err);
		});
	};
	$scope.renderRestaurantsActivityChart = function(barChartData) {
		var barChartCanvas = $("#barChart").get(0).getContext("2d");
        var barChart = new Chart(barChartCanvas);
        var barChartData = barChartData;
        var barChartOptions = {
          //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
          scaleBeginAtZero: true,
          //Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines: true,
          //String - Colour of the grid lines
          scaleGridLineColor: "rgba(0,0,0,.05)",
          //Number - Width of the grid lines
          scaleGridLineWidth: 1,
          //Boolean - Whether to show horizontal lines (except X axis)
          scaleShowHorizontalLines: true,
          //Boolean - Whether to show vertical lines (except Y axis)
          scaleShowVerticalLines: true,
          //Boolean - If there is a stroke on each bar
          barShowStroke: true,
          //Number - Pixel width of the bar stroke
          barStrokeWidth: 2,
          //Number - Spacing between each of the X value sets
          barValueSpacing: 5,
          //Number - Spacing between data sets within X values
          barDatasetSpacing: 1,
          //String - A legend template
          legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
          //Boolean - whether to make the chart responsive
          responsive: true,
          maintainAspectRatio: false
        };

        barChartOptions.datasetFill = false;
        barChart.Bar(barChartData, barChartOptions);
	};
	
	$scope.refreshContent = function() {
		$scope.refreshRestaurantsActivityChart();
	};
	// refresh the numbers every 30 seconds
	$scope.refreshContent(); // refresh once
	window.setInterval($scope.refreshContent, 30000); // set the timer
}]);