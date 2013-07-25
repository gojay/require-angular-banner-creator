define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('HomeController', ['$scope', 'page',
		function($scope, page){
			// set page title n disable content
			page.setTitle('| Home');
			page.isContent = false;
		}
	]);
});