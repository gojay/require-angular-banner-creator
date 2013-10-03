define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('bannerCreator', function(imageReader){
		// Runs during compile
		return {
			scope: {
				banner : '=ngModel',
				fb : '='
			}, // {} = isolate, true = child, false/undefined = no change
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'app/views/components/banner-creator.html',
			replace: true,
			link: function($scope, iElm, iAttrs, controller) {
				// binding background reposition
				$('body').bind('bgReposition', function(e, data){
					// define svg & image background element
					var $svg      = data.svg;
					var imageBG   = data.imageBG;
					var imageBgEl = imageBG.like;
					// get image background dimension
					var w = parseInt(imageBgEl.getAttribute('width')),
						h = parseInt(imageBgEl.getAttribute('height'));
					// get different size with canvas
					var maxW = parseInt(w - data.dimension.width),
						maxH = parseInt(h - data.dimension.height);
					// helper
					var toggleEl = (data.pricesInBottom) ? '#logo, #description' : '#logo, #description, #price' ;
					var top, x, y = 0;
					// set draggable element
					var $bgDraggable = $('#background > rect', $svg).eq(0);
					// init draggable
					$bgDraggable.draggable({
						cursor: "move",
						containment: [0, 0, 810, 381],
						start: function(e, ui) {
							// hidden elements while dragging
							$(toggleEl, $svg).hide();
							$('#background > rect', $svg).eq(1).hide();
							// set x, y position
							x = parseInt(imageBgEl.getAttribute('x'));
							y = parseInt(imageBgEl.getAttribute('y'));
							// set start top position
							top = ui.position.top;
						},
						drag: function(event, ui) {
							var pos = ui.position;
							// calculate left n top, continues current position
							var calcLeft = x + pos.left;
							var calcTop  = y + (pos.top - top);
							// set max position
							var newX = (calcLeft > 0) ? 0 : (calcLeft < -maxW) ? -maxW : calcLeft;
							var newY = (calcTop > 0) ? 0 : (calcTop < -maxH) ? -maxH : calcTop;
							// set attribute position
							angular.forEach(imageBG, function(e){
								e.setAttribute('x', newX);
								e.setAttribute('y', newY);
							});
						},
						stop: function(event, ui) {
							// show elements after dragging
							$(toggleEl, $svg).show();
							$('#background > rect', $svg).eq(1).show();
						}
					});
				});

				var displayTpl = true;
				$scope.displayTpl = function(evt, displaySVG){
					$(evt.currentTarget).parent().children().each(function(i, e){
						$(e).attr('disabled',false);
					});
					$(evt.currentTarget).attr('disabled',true);
					if(displaySVG == 'both'){
						$('#svg-editor > svg').each(function(i, e){ $(e).show(); });
						return;
					}
					displayTpl = false;
					$('#svg-editor > svg').each(function(i, e){ $(e).hide(); });
					$('#svg-editor > svg#svg-editor-'+displaySVG).show();
				};

				// start background reposition
				$scope.doBGReposition = function(evt){
					var $button  = $(evt.currentTarget);
					var $svgLast = $('#svg-editor > svg#svg-editor-enter');
					var $dropEl  = $('.drop-area');
					if($dropEl.is(':hidden')){
						$dropEl.fadeIn('slow');
						if(displayTpl) $svgLast.show();
						$button.html('<i class="icon-move"></i> Background Reposition');
					} else {
						$dropEl.fadeOut('slow');
						if(displayTpl) $svgLast.hide();
						$button.html('<i class="icon-ok"></i> Done');
					}
				};
			}
		};
	});
});