define([
	'controllers/controllers',
	'services/splashService',
	'jquery',
	'jqueryui'
], function(controllers){
	controllers.controller('MobileController', ['$scope', '$timeout', '$compile', 'SplashConfig', 'imageReader',
		function($scope, $timeout, $compile, SplashConfig, imageReader){
			/*
			 * original iphone4  
			 *  dimension : 640 X 920
			 *  client logo : 447 X 220
			 *  CH logo : 608 X 306
			 *
			 * original iphone5  
			 *  dimension : 640 X 1096
			 *  client logo : 447 X 220
			 *  CH logo : 608 X 306
			 *
			 * original ipad  
			 *  dimension : 1536 X 2048
			 *  client logo : 1102 X 512
			 *  CH logo : 608 X 306
			*/
			$scope.isDownloadDisabled = true;
			$scope.splash = SplashConfig;

			// default
			var splashType  = 'iphone4';
			// define dimensions
			var svgDimension  = $scope.splash.dimensions[splashType];
			var logoDimension = $scope.splash.logo[splashType];
			var chDimension   = $scope.splash.ch[splashType];
			// calculate height logo
			var h    = svgDimension.height;
			var maxH = h - chDimension.height;

			console.log('svgDimension', svgDimension);
			console.log('logoDimension', logoDimension);
			console.log('chDimension', chDimension);

			/* scope inject & watcher */

			$scope.splash.editor.ch.y = chDimension.y;
			$scope.splash.editor.ch.p = Math.round(chDimension.y/h*100);

			console.log('editor', $scope.splash.editor);

			$scope.$watch('splash.editor.ch.p', function(input){
				var value = Math.round(input * h / 100);
				$scope.splash.editor.ch.y = (value > maxH) ? maxH : value;
				$("#slider-vertical-footer").slider( "option", "value", h - value );
			});

			// define svg
			$svg = $('#svg-editor > svg');

			/*var $editorTpl = $('#editor .template');

			$('.collapse').live('show', function() {
				var $link = $(this).parent().find('a');
				$(this).parent().find('a').addClass('open'); //add active state to button on open
				// show tpl content editor 
				var imgTplClass = '.img-' + this.id;
				$(imgTplClass, $editorTpl).show();
				// get title
				var title = $link.data('title');
				// chnage breadcumb active title
				$('nav > ul > li.active').text(title);
			});

			$('.collapse').live('hide', function() {
				$(this).parent().find('a').removeClass('open'); //remove active state to button on close
				// hide preview tpl
				var imgTplClass = '.img-' + this.id;
				$(imgTplClass, $editorTpl).hide();
			});*/

			/* init jPicker (background) */

			// callback
			var callbackJPicker = function(color, context) {
				var all = color.val('all');
				if( all.hex == 'ffffff' ){
					$('#logo-footer-iphone-color', $svg).hide();
					$('#logo-footer-iphone-white', $svg).show();
					$scope.splash.white = true;
				} else {
					$('#logo-footer-iphone-color', $svg).show();
					$('#logo-footer-iphone-white', $svg).hide();
					$scope.splash.white = false;
				}
				$('rect', $svg)[0].setAttribute('fill', '#' + all.hex);
			};
			// input color picker
			$('#input-bg-color').jPicker({
				window : {
					effects :  { type: 'fade' },
					position : {
						x : ($(window).width() - $('.jPicker').width()) / 2,
						y : 177
					}
				},
				images : {
					clientPath : 'assets/css/jpicker/images/'
				}
			}, callbackJPicker, callbackJPicker);

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

			/* init spinner (input number) */

			$timeout(function(){
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
			}, 1000);

			/* init image reader (background) */

			imageReader.init({
				buttonClass   : 'btn-success',
				inputFileEl   : '#input-bg',
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


			/* init image reader (logo) */

			imageReader.init({
				buttonClass   : 'btn-success',
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

			var self = this;

			self.zip = new JSZip();

			/* convert SVG to image data URI */

			$scope.convert = function(evt){
				// show loading popup
				$.blockUI({
					message: $('#popup-loading-img'),
					overlayCSS:{
						opacity : '0.8'
					},
					css: {
						background : 'transparent',
						border     : 'none',
						top        : ($(window).height() - 350) / 2 + 'px',
						left       : ($(window).width() - 375) / 2 + 'px',
						width      : '350px'
					}
				});
				// get SVG element
				var svg  = $('#svg-editor > svg')[0];
				// create canvas banner like
				createCanvas(svg, function(img, imgDataURI){
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
					setTimeout(function() {
						$.unblockUI({
							onUnblock: function() {
								$generate.modal('show');
								$('.download-zip', $generate).hide();
							}
						});
					}, 1000);
				});
			};

			$scope.build = function(evt){
				console.log('build', evt);
				// get y-axis
				var cl_p = $scope.splash.editor.logo.p;
				var ch_p = $scope.splash.editor.ch.p;

				console.info('calculating...');

				var requests = [];
				angular.forEach($scope.splash.dimensions, function(e,i){
					console.log(i,e);
					// get logos
					var cl = $scope.splash.logo[i];
					var ch = $scope.splash.ch[i];
					var maxH = e.height - ch.height;
					// calculate y attributes
					cl.y = (cl_p !== null) ? Math.round(cl_p/100 * e.height) : cl.y ;
					var calc = Math.round(ch_p/100 * e.height);
					ch.y = calc > maxH ? maxH : calc;
					// stote into requests
					requests.push({
						ID  : i,
						svg : e,
						logo: {
							cl : cl,
							ch : ch
						}
					});
					if(requests.length == 3){
						setTimeout(function(){
							console.info('start building...');
							self.chainBuilding(requests).done(function(response){
								console.log('finish building');
								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.zip.generate({type:"blob"}));
								// set anchor link
								var aZip = document.getElementById('downloadZip');
								aZip.download = "splash.zip";
								aZip.href     = link;
								// applying isGenerateDisabled to false
								$scope.$apply(function(scope){
									scope.isDownloadDisabled = false;
								});
							});
						}, 2000);
					}
					// var attributes = {
					// 	ID  : i,
					// 	svg : e,
					// 	logo: {
					// 		cl : cl,
					// 		ch : ch
					// 	}
					// };
					// self.generateCanvas( attributes );
				});
			};

			this.chainBuilding = function( requests ){
				var deferred = $.Deferred();
				// get count requests
				var countRequest = requests.length - 1;
				var promise = requests.reduce(function(promise, request, index){
					var type = request.ID;
					console.info(type + ' index : ' + index);
					return promise.pipe(function(){
						console.info('creating SVG ' + type);
						var svg = self.createSVG(request);
						return self.generateImage(svg).done(function(imgDataURI){
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

			// SVG generate image
			this.generateImage = function( svg ){
				var deferred = $.Deferred();

				console.log('generating image..');

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
					setTimeout(function() {
						var img = imgDataURI.replace(/^data:image\/(png|jpg);base64,/, "");
						deferred.resolve(img);
					}, 2000);
				};
				img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

				return deferred.promise();
			};

			/*
			this.generateCanvas = function( data ){
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

				var svgEl = $svg[0];
				var canvasID = 'canvas-' + data.ID;
				self.createCanvas(svgEl, canvasID, function(canvasID, img, imgDataURI){
					console.info('Canvas ' + canvasID + ' generated');
					console.log(canvasID, 'URI', imgDataURI);
				});
			};

			// create canvas to generate image
			this.createCanvas = function(svg, canvasID, callback){
				// parse SVG XML
				var svg_xml = (new XMLSerializer()).serializeToString(svg);
				// create canvas
				// var canvas  = document.createElement('canvas');
				var canvas  = document.getElementById(canvasID);
				// get canvas context
				var ctx = canvas.getContext("2d");
				// create an image
				var img = new Image();
				// set image (SVG data URI)
				img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent( svg_xml )));
				// draw the canvas, when image is loaded 
				img.onload = function(){
					// set canvas dimension by image
					canvas.width  = img.width;
					canvas.height = img.height;
					// draw
					ctx.drawImage(img, 0, 0);
					// convert image to data URI
					var imgDataURI = canvas.toDataURL('image/jpg');
					// call callback
					callback(canvasID, img, imgDataURI);
					// callback(canvasID, img);
				};
			};
			*/	
		}
	]);
});