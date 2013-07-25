define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashCreator', function(imageReader, $compile){
		// Runs during compile
		return {
			scope: {
				splash : '='
			}, // {} = isolate, true = child, false/undefined = no change
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'app/views/components/splash-creator.html',
			replace: true,
			controller: function($scope, $element, $attrs, $transclude){},
			link: function($scope, iElm, iAttrs, controller){

				// default
				var splashType  = 'iphone4';
				// define dimensions
				var svgDimension  = $scope.splash.dimensions[splashType];
				var logoDimension = $scope.splash.logo[splashType];
				var chDimension   = $scope.splash.ch[splashType];
				// calculate height logo
				var h    = svgDimension.height;
				var maxH = h - chDimension.height;

				// define svg
				$svg = $('#svg-editor > svg');

				/* init fixed sidebar */

				// keep sidebar on the top, while user scrolling the window
				$(window).scroll(function() {
					if ($(window).scrollTop() >= 100) {
						$('aside').css('top', 10);
					} else {
						$('aside').css('top', 100);
					}
				});

				/* init jPicker (background) */

				// callback
				var callbackJPicker = function(color, context) {
					var all = color.val('all');
					if( all.hex == 'ffffff' ){
						$('rect', $svg)[0].setAttribute('stroke', 'black');
						$('#logo-footer-iphone-color', $svg).hide();
						$('#logo-footer-iphone-white', $svg).show();
						$scope.splash.white = true;
					} else {
						$('rect', $svg)[0].setAttribute('stroke', 'transparent');
						$('#logo-footer-iphone-color', $svg).show();
						$('#logo-footer-iphone-white', $svg).hide();
						$scope.splash.white = false;
					}
					$('rect', $svg)[0].setAttribute('fill', '#' + all.hex);
				};
				// input color picker
				var $bgColor = $('#input-bg-color');
				// if( !$bgColor.siblings('.jPicker') ){
					$bgColor.jPicker({
						window : {
							effects :  { type: 'fade' },
							position : {
								x : 'screenCenter',
								y : 'center'
							}
						},
						images : {
							clientPath : 'assets/css/jpicker/images/'
						}
					}, callbackJPicker, callbackJPicker);
				// }

				/* init spinner (input number) */

				$("#input-reposition-header").spinner({
					min:0, max: 100,
					spin: function( event, ui ) {
						$scope.$apply(function(scope){
							scope.splash.editor.logo.p = ui.value;
						});
					}
				});
				$("#input-reposition-footer").spinner({
					min:0, max: 100,
					spin: function( event, ui ) {
						$scope.$apply(function(scope){
							scope.splash.editor.ch.p = ui.value;
						});
					}
				});

				/* init slider (reposition) */

				// client logo
				$("#slider-vertical-header").slider({
					orientation: "vertical",
					min: 0,
					max: 0,
					value: 0
				});
				// ch logo
				$("#slider-vertical-footer").slider({
					orientation: "vertical",
					min: 0,
					max: h,
					value: (h - chDimension.y),
					slide: function( event, ui ) {
						var value = h - ui.value;
						var percent = Math.round(value/h * 100);
						var y = (value > maxH) ? maxH : value;
						console.log('ch logo', percent, value, y);
						$scope.$apply(function(scope){
							scope.splash.editor.ch.p = percent;
							scope.splash.editor.ch.y = y;
						});
					}
				});

				/* scope inject & watcher */

				$scope.splash.editor.ch.y = chDimension.y;
				$scope.splash.editor.ch.p = Math.round(chDimension.y/h*100);
				$scope.$watch('splash.editor.ch.p', function(input){
					var value = Math.round(input * h / 100);
					$scope.splash.editor.ch.y = (value > maxH) ? maxH : value;
					$("#slider-vertical-footer").slider( "option", "value", h - value );
				});

				/* init image reader (logo) */

				imageReader.init({
					dropArea      : '#drop-logo',
					inputFileEl   : '#input-logo',
					inputFileText : 'Select an image',
					section       : 'splash',
					compile       : function(buttonEl, changeEl, blob, image){
						// change text label input file
						var labelEl = $(buttonEl).parent().siblings('label')[0];
						labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');

						console.log('changeEl', changeEl);

						$.blockUI({
							message: '<i class="icon-spinner icon-spin icon-large"></i> Please wait...',
							css: {
								border: '1px solid #007dbc'
							}
						});
						// upload to resize
						imageReader.uploadFile({
							file: blob,
							name: 'splash',
							size: {
								iphone: logoDimension,
								ipad: $scope.splash.logo.ipad
							},
							multi: true
						}, function(response){
							console.log(response);
							var $parent = $(changeEl).parent();
							/* change image src */
							// ipad
							var ipadEl = $('#logo-ipad-editor-splash', $parent)[0];
							ipadEl.setAttribute('xlink:href', response.ipad);
							// iphone
							changeEl.setAttribute('xlink:href', response.iphone);
							changeEl.setAttribute('width','{{splash.editor.logo.w}}');
							changeEl.setAttribute('height','{{splash.editor.logo.h}}');
							changeEl.setAttribute('x','{{splash.editor.logo.x}}');
							changeEl.setAttribute('y','{{splash.editor.logo.y}}');
							// remove old image logo
							$('image', $parent).eq(0).remove();
							// then prepend new compiled image logo
							$parent.append($compile(changeEl)($scope));
							// applying scope
							$scope.$apply(function(scope){
								scope.splash.editor.logo.w = logoDimension.width;
								scope.splash.editor.logo.h = logoDimension.height;
								scope.splash.editor.logo.x = logoDimension.x;
								scope.splash.editor.logo.y = logoDimension.y;
								// slider
								var h = $scope.splash.dimensions[splashType].height;
								var maxH = h - chDimension.height;
								// get calc percent
								$scope.splash.editor.logo.p = Math.round(logoDimension.y/h*100);
								// watchers, update y logo horizontal
								$scope.$watch('splash.editor.logo.p', function(input){
									var value = Math.round(input * h / 100);
									$scope.splash.editor.logo.y = (value > maxH) ? maxH : value;
									$("#slider-vertical-header").slider( "option", "value", h - value );
								});
								/* slider */
								$("#slider-vertical-header").slider({
									orientation: "vertical",
									min: 0,
									max: h,
									value: (h - logoDimension.y),
									slide: function( event, ui ) {
										var value = h - ui.value;
										var percent = Math.round(value/h * 100);
										var y = (value > maxH) ? maxH : value;
										console.log('client logo', value, y);
										$scope.$apply(function(scope){
											scope.splash.editor.logo.y = y;
											scope.splash.editor.logo.p = percent;
										});
									}
								});
							});
							$.unblockUI();
						});
					}
				});
			}
		};
	});
});