define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('EditConversationController', ['$scope', 'conversation', 
		function($scope, conversation){
			console.log('conversation', conversation);
			$scope.conversation = conversation.data;
		}
	]);
});