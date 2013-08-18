define(['providers/providers'], function(providers){
	providers.provider('transition', function(){
		// default
		this.selector        = 'body';
		this.startTransition = 'rotateInRight';
		this.pageTransition  = 'slide';
		this.transition      = {};

		this.setStartTransition = function(startTransition){
			this.startTransition = startTransition;
		};
		this.setPage = function(selector){
			this.selector = selector;
		};
		this.setPageTransition = function(type){
			this.pageTransition = type;
			switch(this.pageTransition){
				case 'whirl':
					this.transition._in = 'whirlIn';
					this.transition.out = 'whirlOut';
					break;

				case 'rotate':
					this.transition._in = 'rotateInLeft';
					this.transition.out = 'rotateOutLeft';
					break;

				case 'tumble':
					this.transition._in = 'tumbleIn';
					this.transition.out = 'tumbleOut';
					break;

				default     :
				case 'slide':
					this.transition._in = 'slideInSkew';
					this.transition.out = 'slideOutSkew';
					break;
			}
		};

		this.$get = function(){
			var selector        = this.selector;
			var startTransition = this.startTransition;
			var pageTransition  = this.pageTransition;
			var classOut        = this.transition.out;
			var classIn         = this.transition._in;
			return {
				isPerspective: function(){
					var perspective = ['whirl', 'rotate', 'tumble'];
					return perspective.indexOf(pageTransition) != -1 ;
				},
				getElement: function(){
					if(selector == 'body' || angular.equals($(selector), [])) return $('body');

					console.log('pageTransition', pageTransition, this.isPerspective());
					if( this.isPerspective() ){
						var height    = $('body').height();
						var top       = $(selector).offset().top;
						var setHeight = height - top;
						$(selector).css('height', setHeight + 'px');
					}

					return $(selector);
				},
				start: function(){
					$('body').addClass(startTransition);
					setTimeout(function(){
						console.log('change html, body css');
						$('html').css({'background':'#fff'});
						$('body').removeClass(startTransition);
					}, 1000);
				},
				change: function(){
					var self  = this;
					var $page = this.getElement();

					// http://api.jquery.com/delay/
					// http://api.jquery.com/queue/
					$page.addClass(classOut).delay(1000).queue(function(next) {

						$(this).removeClass(classOut);
						$(this).addClass(classIn);

						// clear angular view
						$('.ng-view').html('');
						// centering page services
						self.centerPageMessage();

						setTimeout(function() {
							if( self.isPerspective() ){
								$page.css('height', '100%');
								$page.removeClass(classIn);
							}
						}, 1000);

						next();
					});
				},
				/* centerize page loader & message */
				centerPageMessage: function(){
					var w = $('#wrap-content > .container').width(),
						h = $('#wrap-content').height();
					var $pl = $('#page-loader'),
						$pm = $('#page-message');
					var lleft = (w - $pl.width()) / 2,
						mleft = (w - $pm.width()) / 2;
					var ltop = (h - $pl.height()) / 2,
						mtop = (h - $pm.height()) / 2;
					$pl.css({'left':lleft + 'px', 'top':ltop + 'px'});
					$pm.css({'left':mleft + 'px', 'top':mtop + 'px'});
				}
			};
		};
	});
});