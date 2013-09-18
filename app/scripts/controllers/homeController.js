define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('HomeController', ['$scope',
		function($scope){
			$('a.handler-left').switchClass('visible', 'invisible', 0);
			$('a.handler-right').switchClass('visible', 'invisible', 0);
		}
	]);
});