/*! angular-jqm - v0.0.1-SNAPSHOT - 2013-09-23
 * https://github.com/angular-widgets/angular-jqm
 * Copyright (c) 2013 OPITZ CONSULTING GmbH; Licensed MIT */
(function(window, angular) {
    "use strict";
/**
 * @ngdoc overview
 * @name jqm
 * @description
 *
 * 'jqm' is the one module that contains all jqm code.
 */
var jqmModule = angular.module("jqm", ["ngMobile", "jqm-templates", "ui.bootstrap.position"]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$animator', ['$delegate', function ($animator) {

        patchedAnimator.enabled = $animator.enabled;
        return patchedAnimator;

        function patchedAnimator(scope, attr) {
            var animation = $animator(scope, attr),
                _leave = animation.leave,
                _enter = animation.enter;
            animation.enter = patchedEnter;
            animation.leave = patchedLeave;
            return animation;

            // if animations are disabled or we have none
            // add the "ui-page-active" css class manually.
            // E.g. needed for the initial page.
            function patchedEnter(elements) {
                var i, el;
                if (!$animator.enabled() || !animationName("enter")) {
                    forEachPage(elements, function (element) {
                        angular.element(element).addClass("ui-page-active");
                    });
                }
                /*jshint -W040:true*/
                return _enter.apply(this, arguments);
            }

            function patchedLeave(elements) {
                if (!$animator.enabled() || !animationName("leave")) {
                    forEachPage(elements, function (element) {
                        angular.element(element).removeClass("ui-page-active");
                    });
                }
                /*jshint -W040:true*/
                return _leave.apply(this, arguments);
            }

            function forEachPage(elements, callback) {
                angular.forEach(elements, function (element) {
                    if (element.className && ~element.className.indexOf('ui-page')) {
                        callback(element);
                    }
                });
            }

            function animationName(type) {
                // Copied from AnimationProvider.
                var ngAnimateValue = scope.$eval(attr.ngAnimate);
                var className = ngAnimateValue ?
                    angular.isObject(ngAnimateValue) ? ngAnimateValue[type] : ngAnimateValue + '-' + type
                    : '';
                return className;
            }
        }
    }]);
}]);

var PAGE_ANIMATION_DEFS = {
    none: {
        sequential: true,
        fallback: 'none'
    },
    slide: {
        sequential: false,
        fallback: 'fade'
    },
    fade: {
        sequential: true,
        fallback: 'fade'
    },
    pop: {
        sequential: true,
        fallback: 'fade'
    },
    slidefade: {
        sequential: true,
        fallback: 'fade'
    },
    slidedown: {
        sequential: true,
        fallback: 'fade'
    },
    slideup: {
        sequential: true,
        fallback: 'fade'
    },
    flip: {
        sequential: true,
        fallback: 'fade'
    },
    turn: {
        sequential: true,
        fallback: 'fade'
    },
    flow: {
        sequential: true,
        fallback: 'fade'
    }
};

registerPageAnimations(PAGE_ANIMATION_DEFS);

function registerPageAnimations(animations) {
    var type;
    for (type in animations) {
        registerPageAnimation(type, false, 'enter');
        registerPageAnimation(type, true, 'enter');
        registerPageAnimation(type, false, 'leave');
        registerPageAnimation(type, true, 'leave');
    }
}

function registerPageAnimation(animationType, reverse, direction) {
    var ngName = "page-" + animationType;

    if (reverse) {
        ngName += "-reverse";
    }
    ngName += "-" + direction;

    jqmModule.animation(ngName, ['$animationComplete', '$sniffer', function (animationComplete, $sniffer) {
        var degradedAnimationType = maybeDegradeAnimation(animationType),
            activePageClass = "ui-page-active",
            toPreClass = "ui-page-pre-in",
            addClasses = degradedAnimationType + (reverse ? " reverse" : ""),
            removeClasses = "out in reverse " + degradedAnimationType,
            viewPortClasses = "ui-mobile-viewport-transitioning viewport-" + degradedAnimationType,
            animationDef = PAGE_ANIMATION_DEFS[degradedAnimationType];

        if (degradedAnimationType === 'none') {
            return {
                setup: setupNone,
                start: startNone
            };
        } else {
            if (direction === "leave") {
                addClasses += " out";
                removeClasses += " " + activePageClass;
                return {
                    setup: setupLeave,
                    start: start
                };
            } else {
                addClasses += " in";
                return {
                    setup: setupEnter,
                    start: start
                };
            }
        }

        // --------------

        function setupNone(element) {
            element = filterElementsWithParents(element);
            if (direction === "leave") {
                element.removeClass(activePageClass);
            } else {
                element.addClass(activePageClass);
            }
        }

        function startNone(element, done) {
            done();
        }

        function setupEnter(element) {
            var synchronization;
            element = filterElementsWithParents(element);
            synchronization = createSynchronizationIfNeeded(element.eq(0).parent(), "enter");
            synchronization.events.preEnter.listen(function() {
                // Set the new page to display:block but don't show it yet.
                // This code is from jquery mobile 1.3.1, function "createHandler".
                // Prevent flickering in phonegap container: see comments at #4024 regarding iOS
                element.css("z-index", -10);
                element.addClass(activePageClass + " " + toPreClass);
            });
            synchronization.events.enter.listen(function() {
                // Browser has settled after setting the page to display:block.
                // Now start the animation and show the page.
                element.addClass(addClasses);
                // Restores visibility of the new page: added together with $to.css( "z-index", -10 );
                element.css("z-index", "");
                element.removeClass(toPreClass);
            });
            synchronization.events.enterDone.listen(function() {
                element.removeClass(removeClasses);
            });

            synchronization.enter();
            return synchronization;
        }

        function setupLeave(element) {
            var synchronization,
                origElement = element;
            element = filterElementsWithParents(element);
            synchronization = createSynchronizationIfNeeded(element.eq(0).parent(), "leave");
            synchronization.events.leave.listen(function () {
                element.addClass(addClasses);
            });
            synchronization.events.leaveDone.listen(function () {
                element.removeClass(removeClasses);
            });
            synchronization.leave();
            return synchronization;
        }

        function start(element, done, synchronization) {
            synchronization.events.end.listen(done);
        }

        function createSynchronizationIfNeeded(parent, direction) {
            var sync = parent.data("animationSync");
            if (sync && sync.running[direction]) {
                // We already have a running animation, so stop it
                sync.stop();
                sync = null;
            }
            if (!sync) {
                if (animationDef.sequential) {
                    sync = sequentialSynchronization(parent);
                } else {
                    sync = parallelSynchronization(parent);
                }
                sync.events.start.listen(function () {
                    parent.addClass(viewPortClasses);
                });
                sync.events.end.listen(function () {
                    parent.removeClass(viewPortClasses);
                    parent.data("animationSync", null);
                });
                parent.data("animationSync", sync);
            }
            sync.running = sync.running || {};
            sync.running[direction] = true;
            return sync;
        }

        function filterElementsWithParents(element) {
            var i, res = angular.element();
            for (i = 0; i < element.length; i++) {
                if (element[i].nodeType === 1 && element[i].parentNode) {
                    res.push(element[i]);
                }
            }
            return res;
        }

        function maybeDegradeAnimation(animation) {
            if (!$sniffer.cssTransform3d) {
                // Fall back to simple animation in browsers that don't support
                // complex 3d animations.
                animation = PAGE_ANIMATION_DEFS[animation].fallback;
            }
            if (!$sniffer.animations) {
                animation = "none";
            }
            return animation;
        }

        function parallelSynchronization(parent) {
            var events = {
                    start: latch(),
                    preEnter: latch(),
                    enter: latch(),
                    enterDone: latch(),
                    leave: latch(),
                    leaveDone: latch(),
                    end: latch()
                },
                runningCount = 0;
            events.start.listen(function () {
                // setTimeout to allow
                // the browser to settle after the new page
                // has been set to display:block and before the css animation starts.
                // Without this animations are sometimes not shown,
                // unless you call window.scrollTo or click on a link (weired dependency...)
                window.setTimeout(function () {
                    events.enter.notify();
                    events.leave.notify();
                }, 0);
            });
            events.end.listen(animationComplete(parent, onAnimationComplete));
            events.end.listen(events.enterDone.notify);
            events.end.listen(events.leaveDone.notify);
            events.start.listen(events.preEnter.notify);

            return {
                enter: begin,
                leave: begin,
                stop: stop,
                events: events
            };

            function begin() {
                runningCount++;
                events.start.notify();
            }

            function stop() {
                events.leaveDone.notify();
                events.enterDone.notify();
                events.end.notify();
            }

            function onAnimationComplete() {
                runningCount--;
                if (runningCount === 0) {
                    events.end.notify();
                }
            }
        }

        function sequentialSynchronization(parent) {
            var events = {
                    start: latch(),
                    preEnter: latch(),
                    enter: latch(),
                    enterDone: latch(),
                    leave: latch(),
                    leaveDone: latch(),
                    end: latch()
                },
                hasEnter = false,
                hasLeave = false,
                _onAnimationComplete = angular.noop;
            events.end.listen(animationComplete(parent, onAnimationComplete));
            events.start.listen(events.leave.notify);
            events.leaveDone.listen(events.preEnter.notify);
            events.leaveDone.listen(events.enter.notify);
            events.leaveDone.listen(function() {
                if (hasEnter) {
                    _onAnimationComplete = events.enterDone.notify;
                } else {
                    events.enterDone.notify();
                }
            });
            // setTimeout to detect if a leave animation has been used.
            window.setTimeout(function () {
                if (!hasLeave) {
                    events.leaveDone.notify();
                }
            }, 0);
            events.enterDone.listen(events.end.notify);

            return {
                enter: enter,
                leave: leave,
                stop: stop,
                events: events
            };

            function enter() {
                hasEnter = true;
                events.start.notify();
            }

            function leave() {
                hasLeave = true;
                events.start.notify();
                _onAnimationComplete = events.leaveDone.notify;
            }

            function stop() {
                events.leaveDone.notify();
                events.enterDone.notify();
                events.end.notify();
            }

            function onAnimationComplete() {
                _onAnimationComplete();
            }

        }
    }]);

    function latch() {
        var _listeners = [],
            _notified = false;
        return {
            listen: listen,
            notify: notify
        };

        function listen(callback) {
            if (_notified) {
                callback();
            } else {
                _listeners.push(callback);
            }
        }

        function notify() {
            if (_notified) {
                return;
            }
            var i;
            for (i = 0; i < _listeners.length; i++) {
                _listeners[i]();
            }
            _notified = true;
        }
    }
}

