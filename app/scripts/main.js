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
		angularCookies  : 'vendor/angular/angular-cookies.min',
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
		angularResource : ['angular'],
		angularCookies : ['angular']
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
	'filters/ifFilter',
	// directives
	'directives/bannerCreator',
	'directives/conversationCreator',
	'directives/splashCreator',
	// controllers
	'controllers/homeController',
	'controllers/bannerController',
	'controllers/conversationController',
	'controllers/editConversationController',
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

	app.config(['$routeProvider', '$locationProvider', 'debugProvider', 'transitionProvider', 'imageReaderProvider',
		function($routeProvider, $locationProvider, debugProvider, transitionProvider, imageReaderProvider){
			// enable/disable debuging
			debugProvider.setDebug(true);
			// transition config  
			transitionProvider.setStartTransition('expandIn');
			transitionProvider.setPageTransition('slide');
			transitionProvider.setPage('#wrap-content > .container');
			// router
			$routeProvider
				.when('/', {
					title : '| Home',
					templateUrl : 'app/views/home.html',
					controller  : 'HomeController',
					static      : true,
					resolve: {
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/banner', {
					title : '| Facebook Banner',
					breadcrumb : {
						current:  'Facebook Banner Template',
						currentLink : '',
						active :  'Template Empty Prize'
					},
					// static      : true,
					templateUrl : 'app/views/banner.html',
					controller : 'BannerController',
					resolve: {
						banners: function($rootScope, BannerTemplates, RecentBanners){
							$rootScope.pageService.message = 'Preparing banner templates..';
							return BannerTemplates().then(function(templates){
								$rootScope.pageService.message = 'Preparing recent banners..';
								return RecentBanners().then(function(recents){
									$rootScope.pageService.start = false;
									return {
										templates : templates,
										recents   : recents,
										banner    : null
									};
								});
							});
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/banner/:bannerId', {
					title : '| Facebook Banner',
					breadcrumb : {
						current:  'Facebook Banner Template',
						currentLink : '#!/facebook/banner',
						active :  'Template Empty Prize'
					},
					templateUrl : 'app/views/banner.html',
					controller  : 'BannerController',
					resolve: {
						banners: function($rootScope, $route, BannerTemplates, RecentBanners, DetailBanner){
							$rootScope.pageService.message = 'Requesting banner id '+ $route.current.params.bannerId +'..';
							return DetailBanner().then(function(banner){
								$rootScope.pageService.message = 'Preparing banner templates..';
								return BannerTemplates().then(function(templates){
									$rootScope.pageService.message = 'Preparing recent banners..';
									return RecentBanners().then(function(recents){
										$rootScope.pageService.start = false;
										return {
											templates : templates,
											recents   : recents,
											banner    : banner
										};
									});
								});
							});
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/conversation', {
					title : '| Facebook Conversation',
					breadcrumb : {
						current:  'Facebook Conversation Template',
						currentLink : '',
						active :  'Template 1'
					},
					template   : '<conversation-creator ng-model="data"></conversation-creator>',
					controller : 'ConversationController',
					resolve: {
						conversations: function($rootScope, ConversationTemplates, RecentConversations){
							$rootScope.pageService.message = 'Preparing conversation templates..';
							return ConversationTemplates().then(function(templates){
								$rootScope.pageService.message = 'Preparing recent conversations..';
								return RecentConversations().then(function(recents){
									$rootScope.pageService.start = false;
									return {
										templates: templates,
										recents: recents,
										detail: null
									};
								});
							});
							
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/facebook/conversation/:conversationId', {
					title : '| Facebook Conversation',
					breadcrumb : {
						current:  'Facebook Conversation Template',
						currentLink : '#!/facebook/conversation',
						active :  'Template 1'
					},
					template    : '<conversation-creator ng-model="data"></conversation-creator>',
					controller  : 'ConversationController',
					resolve: {
						conversations: function($rootScope, $route, ConversationTemplates, RecentConversations, DetailConversation){
							$rootScope.pageService.message = 'Requesting conversation id '+ $route.current.params.conversationId +'..';
							return DetailConversation().then(function(conversation){
								$rootScope.pageService.message = 'Preparing conversation templates..';
								return ConversationTemplates().then(function(templates){
									$rootScope.pageService.message = 'Preparing recent conversations..';
									return RecentConversations().then(function(recents){
										$rootScope.pageService.start = false;
										return {
											templates: templates,
											recents: recents,
											detail: conversation
										};
									});
								});
							});
						},
						delay: function($q, $timeout) {
							var delay = $q.defer();
							$timeout(delay.resolve, 1000);
							return delay.promise;
						}
					}
				})
				.when('/mobile', {
					title : '| Mobile SplashScreen',
					breadcrumb : {
						current:  'Mobile SplashScreen & Background',
						active :  'Splash Screen'
					},
					static      : true,
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

			// Hashbang Mode
   			$locationProvider
   				.html5Mode(false)
  				.hashPrefix('!');
		}
	])
	.config(['$compileProvider' , function ($compileProvider) {
          $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto):/);
    }])
	.run(function($rootScope, transition) {
		$rootScope.panel = {
			right: {
				model: null,
				template: null
			},
			left: {
				model: null,
				template: null
			}
		};
		// change transition when start route 
		$rootScope.$on('$routeChangeStart', function(scope, next, current) {
			// console.log('Changing from '+angular.toJson(current)+' to '+angular.toJson(next));
			$rootScope.showBreadcrumb = false;
			// transition
			if(current === undefined) transition.start();
			else transition.change();
			$rootScope.pageService = {
				loaded: false,
				start : true,
				reject: false,
				status: null,
				message: ''
			};
		});
		$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
			// inject page_title form current route
			$rootScope.pageTitle = current.$$route.title;
			$rootScope.showBreadcrumb = (current.$$route.breadcrumb === undefined) ? false : true ;
			$rootScope.breadcrumb = current.$$route.breadcrumb;
			// set start pageService false, if page static, or doesn't needed services
			if(current.$$route.static !== undefined) $rootScope.pageService.start = false;
		});
	});
	domReady(function() {
		angular.bootstrap(document, ['ImageApp']);
		$('html').attr('ng-app', 'ImageApp');
    });
});