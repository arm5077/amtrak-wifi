app = angular.module("wifiApp", []);

app.controller("wifiController", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
	$scope.padding = .1;
	$scope.minHeight = 10;
	$scope.chartHeight = 100;
	$scope.max = 10;
	$scope.Math = Math;
	
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
			
			$scope.trip = [];
			
			// Get shape data
			$http.get("shp/dc-ny.geojson").success(function(data){	
				$scope.trip[0] = data;
				$http.get("shp/ny-dc.geojson").success(function(data){	
					$scope.trip[1] = data;					
					var combined = $scope.trip[0].features.concat($scope.trip[1].features);
					$scope.legs.forEach(function(leg){
						var points = combined.filter(function(point){
							return ( point.properties.leg == leg.id )
						});
						
						leg.points = points.map(function(point){
							return point.properties;
						});

					});				
				});				
				
			}).error(function(err){ throw err; });
		});
	
	$scope.getAverage = function(leg, trip){
		var total = 0, count=0;
		if( $scope.trip[trip] ){
			var speeds = $scope.trip[trip].features.forEach(function(datum){ 
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
				console.log(attr);
			var map = new L.Map(element[0], {
			    center: new L.LatLng(attr.lat,attr.lng),
			    zoom: attr.zoom,
				attributionControl: false,
				scrollWheelZoom: false
			});
			
			map.once('focus', function() { map.scrollWheelZoom.enable(); });
			
			L.tileLayer('https://{s}.tiles.mapbox.com/v3/arm5077.78b64076/{z}/{x}/{y}.png', {}
			).addTo(map);
			
			var geoJSONCheck = setInterval(function(){

				if( typeof scope.$parent.trip[attr.direction] != "undefined" ){				
					L.geoJson(scope.$parent.trip[attr.direction],{
						style: function(feature){
							if( feature.properties.download >= 3 ) return {color: "#2a7068", opacity: .8}
							if( feature.properties.download >= 1 ) return {color: "#f9a61a", opacity: .8}
							if( feature.properties.download < 1 ) return {color: "#a44229", opacity: .8}
						}
					}).addTo(map);
					map.invalidateSize(true);
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

app.directive("sizeToSibling", function() {
	return {
		link: function(scope, element, attr) {
			
			setInterval(function(){
				element.css({
					height: Math.min(element.parent().children()[2].offsetHeight, 300) + "px"
				});
			}, 500);

		}
	};	

});