/**
 * @ngdoc directive
 * @name jqm.directive:jqmCachingView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `jqmCachingView` extends `jqmView` in the following way:
 *
 * - views are only compiled once and then stored in the `jqmViewCache`. By this, changes between views are very fast.
 * - controllers are still instantiated on every route change. Their changes to the scope get cleared
 *   when the view is left.
 *
 * Side effects:
 * - For animations between multiple routes that use the same template add the attribute `allow-same-view-animation`
 *   to the root of your view. Background: The DOM nodes and scope of the compiled template are reused for every view.
 *   With this attribute `jqmCachingView` will create two instances of the template internally.
 *   Example: Click on Moby and directly after this on Gatsby. Both routes use the same template and therefore
 *   the template has to contain `allow-same-view-animation`.
 *
 * @requires jqmViewCache
 *
 * @param {expression=} jqmCachingView angular expression evaluating to a route (optional). See `jqmView` for details.
 * @scope
 * @example
    <example module="jqmView">
      <file name="index.html">
          Choose:
          <a href="#/Book/Moby">Moby</a> |
          <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="#/Book/Gatsby">Gatsby</a> |
          <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="#/Book/Scarlet">Scarlet Letter</a><br/>

          <div jqm-caching-view style="height:300px"></div>
      </file>

      <file name="book.html">
        <div jqm-page allow-same-view-animation>
          <div jqm-header><h1>Book {{book.params.bookId}}</h1></div>
          The book contains ...
        </div>
      </file>

      <file name="chapter.html">
        <div jqm-page allow-same-view-animation>
          <div jqm-header><h1>Chapter {{chapter.params.chapterId}} of {{chapter.params.bookId}}</h1></div>
          This chapter contains ...
        </div>
      </file>

      <file name="script.js">
        angular.module('jqmView', ['jqm'], function($routeProvider) {
          $routeProvider.when('/Book/:bookId', {
            templateUrl: 'book.html',
            controller: BookCntl,
            controllerAs: 'book',
            animation: 'page-slide'
          });
          $routeProvider.when('/Book/:bookId/ch/:chapterId', {
            templateUrl: 'chapter.html',
            controller: ChapterCntl,
            controllerAs: 'chapter',
            animation: 'page-slide'
          });
        });

        function BookCntl($routeParams) {
          this.params = $routeParams;
        }

        function ChapterCntl($routeParams) {
          this.params = $routeParams;
        }
      </file>
    </example>
*/
jqmModule.directive('jqmCachingView', ['jqmViewDirective', 'jqmViewCache', '$injector',
    function (jqmViewDirectives, jqmViewCache, $injector) {
        return {
            restrict: 'ECA',
            controller: ['$scope', JqmCachingViewCtrl],
            require: 'jqmCachingView',
            compile: function(element, attr) {
                var links = [];
                angular.forEach(jqmViewDirectives, function (directive) {
                    links.push(directive.compile(element, attr));
                });
                return function (scope, element, attr, ctrl) {
                    angular.forEach(links, function (link) {
                        link(scope, element, attr, ctrl);
                    });
                };
            }
        };

        function JqmCachingViewCtrl($scope) {
            var self = this;
            angular.forEach(jqmViewDirectives, function (directive) {
                $injector.invoke(directive.controller, self, {$scope: $scope});
            });
            this.loadAndCompile = loadAndCompile;
            this.watchAttrName = 'jqmCachingView';
            this.onClearContent = onClearContent;

            // --------

            function loadAndCompile(templateUrl) {
                return jqmViewCache.load($scope, templateUrl).then(function (cacheEntry) {
                    var templateInstance = cacheEntry.next();
                    templateInstance.scope.$reconnect();
                    return templateInstance;
                });
            }

            function onClearContent(contents) {
                // Don't destroy the data of the elements when they are removed
                contents.remove = detachNodes;
            }

        }

        // Note: element.remove() would
        // destroy all data associated to those nodes,
        // e.g. widgets, ...
        function detachNodes() {
            /*jshint -W040:true*/
            var i, node, parent;
            for (i = 0; i < this.length; i++) {
                node = this[i];
                parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            }
        }
}]);

