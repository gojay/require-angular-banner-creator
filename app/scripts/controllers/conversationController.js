define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('ConversationController', ['$scope', 'conversations', 'ConversationConfig',
		function($scope, conversations, ConversationConfig){
			console.log('conversations', conversations);
			console.log('new Conversation', ConversationConfig);
			$scope.conversations = conversations;
			$scope.conversation = ConversationConfig;
		}
	]);
});