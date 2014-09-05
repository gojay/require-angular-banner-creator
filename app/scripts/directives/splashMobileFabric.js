define([
    'directives/directives',
    'services/splashService'
], function(directives) {
    directives.directive('splashMobileFabric', [
        '$compile', '$timeout', 'RecentMobilephotos', 'imageReader', '$modal',

        'Fabric', 
        'FabricConstants', 
        'Keypress', 

        function(
            $compile, $timeout, RecentMobilephotos, imageReader, $modal,
            Fabric, FabricConstants, Keypress) {
            // Runs during compile
            return {
                scope: {
                    splash: '='
                }, 
                restrict: 'EAC',
                templateUrl: 'app/views/components/splash-mobile-fabric.html',
                replace: true,
                controller: function($scope, $element, $attrs, $transclude) {

                    var self = this;
                    var canvasEl = '#canvas-mobile';

                    //
                    // Fabric JS for mobile splash
                    // ================================================================

                    $scope.splash.fabric = {};
                    $scope.splash.FabricConstants = FabricConstants;

                    function setObjectImage( objectName, src, callback ){
                        var fabric = $scope.splash.fabric;

                        var object = fabric.getObjectByName(objectName);

                        // console.log('object:'+objectName, object);

                        if ( !object ) return;

                        object.getElement().src = src;
                        object.opacity = 1;
                        fabric.render();

                        if( callback ) callback();
                    }
                    function mobileGenerateQR( name, url ){
                        var qr = $scope.splash.qr[name];

                        if( url == null ) url = qr.url;

                        if( url == null ) return;

                        qr.loading = true;
                        $timeout(function(){
                            qrcode.qrcode({
                                "render": "canvas",
                                "width" : $scope.splash.dimensions.qr.width,
                                "height": $scope.splash.dimensions.qr.height,
                                "color" : "#3a3",
                                "text"  : url
                            });
                            var canvasQR   = qrcode.find('canvas')[0];
                            var imgDataURI = canvasQR.toDataURL('image/jpeg');
                            qrcode.empty();

                            // set qr image to object
                            setObjectImage('qr-'+name, imgDataURI, function(){
                                qr.url = url;
                                qr.loading = false;
                            });
                        }, 1000);
                    }

                    // Ui Bootstrap Modal
                    // Set Photo
                    // ================================================================
                    $scope.splash.open = function(peopleIndex, size) {
                        var imageSize = $scope.splash.dimensions.testimonial;
                        var modalInstance = $modal.open({
                            templateUrl: 'modalInsertPhoto.html',
                            controller: function($scope, $modalInstance, $timeout, data, imageReader) {
                                console.log('data', data);

                                $scope.splash = data.splash;
                                $scope.photos = data.photos;
                                $scope.photoIndex = null;
                                $scope.selected = function($index) {
                                    $scope.photoIndex = $index;
                                    self.setPhoto($index, peopleIndex);
                                };
                                $scope.ok = function() {
                                    $modalInstance.close({
                                        peopleIndex: peopleIndex, 
                                        // photoIndex:$scope.photoIndex
                                    });
                                };
                                $scope.cancel = function() {
                                    // if ($scope.people.recent.index)
                                    //     $scope.people.avatar = $scope.people.recent.avatar;
                                    // else
                                    //     $scope.people.avatar = self.dummyImage + peopleIndex;

                                    $modalInstance.dismiss('cancel'); 
                                };

                                $scope.insertPhoto = function(evt) {
                                    var $buttonFile = angular.element(evt.currentTarget),
                                        $inputFile  = $buttonFile.siblings('input[type="file"]');

                                    var handleFile = function(evt) {
                                        var file = evt.target.files[0];
                                        imageReader.handleReadImage(file, {
                                            compile: function(buttonEl, changeEl, blob, image) {

                                                var filename = blob.name;
                                                filename = filename.substr(0, filename.lastIndexOf('.'));

                                                $buttonFile.html('<i class="icon-refresh icon-spin"></i> Uploading').attr('disabled', 'disabled');

                                                // upload image
                                                imageReader.uploadFile({
                                                    file: blob,
                                                    name: 'mobile_photo_' + filename,
                                                    size: {
                                                        width : 428,
                                                        height: 428
                                                    }
                                                }, function(response) {

                                                    console.log(response)

                                                    $scope.splash.images.testimonials[peopleIndex] = response.dataURI;
                                                    setObjectImage( 'testimoni-pic-'+peopleIndex, response.dataURI, function(){
                                                        angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');
                                                    });

                                                    $scope.photos.push(response.image);
                                                    $scope.photoIndex = $scope.photos.length - 1;
                                                    $scope.$apply();

                                                    $buttonFile.html('Change image').removeAttr('disabled');
                                                });
                                            }
                                        });
                                    };

                                    $timeout(function() {
                                        $inputFile
                                            .unbind('change')
                                            .bind('change', handleFile)
                                            .trigger('click');
                                    });
                                };
                            },
                            size: size,
                            resolve: {
                                data: function(RecentMobilephotos, $loadDialog){
                                    console.log($scope.splash);
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
                            // console.log(index);
                        });
                    };
                    self.setPhoto = function(photoIndex, index) {
                        // create canvas
                        var canvas = document.createElement('canvas');
                        // get canvas context
                        var ctx = canvas.getContext("2d");
                        // create image
                        var img = new Image();
                        img.onload = function() {
                            // set canvas dimension
                            canvas.width  = img.width;
                            canvas.height = img.height;
                            // draw image
                            ctx.drawImage(img, 0, 0);
                            // convert to image png
                            var imgDataURI = canvas.toDataURL('image/png');
                            $scope.splash.images.testimonials[index] = imgDataURI;
                            setObjectImage( 'testimoni-pic-'+index, imgDataURI );
                        };
                        img.src = "images/upload/" + $scope.splash.photos[photoIndex];
                    };

                    //
                    // DownloadPoster
                    // ================================================================
                    $scope.splash.downloadPoster = function( id ){
                        var fabric = $scope.splash.fabric;

                        // Stops active object outline from showing in image
                        fabric.deactivateAll();

                        var initialCanvasScale = fabric.canvasScale;
                        fabric.resetZoom();

                        var name = 'poster-default';
                        if( fabric.presetSize.type ){
                            name = $scope.splash.text.app.replace(/\s/g, '-') + ' ' + fabric.presetSize.name;
                            name = name.replace(/\s/g, '_');
                        }

                        // get anchor link
                        var anchor = document.getElementById(id);
                        anchor.download = name + ".png";
                        anchor.href = fabric.canvas.toDataURL('png');

                        $scope.splash.disable.generate = false;
                        $scope.splash.disable.download = false;

                        fabric.canvasScale = initialCanvasScale;
                        fabric.setZoom();
                    }

                    //
                    // Watchers
                    // ================================================================
                    $scope.$watch('splash.text.app', function(newVal){
                        if (typeof newVal === 'string' && $scope.splash.fabric.selectedObject && $scope.splash.fabric.selectedObject.name == 'app-name') {
                            $scope.splash.fabric.setText(newVal);
                            $scope.splash.fabric.render();
                            $scope.splash.fabric.centerH();
                        }
                    });
                    $scope.$watch('splash.text.left', function(newVal){
                        if (typeof newVal === 'string' && $scope.splash.fabric.selectedObject && $scope.splash.fabric.selectedObject.name == 'testimoni-text-left') {
                            $scope.splash.fabric.setText(newVal);
                            $scope.splash.fabric.render();
                        }
                    });
                    $scope.$watch('splash.text.right', function(newVal){
                        if (typeof newVal === 'string' && $scope.splash.fabric.selectedObject && $scope.splash.fabric.selectedObject.name == 'testimoni-text-right') {
                            $scope.splash.fabric.setText(newVal);
                            $scope.splash.fabric.render();
                        }
                    });
                    $scope.$watch('splash.images.screenshot', function(image){
                        if( image == null ) return;
                        setObjectImage( 'app-screenshot', image);
                    });

                    self.initInputFile = function(){
                        // App Screenshot image
                        // ================================================================
                        imageReader.init({
                            buttonClass  : 'btn-info',
                            inputFileEl  : '#input-screenshot',
                            inputFileText: 'Upload image',
                            compile: function(buttonEl, changeEl, blob, image) {

                                console.log('imageReader:Screenshot', this)

                                var imageSize = $scope.splash.dimensions.app;

                                if( image.width < imageSize.width || image.height < imageSize.height ){
                                    alert('Please make sure your image is >= '+ imageSize.width +'x'+ imageSize.height +' pixels');
                                    $(this.inputFileEl).val('');
                                    return;
                                }

                                $(canvasEl).block({
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
                                        width : imageSize.width,
                                        height: imageSize.height
                                    }
                                }, function(response) {

                                    $scope.splash.images.screenshot = response.dataURI;
                                    $scope.$apply();

                                    $timeout(function(){
                                        $(canvasEl).unblock();
                                        angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');
                                    }, 1000);
                                });
                            }
                        });
                        // Testimonial images
                        // ================================================================
                        imageReader.init({
                            buttonClass  : 'btn-info',
                            inputFileEl  : '#input-testimonial-photo-left',
                            inputFileText: 'Upload image',
                            compile: function(buttonEl, changeEl, blob, image) {

                                var imageSize = $scope.splash.dimensions.testimonial;

                                if( image.width < imageSize.width || image.height < imageSize.height ){
                                    alert('Please make sure your image is >= '+ imageSize.width +'x'+ imageSize.height +' pixels');
                                    $(this.inputFileEl).val('');
                                    return;
                                }

                                $(canvasEl).block({
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
                                    name: 'mobile-testimonial-left',
                                    size: {
                                        width : imageSize.width,
                                        height: imageSize.height
                                    }
                                }, function(response) {

                                    $scope.splash.images.testimonials.left = response.dataURI;

                                    setObjectImage( 'testimoni-pic-left', response.dataURI, function(){
                                        $(canvasEl).unblock();
                                        angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');
                                    });

                                });
                            }
                        });
                        imageReader.init({
                            buttonClass  : 'btn-info',
                            inputFileEl  : '#input-testimonial-photo-right',
                            inputFileText: 'Upload image',
                            compile: function(buttonEl, changeEl, blob, image) {

                                var imageSize = $scope.splash.dimensions.testimonial;

                                if( image.width < imageSize.width || image.height < imageSize.height ){
                                    alert('Please make sure your image is >= '+ imageSize.width +'x'+ imageSize.height +' pixels');
                                    $(this.inputFileEl).val('');
                                    return;
                                }

                                $(canvasEl).block({
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
                                    name: 'mobile-testimonial-right',
                                    size: {
                                        width : imageSize.width,
                                        height: imageSize.height
                                    }
                                }, function(response) {

                                    $scope.splash.images.testimonials.right = response.dataURI;

                                    setObjectImage( 'testimoni-pic-right', response.dataURI );

                                    $(canvasEl).unblock();

                                    angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');

                                });
                            }
                        });
                    };
                    $timeout(self.initInputFile);
                    
                    //
                    // QR Code image (UI_EVENT)
                    // ================================================================
                    var qrcode;

                    var currentQRURL = null;
                    $scope.splash.onFocusQR = function(e){
                        currentQRURL = e.target.value;
                    };
                    $scope.splash.onKeyUpQR = function(e){
                        var name  = e.target.name;
                        var valid = e.target.validity.valid;
                        $scope.splash.qr[name].valid = e.target.validity.valid;
                    };
                    $scope.splash.onBlurQR = function(e){
                        var name = e.target.name;
                        var url  = e.target.value;

                        // if url is valid && url not same before
                        if( e.target.validity.valid && currentQRURL != url ){

                            mobileGenerateQR(name, url);

                        }
                    };

                    //
                    // Editing Canvas Size
                    // ================================================================
                    $scope.selectCanvas = function() {
                        $scope.canvasCopy = {
                            width: $scope.splash.fabric.canvasOriginalWidth,
                            height: $scope.splash.fabric.canvasOriginalHeight
                        };
                    };
                    $scope.setCanvasSize = function() {
                        $scope.splash.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
                        $scope.splash.fabric.setDirty(true);
                        delete $scope.canvasCopy;
                    };

                    //
                    // Init
                    // ================================================================
                    $scope.init = function() {
                        $scope.splash.fabric = new Fabric({
                            JSONExportProperties: FabricConstants.JSONExportProperties,
                            textDefaults: FabricConstants.textDefaults,
                            shapeDefaults: FabricConstants.shapeDefaults,
                            json: {},
                            CustomAttributes: FabricConstants.CustomAttributes,
                            onChangeCanvasSize: onChangeCanvasSize
                        });

                        $scope.$watch('splash.fabric.canvasScale', function(length){
                            $scope.splash.fabric.setZoom();
                        });

                        $scope.$watch('splash.fabric.controls.angle', function(value){
                            $scope.splash.fabric.angleControl();
                        });
                        $scope.$watch('splash.fabric.controls.left', function(value){
                            // if( value < 0) $scope.splash.fabric.controls.left = 0;
                            // else if ( value > $scope.splash.fabric.maxBounding.left) $scope.splash.fabric.controls.left = $scope.splash.fabric.maxBounding.left;
                            $scope.splash.fabric.leftControl();
                        });
                        $scope.$watch('splash.fabric.controls.top', function(value){
                            // if( value < 0) $scope.splash.fabric.controls.top = 0;
                            // else if ( value > $scope.splash.fabric.maxBounding.top) $scope.splash.fabric.controls.top = $scope.splash.fabric.maxBounding.top;
                            $scope.splash.fabric.topControl();
                        });
                        $scope.$watch('splash.fabric.controls.scale', function(value){
                            $scope.splash.fabric.scaleControl();
                        });

                        qrcode = angular.element('#qrcode');
                    };

                    $scope.$on('canvas:created', $scope.init);

                    //
                    // Keypress
                    // ================================================================
                    Keypress.onSave(function() {
                        // $scope.updatePage();
                    });
                    Keypress.onControls({
                        up: function(){
                            if( $scope.splash.fabric.selectedObject ) {
                                $scope.splash.fabric.controls.top -= 1;
                                $scope.$apply();
                                // console.log('up', $scope.splash.fabric.controls.top);
                            }
                        },
                        down: function(){
                            if( $scope.splash.fabric.selectedObject ) {
                                $scope.splash.fabric.controls.top += 1;
                                $scope.$apply();
                                // console.log('down', $scope.splash.fabric.controls.top);
                            }
                        },
                        left: function(){
                            if( $scope.splash.fabric.selectedObject ) {
                                $scope.splash.fabric.controls.left -= 1;
                                $scope.$apply();
                                // console.log('left', $scope.splash.fabric.controls.left);
                            }
                        },
                        right: function(){
                            if( $scope.splash.fabric.selectedObject ) {
                                $scope.splash.fabric.controls.left += 1;
                                $scope.$apply();
                                // console.log('right', $scope.splash.fabric.controls.left);
                            }
                        }
                    });

                    //
                    // Callback onChangeCanvasSize
                    // ================================================================
                    function onChangeCanvasSize( self ){

                        var canvas  = self.canvas;
                        canvas.backgroundImage = null;
                        self.clearCanvas();

                        if( self.presetSize && self.presetSize.hasOwnProperty('type') ){
                            // if is paper a4 / a5, set canvas scale
                            var initialCanvasScale = self.canvasScale = 0.3;

                            // set background image
                            var backgroundImageName = 'stiker_'+ self.presetSize.type +'_'+ self.presetSize.width +'x'+ self.presetSize.height +'.jpg';
                            canvas.setBackgroundImage( 'images/mobile/'+ backgroundImageName, canvas.renderAll.bind(canvas), {
                                scaleX: initialCanvasScale,
                                scaleY: initialCanvasScale
                            });

                            var type = self.presetSize.type;
                            var ppi  = self.presetSize.ppi;
                            var CustomAttributes = self.CustomAttributes[type];

                            // callback image
                            var callbackImage = function( object, name, type, index ){
                                var attributes = CustomAttributes[ppi][type][index];
                                object.name   = name;
                                if( type == 'people' ){
                                    object.width  = attributes.width;
                                    object.height = attributes.height;
                                }
                                object.left   = attributes.left;
                                object.top    = attributes.top;
                                object.hasControls = false;
                                if( type == 'people'){
                                    object.clipTo = function(ctx) {
                                        ctx.arc(0, 0, object.width / 2 , 0, 2*Math.PI, true);
                                    };
                                }
                            }

                            // get attributes
                            var ss = CustomAttributes[ppi]['ss'];
                            var qr = CustomAttributes[ppi]['qr'];
                            var testimoniDimension = CustomAttributes[ppi]['people']['left'];
                            var textAttribute = CustomAttributes[ppi]['text'];

                            // set model mobile dimension
                            $scope.splash.dimensions = {
                                app: { width : ss.width, height: ss.height },
                                testimonial: { width : testimoniDimension.width, height: testimoniDimension.height },
                                qr: { width: qr.iphone.width, height: qr.iphone.height }
                            };

                            // screenshot
                            var screenshot = $scope.splash.images.screenshot ? 
                                                'images/upload/mobile_screenshot.png' :
                                                'images/dummy/'+ ss.width +'x'+ ss.height +'.jpg' ;
                            $scope.splash.fabric.addImage(screenshot, function(object){
                                object.name = 'app-screenshot';
                                object.set({
                                    width  : ss.width,
                                    height : ss.height,
                                    left   : ss.left,
                                    top    : ss.top,
                                });
                            });

                            // add app name
                            $scope.splash.fabric.addText($scope.splash.text.app, function(object){
                                var attribute = textAttribute['app'];
                                object.set({
                                    name: 'app-name',
                                    fill: '#434343',
                                    stroke: '#434343',
                                    fontSize: attribute.size,
                                    left: attribute.left,
                                    top: attribute.top,
                                    textAlign: 'center',
                                });
                            });
                            // add qr images
                            var qrIphone = qr['iphone'];
                            $scope.splash.fabric.addImage('images/dummy/'+ qrIphone.width +'x'+ qrIphone.height +'.jpg', function(object){
                                callbackImage( object, 'qr-iphone', 'qr', 'iphone' );
                            });
                            var qrAndroid = qr['android'];
                            $scope.splash.fabric.addImage('images/dummy/'+ qrAndroid.width +'x'+ qrAndroid.height +'.jpg', function(object){
                                callbackImage( object, 'qr-android', 'qr', 'android' );
                            });

                            // add testimoni pic n text Left
                            var imgTestimonialLeft = $scope.splash.images.testimonials.left ? 
                                                'images/upload/mobile_testimonial_left.jpg' :
                                                'images/dummy/'+ testimoniDimension.width +'x'+ testimoniDimension.height +'.jpg' ;
                            $scope.splash.fabric.addImage(imgTestimonialLeft, function(object){
                                callbackImage( object, 'testimoni-pic-left', 'people', 'left' );
                            });
                            $scope.splash.fabric.addIText($scope.splash.text.left, function(object){
                                var attribute = textAttribute['people']['left'];
                                object.set({
                                    name: 'testimoni-text-left',
                                    fill: '#313131',
                                    stroke: '#313131',
                                    fontSize: attribute.size,
                                    left: attribute.left,
                                    top: attribute.top,
                                    opacity: 0.5
                                });
                            });
                            // add testimoni pic n text Right
                            var imgTestimonialRight = $scope.splash.images.testimonials.right ? 
                                                'images/upload/mobile_testimonial_right.jpg' :
                                                'images/dummy/'+ testimoniDimension.width +'x'+ testimoniDimension.height +'.jpg' ;
                            $scope.splash.fabric.addImage(imgTestimonialRight, function(object){
                                callbackImage( object, 'testimoni-pic-right', 'people', 'right' );
                            });
                            $scope.splash.fabric.addIText($scope.splash.text.right, function(object){
                                var attribute = textAttribute['people']['right'];
                                object.set({
                                    name: 'testimoni-text-right',
                                    fill: '#313131',
                                    stroke: '#313131',
                                    fontSize: attribute.size,
                                    left: attribute.left,
                                    top: attribute.top,
                                    opacity: 0.5
                                });
                            });

                            // set QR
                            mobileGenerateQR('iphone');
                            mobileGenerateQR('android');
                        }
                    }
                },
                link: function($scope, iElm, iAttrs, controller) {}
            };
        }
    ]);
});