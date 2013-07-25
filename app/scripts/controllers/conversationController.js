define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('ConversationController', ['$scope', 'page',
		function($scope, page){
			// set page title n enable content
			page.setTitle('| Conversation');
			page.isContent = true;
		}
	]);
});