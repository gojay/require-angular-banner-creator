define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('ConversationController', ['$scope', 'conversations',
		function($scope, conversations){
			console.log('conversations', conversations);
			$scope.data = conversations;
		}
	]);
});