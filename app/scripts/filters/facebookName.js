define(['filters/filters'], function(filters){
	filters.filter('facebookName', function() {
		return function(input) {
			return (input) ? '/'+ input : '';
		};
	});
});