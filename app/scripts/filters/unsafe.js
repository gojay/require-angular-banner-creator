define(['filters/filters'], function(filters){
	filters.filter('unsafe', function() {
		return function(input) {
			return input.replace(/unsafe:/, '');
		};
	});
});