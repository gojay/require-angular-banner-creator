define(['services/services'], function(services){
	services
		.factory('ConversationTpl', function(){
			return {
				directions : {
					square: {
						w: 403,
						h: 403
					},
					portrait: {
						w: 403,
						h: 550
					},
					landscape: {
						w: 550,
						h: 403
					}
				},
				dimensions : {
					logo : {
						w: 165,
						h: 45
					},
					spot : {
						w: 70,
						h: 70
					},
					bg : {
						w: 403,
						h: 403
					}
				},
				bgColors : {
					'blue' : {
						title: 'Blue',
						color: 'blue',
						selected: true,
					},
					'bluedark' : {
						title: 'Dark Blue',
						color: 'darkblue',
						selected: false,
					},
					'orange' : {
						title: 'Light Orange',
						color: 'orange',
						selected: false,
					}, 
					'orangedark' : {
						title: 'Dark Orange',
						color: 'darkorange',
						selected: false,
					},
					'greenlight' : {
						title: 'Light Green',
						color: 'lightgreen',
						selected: false,
					}, 
					'green' : {
						title: 'Green',
						color: 'green',
						selected: false,
					},
					'yellow' : {
						title: 'Yellow',
						color: 'yellow',
						selected: false,
					}, 
					'yellowdark' : {
						title: 'Dark Yellow',
						color: '#CCCC00',
						selected: false,
					},
					'purple' : {
						title: 'Purple',
						color: 'purple',
						selected: false,
					}, 
					'pink' : {
						title: 'Pink',
						color: 'pink',
						selected: false,
					},
					'red' : {
						title: 'Red',
						color: 'red',
						selected: false,
					}
				}
			};
		})
		// default configuration
		.factory('ConversationConfig', function(){
			return {
				ID: null,
				title: '',
				description: '',
				preview: null,
				autosave: true,
				logo : {
					hide: false,
					placeholder: true,
					dimension: {
						w: 165,
						h: 62
					},
					position: {
						x: 18,
						y: 78
					},
					uploaded: false,
					image: 'images/dummy/165x45.png'
				},
				spot1 : {
					hide: false,
					placeholder: true,
					clip: 'square',
					position: {
						x: 65,
						y: 266
					},
					xdiff: null, 
					uploaded: false,
					image: 'images/dummy/70x70.png'
				},
				spot2 : {
					hide: false,
					placeholder: true,
					clip: 'square',
					position: {
						x: 266,
						y: 266
					},
					uploaded: false,
					image: 'images/dummy/70x70.png'
				},
				align: {
					x: 'none',
					y: 'none'
				},
				queue: {
					empty    : true,
					count    : 0,
					finished : 0
				},
				selected : 0,
				templateColor : null
			};
		})
		// .factory('ConversationService', ['$resource',
		// 	function($resource){
		// 		return $resource('api/conversation/:id', {}, {
		// 			update : {
		// 				method: 'PUT'
		// 			},
		// 			remove: {
		// 				method: 'DELETE'
		// 			}
		// 		});
		// 	}
		// ])
		.factory('ConversationService', ['authResource',
			function(authResource){
				return authResource.request('api/conversation/:id');
			}
		])
		.factory('ConversationTemplates', ['ConversationService', '$q', '$rootScope',
			function(ConversationService, $q, $rootScope){
				return function(){
					var deferred = $q.defer();
					ConversationService.get({id : 'template'}, function(data){
						deferred.resolve(data);
					}, function(err){
						$rootScope.pageService = {
							start  : false,
							reject : true,
							status : err.status,
							message: err.data
						};
						deferred.reject('Unable to fetch convarsation templates ' + err);
					});
					return deferred.promise;
				};
			}
		])
		.factory('RecentConversations', ['ConversationService', '$q', '$rootScope',
			function(ConversationService, $q, $rootScope){
				return function(){
					var deferred = $q.defer();
					ConversationService.query(function(data){
						deferred.resolve(data);
					}, function(err){
						$rootScope.pageService = {
							start  : false,
							reject : true,
							status : err.status,
							message: err.data
						};
						deferred.reject('Unable to fetch conversations' + err);
					});
					return deferred.promise;
				};
			}
		])
		.factory('DetailConversation', ['ConversationService', '$route', '$q', '$rootScope',
			function(ConversationService, $route, $q, $rootScope){
				return function(){
					var deferred = $q.defer();
					ConversationService.get({id : $route.current.params.conversationId}, function(data){
						deferred.resolve(data);
					}, function(err){
						$rootScope.pageService = {
							start  : false,
							reject : true,
							status : err.status,
							message: err.data
						};
						deferred.reject('Unable to fetch conversation '  + $route.current.params.conversationId + err);
					});
					return deferred.promise;
				};
			}
		]);
});