jqmModule.directive('jqmClass', [function() {
    return {
        link: function(scope, element, attr) {
            var oldVal;

            scope.$watch(attr.jqmClass, jqmClassWatchAction, true);

            attr.$observe('class', function(value) {
                var jqmClass = scope.$eval(attr.jqmClass);
                jqmClassWatchAction(jqmClass);
            });

            function jqmClassWatchAction(newVal) {
                if (oldVal && !angular.equals(newVal,oldVal)) {
                    changeClass('removeClass', oldVal);
                }
                changeClass('addClass', newVal);
                oldVal = angular.copy(newVal);
            }

            function changeClass(fn, classVal) {
                if (angular.isObject(classVal) && !angular.isArray(classVal)) {
                    var classes = [];
                    angular.forEach(classVal, function(v, k) {
                        if (v) { classes.push(k); }
                    });
                    classVal = classes;
                }
                element[fn](angular.isArray(classVal) ? classVal.join(' ') : classVal);
            }
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmFooter
 * @restrict A
 *
 * @description
 * Defines the footer of a `jqm-page`. For a persistent footer, put the footer directly below `jqmView` / `jqmCachingView`.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
   Hello world!
   <div jqm-footer>
     <h1>Footer of Page1</h1>
   </div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmFooter', ['jqmConfig', function (jqmConfig) {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        controller: angular.noop,
        link: function (scope, element, attr) {
            element.parent().data('jqmFooter', element);
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = jqmConfig.secondaryTheme;
            }
            element.addClass("ui-footer ui-bar-"+scope.$theme);
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmHeader
 * @restrict A
 *
 * @description
 * Defines the header of a `jqm-page`. For a persistent header, put the header directly below `jqmView` / `jqmCachingView`.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-page class="jqm-standalone-page" style="height: 100px;">
   <div jqm-header>
     <h1>Header of Page1</h1>
   </div>
   Hello world!
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmHeader', ['jqmConfig', function (jqmConfig) {
    return {
        restrict: 'A',
        // Own scope as we have a different default theme
        // than the page.
        scope: true,
        controller: angular.noop,
        link: function (scope, element, attr) {
            element.parent().data("jqmHeader", element);
            var hasExplicitTheme = scope.hasOwnProperty('$theme');
            if (!hasExplicitTheme) {
                scope.$theme = jqmConfig.secondaryTheme;
            }
            element.addClass("ui-header ui-bar-"+scope.$theme);
        }
    };
}]);

angular.forEach(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'], function (headerName) {
    jqmModule.directive(headerName, hxDirective);
});
function hxDirective() {
    return {
        restrict: 'E',
        require: ['?^jqmHeader', '?^jqmFooter'],
        compile: function () {
            return function (scope, element, attrs, ctrls) {
                var i;
                for (i=0; i<ctrls.length; i++) {
                    if (ctrls[i]) {
                        element.addClass("ui-title");
                        break;
                    }
                }
            };
        }
    };
}

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanel
 * @restrict A
 *
 * @description
 * Creates a jquery mobile panel.  Must be placed inside of a jqm-panel-container.
 *
 * @param {expression=} opened Assignable angular expression to data-bind the panel's open state to.
 * @param {string=} display Default 'reveal'.  What display type the panel has. Available: 'reveal', 'overlay', 'push'.
 * @param {string=} position Default 'left'. What position the panel is in. Available: 'left', 'right'.
 *
 * @require jqmPanelContainer.
 */
jqmModule.directive('jqmPanel', function() {
    var isDef = angular.isDefined;
    return {
        restrict: 'A',
        require: '^jqmPanelContainer',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmPanel.html',
        // marker controller.
        controller: angular.noop,
        scope: {
            display: '@',
            position: '@'
        },
        compile: function(element, attr) {
            attr.display = isDef(attr.display) ? attr.display : 'reveal';
            attr.position = isDef(attr.position) ? attr.position : 'left';

            return function(scope, element, attr, jqmPanelContainerCtrl) {
                if (scope.position !== 'left' && scope.position !== 'right') {
                    throw new Error("jqm-panel position is invalid. Expected 'left' or 'right', got '"+scope.position+"'");
                }
                jqmPanelContainerCtrl.addPanel({
                    scope: scope,
                    element: element
                });
            };
        }
    };
});

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPanelContainer
 * @restrict A
 *
 * @description
 * A container for jquery mobile panels.
 *
 * If you wish to use this with a view, you want the jqm-panel-container as the
 * parent of your view and your panels. For example:
 * <pre>
 * <div jqm-panel-container="myPanel">
 *   <div jqm-panel>My Panel!</div>
 *   <div jqm-view></div>
 * </div>
 * </pre>
 *
 * @param {expression=} jqmPanelContainer Assignable angular expression to data-bind the panel's open state to.
 *                      This is either `left` (show left panel), `right` (show right panel) or null.
 *
 * @example
<example module="jqm">
  <file name="index.html">
     <div ng-init="state={}"></div>
     <div jqm-panel-container="state.openPanel" style="height:300px;overflow:hidden">
        <div jqm-panel position="left">
          Hello, left panel!
        </div>
        <div jqm-panel position="right" display="overlay">
         Hello, right panel!
        </div>
        <div style="background: white">
           Opened panel: {{state.openPanel}}
           <button ng-click="state.openPanel='left'">Open left</button>
           <button ng-click="state.openPanel='right'">Open right</button>
        </div>
     </div>
  </file>
</example>
 */

jqmModule.directive('jqmPanelContainer', function () {
    return {
        restrict: 'A',
        scope: {
            openPanelName: '=jqmPanelContainer'
        },
        transclude: true,
        templateUrl: 'templates/jqmPanelContainer.html',
        replace: true
    };
});
// Separate directive for the controller as we can't inject a controller from a directive with templateUrl
// into children!
jqmModule.directive('jqmPanelContainer', ['$timeout', '$transitionComplete', '$sniffer', function ($timeout, $transitionComplete, $sniffer) {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', JqmPanelContainerCtrl],
        link: function(scope, element, attr, jqmPanelContainerCtrl) {
            jqmPanelContainerCtrl.setContent(findPanelContent());

            function findPanelContent() {
                var content = angular.element();
                angular.forEach(element.children(), function(element) {
                    var el = angular.element(element);
                    // ignore panels and the generated ui-panel-dismiss div.
                    if (!el.data('$jqmPanelController') && el.data('$scope') && el.scope().$$transcluded) {
                        content.push(element);
                    }
                });
                return content;
            }
        }
    };
    function JqmPanelContainerCtrl($scope, $element) {
        var panels = {},
            content;

        this.addPanel = function (panel) {
            panels[panel.scope.position] = panel;
        };
        this.setContent = function(_content) {
            content = _content;
        };
        $scope.$watch('$scopeAs.pc.openPanelName', openPanelChanged);
        if (!$sniffer.animations) {
            $scope.$watch('$scopeAs.pc.openPanelName', transitionComplete);
        } else {
            $transitionComplete($element, transitionComplete);
        }

        function openPanelChanged() {
            updatePanelContent();
            angular.forEach(panels, function (panel) {
                var opened = panel.scope.position === $scope.openPanelName;
                if (opened) {
                    panel.element.removeClass('ui-panel-closed');
                    $timeout(function () {
                        panel.element.addClass('ui-panel-open');
                    }, 1, false);
                } else {
                    panel.element.removeClass('ui-panel-open ui-panel-opened');
                }
            });

        }

        //Doing transition stuff in jqmPanelContainer, as
        //we need to listen for transition complete event on either the panel
        //element or the panel content wrapper element. Some panel display
        //types (overlay) only animate the panel, and some (reveal) only
        //animate the content wrapper.
        function transitionComplete() {
            angular.forEach(panels, function (panel) {
                var opened = panel.scope.position === $scope.openPanelName;
                if (opened) {
                    panel.element.addClass('ui-panel-opened');
                } else {
                    panel.element.addClass('ui-panel-closed');
                }
            });
        }

        function updatePanelContent() {
            if (!content) {
                return;
            }
            var openPanel = panels[$scope.openPanelName],
                openPanelScope = openPanel && openPanel.scope;

            content.addClass('ui-panel-content-wrap ui-panel-animate');

            content.toggleClass('ui-panel-content-wrap-open', !!openPanelScope);

            content.toggleClass('ui-panel-content-wrap-position-left',
                !!(openPanelScope && openPanelScope.position === 'left'));

            content.toggleClass('ui-panel-content-wrap-position-right',
                !!(openPanelScope && openPanelScope.position === 'right'));
            content.toggleClass('ui-panel-content-wrap-display-reveal',
                !!(openPanelScope && openPanelScope.display === 'reveal'));
            content.toggleClass('ui-panel-content-wrap-display-push',
                !!(openPanelScope && openPanelScope.display === 'push'));
            content.toggleClass('ui-panel-content-wrap-display-overlay',
                !!(openPanelScope && openPanelScope.display === 'overlay'));
        }
    }
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPopup
 * @restrict A
 *
 * @description
 * Creates a popup with the given content.  The popup can be opened and closed on an element using {@link jqm.directive:jqmPopupTarget jqmPopupTarget}.
 *
 * Tip: put a {@link jqm.directive:jqmView jqmView} inside a popup to have full scrollable pages inside.
 * <pre>
 * <div jqm-popup="myPopup">
 *   <div jqm-view="{
 *     templateUrl: 'views/my-popup-content-page.html',
 *     controller: 'MyPopupController'
 *   }"></div>
 * </div>
 * </pre>
 *
 * @param {expression} jqmPopup Assignable angular expression to bind this popup to.  jqmPopupTargets will point to this model.
 * @param {expression=} animation jQuery Mobile animation to use to show/hide this popup.  Default 'fade'.
 * @param {expression=} placement Where to put the popup relative to its target.  Available: 'left', 'right', 'top', 'bottom', 'inside'. Default: 'inside'.
 * @param {expression=} overlay-theme The theme to use for the overlay behind the popup. Defaults to the popup's theme.
 * @param {expression=} corners Whether the popup has corners. Default true.
 * @param {expression=} shadow Whether the popup has shadows. Default true.
 *
 * @example
<example module="jqm">
  <file name="index.html">
      <div jqm-popup="myPopup">
        Hey guys, here's a popup!
      </div>
      <div style="padding: 50px;"
         jqm-popup-target="myPopup"
         jqm-popup-model="pageCenterPop">

         <div jqm-button ng-click="pageCenterPop = true">
            Open Page Center Popup
         </div>
         <div jqm-button
           jqm-popup-target="myPopup"
           jqm-popup-model="buttonPop"
           jqm-popup-placement="left"
           ng-click="buttonPop = true">
           Open popup left of this button!
       </div>
      </div>
  </file>
</example>
 */
jqmModule.directive('jqmPopup', ['$position', '$animationComplete', '$parse', '$rootElement', '$timeout', '$compile', '$rootScope',
function($position, animationComplete, $parse, $rootElement, $timeout, $compile, $rootScope) {
    var isDef = angular.isDefined;
    var popupOverlayTemplate = '<div jqm-popup-overlay></div>';

    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'templates/jqmPopup.html',
        require: '^?jqmPage',
        scope: {
            corners: '@',
            shadow: '@',
            placement: '@',
            animation: '@',
            overlayTheme: '@',
            dismissible: '@'
        },
        compile: function(elm, attr) {
            attr.animation = isDef(attr.animation) ? attr.animation : 'fade';
            attr.corners = isDef(attr.corners) ? attr.corners==='true' : true;
            attr.shadow = isDef(attr.shadow) ? attr.shadow==='true' : true;
            attr.dismissible = isDef(attr.dismissible) ? attr.dismissible==='true' : true;

            return postLink;
        }
    };
    function postLink(scope, elm, attr, pageCtrl) {
        animationComplete(elm, onAnimationComplete);

        var popupModel = $parse(attr.jqmPopup);
        
        if (!popupModel.assign) {
            throw new Error("jqm-popup expected assignable expression for jqm-popup attribute, got '" + attr.jqmPopup + "'");
        }
        popupModel.assign(scope.$parent, scope);
        
        console.group();
        console.log('scope', scope);
        console.groupEnd();

        elm.after( $compile(popupOverlayTemplate)(scope) );

        //Publicly expose show, hide methods
        scope.show = show;
        scope.hideForElement = hideForElement;
        scope.hide = hide;
        scope.target = null;
        scope.opened = false;

        function show(target, placement) {
            scope.target = target;
            scope.opened = true;
            placement = placement || scope.placement;

            elm.css( getPosition(elm, target, placement) );
            scope.$root.$broadcast('$popupStateChanged', scope);
            if (scope.animation === 'none') {
                onAnimationComplete();
            } else {
                elm.addClass('in').removeClass('out');
            }

        }
        function hideForElement(target) {
            if (scope.target && target && scope.target[0] === target[0]) {
                scope.hide();
            }
        }
        function hide() {
            if(!scope.dismissible) return;

            scope.target = null;
            scope.opened = false;
            elm.addClass('out').removeClass('in');

            scope.$root.$broadcast('$popupStateChanged', scope);
            if (scope.animation === 'none') {
                onAnimationComplete();
            } else {
                elm.addClass('out').removeClass('in');
            }

            scope.dismissible = attr.dismissible;
        }

        function onAnimationComplete() {
            elm.toggleClass('ui-popup-active', scope.opened);
            elm.toggleClass('ui-popup-hidden', !scope.opened);
            if (!scope.opened) {
                elm.css('left', '');
                elm.css('top', '');
            }
        }

        function getPosition(elm, target, placement) {
            var popWidth = elm.prop( 'offsetWidth' );
            var popHeight = elm.prop( 'offsetHeight' );
            var pos = $position.position(target);

            var newPosition = {};
            switch (placement) {
                case 'right':
                    newPosition = {
                        top: pos.top + pos.height / 2 - popHeight / 2,
                        left: pos.left + pos.width
                    };
                    break;
                case 'bottom':
                    newPosition = {
                        top: pos.top + pos.height,
                        left: pos.left + pos.width / 2 - popWidth / 2
                    };
                    break;
                case 'left':
                    newPosition = {
                        top: pos.top + pos.height / 2 - popHeight / 2,
                        left: pos.left - popWidth
                    };
                    break;
                case 'top':
                    newPosition = {
                        top: pos.top - popHeight,
                        left: pos.left + pos.width / 2 - popWidth / 2
                    };
                    break;
                case 'center':
                    var page = document.querySelector('.ui-page');
                    newPosition = {
                        top: (page.offsetHeight - popHeight) / 2,
                        left:(page.offsetWidth - popWidth) / 2
                    };
                    break;
                default:
                    newPosition = {
                        top: pos.top + pos.height / 2 - popHeight / 2,
                        left: pos.left + pos.width / 2 - popWidth / 2
                    };
                    break;
            }

            newPosition.top = Math.max(newPosition.top, 0);
            newPosition.left = Math.max(newPosition.left, 0);

            newPosition.top += 'px';
            newPosition.left += 'px';

            return newPosition;
        }
    }
}]);

jqmModule.directive('jqmPopupOverlay', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'templates/jqmPopupOverlay.html'
    };
});

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPopupTarget
 * @restrict A
 *
 * @description
 * Marks an element as a target for a {@link jqm.directive:jqmPopup jqmPopup}, and assigns a model to toggle to show or hide that popup on the element.
 *
 * See {@link jqm.directive:jqmPopup jqmPopup} for an example.
 *
 * @param {expression} jqmPopupTarget Model of a jqmPopup that this element will be linked to.
 * @param {expression=} jqm-popup-model Assignable angular boolean expression that will say whether the popup from jqmPopupTarget is opened on this element. Default '$popup'.
 * @param {string=} jqm-popup-placement The placement for the popup to pop over this element.  Overrides jqmPopup's placement attribute.  See {@link jqm.directive:jqmPopup jqmPopup} for the available values.
 *
 * @require jqmPopup
 */
