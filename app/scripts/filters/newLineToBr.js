define(['filters/filters'], function(filters){
	filters.filter('newLineToBr', function() {
		return function(input) {
			return input.replace(/\n/g, '<br>');
		};
	});
});