define([
	'controllers/controllers',
	'services/bannerService'
], function(controllers){
	controllers.controller('BannerController', ['$scope',  '$q', '$compile', 'page', 'imageReader', 'BannerService', 'BannerConfig', 'banner',
		function($scope, $q, $compile, page, imageReader, BannerService, BannerConfig, banner){
			// set page title n enable content
			page.setTitle('| Banner');
			page.isContent = true;
		}
	]);
});