app = angular.module("wifiApp", []);

app.controller("wifiController", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
	$scope.padding = .1;
	$scope.minHeight = 10;
	$scope.chartHeight = 60;
	$scope.max = 10;
	
	$scope.barWidth = function(count) {
		return (100 / count) * (1 - $scope.padding);
		//return (100 / data.length) - ($scope.padding / (data.length - 1));
	};
	
	$scope.barHeight = function(value){
		//height = value / Math.max.apply(null, data.map(function(d){ return d.count })) * $scope.chartHeight;
		//console.log(Math.max.apply(null, $scope.candidates.map(function(d){ return Math.max.apply(null, d["most-visited"].map(function(d){ return d.count; }))  })));
		height = value / $scope.max * $scope.chartHeight;
		if( height < $scope.minHeight )
			return $scope.minHeight;
		else 
			return height;

	};
	
	$scope.barTop = function(value){
		if( $scope.barHeight(value) < $scope.minHeight )
			return $scope.chartHeight - $scope.minHeight;
		else 
			return $scope.chartHeight - $scope.barHeight(value);
	};	
	
	$scope.barLeft = function(index, count) {
		return index * $scope.barWidth(count) + (index * $scope.padding * (100 / (count - 1 ) ) );
	};
	
	//
	$http.get("data.json").error(function(err){ throw err; })
		.success(function(data){
			$scope.legs = data;
			
			// Get shape data
			$http.get("shp/dc-ny.geojson").success(function(data){	
				$scope.trip1 = data;
				
				$scope.legs.forEach(function(leg){
					var points = $scope.trip1.features.filter(function(point){
						return ( point.properties.leg == leg.id )
					});
					
					leg.points = points.map(function(point){
						return point.properties;
					});
					
				});
				console.log($scope.legs);
				
			}).error(function(err){ throw err; });
		});
	
	$scope.getAverage = function(leg, trip){
		var total = 0, count=0;
		if( $scope.trip1 ){
			var speeds = $scope.trip1.features.forEach(function(datum){ 
				if( datum.properties.leg == leg ){ 
					total += datum.properties.download;
					count++;
				} 
			});
			return Math.floor(total/count * 10) / 10 ;
		}

	}

	/*
	// replace "toner" here with "terrain" or "watercolor"
	var layer = new L.StamenTileLayer("toner-lite");
	var map = new L.Map("map", {
	    center: new L.LatLng(39.892221,-75.789185),
	    zoom: 8
	});
	map.addLayer(layer);
	
	$http.get("shp/dc-ny.geojson").success(function(data){		
		// Style map
		L.geoJson(data,{
			style: function(feature){
				if( feature.properties.download >= 3 ) return {color: "#2a7068"}
				if( feature.properties.download >= 1 ) return {color: "#f9a61a"}
				if( feature.properties.download < 1 ) return {color: "#a44229"}
			}
		}).addTo(map);
		
	}).error(function(err){
		throw err;
	});
	*/
	
	$scope.useHTML = function(text){
		return $sce.trustAsHtml(text);
	};
	
}]);

app.directive("map", function() {
	return {
		restrict: 'E',
		link: function(scope, element, attr) {
			var layer = new L.StamenTileLayer("toner-lite");
			var map = new L.Map(element[0], {
			    center: new L.LatLng(scope.leg.lat,scope.leg.lng),
			    zoom: 8
			});
			map.addLayer(layer);
			
			var geoJSONCheck = setInterval(function(){

				if( typeof scope.$parent.trip1 != "undefined" ){				
					console.log(scope.$parent.trip1);
					L.geoJson(scope.$parent.trip1,{
						style: function(feature){
							if( feature.properties.download >= 3 ) return {color: "#2a7068"}
							if( feature.properties.download >= 1 ) return {color: "#f9a61a"}
							if( feature.properties.download < 1 ) return {color: "#a44229"}
						}
					}).addTo(map);
					clearInterval(geoJSONCheck);
				}

				
			}, 500)

		}
	};	

});

app.directive("bar", function() {
	return {
		restrict: 'E',
		link: function(scope, element, attr) {
			element.css({
				//width: scope.barWidth(scope.candidate["most-visited"]) + "%"
			});
		}
	};	

});

