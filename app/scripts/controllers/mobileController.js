define(['controllers/controllers'], function(controllers){
	controllers.controller('MobileController', ['$scope', '$timeout', '$compile', 'imageReader',
		function($scope, $timeout, $compile, imageReader){

			var $editorTpl = $('#editor .template');

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
			});

			$timeout(function(){
				$(".slider-vertical").slider({
					orientation: "vertical",
					min: 0,
					max: 100,
					value: 60,
					slide: function(event, ui) {
						$("#amount").val(ui.value);
					}
				});
				$("#amount").val($(".slider-vertical").slider("value"));
			}, 1000);

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
			$scope.splash = {
				white : true,
				editor: {
					logo : {
						w:null,
						h:null,
						p:null, // percent
						x:null,
						y:null
					},
					ch : {
						p:null, // percent
						x:null,
						y:null
					}
				},
				dimensions: {
					iphone4: {
						width  : 640,
						height : 920
					},
					iphone5: {
						width  : 640,
						height : 1096
					},
					ipad: {
						width  : 1536,
						height : 2048
					}
					/*
					ipad: {
						width  : 768,
						height : 1024,
						ratio  : 2
					}
					*/
				},
				logo: {
					iphone4: {
						width  : 447,
						height : 220,
						x:97,
						y:120
					},
					iphone5: {
						width  : 447,
						height : 220,
						x:97,
						y:164
					},
					ipad: {
						width  : 1009,
						height : 354,
						x:264,
						y:335
					}
					/*
					ipad: {
						width  : 551,
						height : 256,
						x:108.5,
						y:128,
						ratio  : 2
					}
					*/
				},
				ch: {
					iphone4: {
						width  : 307,
						height : 153,
						x : 167,
						y : 608
					},
					iphone5: {
						width  : 307,
						height : 153,
						x : 167,
						y : 745
					},
					ipad: {
						width  : 608,
						height : 306,
						x : 464,
						y : 1383
					}
					/*
					ipad: {
						x : 116,
						y : 345.75,
						ratio  : 4
					}
					*/
				}
			};

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