define([
	'controllers/controllers'
], function(controllers){
	controllers.controller('ConversationController', ['$scope', 'ConversationConfig', 
		function($scope, ConversationConfig){
			console.log('ConversationConfig', ConversationConfig);
			$scope.conversation = ConversationConfig;
		}
	]);
});