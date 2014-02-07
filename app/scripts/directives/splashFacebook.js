define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashFacebook', ['$compile', '$timeout', 'imageReader',
		function($compile, $timeout, imageReader){
			// Runs during compile
			return {
				scope: {
					splash : '=ngModel'
				}, // {} = isolate, true = child, false/undefined = no change
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/splash-facebook.html',
				replace: true,
				controller: function($scope, $element, $attrs, $transclude){
					var self = this;
				},
				link: function($scope, iElm, iAttrs, controller){

				}
			};
		}
	]);
});