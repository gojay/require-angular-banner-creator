define([
	'controllers/controllers',
	'pusher'
], function(controllers){
	controllers.controller('PusherController', ['$scope', '$log', 'PusherConfig', 'PushMessage',
		function($scope, $log, PusherConfig, PushMessage){
			$scope.connectionStatus = null;
    
        	$scope.data = {
        		message: null
        	};
        	$scope.lists = [];
          	Pusher.log = function( msg ) {
    		    $log.log('log', msg);
    		};
    		  
    		var pusher = new Pusher(PusherConfig.apiKey);
    		pusher.connection.bind('state_change', function( change ) {
    			$log.debug('state_change', change)
    		    $scope.connectionStatus = change.current;
    		    $scope.$apply();
    	  	});
    
    	  	var channel = pusher.subscribe('messages');
    	  	channel.bind('new_message', function(data){
    	  		$scope.lists.push(data);
    		    $scope.$apply();

    		    $log.debug($scope.lists);
    	  	});
    
    	  	$scope.send = function() {
    	  		PushMessage($scope.data).then(function(response){
    	  			$log.debug('send:response', response)
    	  			$scope.data.message = null;
    	  		});
    	  	};
		}
	]);
});