jqmModule.directive('jqmPopupTarget', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, elm, attr) {
            var jqmPopup;
            var popupModel = $parse(attr.jqmPopupModel || '$popup');

            var placement;
            attr.$observe('jqmPopupPlacement', function(p) {
                placement = p;
            });

            scope.$watch(attr.jqmPopupTarget, setPopup);
            scope.$watch(popupModel, popupModelWatch);
            scope.$on('$popupStateChanged', popupStateChanged);

            function setPopup(newPopup) {
                jqmPopup = newPopup;
                popupModelWatch( popupModel(scope) );
            }
            function popupModelWatch(isOpen) {
                if (jqmPopup) {
                    if (isOpen) {
                        jqmPopup.show(elm, placement);
                    } else if (jqmPopup.opened) {
                        jqmPopup.hideForElement(elm);
                    }
                }
            }
            function popupStateChanged($e, popup) {
                //We only care if we're getting change from our popupTarget
                if (popup === jqmPopup) {
                    popupModel.assign(
                        scope,
                        popup.opened && popup.target && popup.target[0] === elm[0]
                    );
                }
            }

        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmPositionAnchor
 * @restrict A
 *
 * @description
 * For every child element that has an own scope this will set the property $position in the child's scope
 * and keep that value updated whenever elements are added, moved or removed from the element.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div jqm-position-anchor>
     <div ng-controller="angular.noop">First child: {{$position}}</div>
     <div ng-controller="angular.noop">Middle child: {{$position}}</div>
     <div ng-controller="angular.noop">Last child: {{$position}}</div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmPositionAnchor', [ '$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var elementNode = element[0];
            afterFn(elementNode, 'appendChild', enqueueUpdate);
            afterFn(elementNode, 'insertBefore', enqueueUpdate);
            afterFn(elementNode, 'removeChild', enqueueUpdate);

            enqueueUpdate();

            function afterFn(context, fnName, afterCb) {
                var fn = context[fnName];
                context[fnName] = function (arg1, arg2) {
                    fn.call(context, arg1, arg2);
                    afterCb(arg1, arg2);
                };
            }

            function enqueueUpdate() {
                if (!enqueueUpdate.started) {
                    enqueueUpdate.started = true;
                    $rootScope.$evalAsync(function () {
                        updateChildren();
                        enqueueUpdate.started = false;
                    });
                }
            }

            function updateChildren() {
                var children = element.children(),
                    length = children.length,
                    i, child, newPos, childScope;
                for (i = 0; i < length; i++) {
                    child = children.eq(i);
                    childScope = child.scope();
                    if (childScope !== scope) {
                        childScope.$position = getPosition(i, length);
                    }
                }
            }

            function getPosition(index, length) {
                return {
                    first: index === 0,
                    last: index === length - 1,
                    middle: index > 0 && index < length - 1
                };
            }

        }
    };
}]);
jqmModule.directive('jqmScopeAs', [function () {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            var scopeAs = attrs.jqmScopeAs;
            return {
                pre: function (scope) {
                    scope.$$scopeAs = scopeAs;
                }
            };
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmTheme
 * @restrict A
 *
 * @description
 * Sets the jqm theme for this element and it's children by adding a `$theme` property to the scope.
 * Other directives like `jqmCheckbox` evaluate that property.
 *
 * @example
 <example module="jqm">
 <file name="index.html">
 <div>
   <div jqm-checkbox jqm-theme="a">Theme a</div>
   <div jqm-checkbox jqm-theme="b">Theme b</div>
 </div>
 </file>
 </example>
 */
jqmModule.directive('jqmTheme', [function () {
    return {
        restrict: 'A',
        // Need an own scope so we can distinguish between the parent and the child scope!
        scope: true,
        compile: function compile() {
            return {
                pre: function preLink(scope, iElement, iAttrs) {
                    // Set the theme before all other link functions of children
                    var theme = iAttrs.jqmTheme;
                    if (theme) {
                        scope.$theme = theme;
                    }
                }
            };
        }
    };
}]);

/**
 * @ngdoc directive
 * @name jqm.directive:jqmView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `jqmView` extends `ngView` in the following way:
 *
 * - animations can also be specified on routes using the `animation` property (see below).
 * - animations can also be specified in the template using the `view-animation` attribute on a root element.
 * - when the user hits the back button, the last animation is executed with the `-reverse` suffix.
 * - instead of using `$route` an expression can be specified as value of the directive. Whenever
 *   the value of this expression changes `jqmView` updates accordingly.
 * - content that has been declared inside of `ngView` stays there, so you can mix dynamically loaded content with
 *   fixed content.
 *
 * @param {expression=} jqmView angular expression evaluating to a route.
 *
 *   * `{string}`: This will be interpreted as the url of a template.
 *   * `{object}`: A route object with the same properties as `$route.current`:
 *     - `templateUrl` - `{string=}` - the url for the template
 *     - `controller` - `{string=|function()=}` - the controller
 *     - `controllerAs` - `{string=}` - the name of the controller in the scope
 *     - `locals` - `{object=}` - locals to be used when instantiating the controller
 *     - `back` - `{boolean=}` - whether the animation should be executed in reverse
 *     - `animation` - `{string=|function()=}` - the animation to use. If `animation` is a function it will
 *        be called using the `$injector` with the extra locals `$routeParams` (`route.params`) and `$scope` (the scope of `jqm-view`).
 *
 * @scope
 * @example
 <example module="jqmView">
 <file name="index.html">
 Choose:
 <a href="#/Book/Moby">Moby</a> |
 <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
 <a href="#/Book/Gatsby">Gatsby</a> |
 <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
 <a href="#/Book/Scarlet">Scarlet Letter</a><br/>

 <div jqm-view style="height:300px"></div>
 </file>

 <file name="book.html">
 <div jqm-page>
 <div jqm-header><h1>Book {{book.params.bookId}}</h1></div>
 The book contains ...
 </div>
 </file>

 <file name="chapter.html">
 <div jqm-page>
 <div jqm-header><h1>Chapter {{chapter.params.chapterId}} of {{chapter.params.bookId}}</h1></div>
 This chapter contains ...
 </div>
 </file>

 <file name="script.js">
 angular.module('jqmView', ['jqm'], function($routeProvider) {
          $routeProvider.when('/Book/:bookId', {
            templateUrl: 'book.html',
            controller: BookCntl,
            controllerAs: 'book',
            animation: 'page-slide'
          });
          $routeProvider.when('/Book/:bookId/ch/:chapterId', {
            templateUrl: 'chapter.html',
            controller: ChapterCntl,
            controllerAs: 'chapter',
            animation: 'page-slide'
          });
        });

 function BookCntl($routeParams) {
          this.params = $routeParams;
        }

 function ChapterCntl($routeParams) {
          this.params = $routeParams;
        }
 </file>
 </example>
 */
jqmModule.directive('jqmView', ['$templateCache', '$route', '$anchorScroll', '$compile',
    '$controller', '$animator', '$http', '$q', '$injector',
    function ($templateCache, $route, $anchorScroll, $compile, $controller, $animator, $http, $q, $injector) {
        return {
            restrict: 'ECA',
            controller: ['$scope', JqmViewCtrl],
            require: 'jqmView',
            compile: function (element, attr) {
                element.children().attr('view-fixed', 'true');
                return link;
            }
        };
        function link(scope, element, attr, jqmViewCtrl) {
            var lastScope,
                lastContents,
                lastAnimationName,
                onloadExp = attr.onload || '',
                animateAttr = {},
                animate = $animator(scope, animateAttr),
                jqmViewExpr = attr[jqmViewCtrl.watchAttrName],
                changeCounter = 0;
            if (!jqmViewExpr) {
                watchRoute();
            } else {
                watchRouteExp(jqmViewExpr);
            }

            function watchRoute() {
                scope.$on('$routeChangeSuccess', update);
                update();

                function update() {
                    routeChanged($route.current);
                }
            }


            function watchRouteExp(routeExp) {
                // only shallow watch (e.g. change of route instance)
                scope.$watch(routeExp, routeChanged, false);
            }

            function routeChanged(route) {
                // For this counter logic, see ngIncludeDirective!
                var thisChangeId = ++changeCounter,
                    $template;
                if (!route || angular.isString(route)) {
                    route = {
                        templateUrl: route
                    };
                }
                $template = route.locals && route.locals.$template;
                var url = route.loadedTemplateUrl || route.templateUrl || $template;
                if (url) {
                    // Note: $route already loads the template. However, as it's also
                    // using $templateCache and so does loadAndCompile we don't get extra $http requests.
                    jqmViewCtrl.loadAndCompile(url, $template).then(function (templateInstance) {
                        if (thisChangeId !== changeCounter) {
                            return;
                        }
                        templateLoaded(route, templateInstance);
                    }, function () {
                        if (thisChangeId === changeCounter) {
                            clearContent();
                        }
                        clearContent();
                    });
                } else {
                    clearContent();
                }
            }

            function clearContent() {
                var contents = angular.element();
                angular.forEach(element.contents(), function(element) {
                    var el = angular.element(element);
                    if (!el.attr('view-fixed')) {
                        contents.push(element);
                    }
                });

                jqmViewCtrl.onClearContent(contents);
                animate.leave(contents, element);
                if (lastScope) {
                    lastScope.$destroy();
                    lastScope = null;
                }
            }

            function templateLoaded(route, templateInstance) {
                var locals = route.locals || {},
                    controller;
                calcAnimation(route, templateInstance);
                clearContent();
                animate.enter(templateInstance.elements, element);

                lastScope = locals.$scope = templateInstance.scope;
                route.scope = lastScope;
                lastContents = templateInstance.elements;

                if (route.controller) {
                    controller = $controller(route.controller, locals);
                    if (route.controllerAs) {
                        lastScope[route.controllerAs] = controller;
                    }
                    element.children().data('$ngControllerController', controller);
                }
                lastScope.$emit('$viewContentLoaded', templateInstance.elements);
                lastScope.$eval(onloadExp);
                // $anchorScroll might listen on event...
                $anchorScroll();
            }

            function calcAnimation(route, templateInstance) {
                var animation,
                    reverse = route.back,
                    routeAnimationName,
                    animationName;
                if (attr.ngAnimate) {
                    animateAttr.ngAnimate = attr.ngAnimate;
                    return;
                }
                animation = route.animation;
                if (angular.isFunction(animation) || angular.isArray(animation)) {
                    routeAnimationName = $injector.invoke(route.animation, null, {
                        $scope: scope,
                        $routeParams: route.params
                    });
                } else {
                    routeAnimationName = animation;
                }
                if (!routeAnimationName) {
                    angular.forEach(templateInstance.elements, function (element) {
                        var el = angular.element(element);
                        routeAnimationName = routeAnimationName || el.attr('view-animation') || el.attr('data-view-animation');
                    });
                }
                if (reverse) {
                    animationName = lastAnimationName;
                    if (animationName) {
                        animationName += "-reverse";
                    }
                } else {
                    animationName = routeAnimationName;
                }
                lastAnimationName = routeAnimationName;
                if (animationName) {
                    animateAttr.ngAnimate = "'" + animationName + "'";
                } else {
                    animateAttr.ngAnimate = "''";
                }
            }
        }

        function JqmViewCtrl($scope) {
            this.watchAttrName = 'jqmView';
            this.loadAndCompile = loadAndCompile;
            this.onClearContent = angular.noop;

            function loadAndCompile(templateUrl, template) {
                if (template) {
                    return $q.when(compile(template));
                } else {
                    return $http.get(templateUrl, {cache: $templateCache}).then(function (response) {
                        return compile(response.data);
                    });
                }
            }

            function compile(template) {
                var link = $compile(angular.element('<div></div>').html(template).contents());
                var scope = $scope.$new();
                return {
                    scope: scope,
                    elements: link(scope)
                };
            }
        }
    }]);

jqmModule.factory('$animationComplete', ['$sniffer', function ($sniffer) {
    return function (el, callback, once) {
        var eventNames = 'animationend';
        if (!$sniffer.animations) {
            throw new Error("Browser does not support css animations.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "AnimationEnd";
        }
        var _callback = callback;
        if (once) {
            callback = function() {
                unbind();
                _callback();
            };
        }
        //We have to split because unbind doesn't support multiple event names in one string
        //This will be fixed in 1.2, PR opened https://github.com/angular/angular.js/pull/3256
        angular.forEach(eventNames.split(' '), function(eventName) {
            el.bind(eventName, callback);
        });

        return unbind;

        function unbind() {
            angular.forEach(eventNames.split(' '), function(eventName) {
                el.unbind(eventName, callback);
            });
        }
    };
}]);

jqmModule.config(['$provide', function($provide) {
    var lastLocationChangeByProgram = false;
    $provide.decorator('$location', ['$delegate', '$browser', '$history', '$rootScope', function($location, $browser, $history, $rootScope) {
        instrumentBrowser();

        $rootScope.$on('$locationChangeSuccess', function () {
            if (!lastLocationChangeByProgram) {
                $history.onUrlChangeBrowser($location.url());
            }
        });

        $history.onUrlChangeProgrammatically($location.url() || '/', false);

        return $location;

        function instrumentBrowser() {
            var _url = $browser.url;
            $browser.url = function (url, replace) {
                if (url) {
                    // setter
                    $history.onUrlChangeProgrammatically($location.url(), replace);
                    lastLocationChangeByProgram = true;
                    $rootScope.$evalAsync(function () {
                        lastLocationChangeByProgram = false;
                    });
                }
                return _url.apply(this, arguments);
            };
        }
    }]);
}]);

jqmModule.factory('$history', ['$window', '$timeout', function $historyFactory($window, $timeout) {
    var $history = {
        go: go,
        urlStack: [],
        indexOf: indexOf,
        activeIndex: -1,
        previousIndex: -1,
        onUrlChangeBrowser: onUrlChangeBrowser,
        onUrlChangeProgrammatically: onUrlChangeProgrammatically
    };

    return $history;

    function go(relativeIndex) {
        // Always execute history.go asynchronously.
        // This is required as firefox and IE10 trigger the popstate event
        // in sync. By using a setTimeout we have the same behaviour everywhere.
        // Don't use $defer here as we don't want to trigger another digest cycle.
        // Note that we need at least 20ms to ensure that
        // the hashchange/popstate event for the current page
        // as been delivered (in IE this can take some time...).
        $timeout(function () {
            $window.history.go(relativeIndex);
        }, 20, false);
    }

    function indexOf(url) {
        var i,
            urlStack = $history.urlStack;
        for (i = 0; i < urlStack.length; i++) {
            if (urlStack[i].url === url) {
                return i;
            }
        }
        return -1;
    }

    function onUrlChangeBrowser(url) {
        var oldIndex = $history.activeIndex;
        $history.activeIndex = indexOf(url);
        if ($history.activeIndex === -1) {
            onUrlChangeProgrammatically(url, false);
        } else {
            $history.previousIndex = oldIndex;
        }
    }

    function onUrlChangeProgrammatically(url, replace) {
        var currentEntry = $history.urlStack[$history.activeIndex];
        if (!currentEntry || currentEntry.url !== url) {
            $history.previousIndex = $history.activeIndex;
            if (!replace) {
                $history.activeIndex++;
            }
            $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
            $history.urlStack.push({url: url});
        }
    }
}]);

/**
 * @ngdoc object
 * @name jqm.jqmConfigProvider
 *
 * @description Used to configure the default theme.
 */

jqmModule.provider('jqmConfig', function() {
    /**
     * @ngdoc method
     * @name jqm.jqmConfigProvider#primaryTheme
     * @methodOf jqm.jqmConfigProvider
     *
     * @description Sets/gets the default primary theme (used if jqm-theme is
     * not set on the element). Default: 'c'
     *
     * @param {string=} newTheme The new primary theme to set.
     * @returns {string} The current primary theme.
     */
    /**
     * @ngdoc method
     * @name jqm.jqmConfigProvider#secondaryTheme
     * @methodOf jqm.jqmConfigProvider
     * 
     * @description Sets/gets the secondary theme (used on footers, headers, etc 
     * if not theme is set on the element). Default: 'a'
     *
     * @param {string=} newTheme The new secondary theme to set.
     * @returns {string} The current secondary theme.
     */

    var _primaryTheme = 'c';
    var _secondaryTheme = 'a';
    return {
        primaryTheme: primaryTheme,
        secondaryTheme: secondaryTheme,
        $get: serviceFactory
    };

    function primaryTheme(value) {
        if (value) { _primaryTheme = value; }
        return _primaryTheme;
    }
    function secondaryTheme(value) {
        if (value) { _secondaryTheme = value; }
        return _secondaryTheme;
    }

    /**
     * @ngdoc object
     * @name jqm.jqmConfig
     * @description
     * A service used to tell the default primary and secondary theme. 
     */
    /**
     * @ngdoc property
     * @name jqm.jqmConfig#primaryTheme
     * @propertyOf jqm.jqmConfig
     *
     * @description {string} The current primary theme.  See {@link jqm.jqmConfigProvider#primaryTheme}.
     */
    /**
     * @ngdoc property
     * @name jqm.jqmConfig#secondaryTheme
     * @propertyOf jqm.jqmConfig
     *
     * @description {string} The current secondary theme.  See {@link jqm.jqmConfigProvider#secondaryTheme}.
     */
    function serviceFactory() {
        return {
            primaryTheme: _primaryTheme,
            secondaryTheme: _secondaryTheme
        };
    }

});

jqmModule.provider('jqmViewCache', function () {
    return {
        $get: ['$cacheFactory', '$compile', '$http', '$templateCache', '$q', factory]
    };

    function factory($cacheFactory, $compile, $http, $templateCache, $q) {
        var jqmViewCache = $cacheFactory('jqmCachingView');

        return {
            cache: jqmViewCache,
            load: load
        };

        function load(scope, url) {
            var cacheKey = scope.$id+'@'+url,
                cacheEntryPromise = jqmViewCache.get(cacheKey);
            if (cacheEntryPromise) {
                return cacheEntryPromise;
            }
            cacheEntryPromise = $http.get(url, {cache: $templateCache}).then(function (response) {
                var compileElements = angular.element('<div></div>').html(response.data).contents();
                return createCacheEntry(scope, compileElements);
            });
            jqmViewCache.put(cacheKey, cacheEntryPromise);
            return cacheEntryPromise;
        }

        function createCacheEntry(scope, compileElements) {
            var currentIndex = 0,
                templateInstances = [],
                i,
                templateInstanceCount = 1,
                link;
            angular.forEach(compileElements, function (element) {
                var el;
                if (element.nodeType === window.Node.ELEMENT_NODE) {
                    el = angular.element(element);
                    if (angular.isDefined(el.attr('allow-same-view-animation')) ||
                        angular.isDefined(el.attr('data-allow-same-view-animation'))) {
                        templateInstanceCount = 2;
                    }
                }
            });
            link = $compile(compileElements);
            for (i = 0; i < templateInstanceCount; i++) {
                templateInstances.push(createTemplateInstance(link, scope, true));
            }
            return {
                get: get,
                next: next
            };

            function get(index) {
                if (!angular.isDefined(index)) {
                    index = currentIndex;
                }
                return templateInstances[index];
            }

            function next() {
                currentIndex++;
                if (currentIndex >= templateInstances.length) {
                    currentIndex = 0;
                }
                return get(currentIndex);
            }
        }

        function createTemplateInstance(link, scope, clone) {
            var ctrlScope = scope.$new(),
                directiveScope = ctrlScope.$new(),
                elements,
                cloneAttachFn;
            ctrlScope.$disconnect();
            ctrlScope.$destroy = scopeClearAndDisconnect;
            if (clone) {
                cloneAttachFn = angular.noop;
            }
            elements = link(directiveScope, cloneAttachFn);
            return {
                scope: ctrlScope,
                elements: elements
            };
        }
    }

    function scopeClearAndDisconnect() {
        /*jshint -W040:true*/
        var prop;
        // clear all watchers, listeners and all non angular properties,
        // so we have a fresh scope!
        this.$$watchers = [];
        this.$$listeners = [];
        for (prop in this) {
            if (this.hasOwnProperty(prop) && prop.charAt(0) !== '$') {
                delete this[prop];
            }
        }
        this.$disconnect();
    }

});
/**
 * @ngdoc function
 * @name jqm.$loadDialog
 * @requires $rootElement
 * @requires $rootScope
 *
 * @description
 * Shows a wait dialog to indicate some long running work.
 * @example
<example module="jqm">
  <file name="index.html">
    <div ng-controller="DemoCtrl">
      <button ng-click="$loadDialog.hide()">Hide</button>
      <hr />
      <div jqm-textinput placeholder="Dialog Text" ng-model="dialogText"></div>
      <button ng-click="$loadDialog.show(dialogText)">Show{{dialogText && ' with text' || ''}}</button>
      <hr />
      <button ng-click="showForPromise()">waitFor promise</button>
    </div>
  </file>
  <file name="script.js">
    function DemoCtrl($scope, $loadDialog, $timeout, $q) {
      $scope.$loadDialog = $loadDialog;     

      $scope.showForPromise = function() {
        var deferred = $q.defer();
        $timeout(deferred.resolve, 1000);

        $loadDialog.waitFor(deferred.promise, 'Showing for 1000ms promise...');
      };
    }
  </file>
</example>
 */
jqmModule.factory('$loadDialog', ['$rootElement', '$rootScope', function ($rootElement, $rootScope) {

    // var rootElement = $rootElement.clone();
    var rootElement = angular.element('html');

    var showCalls = [];
    var loadingClass = 'ui-loading';

    var defaultTemplate = angular.element("<div class='ui-loader ui-corner-all ui-body-b'>" +
        "   <span class='ui-icon ui-icon-loading'></span>" +
        "   <h1></h1>" +
        "</div>");

    rootElement.append(defaultTemplate);
    defaultTemplate.bind("click", onClick);

    console.log('$rootElement', rootElement);

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            $rootScope.$apply(function () {
                lastCall.callback.apply(this, arguments);
            });
        }
        // This is required to prevent a second
        // click event, see
        // https://github.com/jquery/jquery-mobile/issues/1787
        event.preventDefault();
    }

    function updateUI() {
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var message = lastCall.msg;

            defaultTemplate.removeClass('ui-loader-verbose ui-loader-default');

            if (message) {
                defaultTemplate.addClass('ui-loader-verbose');
                defaultTemplate.find('h1').text(message);
            } else {
                defaultTemplate.addClass('ui-loader-default');
            }

            rootElement.addClass(loadingClass);
        } else {
            rootElement.removeClass(loadingClass);
        }
    }

    function updateText(message) {
        defaultTemplate.find('h1').text(message);
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#show
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Opens the wait dialog and shows the given message (if existing).
     * If the user clicks on the wait dialog the given callback is called.
     * This can be called even if the dialog is currently showing. It will
     * then change the message and revert back to the last message when
     * the hide function is called.
     *
     * @param {string=} message The message to be shown when the wait dialog is displayed.
     * @param {function=} callback The Callback that is executed when the wait dialog is clicked.
     *
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] === 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] === 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] === 'function') {
            tapCallback = arguments[1];
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUI();
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#hide
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Restores the dialog state before the show function was called.
     *
     */
    function hide() {
        showCalls.pop();
        updateUI();
    }

    function always(promise, callback) {
        promise.then(callback, callback);
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#waitFor
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Shows the dialog as long as the given promise runs. Shows the given message
     * if defined.
     *
     * @param {Promise} promise The Promise.
     * @param {string=} message The message to be show.
     * */
    function waitFor(promise, msg) {
        show(msg);
        always(promise, function () {
            hide();
        });
    }

    /**
     * @ngdoc method
     * @name jqm.$loadDialog#waitForWithCancel
     * @methodOf jqm.$loadDialog
     *
     * @description
     * Same as jqm.$loadDialog#waitFor, but rejects the promise with the given
     * cancelData when the user clicks on the wait dialog.
     *
     * @param {Deferred} The deferred object to cancel the promise.
     * @param {*} cancelData To reject the promise with.
     * @param {string=} message The message to be show.
     */
    function waitForWithCancel(deferred, cancelData, msg) {
        show(msg, function () {
            deferred.reject(cancelData);
        });
        always(deferred.promise, function () {
            hide();
        });
    }

    function setTheme(theme){
        var body = defaultTemplate[0].className.match(/\bui-body-[^\s]*/),
            bodyClass = body[0];

        defaultTemplate.removeClass(bodyClass).addClass('ui-body-'+theme);
        return this;
    }

    return {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel: waitForWithCancel,
        setTheme: setTheme
    };
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$parse', ['$delegate', jqmScopeAsParseDecorator]);

    function jqmScopeAsParseDecorator($parse) {
        return function (expression) {
            if (!angular.isString(expression)) {
                // $parse is also used for calling functions (e.g. from $scope.eval),
                // which we don't want to intercept.
                return $parse(expression);
            }

            var evalFn = $parse(expression),
                assignFn = evalFn.assign;
            if (assignFn) {
                patchedEvalFn.assign = patchedAssign;
            }
            return patchedEvalFn;

            function patchedEvalFn(context, locals) {
                return callInContext(evalFn, context, locals);
            }

            function patchedAssign(context, value) {
                return callInContext(assignFn, context, value);
            }

            function callInContext(fn, context, secondArg) {
                var scopeAs = {},
                    earlyExit = true;
                while (context && context.hasOwnProperty("$$scopeAs")) {
                    scopeAs[context.$$scopeAs] = context;
                    context = context.$parent;
                    earlyExit = false;
                }
                if (earlyExit) {
                    return fn(context, secondArg);
                }
                // Temporarily add a property in the parent scope
                // to reference the child scope.
                // Needed as the assign function does not allow locals, otherwise
                // we could use the locals here (which would be more efficient!).
                context.$scopeAs = scopeAs;
                try {
                    /*jshint -W040:true*/
                    return fn.call(this, context, secondArg);
                } finally {
                    delete context.$scopeAs;
                }
            }
        };
    }
}]);

