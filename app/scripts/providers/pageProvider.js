define(['providers/providers'], function(providers){
	providers.provider('page', function(){
		this.$get = function(){
			return {
				title: '',
				isContent: false,
				setTitle: function(title) {
					this.title = title;
				},
				getTitle: function() {
					return this.title;
				}
			};
		};
	});
});