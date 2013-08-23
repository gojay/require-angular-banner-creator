define(['filters/filters'], function(filters){
	filters.filter('iif', function () {
	   return function(input, trueValue, falseValue) {
	        return input ? trueValue : falseValue;
	   };
	});
});