// Note: We don't create a directive for the html element,
// as sometimes people add the ng-app to the body element.
jqmModule.run(['$window', function($window) {
    angular.element($window.document.documentElement).addClass("ui-mobile");
}]);

jqmModule.config(['$provide', function($provide) {
    $provide.decorator('$route', ['$delegate', '$rootScope', '$history', function($route, $rootScope, $history) {
        $rootScope.$on('$routeChangeStart', function(event, newRoute) {
            if (newRoute) {
                newRoute.back = $history.activeIndex < $history.previousIndex;
            }
        });
        return $route;
    }]);
}]);
/**
 * In the docs, an embedded angular app is used. However, due to a bug,
 * the docs don't disconnect the embedded $rootScope from the real $rootScope.
 * By this, our embedded app will never get freed and it's watchers will still fire.
 */
jqmModule.run(['$rootElement', '$rootScope', function clearRootScopeOnRootElementDestroy($rootElement, $rootScope) {
    $rootElement.bind('$destroy', function() {
        $rootScope.$destroy();
        $rootScope.$$watchers = [];
        $rootScope.$$listeners = [];
    });
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$rootScope', ['$delegate', scopeReconnectDecorator]);
    $provide.decorator('$rootScope', ['$delegate', 'jqmConfig', inheritThemeDecorator]);

    function scopeReconnectDecorator($rootScope) {
        $rootScope.$disconnect = function () {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var parent = this.$parent;
            this.$$disconnected = true;
            // See Scope.$destroy
            if (parent.$$childHead === this) {
                parent.$$childHead = this.$$nextSibling;
            }
            if (parent.$$childTail === this) {
                parent.$$childTail = this.$$prevSibling;
            }
            if (this.$$prevSibling) {
                this.$$prevSibling.$$nextSibling = this.$$nextSibling;
            }
            if (this.$$nextSibling) {
                this.$$nextSibling.$$prevSibling = this.$$prevSibling;
            }
            this.$$nextSibling = this.$$prevSibling = null;
        };
        $rootScope.$reconnect = function () {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var child = this;
            if (!child.$$disconnected) {
                return;
            }
            var parent = child.$parent;
            child.$$disconnected = false;
            // See Scope.$new for this logic...
            child.$$prevSibling = parent.$$childTail;
            if (parent.$$childHead) {
                parent.$$childTail.$$nextSibling = child;
                parent.$$childTail = child;
            } else {
                parent.$$childHead = parent.$$childTail = child;
            }

        };
        return $rootScope;
    }

    function inheritThemeDecorator($rootScope, jqmConfig) {
        instrumentScope($rootScope, jqmConfig.primaryTheme);
        return $rootScope;

        function instrumentScope(scope, theme) {
            scope.$theme = theme;
            var _new = scope.$new;
            scope.$new = function (isolate) {
                var res = _new.apply(this, arguments);
                if (isolate) {
                    instrumentScope(res, this.$theme);
                }
                return res;

            };
        }
    }
}]);

