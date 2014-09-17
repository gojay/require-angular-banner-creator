define([
	'angular',
	'angularResource'
], function(angular){
	'use strict';
	return angular.module('services', ['ngResource'])
	  	.factory('authResource', ['$http', '$resource', '$cookieStore',
			function($http, $resource, $cookieStore){
				this.url = null;
				return {
					authentifiedRequest: function(method, url, data, okCallback, errCallback){
						var headers = {'AuthToken' : $cookieStore.get('token')};
						// var headers = {'AuthToken': 'basic ' + btoa('admin:admin')};
						if($.inArray(angular.uppercase(method), ['POST', 'PUT']) >= 0){
							headers['Content-Type'] = 'application/x-www-form-urlencoded';
						}

			            $http({
			                method : method,
			                url    : url,
			                data   : data,
			                headers: headers
			            }).success(okCallback).error(errCallback);
			        },
					request: function(url){
						return $resource(url, {}, {
							query : {
								method: 'GET',
								isArray: true
							},
							get : {
								method: 'GET'
							},
							update : {
								method: 'PUT'
							},
							remove: {
								method: 'DELETE'
							}
						});
					}
				}
			}
  		])
		.factory('CreatorID', ['authResource', '$q', '$rootScope',
			function(authResource, $q, $rootScope){
				return function(){
					var deferred = $q.defer();
					authResource.authentifiedRequest('GET', 'api/ID', {}, function(data){
						deferred.resolve(data);
					}, function(err){
						$rootScope.pageService = {
							start  : false,
							reject : true,
							status : err.status,
							message: err.data
						};
						deferred.reject('Unable to get creator ID : ' + err);
					})
					return deferred.promise;
				};
			}
		])
		.factory('PushMessage', ['authResource', '$q', '$rootScope',
			function(authResource, $q, $rootScope){
				return function( data ){
					var deferred = $q.defer();
					authResource.authentifiedRequest('POST', 'api/message', data, function(response){
						deferred.resolve(response);
					}, function(err){
						$rootScope.pageService = {
							start  : false,
							reject : true,
							status : err.status,
							message: err.data
						};
						deferred.reject('Unable to push message : ' + err);
					})
					return deferred.promise;
				};
			}
		]);
});