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
		angular      : 'vendor/angular/angular.min',
		angularResource : 'vendor/angular/angular-resource.min',
		angularCookies  : 'vendor/angular/angular-cookies.min',
		angularHttpAuthInterceptor  : 'vendor/angular/http-auth-interceptor',
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
		angularCookies : ['angular'],
		angularHttpAuthInterceptor : ['angular']
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
	'directives/authApplication',
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

	app.config(['$compileProvider', '$routeProvider', '$locationProvider', 'debugProvider', 'transitionProvider', 'imageReaderProvider',
		function($compileProvider, $routeProvider, $locationProvider, debugProvider, transitionProvider, imageReaderProvider){

	        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);

			// router
			$routeProvider
				.when('/', {
					page: {
						static: true,
						title : '| Home',
						breadcrumb: {
							show: false
						}
					},
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
					page: {
						static: false,
						title: '| Facebook Banner',
						breadcrumb: {
							show: true,
							link: {
								title: 'Facebook Banner Template',
								href : '',
								active: 'Template Empty Prize',
							}
						}
					},
					templateUrl : 'app/views/banner.html',
					controller  : 'BannerController',
					resolve: {
						banners: function($rootScope, BannerTemplates, RecentBanners, CreatorID){
							$rootScope.pageService.message = 'Preparing banner templates..';
							return BannerTemplates().then(function(templates){
								$rootScope.pageService.message = 'Preparing recent banners..';
								return RecentBanners().then(function(recents){
									return CreatorID().then(function(creator){
										$rootScope.pageService.start = false;
										return {
											templates : templates,
											recents   : recents,
											banner    : null,
											ID : creator.ID
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
				.when('/facebook/banner/:bannerId', {
					page: {
						static: false,
						title: '| Facebook Banner',
						breadcrumb: {
							show: true,
							link: {
								title: 'Facebook Banner Template',
								href : '#!/facebook/banner',
								active: 'Template Empty Prize',
							}
						}
					},
					templateUrl : 'app/views/banner.html',
					controller  : 'BannerController',
					resolve: {
						banners: function($rootScope, $route, $timeout, BannerTemplates, RecentBanners, DetailBanner){
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
					page: {
						static: false,
						title: '| Facebook Conversation',
						breadcrumb: {
							show: true,
							link: {
								title: 'Facebook Conversation Template',
								href : '',
								active: 'Template 1',
							}
						}
					},
					template   : '<conversation-creator ng-model="data"></conversation-creator>',
					controller : 'ConversationController',
					resolve: {
						conversations: function($rootScope, ConversationTemplates, RecentConversations, CreatorID){
							$rootScope.pageService.message = 'Preparing conversation templates..';
							return ConversationTemplates().then(function(templates){
								$rootScope.pageService.message = 'Preparing recent conversations..';
								return RecentConversations().then(function(recents){
									return CreatorID().then(function(creator){
										$rootScope.pageService.start = false;
										console.log('pageService', $rootScope.pageService)
										return {
											templates: templates,
											recents: recents,
											detail: null,
											ID : creator.ID
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
				.when('/facebook/conversation/:conversationId', {
					page: {
						static: false,
						title : '| Facebook Conversation',
						breadcrumb: {
							show: true,
							link: {
								title: 'Facebook Conversation Template',
								href : '#!/facebook/conversation',
								active: 'Template 1',
							}
						}
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
					page: {
						static: true,
						title : '| Mobile SplashScreen',
						breadcrumb: {
							show: true,
							link: {
								title: 'Mobile SplashScreen & Background',
								href : '',
								active: 'Splash Screen',
							}
						}
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

				// enable/disable debuging
				debugProvider.setDebug(true);
				// transition config  
				transitionProvider.setStartTransition('expandIn');
				transitionProvider.setPageTransition('slide');
				transitionProvider.setPage('#wrap-content > .container');

			// Hashbang Mode
   			$locationProvider
   				.html5Mode(false)
  				.hashPrefix('!');
		}
	])
	.run(function($rootScope, $http, $timeout, $location, transition) {
		window._unsupported = { allow : false, status: false };
		window._onbeforeunload = true;
		// show popup for unsopported browsers
		if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && window._unsupported.allow)
		{
			window._unsupported.status = true;
			$timeout(function(){
				$.blockUI({
					message: $('#popup-unsupported'),
					overlayCSS: {
						backgroundColor: '#000',
						opacity: 0.8,
						cursor: 'default'
					},
					css: {
						background : 'transparent',
						border     : 'none',
						top        : ($(window).height() - 479) / 2 + 'px',
						left       : ($(window).width() - 649) / 2 + 'px',
						width      : '649px',
						cursor     : 'default'
					}
				})
			}, 1000);
		}
		// define root scope panel
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
		// pageService
		$rootScope.pageService = {
			loaded: false,
			start : false,
			reject: false,
			status: null,
			message: ''
		};
		// change transition when starting routes 
		$rootScope.$on('$routeChangeStart', function(scope, next, current) {
			// console.log('Changing from '+angular.toJson(current)+' to '+angular.toJson(next));

			// authorization ping 
			// $rootScope.$broadcast('event:auth-ping');

			// transition
			if(current === undefined) {
				$rootScope.pageService.static = false;
			} else {
				// set false start pageService to static page, or doesn't needed services
				$rootScope.pageService.static = next.$$route.page.static == undefined ? false : next.$$route.page.static;
				transition.change();
			}
		});
		$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
			// console.log('current route', current.$$route)
			// inject page form current route
			$rootScope.page = current.$$route.page;
		});
		$rootScope.$on('$locationChangeStart', function(event, next, current) {
			// console.log(next);
			if(window._unsupported.status){
				$location.path('/');
			}
			if(!window._onbeforeunload){
				if(!confirm("You have attempted to leave this page. If you have made any changes to the settings without clicking the Save button, your changes will be lost.  Are you sure you want to exit this page?")) {
					event.preventDefault();
				}
			}
	    });
	});
	domReady(function() {
		angular.bootstrap(document, ['ImageApp']);
		$('html').attr('ng-app', 'ImageApp');
    });
});