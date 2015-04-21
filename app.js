app = angular.module("wifiApp", []);

app.controller("wifiController", ["$scope", "$http", function($scope, $http){
	
	// replace "toner" here with "terrain" or "watercolor"
	var layer = new L.StamenTileLayer("toner-lite");
	var map = new L.Map("map", {
	    center: new L.LatLng(39.892221,-75.789185),
	    zoom: 8
	});
	map.addLayer(layer);
	
	$http.get("shp/dc-ny.geojson").success(function(data){
		console.log(data);
		
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
	
}]);