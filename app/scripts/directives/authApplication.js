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

						$scope.login.error.status  = true;
						$scope.login.error.class   = data.class;
						$scope.login.error.message = data.message;

			        	var $login = $('#popup-login');
			        	$('#wrapper').addClass('hide');
			        	if(!$('.blockUI').length){
				          	$.blockUI({
								message: $login,
								overlayCSS: {
									backgroundColor: '#000',
									opacity: 0.9,
									cursor: 'default'
								},
								css: {
									top   	: ($(window).height() - $login.height()) / 2 + 'px',
									width 	: '35%',
									border 	: 'none',
									background: 'white',
									// color: '#3685C6',
									padding: '10px',
									cursor : 'default',
									textAlign: 'left',
									borderRadius: '15px'
								}
							});
			        	}
			        });
			        $scope.$on('event:auth-loginConfirmed', function() {
			        	console.log('event:auth-loginConfirmed');
			        	$('#wrapper').removeClass('hide');
		         		$.unblockUI();
		        	});
			        $scope.$on('event:auth-ping', function() {
			        	console.log('event:auth-ping');
			      		authResource.authentifiedRequest('GET', 'api/ping', {}, function(){
					      	$scope.$broadcast('event:loginConfirmed');
					    });
			      		// $http.get('api/ping').success(function() {
					    //   	$scope.$broadcast('event:loginConfirmed');
					    // });
		        	});

				    $scope.login = {
				    	credentials: {
					    	username : null,
					    	password : null
				    	},
				    	user  : null,
				    	error : {
					    	status: false,
					    	title: null,
					    	message: null
					    }
				    };
				    $scope.login.connect = function() {
				        $http.post('/_auth_/api.php').success(function(data, status) {
				            if (status < 200 || status >= 300)
				                return;
				            $cookieStore.set();
				            authService.loginConfirmed();
				        });
				    };
				    $scope.login.disconnect = function() {
				        $scope.login.user = null;
				    };
				    // $scope.$watch('login.credentials.username + login.credentials.password', function() {
				    //     $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa($scope.login.credentials.username + ':' + $scope.login.credentials.password);
				    // });
				}
			};
		}]
	);
});