jqmModule.config(['$provide', function ($provide) {
    $provide.decorator('$sniffer', ['$delegate', '$window', '$document', function ($sniffer, $window, $document) {
        var fakeBody = angular.element("<body>");
        angular.element($window.document.body).prepend(fakeBody);

        $sniffer.cssTransform3d = transform3dTest();

        android2Transitions();

        fakeBody.remove();

        return $sniffer;

        function media(q) {
            return window.matchMedia(q).matches;
        }

        // This is a copy of jquery mobile 1.3.1 detection for transform3dTest
        function transform3dTest() {
            var mqProp = "transform-3d",
            vendors = [ "Webkit", "Moz", "O" ],
            // Because the `translate3d` test below throws false positives in Android:
            ret = media("(-" + vendors.join("-" + mqProp + "),(-") + "-" + mqProp + "),(" + mqProp + ")");

            if (ret) {
                return !!ret;
            }

            var el = $window.document.createElement("div"),
            transforms = {
                // We’re omitting Opera for the time being; MS uses unprefixed.
                'MozTransform': '-moz-transform',
                'transform': 'transform'
            };

            fakeBody.append(el);

            for (var t in transforms) {
                if (el.style[ t ] !== undefined) {
                    el.style[ t ] = 'translate3d( 100px, 1px, 1px )';
                    ret = window.getComputedStyle(el).getPropertyValue(transforms[ t ]);
                }
            }
            return ( !!ret && ret !== "none" );
        }

        //Fix android 2 not reading transitions correct.
        //https://github.com/angular/angular.js/pull/3086
        //https://github.com/angular-widgets/angular-jqm/issues/89
        function android2Transitions() {
            if (!$sniffer.transitions || !$sniffer.animations) {
                $sniffer.transitions = angular.isString($document[0].body.style.webkitTransition);
                $sniffer.animations = angular.isString($document[0].body.style.webkitAnimation);
                if ($sniffer.animations || $sniffer.transitions) {
                    $sniffer.vendorPrefix = 'webkit';
                    $sniffer.cssTransform3d = true;
                }
            }
        }

    }]);
}]);

