define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('HomeController', ['$scope',
		function($scope){
			$('a.handler-left').attr('disabled', 'disabled'); // disabled
			$('a.handler-right').attr('disabled', 'disabled'); // disabled
		}
	]);
});