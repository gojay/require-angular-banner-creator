// +------------------------------------------------------------------------+
// | Image Creator Built by AngularJS & RequireJS                           |
// +------------------------------------------------------------------------+
// | Copyright (c) Dani Gojay 2013 All rights reserved.                     |
// | Version       2.1-resource                                                      |
// | Last modified 15/07/2013                                               |
// | Email         dani.gojay@gmail.com                                     |
// | Web           http://github.com/gojay & http://gojayincode.com         |
// +------------------------------------------------------------------------+

require.config({
    paths: {
        // core
        // angular      : 'vendor/angular/angular.min',
        angular: 'vendor/angular/angular.1.1.5.min',
        angularRoute: 'vendor/angular/angular-route.min',
        angularBootstrap: 'vendor/angular/ui-bootstrap-tpls.min',
        angularUtils: 'vendor/angular/ui-utils.min',
        angularMobile: 'vendor/angular/angular-mobile',
        angularJQM: 'vendor/angular/angular-jqm',
        angularResource: 'vendor/angular/angular-resource.min',
        angularCookies: 'vendor/angular/angular-cookies.min',
        angularHttpAuthInterceptor: 'vendor/angular/http-auth-interceptor',
        jquery: 'vendor/jquery/jquery.min',
        bootstrap: 'vendor/bootstrap/bootstrap.min',
        // jQuery UI & Plugins
        jqueryui: 'vendor/jquery/jquery-ui.min',
        blockUI: 'vendor/jquery/plugins/jquery.blockUI',
        imgareaselect: 'vendor/jquery/plugins/jquery.imgareaselect.min',
        jszip: 'vendor/jquery/plugins/jszip',
        jpicker: 'vendor/jquery/plugins/jpicker.min',
        qtip: 'vendor/jquery/plugins/jquery.qtip',
        jQueryqrcode: 'vendor/jquery/plugins/jquery.qrcode.min',
        qrcode: 'vendor/jquery/plugins/qrcode.min',
        // SVG
        SVG: 'vendor/svg/svg',
        svgTextFlow: 'vendor/svg/svg.textflow.min',
        svgtoDataURL: 'vendor/svg/svg_todataurl',
        // raphael
        raphael: 'vendor/raphael/raphael',
        raphaelShapes: 'vendor/raphael/raphael.shapes',
        raphaelGroup: 'vendor/raphael/raphael.group',
        raphaelHTML: 'vendor/raphael/raphael.html',
        raphaelFilter: 'vendor/raphael/fraphael',
        raphaelTransform: 'vendor/raphael/raphael.transform',
        raphaelSVGImport: 'vendor/raphael/raphael-svg-import',
        raphaelInfoBox: 'vendor/raphael/raphaeljs-infobox',
        domReady: 'vendor/domReady',

        'fabric': 'vendor/fabric/fabric',
        'fabricAngular': 'vendor/fabric/fabricAngular',
        'fabricCanvas': 'vendor/fabric/fabricCanvas',
        'fabricConstants': 'vendor/fabric/fabricConstants',
        'fabricDirective': 'vendor/fabric/fabricDirective',
        'fabricDirtyStatus': 'vendor/fabric/fabricDirtyStatus',
        'fabricUtilities': 'vendor/fabric/fabricUtilities',
        'fabricWindow': 'vendor/fabric/fabricWindow',

        'pusher': 'http://js.pusher.com/2.2/pusher.min'
    },
    shim: {
        // jquery
        jqueryui 	: ['jquery'],
        blockUI 	: ['jquery'],
        imgareaselect: ['jquery'],
        jszip 		: ['jquery'],
        jpicker 	: ['jquery'],
        qtip 		: ['jquery'],
        jQueryqrcode      : ['jquery'],
        qrcode 		: ['jquery'],
        // bootstrap
        bootstrap 	: ['jquery'],
        // svg
        SVG: {
            deps: ['jquery'],
            exports: 'SVG'
        },
        svgTextFlow: ['SVG'],
        // raphael
        raphael: {
            deps: ['jquery'],
            exports: 'raphael'
        },
        raphaelShapes 	: ['raphael'],
        raphaelGroup    : ['raphael'],
        raphaelHTML 	: ['raphael'],
        raphaelFilter 	: ['raphael'],
        raphaelTransform: ['raphael'],
        raphaelSVGImport: ['raphael'],
        raphaelInfoBox: ['raphael'],
        // angular
        angular: {
            deps: ['jquery'],
            exports: 'angular'
        },
        angularRoute    : ['angular'],
        angularBootstrap: ['angular'],
        angularUtils    : ['angular'],
        angularMobile 	: ['angular'],
        angularJQM 		: ['angular'],
        angularResource : ['angular'],
        angularCookies  : ['angular'],
        angularHttpAuthInterceptor: ['angular'],

        'fabric': ['jquery'],

        'fabricAngular': ['fabric'],
        'fabricCanvas': ['fabric'],
        'fabricConstants': ['fabric'],
        'fabricDirective': ['fabric'],
        'fabricDirtyStatus': ['fabric'],
        'fabricUtilities': ['fabric'],
        'fabricWindow': ['fabric']
    }
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = 'NG_DEFER_BOOTSTRAP!';

require([
        'jquery',
        'angular',
        'app',
        // 'domReady',
        'bootstrap',
        // providers
        'providers/debugProvider',
        'providers/transitionProvider',
        'providers/imageReaderProvider',
        // filters
        'filters/comaToNewLine',
        'filters/newLineToBr',
        'filters/newLineToDblBr',
        'filters/ifFilter',
        'filters/facebookName',
        'filters/blockquote',
        // directives
        'directives/authApplication',
        'directives/bannerCreator',
        'directives/conversationCreator',
        'directives/splashCustom',
        'directives/splashFacebook',
        'directives/splashMobileFabric',
        'directives/tbModal',
        // controllers
        'controllers/homeController',
        'controllers/bannerController',
        'controllers/conversationController',
        'controllers/editConversationController',
        'controllers/splashController',
        'controllers/raphaelController',
        'controllers/pusherController',
        // plugins & helpers
        'blockUI',
        'imgareaselect',
        'jszip',
        'jpicker',
        'qtip',
        'jQueryqrcode',
        'qrcode',
        // svg
        'SVG',
        'svgtoDataURL',
        'svgTextFlow',
        // raphael
        'raphael',
        'raphaelShapes',
        'raphaelGroup',
        'raphaelHTML',
        'raphaelFilter',
        'raphaelTransform',
        'raphaelSVGImport',
        'raphaelInfoBox'
    ],
    function(jquery, angular, app) {
        'use strict';
        /* jshint ignore:start */
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        /* jshint ignore:end */
        angular.element().ready(function() {
            angular.resumeBootstrap([app.name]);
        });
    });