jqmModule.factory('$transitionComplete', ['$sniffer', function ($sniffer) {
    return function (el, callback, once) {
        var eventNames = 'transitionend';
        if (!$sniffer.transitions) {
            throw new Error("Browser does not support css transitions.");
        }
        if ($sniffer.vendorPrefix) {
            eventNames += " " + $sniffer.vendorPrefix.toLowerCase() + "TransitionEnd";
        }
        var _callback = callback;
        if (once) {
            callback = function() {
                unbind();
                _callback();
            };
        }
        //We have to split because unbind doesn't support multiple event names in one string
        //This will be fixed in 1.2, PR opened https://github.com/angular/angular.js/pull/3256
        angular.forEach(eventNames.split(' '), function(eventName) {
            el.bind(eventName, callback);
        });

        return unbind;

        function unbind() {
            angular.forEach(eventNames.split(' '), function(eventName) {
                el.unbind(eventName, callback);
            });
        }
    };
}]);

angular.module('jqm-templates', ['templates/jqmPanel.html', 'templates/jqmPanelContainer.html', 'templates/jqmPopup.html', 'templates/jqmPopupOverlay.html']);

angular.module("templates/jqmPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPanel.html",
    "<div class=\"ui-panel ui-panel-closed\"\n" +
    "  ng-class=\"'ui-panel-position-'+position+' ui-panel-display-'+display+' ui-body-'+$theme+' ui-panel-animate'\">\n" +
    "  <div class=\"ui-panel-inner\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmPanelContainer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPanelContainer.html",
    "<div jqm-scope-as=\"pc\" ng-transclude class=\"jqm-panel-container\">\n" +
    "    <div class=\"ui-panel-dismiss\"\n" +
    "        ng-click=\"$scopeAs.pc.openPanelName = null\" \n" +
    "        ng-class=\"$scopeAs.pc.openPanelName ? 'ui-panel-dismiss-open ui-panel-dismiss-'+$scopeAs.pc.openPanelName : ''\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmPopup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPopup.html",
    "<div jqm-scope-as=\"jqmPopup\" class=\"ui-popup-container {{$scopeAs.jqmPopup.animation}}\" jqm-class=\"{'ui-popup-hidden': !$scopeAs.jqmPopup.opened}\">\n" +
    "  <div jqm-scope-as=\"jqmPopup\" class=\"ui-popup ui-body-{{$scopeAs.jqmPopup.$theme}}\"\n" +
    "    jqm-class=\"{'ui-overlay-shadow': $scopeAs.jqmPopup.shadow,\n" +
    "    'ui-corner-all': $scopeAs.jqmPopup.corners}\"\n" +
    "    ng-transclude>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/jqmPopupOverlay.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/jqmPopupOverlay.html",
    "<div view-fixed=\"true\" class=\"ui-popup-screen ui-overlay-{{$scopeAs.jqmPopup.overlayTheme}}\" \n" +
    "  jqm-class=\"{'ui-screen-hidden': !$scopeAs.jqmPopup.opened, 'in': $scopeAs.jqmPopup.opened}\"\n" +
    "  ng-click=\"$scopeAs.jqmPopup.hide()\">\n" +
    "</div>\n" +
    "");
}]);

