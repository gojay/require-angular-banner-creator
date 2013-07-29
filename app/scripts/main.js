// +------------------------------------------------------------------------+
// | Image Creator Built by AngularJS & RequireJS                           |
// +------------------------------------------------------------------------+
// | Copyright (c) Dani Gojay 2013 All rights reserved.                     |
// | Version       2.0                                                      |
// | Last modified 15/07/2013                                               |
// | Email         dani.gojay@gmail.com                                     |
// | Web           http://github.com/gojay & http://gojayincode.com         |
// +------------------------------------------------------------------------+

require.config({
	paths: {
		// core
		angular      : 'vendor/angular/angular.min',
		angularResource : 'vendor/angular/angular-resource.min',
		jquery       : 'vendor/jquery/jquery.min',
		bootstrap    : 'vendor/bootstrap/bootstrap.min',
		// jQuery UI & Plugins
		jqueryui     : 'vendor/jquery/jquery-ui.min',
		blockUI      : 'vendor/jquery/plugins/jquery.blockUI',
		imgareaselect: 'vendor/jquery/plugins/jquery.imgareaselect.min',
		jszip        : 'vendor/jquery/plugins/jszip',
		jpicker      : 'vendor/jquery/plugins/jpicker.min',
		// SVG
		SVG          : 'vendor/svg/svg',
		svgTextFlow  : 'vendor/svg/svg.textflow.min',
		svgtoDataURL : 'vendor/svg/svg_todataurl',
		domReady     : 'vendor/domReady'
	},
	shim: {
		jqueryui: ['jquery'],
		blockUI: ['jquery'],
		imgareaselect: ['jquery'],
		jszip: ['jquery'],
		jpicker: ['jquery'],
		bootstrap: ['jquery'],
		SVG: {
			deps: ['jquery'],
			exports: 'SVG'
		},
		svgTextFlow: ['SVG'],
		angular: {
			deps: ['jquery'],
			exports: 'angular'
		},
		angularResource : ['angular']
	}
});

require([
	'angular',
	'app',
	'domReady',
	'bootstrap',
	// providers
	'providers/debugProvider',
	'providers/transitionProvider',
	'providers/imageReaderProvider',
	// filters
	'filters/comaToNewLine',
	'filters/newLineToBr',
	'filters/newLineToDblBr',
	// directives
	'directives/bannerCreator',
	'directives/conversationCreator',
	'directives/splashCreator',
	// controllers
	'controllers/homeController',
	'controllers/bannerController',
	'controllers/conversationController',
	'controllers/mobileController',
	// plugins & helpers
	'blockUI',
	'imgareaselect',
	'jszip',
	'jpicker',
	// svg
	'SVG',
	'svgtoDataURL',
	'svgTextFlow'
],
function(angular, app, domReady){
	'use strict';

	app.config(['$routeProvider', 'debugProvider', 'transitionProvider', 'imageReaderProvider',
		function($routeProvider, debugProvider, transitionProvider, imageReaderProvider){
			// enable/disable debuging
			debugProvider.setDebug(true);
			// transition config  
			transitionProvider.setStartTransition('expandIn');
			transitionProvider.setPageTransition('tumble');
			transitionProvider.setPage('html');
			// router
			$routeProvider
				.when('/', {
					title : '| Home',
					templateUrl : 'app/views/home.html',
					controller  : 'HomeController',
					resolve: {
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/banner', {
					title : '| Banner',
					breadcrumb : {
						current:  'Facebook Banner Template',
						active :  'Template 1'
					},
					// templateUrl : 'app/views/banner.html',
					template    : '<h3>Under construction</h3>',
					controller  : 'BannerController',
					resolve: {
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/conversation', {
					title : '| Conversation',
					breadcrumb : {
						current:  'Facebook Conversation Template',
						active :  'Template 1'
					},
					template    : '<conversation-creator></conversation-creator>',
					controller  : 'ConversationController',
					resolve: {
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/mobile', {
					title : '| Mobile',
					breadcrumb : {
						current:  'Mobile SplashScreen & Background',
						active :  'Splash Screen'
					},
					templateUrl : 'app/views/mobile.html',
					controller  : 'MobileController',
					resolve: {
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(function(){
								delay.resolve();
							}, 1000);
							return delay.promise;
						}
					}
				})
				.otherwise({ redirectTo:'/' });
		}
	])
	.run(function($rootScope, transition) {
		// change transition when start route 
		$rootScope.$on('$routeChangeStart', function(scope, next, current) {
			console.log('Changing from '+angular.toJson(current)+' to '+angular.toJson(next));
			$rootScope.showBreadcrumb = false;
			transition.change();
		});
		// inject page_title form current route
		$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
			$rootScope.pageTitle = current.$$route.title;
			$rootScope.showBreadcrumb = (current.$$route.breadcrumb === undefined) ? false : true ;
			$rootScope.breadcrumb = current.$$route.breadcrumb;
		});
	});
	domReady(function() {
		angular.bootstrap(document, ['ImageApp']);
		$('html').attr('ng-app', 'ImageApp');
    });
});