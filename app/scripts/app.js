define([
    'angular',
    'angularBootstrap',
    'angularUtils',
    'angularMobile',
    'angularJQM',
    'angularHttpAuthInterceptor',
    'angularCookies',
    'angularResource',
    // 'angularRoute',
    'controllers/controllers',
    'directives/directives',
    'filters/filters',
    'providers/providers',
    'services/services',
], function(angular) {
    return angular.module('ImageApp', [
        'ui.bootstrap',
        'ui.event',
        'jqm',
        'http-auth-interceptor',

        'ngCookies',
        'ngResource',
        // 'ngRoute',

        'controllers',
        'directives',
        'filters',
        'providers',
        'services'
    ])
    .config(['$compileProvider', '$routeProvider', '$locationProvider', 'debugProvider', 'transitionProvider', 'imageReaderProvider',
            function($compileProvider, $routeProvider, $locationProvider, debugProvider, transitionProvider, imageReaderProvider) {

                // compile sanitazion
                $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);

                // router
                $routeProvider
                    .when('/', {
                        page: {
                            static: true,
                            title: '| Home',
                            breadcrumb: {
                                show: false
                            }
                        },
                        templateUrl: 'app/views/home.html',
                        controller: 'HomeController',
                        animation: 'page-slide'
                    })
                    .when('/facebook/banner', {
                        page: {
                            static: false,
                            title: '| Facebook Banner',
                            breadcrumb: {
                                show: true,
                                link: {
                                    title: 'Facebook Banner Template',
                                    href: '',
                                    active: 'Template Empty Prize',
                                }
                            }
                        },
                        templateUrl: 'app/views/banner.html',
                        controller: 'BannerController',
                        animation: 'page-slide',
                        resolve: {
                            banners: function($rootScope, $loadDialog, BannerTemplates, RecentBanners, CreatorID) {

                                if (angular.isDefined($rootScope.models.banner))
                                    return $rootScope.models.banner;

                                $loadDialog.show('Loading');
                                // $rootScope.pageService.message = 'Preparing banner templates..';
                                return BannerTemplates().then(function(templates) {
                                    // $('.ui-loader > h1').text('Preparing recent banners..');
                                    // $rootScope.pageService.message = 'Preparing recent banners..';
                                    return RecentBanners().then(function(recents) {
                                        return CreatorID().then(function(creator) {
                                            // $rootScope.pageService.start = false;
                                            $loadDialog.hide();
                                            var models = {
                                                templates: templates,
                                                recents: recents,
                                                banner: null,
                                                ID: creator.ID
                                            };
                                            $rootScope.models['banner'] = models;
                                            return models;
                                        });
                                    });
                                });
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
                                    href: '#!/facebook/banner',
                                    active: 'Template Empty Prize',
                                }
                            }
                        },
                        templateUrl: 'app/views/banner.html',
                        controller: 'BannerController',
                        animation: 'page-slide',
                        resolve: {
                            banners: function($rootScope, $loadDialog, $route, $timeout, BannerTemplates, RecentBanners, DetailBanner) {
                                $loadDialog.show('Loading');
                                // $rootScope.pageService.message = 'Requesting banner id '+ $route.current.params.bannerId +'..';
                                return DetailBanner().then(function(banner) {
                                    // $rootScope.pageService.message = 'Preparing banner templates..';
                                    return BannerTemplates().then(function(templates) {
                                        // $rootScope.pageService.message = 'Preparing recent banners..';
                                        return RecentBanners().then(function(recents) {
                                            // $rootScope.pageService.start = false;
                                            $loadDialog.hide();
                                            return {
                                                templates: templates,
                                                recents: recents,
                                                banner: banner
                                            };
                                        });
                                    });
                                });
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
                                    href: '',
                                    active: 'Template 1',
                                }
                            }
                        },
                        template: '<conversation-creator ng-model="data"></conversation-creator>',
                        controller: 'ConversationController',
                        animation: 'page-slide',
                        resolve: {
                            conversations: function($rootScope, $loadDialog, ConversationTemplates, RecentConversations, CreatorID) {

                                if (angular.isDefined($rootScope.models.conversations))
                                    return $rootScope.models.conversations;

                                $loadDialog.show('Loading');
                                // $rootScope.pageService.message = 'Preparing conversation templates..';
                                return ConversationTemplates().then(function(templates) {
                                    // $rootScope.pageService.message = 'Preparing recent conversations..';
                                    return RecentConversations().then(function(recents) {
                                        return CreatorID().then(function(creator) {
                                            // $rootScope.pageService.start = false;
                                            $loadDialog.hide();

                                            var models = {
                                                templates: templates,
                                                recents: recents,
                                                detail: null,
                                                ID: creator.ID
                                            };

                                            $rootScope.models['conversations'] = models;
                                            return models;
                                        });
                                    });
                                });
                            }
                        }
                    })
                    .when('/facebook/conversation/:conversationId', {
                        page: {
                            static: false,
                            title: '| Facebook Conversation',
                            breadcrumb: {
                                show: true,
                                link: {
                                    title: 'Facebook Conversation Template',
                                    href: '#!/facebook/conversation',
                                    active: 'Template 1',
                                }
                            }
                        },
                        template: '<conversation-creator ng-model="data"></conversation-creator>',
                        controller: 'ConversationController',
                        animation: 'page-slide',
                        resolve: {
                            conversations: function($rootScope, $loadDialog, $route, ConversationTemplates, RecentConversations, DetailConversation) {
                                $loadDialog.show('Loading');
                                // $rootScope.pageService.message = 'Requesting conversation id '+ $route.current.params.conversationId +'..';
                                return DetailConversation().then(function(conversation) {
                                    // $rootScope.pageService.message = 'Preparing conversation templates..';
                                    return ConversationTemplates().then(function(templates) {
                                        // $rootScope.pageService.message = 'Preparing recent conversations..';
                                        return RecentConversations().then(function(recents) {
                                            // $rootScope.pageService.start = false;
                                            $loadDialog.hide();
                                            return {
                                                templates: templates,
                                                recents: recents,
                                                detail: conversation
                                            };
                                        });
                                    });
                                });
                            }
                        }
                    })
                    .when('/splash', {
                        page: {
                            static: true,
                            title: '| Mobile SplashScreen',
                            breadcrumb: {
                                show: true,
                                link: {
                                    title: 'SplashScreen & Background',
                                    href: '',
                                    active: 'Splash Screen',
                                }
                            }
                        },
                        templateUrl: 'app/views/splash.html',
                        controller: 'SplashController',
                        animation: 'page-slide'
                    })
                    .when('/raphael', {
                        page: {
                            static: true,
                            title: '| Raphael',
                            breadcrumb: {
                                show: false
                            }
                        },
                        templateUrl: 'app/views/raphael.html',
                        controller: 'RaphaelController'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });

                // enable/disable debuging
                debugProvider.setDebug(true);

                // transition config  
                // transitionProvider.setStartTransition('expandIn');
                // transitionProvider.setPageTransition('slide');
                // transitionProvider.setPage('#wrap-content > .container');

                // Hashbang Mode
                $locationProvider
                    .html5Mode(false)
                    .hashPrefix('!');
            }
    ])
    .run([ '$rootScope', '$http', '$timeout', '$location', 'transition',
        function($rootScope, $http, $timeout, $location, transition) {
            window._unsupported = {
                allow : false,
                status: false
            };
            window._onbeforeunload = true;
    
            // only using firefox to run this application.
            // showing popup for unsopported browsers
            if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && window._unsupported.allow) {
                window._unsupported.status = true;
                $timeout(function() {
                    $.blockUI({
                        message: $('#popup-unsupported'),
                        overlayCSS: {
                            backgroundColor: '#000',
                            opacity: 0.8,
                            cursor: 'default'
                        },
                        css: {
                            background: 'transparent',
                            border: 'none',
                            top: ($(window).height() - 479) / 2 + 'px',
                            left: ($(window).width() - 649) / 2 + 'px',
                            width: '649px',
                            cursor: 'default'
                        }
                    })
                }, 400);
            }
            // define root scope models
            $rootScope.models = {};
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
            // define root scope pageService
            $rootScope.pageService = {
                loaded: false,
                start: false,
                reject: false,
                status: null,
                message: ''
            };
            $rootScope.$on('$routeChangeStart', function(scope, next, current) {
                $rootScope.$broadcast('test');
    
                // authorization ping 
                // $rootScope.$broadcast('event:auth-ping');
    
                // transition
                // if(current === undefined || next.$$route.controller == "HomeController") {
                //  $rootScope.pageService.static = false;
                // } else {
                //  // set false start pageService to static page, or doesn't needed services
                //  $rootScope.pageService.static = next.$$route.page.static == undefined ? false : next.$$route.page.static;
                //  transition.change();
                // }
            });
            $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
                // inject page from current route
                $rootScope.page = current.$$route.page;
            });
            $rootScope.$on('$locationChangeStart', function(event, next, current) {
                if (window._unsupported.status) {
                    $location.path('/');
                }
                if (!window._onbeforeunload) {
                    if (!confirm("You have attempted to leave this page. If you have made any changes to the settings without clicking the Save button, your changes will be lost.  Are you sure you want to exit this page?")) {
                        event.preventDefault();
                    } else {
                        window._onbeforeunload = true;
                    }
                }
            });
        }]);
});