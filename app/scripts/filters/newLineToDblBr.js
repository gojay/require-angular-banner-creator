define(['filters/filters'], function(filters){
	filters.filter('newLineToDblBr', function() {
		return function(input) {
			return input.replace(/\n/g, '<br><br>');
		};
	});
});