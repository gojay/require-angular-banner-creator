define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashCreator', ['$compile', '$timeout', 'imageReader',
		function($compile, $timeout, imageReader){
			// Runs during compile
			return {
				scope: {
					splash : '=ngModel'
				}, // {} = isolate, true = child, false/undefined = no change
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/splash-creator.html',
				replace: true,
				controller: function($scope, $element, $attrs, $transclude){
					
					var self = this;

					self.inputBgColor        = '#input-bg-color';
					self.inputLogo           = '#input-logo';
					self.logoFooterColor     = '#logo-footer-iphone-color';
					self.logoFooterWhite     = '#logo-footer-iphone-white';
					self.sliderlogo          = '#slider-vertical-header';
					self.sliderCH            = '#slider-vertical-footer';
					self.inputRepositionLogo = '#input-reposition-header';
					self.inputRepositionCH   = '#input-reposition-footer';

					// default
					self.splashType  = 'iphone4';

					console.log($scope.splash);

					// define dimensions
					self.svgDimension  = $scope.splash.dimensions[self.splashType];
					self.logoDimension = $scope.splash.logo[self.splashType];
					self.chDimension   = $scope.splash.ch[self.splashType];
					// calculate height logo
					self.h    = self.svgDimension.height;
					self.maxH = self.h - self.chDimension.height;

					/* scope inject & watcher */

					$scope.splash.editor.ch.y = self.chDimension.y;
					$scope.splash.editor.ch.p = Math.round(self.chDimension.y/self.h*100);

					console.log('editor', $scope.splash.editor);

					$scope.$watch('splash.editor.ch.p', function(input){
						var value = Math.round(input * self.h / 100);
						$scope.splash.editor.ch.y = (value > self.maxH) ? self.maxH : value;
						$(self.sliderCH).slider( "option", "value", self.h - value );
					});
				},
				link: function($scope, iElm, iAttrs, controller){

					// define svg
					var $svgEditor = $('#svg-custom'),
					    $svg = $('svg', $svgEditor);

					var splashType    = controller.splashType;
					var svgDimension  = controller.svgDimension;
					var logoDimension = controller.logoDimension;
					var chDimension   = controller.chDimension;
					var h    = controller.h;
					var maxH = controller.maxH;

					/* init jPicker (background) */

					// jPicker callback
					var callbackJPicker = function(color, context) {
						var all = color.val('all');
						if( all.hex == 'ffffff' ){
							$(controller.logoFooterColor, $svg).hide();
							$(controller.logoFooterWhite, $svg).show();
							$scope.splash.white = true;
						} else {
							$(controller.logoFooterColor, $svg).show();
							$(controller.logoFooterWhite, $svg).hide();
							$scope.splash.white = false;
						}
						$('rect', $svg)[0].setAttribute('fill', '#' + all.hex);
					};

					$timeout(function(){
						$('.jPicker.Container').remove();
						$(controller.inputBgColor)
							.jPicker({
								window : {
									effects :  { type:'slide' },
									position : {
										x : 'screenCenter',
										y : 'top'
									}
								},
								images : {
									clientPath : 'assets/css/jpicker/images/'
								}
							}, callbackJPicker, callbackJPicker);
					}, 400);

					/* init slider (reposition) */

					// client logo
					$(controller.sliderlogo).slider({
						orientation: "vertical",
						min: 0,
						max: 0,
						value: 0
					});
					// ch logo
					$(controller.sliderCH).slider({
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

					/* init spinner (input number) */

					$(controller.inputRepositionLogo).spinner({
						min:0, max: 100,
						spin: function( event, ui ) {
							$scope.$apply(function(scope){
								scope.splash.editor.logo.p = ui.value;
							});
						}
					});
					$(controller.inputRepositionCH).spinner({
						min:0, max: 100,
						spin: function( event, ui ) {
							$scope.$apply(function(scope){
								scope.splash.editor.ch.p = ui.value;
							});
						}
					});

					/* init image reader (background) */

					imageReader.init({
						buttonClass   : 'btn-success',
						inputFileEl   : '#input-bg',
						inputFileText : 'Select an image',
						section       : 'splash',
						compile       : function(buttonEl, changeEl, blob, image){
							// do upload bg
						}
					});


					/* init image reader (logo) */

					imageReader.init({
						buttonClass   : 'btn-success',
						inputFileEl   : controller.inputLogo,
						inputFileText : 'Select an image',
						section       : 'splash',
						compile       : function(buttonEl, changeEl, blob, image){

							console.log('$scope.splash', $scope.splash);

							$svgEditor.block({
								overlayCSS: {
									backgroundColor: '#fff',
									opacity: 0.8
								},
								message: '<i class="icon-spinner icon-spin icon-4x"></i> <br/> Uploading',
								css: {
									border: 'none',
									background: 'none',
									color: '#3685C6'
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

								console.log('uploadFile', response);

								var $parent = $(changeEl).parent();

								console.log('parent', changeEl, $parent);
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
										$(controller.sliderlogo).slider( "option", "value", h - value );
									});
									/* slider */
									$(controller.sliderlogo).slider({
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
								$svgEditor.unblock();
							});
						}
					});
				}
			};
		}
	]);
});