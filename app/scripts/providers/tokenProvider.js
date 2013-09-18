define(['providers/providers'], function(providers){
	providers.provider('token', function(){
	    var token = "none";

		this.set = function(newToken) {
			token = newToken;
		};
		this.$get = function(){
			return {
				get: function(){
					return 'Basic ' + btoa('admin:admin');
				}
			}
		};
	});
});