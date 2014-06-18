define(['filters/filters'], function(filters){
	filters.filter('blockquote', function() {
		return function(input) {
			return (input) ? '"'+ input +'"': '';
		};
	});
});