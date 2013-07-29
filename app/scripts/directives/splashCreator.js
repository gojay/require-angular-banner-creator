define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashCreator', function(imageReader, $compile){
		// Runs during compile
		return {
			scope: {
				splash : '=ngModel'
			}, // {} = isolate, true = child, false/undefined = no change
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'app/views/components/splash-creator.html',
			replace: true,
			controller: function($scope, $element, $attrs, $transclude){},
			link: function($scope, iElm, iAttrs, controller){}
		};
	});
});