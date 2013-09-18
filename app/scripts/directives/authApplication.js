define([
	'directives/directives',
	'services/services',
], function(directives){
	directives.directive('authApplication', ['$http', 'authService', 'authResource', '$cookieStore',
		function($http, authService, authResource, $cookieStore){
			// Runs during compile
			return {
				restrict: 'C', // E = Element, A = Attribute, C = Class, M = Comment
				link: function($scope, iElm, iAttrs, controller) {
					$scope.$on('event:auth-loginRequired', function(event, data) {
			        	console.log('event:auth-loginRequired');

			        	// remove token
				        $cookieStore.remove('token');

				        $scope.auth.error = data;

			        	var $login = $('#popup-login');
			        	if( $scope.auth.error != null && !data.type ){
				          	$.blockUI({
								message: $login,
								overlayCSS: {
									backgroundColor: '#000',
									opacity: 0.9,
									cursor : 'default'
								},
								css: {
									top   	: ($(window).height() - $login.height()) / 2 + 'px',
									width 	: '35%',
									border 	: 'none',
									background: 'white',
									padding   : '10px',
									cursor    : 'default',
									textAlign : 'left',
									borderRadius: '15px'
								}
							});
			        	}
			        });
			        $scope.$on('event:auth-loginConfirmed', function() {
			        	console.log('event:auth-loginConfirmed');
			        	$scope.auth.error = null;
		         		$.unblockUI();
		        	});
			        $scope.$on('event:auth-ping', function() {
			        	console.log('event:auth-ping');
			      		authResource.authentifiedRequest('GET', 'api/ping', {}, function(){
					      	$scope.$broadcast('event:loginConfirmed');
					    });
		        	});

				    $scope.auth = {
				    	credentials: {
					    	username : null,
					    	password : null
				    	},
				    	user  : null,
				    	error : null
				    };
				    $scope.auth.connect = function() {
						authResource.authentifiedRequest('POST', 'api/login', $scope.auth.credentials, 
							function(data, status){
								console.log('login response', data, status);

						      	if (status < 200 || status >= 300) return;

						      	$scope.auth.credentials.username = null;
						      	$scope.auth.credentials.password = null;
					            // set user n token cookie
					            $scope.auth.user = data.username;
					            $cookieStore.put('token', data.token);
					            // login confirmed
					            authService.loginConfirmed();
						    }
						);
				    };
				    $scope.auth.disconnect = function() {
				        $scope.auth.user = null;
				        $cookieStore.remove('token');
				    };
				}
			};
		}]
	);
});