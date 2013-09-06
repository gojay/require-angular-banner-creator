define([
	'angular',
	'angularHttpAuthInterceptor',
	'angularCookies',
	'controllers/controllers',
	'directives/directives',
	'filters/filters',
	'providers/providers',
	'services/services'
], function(angular){
	return angular.module('ImageApp', [
		'http-auth-interceptor', 
		'ngCookies',
		'controllers', 
		'directives', 
		'filters', 
		'providers', 
		'services'
	]);
});