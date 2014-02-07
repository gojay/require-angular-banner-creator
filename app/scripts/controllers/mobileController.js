define([
	'controllers/controllers',
	'services/splashService',
	'jquery',
	'jqueryui'
], function(controllers){
	controllers.controller('MobileController', ['$scope', '$timeout', '$compile', 'SplashConfig', 'SplashFB', 'imageReader',
		function($scope, $timeout, $compile, SplashConfig, SplashFB, imageReader){

			var ID = new Date().getTime();
			var self = this;
			self.zip = new JSZip();

			self.svgEditor = '#svg-facebook';

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

			/* collapse listener */

			$('.collapse')
				.live('show', function() {
					var $link = $(this).parent().find('a');
					$(this).parent().find('a').addClass('open'); //add active state to button on open
					var title = $(this).parent().find('a').data('title');
					if( /facebook/i.test(title) ){
						self.svgEditor = '#svg-facebook';
						$('#splash-facebook').show();
						$('#splash-creator').hide();
					} else {
						self.svgEditor = '#svg-editor';
						$('#splash-creator').show();
						$('#splash-facebook').hide();
					}
				})
				.live('hide', function() {
					$(this).parent().find('a').removeClass('open'); //remove active state to button on close
				});

			$scope.splash = SplashConfig;
			$scope.generateDisabled = false;
			$scope.isDownloadDisabled = true;

			/* ------------- Facebook controller ------------- */

			$scope.splash['facebook'] = SplashFB;

			var fbname = null;
			var fburl = null;
			$('input[name="fbname"]').focus(function(){ fbname = $(this).val() });
			$('input[name="fbname"]').blur(function(e){
				var text = e.target.value;
				if( e.target.validity.valid && fbname != text ){
					$scope.safeApply(function(){ 
						$scope.splash.facebook.disable.generate = false; 
						$scope.splash.facebook.disable.download = true; 
					});
				}
			});

			$('input[type="url"]').focus(function(){ fburl = $(this).val() });
			$('input[type="url"]').blur(function(e){
				var $imgLoad = $('#ajax-load-qr');
				var text = e.target.value;
				// if url is valid
				if( e.target.validity.valid && fburl != text ){
					var $svg = $('svg', self.svgEditor);
					// disable generate button
					$scope.safeApply(function(){ 
						$scope.splash.facebook.disable.generate = true; 
						$scope.splash.facebook.disable.download = true; 
						$scope.splash.facebook.selected.qr.image = null; 
					});
					// show loading
					$imgLoad.show();
					// clear canvas
					$svg.find('#fb-qrcode-canvas').removeAttr('display');
					$('#canvas-qrcode').html('');

					$timeout(function(){
						// generate canvas QR code
						$('#canvas-qrcode').qrcode({
							width : $scope.splash.facebook.selected.qr.size,
							height: $scope.splash.facebook.selected.qr.size, 
							text  : text 
						});	
						// convert canvas QR code to image element
						var canvasQR   = $('#canvas-qrcode > canvas')[0];
						var imgDataURI = canvasQR.toDataURL('image/jpeg');
						// apply image QR code
						$scope.safeApply(function(){ 
							$scope.splash.facebook.selected.qr.image = imgDataURI;
							$scope.splash.facebook.disable.generate = false;
						});
						// hide loading
						$imgLoad.hide();
					}, 2000);
				}
			});

			$scope.setFBSize = function(size){
				$scope.splash.facebook.size = size;
			};

			$scope.$watch('splash.facebook.size', function(size){
				$scope.splash.facebook.selected.background = SplashFB.attributes[size].background;
				$scope.splash.facebook.selected.dimension  = SplashFB.attributes[size].dimension;
				$scope.splash.facebook.selected.qr  	   = SplashFB.attributes[size].qr;
				$scope.splash.facebook.selected.font  	   = SplashFB.attributes[size].font;
				// generate qr code
				$('input[type="url"]').trigger('blur');
			});

			// $scope.$watch('splash.facebook.selected.qr.image', function(imgURI){
			// 	$('svg', self.svgEditor).find('#fb-qrcode-canvas').remove();
			// });

			/* ------------- end Facebook ------------- */

			/* scope listener */

			/*
			$scope.convert = function(evt){
				// show loading popup
				$(self.svgEditor).block({
					overlayCSS: {
						backgroundColor: '#fff',
						opacity: 0.8
					},
					message: '<i class="icon-spinner icon-spin icon-4x"></i> <br/> <span>Preparing<span>',
					css: {
						border: 'none',
						background: 'none',
						color: '#3685C6'
					}
				});
				// get SVG element
				var svg  = $('#svg-editor > svg')[0];
				// create canvas banner like
				self.createSVG(svg, function(img, imgDataURI){
					// create download anchor
					var downloadLink       = document.createElement('a');
					downloadLink.title     = 'Download '+ splashType +' splash screen';
					downloadLink.href      = imgDataURI;
					downloadLink.target    = '_blank';
					downloadLink.className = 'btn btn-success';
					downloadLink.innerHTML = '<i class="icon-download-alt"></i> Download';
					downloadLink.download  = 'splash-'+ splashType +'.jpg';
					// set image class
					img.className  = 'span12';
					// define generate element
					var $generate = $('#popup-result-generate-image-modal');
					var $generateBody = $generate.find('.modal-body');
					// create template banner list
					var tplImages = '<li class="span12 banner-like">' +
										'<div class="thumbnail">' + img.outerHTML +
											'<div class="caption">' +
												'<h3>Splash Screen</h3>' +
												'<p>This is preview splash scrren for '+ splashType +'</p>'+
												'<p>'+ downloadLink.outerHTML +'</p>' +
											'</div>' +
										'</div>' +
									'</li>';
					// append banner images
					$$('#preview > ul', $generateBody)
							.html('')
							.append(tplImages);
					// open popup
					$timeout(function() {
						$.unblockUI({
							onUnblock: function() {
								$generate.modal('show');
								$('.download-zip', $generate).hide();
							}
						});
					}, 1000);
				});
			};
			*/

			$scope.generateSplashDefault = function(evt){
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
				var cl_p = $scope.splash.editor.logo.p;
				var ch_p = $scope.splash.editor.ch.p;

				console.info('calculating...');
				$('span', self.svgEditor).text('Calculating the splash screens...');

				var requests = [];
				angular.forEach($scope.splash.dimensions, function(e,i){
					console.log(i,e);
					// get logos
					var cl = $scope.splash.logo[i];
					var ch = $scope.splash.ch[i];
					var maxH = e.height - ch.height;
					// calculate y position
					cl.y = (cl_p !== null) ? Math.round(cl_p/100 * e.height) : cl.y ;
					var calc = Math.round(ch_p/100 * e.height);
					ch.y = calc > maxH ? maxH : calc;
					// add queue requests
					requests.push({
						ID  : i,
						svg : e,
						logo: {
							cl : cl,
							ch : ch
						}
					});
					if(requests.length == 3){
						$timeout(function(){

							console.info('start building...');
							$('span', self.svgEditor).text('Starting build the splash screens...');

							self.deferredBuildMultiSVG(requests).done(function(response){

								console.log('finished building');
								$('span', self.svgEditor).text('Finished generate the splash screens');

								$timeout(function(){
									$('span', self.svgEditor).text('Adding the splash screens into ZIP');
								}, 500);

								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.zip.generate({type:"blob"}));
								// set anchor link
								var aZip = document.getElementById('downloadZip');
								aZip.download = "splash-"+ ID +".zip";
								aZip.href     = link;

								// Done
								$timeout(function(){
									$(self.svgEditor).unblock();
									$('#generateImage').text('Generate Image');
									// applying isGenerateDisabled to false
									$scope.$apply(function(scope){
										scope.generateDisabled = true;
										scope.isDownloadDisabled = false;
									});
								}, 2000);
							});
						}, 3000);
					}
				});
			};

			$scope.generateSplashFacebook = function(evt){
				// change button text loading
				var el = evt.currentTarget;
				el.innerHTML = '<i class="icon-refresh icon-spin"></i> Generating image';
				// disable generate button
				$scope.safeApply(function(){ $scope.splash.facebook.disable.generate = true; });
				// show loading message
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

				// convert canvas QR code to image element
				// var $imageQR = $('svg', self.svgEditor).find('#fb-qrcode-image > image');
				// var canvasQR   = $('#canvas-qrcode > canvas')[0];
				// var imgDataURI = canvasQR.toDataURL('image/jpeg');
				// // apply image QR code
				// $scope.safeApply(function(){ $scope.splash.facebook.selected.qr.image = imgDataURI;})

				// generate image
				self.generateImage($('svg', self.svgEditor)[0], 'facebook').done(function(imgDataURI){
					var name = 'facebook-'+ $scope.splash.facebook.size +'_'+ convertToSlug($scope.splash.facebook.url);
					// loading info
					$('span', self.svgEditor).text('Finished generate the facebook splash screen');

					// create object url 
					var DOMURL = window.URL || window.mozURL;
					var link   = DOMURL.createObjectURL(dataURItoBlob(imgDataURI));
					// set anchor link
					var anchor = document.getElementById('downloadFB');
					anchor.download = "splash-"+ name +".jpeg";
					anchor.href     = link;

					// done
					$timeout(function(){ 
						// hide loading meesage
						$(self.svgEditor).unblock();
						//ready to download
						$scope.safeApply(function(){ 
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
			    for(var i = 0; i < binary.length; i++) {
			        array.push(binary.charCodeAt(i));
			    }
			    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
			}

			var ucwords = function(str) {
			    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
			        return $1.toUpperCase();
			    });
			}

			var convertToSlug = function(Text) {
			    return Text
			        .toLowerCase()
			        .replace(/[^\w ]+/g,'')
			        .replace(/ +/g,'-')
			        ;
			}

			this.deferredBuildMultiSVG = function( requests ){
				var deferred = $.Deferred();
				// get count requests
				var countRequest = requests.length - 1;
				var promise = requests.reduce(function(promise, request, index){
					var type = request.ID;
					console.info(type + ' index : ' + index);
					return promise.pipe(function(){

						console.info('creating SVG ' + type);
						$('span', self.svgEditor).text('Creating SVG ' + type);

						var svg = self.createSVG(request);
						return self.generateImage(svg, type).done(function(imgDataURI){
							// add to zip
							self.zip.file('splash_'+type+'.jpg', imgDataURI, {base64: true});
							// send completed
							if(index == countRequest) return 'Completed';
						});
					});
				}, deferred.promise());
				deferred.resolve();
				return promise;
			};

			this.createSVG = function( data ){
				var $svg = $('#svg-editor > svg').clone();
				// set svg dimension
				$svg.attr({
					width : data.svg.width,
					height: data.svg.height
				});
				// get type (iphone or ipad)
				var type = data.ID.replace(/\d/, '');
				// get data logo
				var logo = data.logo;
				// mapping svg logo
				$('#logo', $svg).children().map(function(i,e){
					if(/splash/.test(e.id)) {
						var regexClientType = new RegExp(type);
						if(!regexClientType.test(e.id)) $(e).remove();
						$(e).attr({
							x      : logo.cl.x,
							y      : logo.cl.y,
							width  : logo.cl.width,
							height : logo.cl.height
						}).show();
					} else if(/footer/.test(e.id)) {
						var regexCHType = new RegExp(type);
						if(!regexCHType.test(e.id)) $(e).remove();
						$(e).attr({
							x      : logo.ch.x,
							y      : logo.ch.y,
							width  : logo.ch.width,
							height : logo.ch.height
						});
						if( $scope.splash.white ){
							$('#logo-footer-ipad-white', $svg).show();
						} else {
							$('#logo-footer-ipad-color', $svg).show();
						}
					}
				});

				return $svg[0];
			};

			this.generateImage = function( svg, type ){
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
				img.onload = function(){
					// set canvas dimension
					canvas.width  = img.width;
					canvas.height = img.height;
					// draw image
					ctx.drawImage(img, 0, 0);
					// convert to image png
					var imgDataURI = canvas.toDataURL('image/jpeg');
					// send response
					$timeout(function() {
						var img = (type == 'facebook') ? imgDataURI : imgDataURI.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
						deferred.resolve(img);
					}, 2000);
				};
				img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

				return deferred.promise();
			};
		}
	]);
});