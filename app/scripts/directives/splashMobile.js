define([
    'directives/directives',
    'services/splashService',
    'jquery',
    'jqueryui'
], function(directives) {
    directives.directive('splashMobile', ['$compile', '$timeout', 'RecentMobilephotos', 'imageReader', '$modal',
        function($compile, $timeout, RecentMobilephotos, imageReader, $modal) {
            // Runs during compile
            return {
                scope: {
                    splash: '=ngModel',
                    generateQr: '='
                }, // {} = isolate, true = child, false/undefined = no change
                restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
                templateUrl: 'app/views/components/splash-mobile.html',
                replace: true,
                controller: function($scope, $element, $attrs, $transclude) {
                    console.log('splashMobile', $scope);

                    var self = this;
                    var parentId = (angular.isDefined($attrs.settingElement)) ? $attrs.settingElement : '#tpl-mobile';
                    self.parentEl = angular.element(parentId);

                    self.svgEditor = '#svg-mobile';
                    self.inputScreenshot = '#input-screenshot';

                    // self.dummyImage = 'http://lorempixel.com/100/100/people/';
                    self.dummyImage = 'http://placehold.it/100x100/';

                    $scope.$watch('splash.size', function(size) {
                    	if( !$scope.splash.screenshot ){
                    		$scope.splash.screenshot = $scope.splash.attributes[size].screenshot.image;
                    	}
                        $scope.splash.selected.background = $scope.splash.attributes[size].background;
                        $scope.splash.selected.dimension  = $scope.splash.attributes[size].dimension;
                        $scope.splash.selected.screenshot = $scope.splash.attributes[size].screenshot;
                        $scope.splash.selected.avatar 	  = $scope.splash.attributes[size].avatar;
                        $scope.splash.selected.qr 		  = $scope.splash.attributes[size].qr;
                        // generate qr code
                        $('input[type="url"]', self.parentEl).trigger('blur');

                        console.log('splash change size', size);
                        console.log('splash $scope', $scope.splash);
                    });
                    $scope.$watch('splash.selected.peoples[1].text', function(input) {
                        $scope.splash.selected.peoples[1].limit = $scope.splash.selected.peoples[1].counter - input.length;
                        if ($scope.splash.selected.peoples[1].limit <= 0) {
                            $scope.splash.selected.peoples[1].limit = 0;
                            $scope.splash.selected.peoples[1].text = $scope.splash.selected.peoples[1].text.substring(0, $scope.splash.selected.peoples[1].counter);
                        }
                    });
                    $scope.$watch('splash.selected.peoples[1].text', function(input) {
                        $scope.splash.selected.peoples[1].limit = $scope.splash.selected.peoples[1].counter - input.length;
                        if ($scope.splash.selected.peoples[1].limit <= 0) {
                            $scope.splash.selected.peoples[1].limit = 0;
                            $scope.splash.selected.peoples[1].text = $scope.splash.selected.peoples[1].text.substring(0, $scope.splash.selected.peoples[1].counter);
                        }
                    });

                    $scope.safeApply = function(fn) {
                        var phase = this.$root.$$phase;
                        if (phase == '$apply' || phase == '$digest') {
                            if (fn && (typeof(fn) === 'function')) {
                                fn();
                            }
                        } else {
                            this.$apply(fn);
                        }
                    };

		            $scope.splash.isDisableGenerate = function() {
		                return $scope.splash.screenshot == null || $scope.splash.selected.qr.android.image == null || $scope.splash.selected.qr.iphone.image == null
		            }

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

                    var qrURL = {
                    	iphone : null,
                    	android: null
                    };
                    $scope.splash.onFocusQr = function(e){
                        // device name
                        var deviceName = e.target.name;
                    	qrURL[deviceName] = e.target.value;
                    };
                    $scope.splash.onBlurQr = function(e){
                    	var text = e.target.value;
                        // device name
                        var deviceName = e.target.name;
                        // show loading
                        var $imgLoad = $(e.target).siblings('.ajax-load-qr');
                        // get url
                        var url = e.target.value;

                        // if url is valid && url not same before
                        if (e.target.validity.valid && qrURL[deviceName] != url && deviceName) {
                            // disable generate & download button
                            // set selected QR image
                            $scope.safeApply(function() {
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
                                width: $scope.splash.selected.qr[deviceName].size,
                                height: $scope.splash.selected.qr[deviceName].size,
                                url: url
                            }, function(imgDataURI) {
                                // apply image QR code
                                $scope.safeApply(function() {
                                    $scope.splash.selected.qr[deviceName].image = imgDataURI;
                                    $scope.splash.disable.generate = false;
                                });
                                // hide loading
                                $imgLoad.hide();
                            }));
                        }
                    };

					/* Ui Bootstrap Modal */

                    $scope.splash.open = function(peopleIndex, size) {
                        var modalInstance = $modal.open({
                            templateUrl: 'modalInsertPhoto.html',
                            controller: function($scope, $modalInstance, $timeout, data, imageReader) {
                                $scope.splash = data.splash;
                                $scope.photos = data.photos;
                                $scope.people = data.splash.selected.peoples[peopleIndex];
                                $scope.photoIndex = $scope.people.recent.index;
                                $scope.selected = function($index) {
                                    $scope.photoIndex = $index;
                                    self.setPhoto($index, peopleIndex);
                                };
                                $scope.ok = function() {
                                    $modalInstance.close({peopleIndex: peopleIndex, photoIndex:$scope.photoIndex});
                                };
                                $scope.cancel = function() {
                                    if ($scope.people.recent.index)
                                        $scope.people.avatar = $scope.people.recent.avatar;
                                    else
                                        $scope.people.avatar = self.dummyImage + peopleIndex;

                                    $modalInstance.dismiss('cancel'); 
                                };

                                $scope.insertPhoto = function(evt) {
                                    var $buttonFile = angular.element(evt.currentTarget),
                                        $inputFile  = $buttonFile.siblings('input[type="file"]');

                                    console.log('$inputFile', $inputFile)
                                    $timeout(function() {
                                        $inputFile
                                            .unbind('change')
                                            .bind('change', handleFile)
                                            .trigger('click');
                                    }, 0);

                                    var handleFile = function(evt) {
                                        var file = evt.target.files[0];
                                        imageReader.handleReadImage(file, {
                                            compile: function(buttonEl, changeEl, blob, image) {

                                                var filename = blob.name;
                                                filename = filename.substr(0, filename.lastIndexOf('.'));

                                                $('#svg-mobile').block({
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

                                                $buttonFile.html('<i class="icon-refresh icon-spin"></i> Uploading').attr('disabled', 'disabled');

                                                // upload image
                                                imageReader.uploadFile({
                                                    file: blob,
                                                    name: 'mobile_photo_' + filename,
                                                    size: {
                                                        width : 100,
                                                        height: 100
                                                    }
                                                }, function(response) {

                                                    $scope.splash.selected.peoples[peopleIndex].avatar = response.dataURI;
                                                    $scope.photos.push(response.image);
                                                    $scope.photoIndex = $scope.photos.length - 1;
                                                    $scope.$apply();

                                                    $('#svg-mobile').unblock();

                                                    $buttonFile.html('Change image').removeAttr('disabled');

                                                });
                                            }
                                        });
                                    };
                                };
                            },
                            size: size,
                            resolve: {
                                data: function(RecentMobilephotos, $loadDialog){
                                	if( $scope.splash.photos.length ){
                                		return {
	                                        splash: $scope.splash,
	                                        photos: $scope.splash.photos
	                                    };
                                	} else {
                                		// get mobile photos from 'upload' directory with SplashService ('RecentMobilephotos')
	                                	$loadDialog.show('Loading');
		                                return RecentMobilephotos().then(function(photos){
		                                	// set into splash photos
		                                	$scope.splash.photos = photos;
		                                	$loadDialog.hide();
		                                	return {
		                                        splash: $scope.splash,
		                                        photos: photos
		                                    };
		                                })
                                	}
                                }
                            }
                        });
                        modalInstance.result.then(function(index) {
                        	var selected = index.photoIndex,
                        		peopleIndex = index.peopleIndex;
                            $scope.splash.selected.peoples[peopleIndex].recent.index  = selected;
                            $scope.splash.selected.peoples[peopleIndex].recent.avatar = $scope.splash.selected.peoples[peopleIndex].avatar;
                        });
                    };

                    self.setPhoto = function(photoIndex, people) {
                    	console.log('setPhoto', $scope.splash.selected.avatar)
                        // create canvas
                        var canvas = document.createElement('canvas');
                        // get canvas context
                        var ctx = canvas.getContext("2d");
                        // create image
                        var img = new Image();
                        img.onload = function() {
                            // set canvas dimension
                            canvas.width  = 100;
                            canvas.height = 100;
                            // draw image
                            ctx.drawImage(img, 0, 0);
                            // convert to image png
                            var imgDataURI = canvas.toDataURL('image/png');

                            $scope.splash.selected.peoples[people].avatar = imgDataURI;
                            $scope.$apply();
                        };
                        img.src = "images/upload/" + $scope.splash.photos[photoIndex];
                    }
                },
                link: function($scope, iElm, iAttrs, controller) {
                	
                    /* Read n upload image screenshot */
                    imageReader.init({
                        buttonClass: 'btn-info',
                        inputFileEl: controller.inputScreenshot,
                        inputFileText: 'Upload image',
                        compile: function(buttonEl, changeEl, blob, image) {

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
                                    width : $scope.splash.selected.screenshot.width,
                                    height: $scope.splash.selected.screenshot.height
                                }
                            }, function(response) {

                                $scope.safeApply(function() {
                                    $scope.splash.screenshot = response.dataURI;
                                    $scope.splash.selected.screenshot.image = response.dataURI;
                                });

                                $(controller.svgEditor).unblock();

                                angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');

                            });
                        }
                    });
                }
            };
        }
    ]);
});