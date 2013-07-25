define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('PageController', ['$scope', 'page',
		function($scope, page){
			$scope.page = page;
		}
	]);
});