angular.element(window.document).find('head').append('<style type="text/css">* {\n    -webkit-backface-visibility-hidden;\n}\nhtml, body {\n    -webkit-user-select: none;\n}\n\n/* browser resets */\n.ui-mobile, .ui-mobile html, .ui-mobile body {\n    height: 100%;\n    margin: 0\n}\n\n.ui-footer {\n    position: absolute;\n    bottom: 0;\n    width: 100%;\n    z-index: 2\n}\n\n.ui-header {\n    position: absolute;\n    top: 0;\n    width: 100%;\n    z-index: 1\n}\n\n.ui-mobile .ui-page {\n    height: 100%;\n    min-height: 0;\n    overflow: hidden;\n}\n.ui-content {\n    position: absolute;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    overflow: hidden;\n}\n.ui-content.jqm-content-with-header {\n    top: 42px\n}\n\n.ui-content.jqm-content-with-footer {\n    bottom: 43px\n}\n.jqm-standalone-page {\n    display: block;\n    position: relative;\n}\n\n.ui-panel {\n  position: absolute;\n}\n\n.ui-panel-closed {\n  display: none;\n}\n\n.ui-panel-content-wrap {\n    height: 100%\n}\n\n.jqm-panel-container {\n    position: relative;\n    width: 100%;\n    height: 100%;\n}\n\n.ui-panel-dismiss {\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  margin: auto;\n  width: auto;\n  height: auto;\n}\n.ui-panel-dismiss-open.ui-panel-dismiss-left {\n  left: 17em;\n}\n.ui-panel-dismiss-open.ui-panel-dismiss-right {\n  right: 17em;\n}\n\n.ui-mobile-viewport {\n    /* needed to allow multiple viewports */\n    position: relative;\n    height:100%\n}\n</style>');})(window, angular);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);