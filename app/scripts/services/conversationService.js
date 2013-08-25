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
				}
			};
		})
		// default configuration
		.factory('ConversationConfig', function(){
			return {
				ID: new Date().getTime(),
				title: '',
				description: '',
				preview: null,
				autosave: false,
				logo : {
					hide: false,
					placeholder: true,
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
				selected : 1
			};
		})
		.factory('ConversationService', ['$resource',
			function($resource){
				return $resource('api/conversation/:id', {}, {
					update : {
						method: 'PUT'
					},
					remove: {
						method: 'DELETE'
					}
				});
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