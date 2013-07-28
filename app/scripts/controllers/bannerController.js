define([
	'controllers/controllers',
	'services/bannerService'
], function(controllers){
	controllers.controller('BannerController', ['$scope',  '$q', '$compile', 'imageReader', 'BannerConfig', 'banner',
		function($scope, $q, $compile, imageReader, BannerConfig, banner){}
	]);
});