define(['filters/filters'], function(filters){
	filters.filter('comaToNewLine', function() {
		return function(input) {
			return input.replace(/,/g, '<br>');
		};
	});
});