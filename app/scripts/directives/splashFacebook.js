define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashFacebook', ['$compile', '$timeout', 'imageReader',
		function($compile, $timeout, imageReader){
			// Runs during compile
			return {
				scope: {
					splash : '=',
					generateQr : '='
				}, // {} = isolate, true = child, false/undefined = no change
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/splash-facebook.html',
				replace: true,
				controller: function($scope, $element, $attrs, $transclude){
					var self = this;

					console.log('splashFacebook', $scope.splash);

					var parentId  = ( angular.isDefined($attrs.settingElement) ) ? $attrs.settingElement : '#tpl-facebook' ;
					self.parentEl = angular.element( parentId );

					$scope.$watch('splash.size', function(size){
						$scope.splash.selected.background 	= $scope.splash.attributes[size].background;
						$scope.splash.selected.dimension  	= $scope.splash.attributes[size].dimension;
						$scope.splash.selected.qr 			= $scope.splash.attributes[size].qr;
						$scope.splash.selected.font  	    = $scope.splash.attributes[size].font;
						// generate qr code
						$('input[type="url"]', self.parentEl).trigger('blur');
					});

					$scope.safeApply = function(fn) {
					  	var phase = this.$root.$$phase;
					  	if(phase == '$apply' || phase == '$digest') {
					    	if(fn && (typeof(fn) === 'function')) {
					      	fn();
					    	}
					  	} else {
					    	this.$apply(fn);
					  	}
					};	

					/* Ui Event */

                    var fbname = null;
                    $scope.splash.onFocusFbName = function(e){
                    	fbname = e.target.value;
                    };
                    $scope.splash.onBlurFbName = function(e){
                    	var text = e.target.value;
                        if (e.target.validity.valid && fbname != text) {
                            $scope.safeApply(function() {
                                $scope.splash.disable.generate = false;
                                $scope.splash.disable.download = true;
                            });
                        }
                    };

                    var qrURL = null;
                    $scope.splash.onFocusQr = function(e){
                        // device name
                    	qrURL = e.target.value;
                    };
                    $scope.splash.onBlurQr = function(e){
                    	var text = e.target.value;
                        // show loading
                        var $imgLoad = $(e.target).siblings('.ajax-load-qr');
                        // get url
                        var url = e.target.value;

                        // if url is valid && url not same before
                        if( e.target.validity.valid && qrURL != url ){
							// disable generate & download button
							// set selected QR image
							$scope.safeApply(function(){ 
								$scope.splash.disable.generate = true; 
								$scope.splash.disable.download = true; 
								$scope.splash.selected.qr.image = null;
								console.log('safeApply:$scope.splash', $scope.splash);
							});
							// show loading
							$imgLoad.show();

							// generate QR Code
							$scope.$apply($scope.generateQr({
								canvas: angular.element('#canvas-qrcode'),
								width : $scope.splash.selected.qr.size,
								height: $scope.splash.selected.qr.size,
								url   : qrURL
							}, function( imgDataURI ){
								// apply image QR code
								$scope.safeApply(function(){ 
									$scope.splash.selected.qr.image = imgDataURI;
									$scope.splash.disable.generate = false;
								});
								// hide loading
								$imgLoad.hide();
							}));
						}
                    };
				},
				link: function($scope, iElm, iAttrs, controller){

				}
			};
		}
	]);
});