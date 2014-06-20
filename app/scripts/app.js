define([
    'angular',
    'angularBootstrap',
    'angularUtils',
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
        'ui.event',
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