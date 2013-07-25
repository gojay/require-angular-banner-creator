define([
	'angular',
	'controllers/controllers',
	'directives/directives',
	'filters/filters',
	'providers/providers',
	'services/services'
], function(angular){
	return angular.module('ImageApp', ['controllers', 'directives', 'filters', 'providers', 'services']);
});