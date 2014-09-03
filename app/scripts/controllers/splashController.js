define([
    'controllers/controllers',
    'services/splashService',
    'jquery',
    'jqueryui',

    'fabricAngular',
    'fabricCanvas', 
    'fabricConstants', 
    'fabricDirective', 
    'fabricDirtyStatus',
    'fabricUtilities',
    'fabricWindow',

], function(controllers) {
    controllers.controller('SplashController', [
        '$rootScope', 
        '$scope', 
        '$timeout', 
        '$compile', 
        '$http', 

        'SplashCustom', 
        'SplashFB', 
        'SplashMobile', 
        'imageReader',

        'Fabric', 
        'FabricConstants', 
        'Keypress', 

        function(
            $rootScope, $scope, $timeout, $compile, $http, 
            SplashCustom, SplashFB, SplashMobile, imageReader, 
            Fabric, FabricConstants, Keypress) {

            var ID = new Date().getTime();
            var self = this;
            self.zip = new JSZip();

            self.svgEditor = '#svg-facebook';

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

            $scope.splash = {
                mobile  : SplashMobile,
                facebook: SplashFB,
                custom  : SplashCustom
            };

            var showEditor = $scope.showEditor = 'mobile';
            $scope.generateDisabled = false;
            $scope.isDownloadDisabled = true;

            /* collapse listener */

            $('.collapse')
                .live('show', function() {
                    var $link = $(this).parent().find('a');
                    $(this).parent().find('a').addClass('open'); //add active state to button on open
                    var title = $(this).parent().find('a').data('title');

                    if( !title ) return;

                    if (/facebook/i.test(title)) {
                        $scope.showEditor = "facebook";
                    } else if (/mobile/i.test(title)) {
                        $scope.showEditor = "mobile";
                    } else {
                        $scope.showEditor = "custom";
                    }
                    $scope.$apply();
                })
                .live('hide', function() {
                    $(this).parent().find('a').removeClass('open'); //remove active state to button on close
                });

            $scope.$watch('showEditor', function(editor) {
                showEditor = editor;
                self.svgEditor = '#svg-' + editor;
                // update breadcrumb
                $rootScope.page.breadcrumb.link.active = editor.charAt(0).toUpperCase() + editor.slice(1);
            });

            $scope.generateQR = function(params, callback) {
                console.log('generateQR', params);

                var canvasEl = params.canvas;
                var width = params.width;
                var height = params.height;
                var url = params.url;

                canvasEl.html('');

                $timeout(function() {
                    // generate canvas QR code
                    canvasEl.qrcode({
                        width: width,
                        height: height,
                        text: url
                    });
                    // convert canvas QR code to image element
                    var canvasQR = canvasEl.find('canvas')[0];
                    var imgDataURI = canvasQR.toDataURL('image/jpeg');

                    callback(imgDataURI);

                }, 2000);
            };
            $scope.setStickerSize = function(size) {
                $scope.splash[showEditor].size = size;
            };

            $scope.generateSplashCustom = function(evt) {
                console.log('generate:SplashDefault', evt);
                // start
                var el = evt.currentTarget;
                el.innerHTML = '<i class="icon-refresh icon-spin"></i> Generating images';
                $scope.generateDisabled = true;
                // show loading
                $(self.svgEditor).block({
                    overlayCSS: {
                        backgroundColor: '#fff',
                        opacity: 0.8
                    },
                    message: '<i class="icon-spinner icon-spin icon-4x"></i> <br/> <span>Preparing splash screen..<span>',
                    css: {
                        border: 'none',
                        background: 'none',
                        color: '#3685C6'
                    }
                });

                // get y-axis
                var cl_p = $scope.splash.custom.editor.logo.p;
                var ch_p = $scope.splash.custom.editor.ch.p;

                console.info('calculating...');
                $('span', self.svgEditor).text('Calculating the splash screens...');

                var requests = [];
                angular.forEach($scope.splash.custom.dimensions, function(e, i) {
                    console.log(i, e);
                    // get logos
                    var cl = $scope.splash.custom.logo[i];
                    var ch = $scope.splash.custom.ch[i];
                    var maxH = e.height - ch.height;
                    // calculate y position
                    cl.y = (cl_p !== null) ? Math.round(cl_p / 100 * e.height) : cl.y;
                    var calc = Math.round(ch_p / 100 * e.height);
                    ch.y = calc > maxH ? maxH : calc;
                    // add queue requests
                    requests.push({
                        ID: i,
                        svg: e,
                        logo: {
                            cl: cl,
                            ch: ch
                        }
                    });
                    if (requests.length == 3) {
                        $timeout(function() {

                            console.info('start building...');
                            $('span', self.svgEditor).text('Starting build the splash screens...');

                            self.deferredBuildMultiSVG(requests).done(function(response) {

                                console.log('finished building');
                                $('span', self.svgEditor).text('Finished generate the splash screens');

                                $timeout(function() {
                                    $('span', self.svgEditor).text('Adding the splash screens into ZIP');
                                }, 500);

                                // generated zip 
                                var DOMURL = window.URL || window.mozURL;
                                var link = DOMURL.createObjectURL(self.zip.generate({
                                    type: "blob"
                                }));
                                // set anchor link
                                var aZip = document.getElementById('downloadZip');
                                aZip.download = "splash-" + ID + ".zip";
                                aZip.href = link;

                                // Done
                                $timeout(function() {
                                    $(self.svgEditor).unblock();
                                    $('#generateImage').text('Generate Image');
                                    // applying isGenerateDisabled to false
                                    $scope.$apply(function(scope) {
                                        scope.generateDisabled = true;
                                        scope.isDownloadDisabled = false;
                                    });
                                }, 2000);
                            });
                        }, 3000);
                    }
                });
            };

            $scope.generateSplashFacebook = function(evt) {
                // change button text loading
                var el = evt.currentTarget;
                el.innerHTML = '<i class="icon-refresh icon-spin"></i> Generating image';
                // disable generate button
                $scope.safeApply(function() {
                    $scope.splash.facebook.disable.generate = true;
                });
                // show loading message
                $(self.svgEditor).block({
                    overlayCSS: {
                        backgroundColor: '#fff',
                        opacity: 0.8
                    },
                    message: '<i class="icon-spinner icon-spin icon-4x"></i> <br/> <span>Preparing generate ' + showEditor + ' poster..<span>',
                    css: {
                        border: 'none',
                        background: 'none',
                        color: '#3685C6'
                    }
                });

                // generate image
                self.generateImage($('svg', self.svgEditor)[0], 'facebook').done(function(imgDataURI) {
                    var name = 'facebook-' + $scope.splash.facebook.size + '_' + convertToSlug($scope.splash.facebook.url);
                    // loading info
                    $('span', self.svgEditor).text('Preparing to download ' + showEditor + ' poster');

                    // create object url 
                    var DOMURL = window.URL || window.mozURL;
                    var link = DOMURL.createObjectURL(dataURItoBlob(imgDataURI));
                    // set anchor link
                    var anchor = document.getElementById('downloadFB');
                    anchor.download = "splash-" + name + ".jpeg";
                    anchor.href = link;

                    // done
                    $timeout(function() {
                        // hide loading meesage
                        $(self.svgEditor).unblock();
                        //ready to download
                        $scope.safeApply(function() {
                            $scope.splash.facebook.disable.generate = false;
                            $scope.splash.facebook.disable.download = false;
                        });
                        // set default generate button text
                        el.innerHTML = 'Generate Image';
                    }, 1000);
                });
            };

            var dataURItoBlob = function(dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {
                    type: 'image/jpeg'
                });
            }
            var ucwords = function(str) {
                return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
                    return $1.toUpperCase();
                });
            }
            var convertToSlug = function(Text) {
                return Text
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
            }

            this.generateImage = function(svg, type) {
                var deferred = $.Deferred();

                console.log('generating image..');
                $('span', self.svgEditor).text('Generating splash screen ' + ucwords(type));

                var svg_xml = (new XMLSerializer()).serializeToString(svg);
                // create canvas
                var canvas = document.createElement('canvas');
                // get canvas context
                var ctx = canvas.getContext("2d");
                // create image
                var img = new Image();
                img.onload = function() {
                    // set canvas dimension
                    canvas.width = img.width;
                    canvas.height = img.height;
                    // draw image
                    ctx.drawImage(img, 0, 0);
                    // convert to image png
                    var imgDataURI = canvas.toDataURL('image/jpeg');
                    // send response
                    $timeout(function() {
                        var img = (type == 'facebook' || type == 'mobile') ? imgDataURI : imgDataURI.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                        deferred.resolve(img);
                    }, 2000);
                };
                img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

                return deferred.promise();
            };
            this.deferredBuildMultiSVG = function(requests) {
                var deferred = $.Deferred();
                // get count requests
                var countRequest = requests.length - 1;
                var promise = requests.reduce(function(promise, request, index) {
                    var type = request.ID;
                    console.info(type + ' index : ' + index);
                    return promise.pipe(function() {

                        console.info('creating SVG ' + type);
                        $('span', self.svgEditor).text('Creating SVG ' + type);

                        var svg = self.createSVG(request);
                        return self.generateImage(svg, type).done(function(imgDataURI) {
                            // add to zip
                            self.zip.file('splash_' + type + '.jpg', imgDataURI, {
                                base64: true
                            });
                            // send completed
                            if (index == countRequest) return 'Completed';
                        });
                    });
                }, deferred.promise());
                deferred.resolve();
                return promise;
            };
            this.createSVG = function(data) {
                var $svg = $(self.svgEditor + ' > svg').clone();
                // set svg dimension
                $svg.attr({
                    width: data.svg.width,
                    height: data.svg.height
                });
                // get type (iphone or ipad)
                var type = data.ID.replace(/\d/, '');
                // get data logo
                var logo = data.logo;
                // mapping svg logo
                $('#logo', $svg).children().map(function(i, e) {
                    if (/splash/.test(e.id)) {
                        var regexClientType = new RegExp(type);
                        if (!regexClientType.test(e.id)) $(e).remove();
                        $(e).attr({
                            x: logo.cl.x,
                            y: logo.cl.y,
                            width: logo.cl.width,
                            height: logo.cl.height
                        }).show();
                    } else if (/footer/.test(e.id)) {
                        var regexCHType = new RegExp(type);
                        if (!regexCHType.test(e.id)) $(e).remove();
                        $(e).attr({
                            x: logo.ch.x,
                            y: logo.ch.y,
                            width: logo.ch.width,
                            height: logo.ch.height
                        });
                        if ($scope.splash.white) {
                            $('#logo-footer-ipad-white', $svg).show();
                        } else {
                            $('#logo-footer-ipad-color', $svg).show();
                        }
                    }
                });

                return $svg[0];
            };

            //
            // Fabric JS for mobile splash
            // ================================================================

            $scope.fabric = {};
            $scope.FabricConstants = FabricConstants;

            //
            // Watchers
            // ================================================================
            $scope.$watch('splash.mobile.text.app', function(newVal){
                if (typeof newVal === 'string' && $scope.fabric.selectedObject && $scope.fabric.selectedObject.name == 'app-name') {
                    $scope.fabric.setText(newVal);
                    $scope.fabric.render();
                    $scope.fabric.centerH();
                }
            });
            $scope.$watch('splash.mobile.text.left', function(newVal){
                if (typeof newVal === 'string' && $scope.fabric.selectedObject && $scope.fabric.selectedObject.name == 'testimoni-text-left') {
                    $scope.fabric.setText(newVal);
                    $scope.fabric.render();
                }
            });
            $scope.$watch('splash.mobile.text.right', function(newVal){
                if (typeof newVal === 'string' && $scope.fabric.selectedObject && $scope.fabric.selectedObject.name == 'testimoni-text-right') {
                    $scope.fabric.setText(newVal);
                    $scope.fabric.render();
                }
            });

            function setObjectImage( objectName, src, callback ){
                var fabric = $scope.fabric;

                var object = fabric.getObjectByName(objectName);
                if ( !object ) return;

                object.getElement().src = src;
                object.opacity = 1;
                fabric.render();

                if( callback ) callback();
            }

            //
            // App Screenshot image
            // ================================================================
            self.inputScreenshot = '#input-screenshot';
            var canvasEl = '#canvas-mobile';
            imageReader.init({
                buttonClass  : 'btn-info',
                inputFileEl  : self.inputScreenshot,
                inputFileText: 'Upload image',
                compile: function(buttonEl, changeEl, blob, image) {

                    var imageSize = $scope.splash.mobile.dimensions.app;

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

                        setObjectImage( 'app-screenshot', response.dataURI, function(){
                            $(canvasEl).unblock();
                            angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');
                        });


                    });
                }
            });

            //
            // Testimonial images
            // ================================================================
            self.inputTestimonialLeft = '#input-testimonial-photo-left';
            var canvasEl = '#canvas-mobile';
            imageReader.init({
                buttonClass  : 'btn-info',
                inputFileEl  : self.inputTestimonialLeft,
                inputFileText: 'Upload image',
                compile: function(buttonEl, changeEl, blob, image) {

                    var imageSize = $scope.splash.mobile.dimensions.testimonial;

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

                        setObjectImage( 'testimoni-pic-left', response.dataURI, function(){
                            $(canvasEl).unblock();
                            angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');
                        });

                    });
                }
            });

            self.inputTestimonialRight = '#input-testimonial-photo-right';
            var canvasEl = '#canvas-mobile';
            imageReader.init({
                buttonClass  : 'btn-info',
                inputFileEl  : self.inputTestimonialRight,
                inputFileText: 'Upload image',
                compile: function(buttonEl, changeEl, blob, image) {

                    var imageSize = $scope.splash.mobile.dimensions.testimonial;

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

                        setObjectImage( 'testimoni-pic-right', response.dataURI );

                        $(canvasEl).unblock();

                        angular.element(buttonEl).text('Change image').removeClass('btn-info').addClass('btn-success');

                    });
                }
            });
            
            //
            // QR Code image
            // ================================================================
            var qrcode;

            var currentQRURL = null;
            $scope.splash.mobile.onFocusQr = function(e){
                // device name
                currentQRURL = e.target.value;
                console.log('onFocus', currentQRURL);
                console.log('qrcode', qrcode[0]);
            };
            $scope.splash.mobile.onBlurQr = function(e){
                var name = e.target.name;
                var url  = e.target.value;
                var qr = $scope.splash.mobile.qr[name];
                qr.valid = e.target.validity.valid;

                console.log('dimensions', $scope.splash.mobile.dimensions.qr);

                // if url is valid && url not same before
                if( e.target.validity.valid && currentQRURL != url ){
                    qr.loading = true;
                    $timeout(function(){
                        qrcode.qrcode({
                            "render": "canvas",
                            "width" : $scope.splash.mobile.dimensions.qr.width,
                            "height": $scope.splash.mobile.dimensions.qr.height,
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
                    }, 3000);
                }
            };

            //
            // Editing Canvas Size
            // ================================================================
            $scope.selectCanvas = function() {
                $scope.canvasCopy = {
                    width: $scope.fabric.canvasOriginalWidth,
                    height: $scope.fabric.canvasOriginalHeight
                };
            };
            $scope.setCanvasSize = function() {
                $scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
                $scope.fabric.setDirty(true);
                delete $scope.canvasCopy;
            };

            //
            // Init
            // ================================================================
            $scope.init = function() {
                $scope.fabric = new Fabric({
                    JSONExportProperties: FabricConstants.JSONExportProperties,
                    textDefaults: FabricConstants.textDefaults,
                    shapeDefaults: FabricConstants.shapeDefaults,
                    json: {},
                    CustomAttributes: FabricConstants.CustomAttributes,
                    onChangeCanvasSize: onChangeCanvasSize
                });

                $scope.$watch('fabric.canvasScale', function(length){
                    $scope.fabric.setZoom();
                });

                $scope.$watch('fabric.controls.angle', function(value){
                    $scope.fabric.angleControl();
                });
                $scope.$watch('fabric.controls.left', function(value){
                    // if( value < 0) $scope.fabric.controls.left = 0;
                    // else if ( value > $scope.fabric.maxBounding.left) $scope.fabric.controls.left = $scope.fabric.maxBounding.left;
                    $scope.fabric.leftControl();
                });
                $scope.$watch('fabric.controls.top', function(value){
                    // if( value < 0) $scope.fabric.controls.top = 0;
                    // else if ( value > $scope.fabric.maxBounding.top) $scope.fabric.controls.top = $scope.fabric.maxBounding.top;
                    $scope.fabric.topControl();
                });
                $scope.$watch('fabric.controls.scale', function(value){
                    $scope.fabric.scaleControl();
                });

                qrcode = angular.element('#qrcode');
            };

            $scope.$on('canvas:created', $scope.init);

            Keypress.onSave(function() {
                $scope.updatePage();
            });
            Keypress.onControls({
                up: function(){
                    if( $scope.fabric.selectedObject ) {
                        $scope.fabric.controls.top -= 1;
                        $scope.$apply();
                        console.log('up', $scope.fabric.controls.top);
                    }
                },
                down: function(){
                    if( $scope.fabric.selectedObject ) {
                        $scope.fabric.controls.top += 1;
                        $scope.$apply();
                        console.log('down', $scope.fabric.controls.top);
                    }
                },
                left: function(){
                    if( $scope.fabric.selectedObject ) {
                        $scope.fabric.controls.left -= 1;
                        $scope.$apply();
                        console.log('left', $scope.fabric.controls.left);
                    }
                },
                right: function(){
                    if( $scope.fabric.selectedObject ) {
                        $scope.fabric.controls.left += 1;
                        $scope.$apply();
                        console.log('right', $scope.fabric.controls.left);
                    }
                }
            });

            function onChangeCanvasSize( self ){

                console.log('presetSize', self.presetSize);

                var canvas  = self.canvas;
                canvas.backgroundImage = null;
                self.clearCanvas();

                if( self.presetSize && self.presetSize.hasOwnProperty('type') ){
                    // if is paper a4 / a5, set canvas scale
                    var initialCanvasScale = self.canvasScale = 0.3;

                    // set background image
                    var backgroundImageName = 'stiker_'+ self.presetSize.type +'_'+ self.presetSize.width +'x'+ self.presetSize.height +'.jpg';
                    canvas.setBackgroundImage( 'http://dev.angularjs/_learn_/require-angular-banner-creator/images/mobile/'+ backgroundImageName, canvas.renderAll.bind(canvas), {
                        scaleX: initialCanvasScale,
                        scaleY: initialCanvasScale
                    });

                    // get QR Properties
                    var type = self.presetSize.type;
                    var ppi  = self.presetSize.ppi;
                    var CustomAttributes = self.CustomAttributes[type];

                    var callback = function( object, name, type, index ){
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
                                // ctx.lineWidth = 50;
                                // ctx.strokeStyle = 'red';
                                // ctx.stroke();
                            };
                        }
                    }

                    var ss = CustomAttributes[ppi]['ss'];
                    var qr = CustomAttributes[ppi]['qr'];
                    var testimoniDimension = CustomAttributes[ppi]['people']['left'];
                    var textAttribute = CustomAttributes[ppi]['text'];
                    var text = 'Lorem ipsum dolor sit amet\nlorem ipsum dolor\namet consectetur\n\nYour Name';

                    $scope.splash.mobile.dimensions = {
                        app: { width : ss.width, height: ss.height },
                        testimonial: { width : testimoniDimension.width, height: testimoniDimension.height },
                        qr: { width: qr.iphone.width, height: qr.iphone.height }
                    };
                    $scope.fabric.addImage('http://dev.angularjs/_learn_/require-angular-banner-creator/images/dummy/'+ ss.width +'x'+ ss.height +'.jpg', function(object){
                        object.name = 'app-screenshot';
                        object.set({
                            left  : ss.left,
                            top   : ss.top,
                        })
                    });

                    // add text name app
                    var appName = $scope.splash.mobile.text.app = 'Name of App';
                    $scope.fabric.addText(appName, function(object){
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
                    $scope.fabric.addImage('http://dev.angularjs/_learn_/require-angular-banner-creator/images/dummy/'+ qrIphone.width +'x'+ qrIphone.height +'.jpg', function(object){
                        callback( object, 'qr-iphone', 'qr', 'iphone' );
                    });
                    var qrAndroid = qr['android'];
                    $scope.fabric.addImage('http://dev.angularjs/_learn_/require-angular-banner-creator/images/dummy/'+ qrAndroid.width +'x'+ qrAndroid.height +'.jpg', function(object){
                        callback( object, 'qr-android', 'qr', 'android' );
                    });

                    // add testimoni pic n text Left
                    $scope.fabric.addImage('http://dev.angularjs/_learn_/require-angular-banner-creator/images/dummy/'+ testimoniDimension.width +'x'+ testimoniDimension.height +'.jpg', function(object){
                        callback( object, 'testimoni-pic-left', 'people', 'left' );
                    });
                    var textTestimoniLeft = $scope.splash.mobile.text.left = text;
                    $scope.fabric.addIText(textTestimoniLeft, function(object){
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
                    $scope.fabric.addImage('http://dev.angularjs/_learn_/require-angular-banner-creator/images/dummy/'+ testimoniDimension.width +'x'+ testimoniDimension.height +'.jpg', function(object){
                        callback( object, 'testimoni-pic-right', 'people', 'right' );
                    });
                    var textTestimoniRight = $scope.splash.mobile.text.right = text;
                    $scope.fabric.addIText(textTestimoniRight, function(object){
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
                }
            }
        }
    ]);
});