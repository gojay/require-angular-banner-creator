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
								// var headers = {'Authorization': 'basic ' + $cookieStore.get('token')};
								var headers = {'AuthToken': 'basic ' + btoa('admin:admin')};
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
				  ]);
});