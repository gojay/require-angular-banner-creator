define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('splashMobile', ['$compile', '$timeout', 'imageReader',
		function($compile, $timeout, imageReader){
			// Runs during compile
			return {
				scope: {
					splash : '=ngModel',
					generateQr : '='
				}, // {} = isolate, true = child, false/undefined = no change
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/splash-mobile.html',
				replace: true,
				controller: function($scope, $element, $attrs, $transclude){
					console.log('splashMobile', $scope);

					var self = this;
					var parentId  = ( angular.isDefined($attrs.settingElement) ) ? $attrs.settingElement : '#tpl-mobile' ;
					self.parentEl = angular.element( parentId );

					self.svgEditor    = '#svg-mobile';
					self.inputScreenshot = '#input-screenshot';
					self.inputAvatar1 = '#input-avatar-1';
					self.inputAvatar2 = '#input-avatar-2';

					$scope.$watch('splash.size', function(size){
						$scope.splash.selected.background = $scope.splash.attributes[size].background;
						$scope.splash.selected.dimension  = $scope.splash.attributes[size].dimension;
						$scope.splash.selected.screenshot  = $scope.splash.attributes[size].screenshot;
						$scope.splash.selected.avatar  = $scope.splash.attributes[size].avatar;
						//if( !$scope.splash.selected.qr ) 
							$scope.splash.selected.qr = $scope.splash.attributes[size].qr;
						$scope.splash.selected.font  	  = $scope.splash.attributes[size].font;
						// generate qr code
						$('input[type="url"]', self.parentEl).trigger('blur');
					});
					$scope.$watch('splash.selected.peoples[1].text', function(input){
						$scope.splash.selected.peoples[1].limit = $scope.splash.selected.peoples[1].counter - input.length;
						if($scope.splash.selected.peoples[1].limit <= 0) {
							$scope.splash.selected.peoples[1].limit = 0;
							$scope.splash.selected.peoples[1].text = $scope.splash.selected.peoples[1].text.substring(0, $scope.splash.selected.peoples[1].counter);
						}
					});
					$scope.$watch('splash.selected.peoples[1].text', function(input){
						$scope.splash.selected.peoples[1].limit = $scope.splash.selected.peoples[1].counter - input.length;
						if($scope.splash.selected.peoples[1].limit <= 0) {
							$scope.splash.selected.peoples[1].limit = 0;
							$scope.splash.selected.peoples[1].text = $scope.splash.selected.peoples[1].text.substring(0, $scope.splash.selected.peoples[1].counter);
						}
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
				},
				link: function($scope, iElm, iAttrs, controller){

					var fbname = null;
					$('input[name="fbname"]', controller.parentEl)
						.focus(function(){ 
							fbname = $(this).val(); 
						})
						.blur(function(e){
							var text = e.target.value;
							if( e.target.validity.valid && fbname != text ){
								$scope.safeApply(function(){ 
									$scope.splash.disable.generate = false; 
									$scope.splash.disable.download = true;
								});
							}
						});

					var qrURL = null;
					$('input[type="url"]', controller.parentEl)
						.focus(function(e){ 
							qrURL = $(this).val(); 
						})
						.blur(function(e){
							console.log('blur', e.target)
							// device name
							var deviceName = e.target.name;
							// show loading
							var $imgLoad = $(e.target).siblings('.ajax-load-qr');
							// get url
							var url = e.target.value;

							// if url is valid && url not same before
							if( e.target.validity.valid && qrURL != url && deviceName ){
								// disable generate & download button
								// set selected QR image
								$scope.safeApply(function(){ 
									$scope.splash.disable.generate = true; 
									$scope.splash.disable.download = true; 
									$scope.splash.selected.qr[deviceName].image = null;
									console.log('safeApply:$scope.splash', $scope.splash);
								});
								// show loading
								$imgLoad.show();

								// generate QR Code
								$scope.$apply($scope.generateQr({
									canvas: angular.element('#canvas-qrcode-' + deviceName),
									width : $scope.splash.selected.qr[deviceName].size,
									height: $scope.splash.selected.qr[deviceName].size,
									url   : qrURL
								}, function( imgDataURI ){
									// apply image QR code
									$scope.safeApply(function(){ 
										$scope.splash.selected.qr[deviceName].image = imgDataURI;
										$scope.splash.disable.generate = false;
									});
									// hide loading
									$imgLoad.hide();
								}));
							}
						});
				
					/* Read n upload image screenshot */
					imageReader.init({
						buttonClass   : 'btn-success',
						inputFileEl   : controller.inputScreenshot,
						inputFileText : 'Select an image',
						compile       : function(buttonEl, changeEl, blob, image){

							$(controller.svgEditor).block({
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

							// upload image
							imageReader.uploadFile({
								file: blob,
								name: 'mobile-screenshot',
								size: {
									width : $scope.splash.attributes[$scope.splash.size].screenshot.width,
									height: $scope.splash.attributes[$scope.splash.size].screenshot.height
								}
							}, function(response){
								
								$scope.safeApply(function(){
									$scope.splash.screenshot = response.dataURI;
									$scope.splash.selected.screenshot.image = response.dataURI;
								});

								$(controller.svgEditor).unblock();

							});
						}
					});

					/* Read n upload image (avatar 1) */
					imageReader.init({
						buttonClass   : 'btn-success',
						inputFileEl   : controller.inputAvatar1,
						inputFileText : 'Select an image',
						compile       : function(buttonEl, changeEl, blob, image){

							$(controller.svgEditor).block({
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

							// upload image
							imageReader.uploadFile({
								file: blob,
								name: 'mobile-avatar1',
								size: {
									width : $scope.splash.selected.avatar.width,
									height: $scope.splash.selected.avatar.width
								}
							}, function(response){
								
								$scope.safeApply(function(){
									$scope.splash.selected.peoples[0].avatar = response.dataURI;
								});

								$(controller.svgEditor).unblock();

							});
						}
					});

					/* Read n upload image (avatar 2) */
					imageReader.init({
						buttonClass   : 'btn-success',
						inputFileEl   : controller.inputAvatar2,
						inputFileText : 'Select an image',
						compile       : function(buttonEl, changeEl, blob, image){

							$(controller.svgEditor).block({
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

							// upload image
							imageReader.uploadFile({
								file: blob,
								name: 'mobile-avatar2',
								size: {
									width : $scope.splash.selected.avatar.width,
									height: $scope.splash.selected.avatar.width
								}
							}, function(response){
								
								$scope.safeApply(function(){
									$scope.splash.selected.peoples[1].avatar = response.dataURI;
								});

								$(controller.svgEditor).unblock();

							});
						}
					});
				}
			};
		}
	]);
});