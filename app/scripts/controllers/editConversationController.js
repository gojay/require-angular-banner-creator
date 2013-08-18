define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('EditConversationController', ['$scope', 'conversations',
		function($scope, conversations){
			console.log('data', conversations);
			$scope.conversations = conversations.recents;
			$scope.conversation  = conversations.detail;
		}
	]);
});