define([
	'directives/directives'
], function(directives){
	directives.directive('panel', [,
		function(){
			return {
				scope : {},
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				template: '<div id="panel-right"><p>Panel Right</div>',
				controller: function($scope, $element, $attrs, $transclude){},
				link: function($scope, iElm, iAttrs, controller){}
			};
		}
	]);
});