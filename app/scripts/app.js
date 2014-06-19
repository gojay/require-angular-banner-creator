define([
    'angular',
    'angularBootstrap',
    'angularMobile',
    'angularJQM',
    'angularHttpAuthInterceptor',
    'angularCookies',
    'controllers/controllers',
    'directives/directives',
    'filters/filters',
    'providers/providers',
    'services/services'
], function(angular) {
    return angular.module('ImageApp', [
        'ui.bootstrap',
        'jqm',
        'http-auth-interceptor',
        'ngCookies',
        'controllers',
        'directives',
        'filters',
        'providers',
        'services'
    ]);
});