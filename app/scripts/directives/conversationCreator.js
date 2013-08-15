define([
	'directives/directives',
	'services/conversationService',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('conversationCreator', ['$compile', '$timeout', 'ConversationTpl', 'ConversationConfig', 'ConversationService', 'imageReader',
		function($compile, $timeout, ConversationTpl, ConversationConfig, ConversationService, imageReader){
			// Runs during compile
			return {
				scope : {
					conversation : '=ngModel'
				},
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/conversation-creator.html',
				// replace: true,
				controller: function($scope, $element, $attrs, $transclude) {

					var self = this;

					var index    = 1,
						sizes    = 0,
						requests = [];

					// define elements
					self.btnLogo    = $('#btn-input-logo');
					self.btnSpot1   = $('#btn-input-spot1');
					self.btnSpot2   = $('#btn-input-spot2');
					self.btnBg      = $('#btn-upload-backgrounds');
					self.sectionBg  = $('#drop-backgrounds');
					// define templates
					// self.templates  = ConversationTpl.templates;
					self.templates  = ConversationTpl.templates2;
					// define dimensions
					self.dimensions = ConversationTpl.dimensions;
					// define jsZip
					self.zip = new JSZip();

					// model
					$scope.conversation.ID = new Date().getTime();
					$scope.isDownloadDisabled = true;
					$scope.template = self.templates[$scope.conversation.selected];

					/* scope watchers */

					// logo
					$scope.$watch('conversation.logo.hide', function(checked){
						console.log(checked);
						self.hideElement(checked, 'logo');
					});
					$scope.$watch('conversation.logo.placeholder', function(checked){
						console.log(checked);
						self.addPlaceholder(checked, 'logo');
					});
					// spot1
					$scope.$watch('conversation.spot1.hide', function(checked){
						console.log(checked);
						self.hideElement(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.placeholder', function(checked){
						console.log(checked);
						self.addPlaceholder(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.clip', function(clip){
						console.log('clip', clip);
						self.setClip(clip, 'spot1');
					});
					// spot2
					$scope.$watch('conversation.spot2.hide', function(checked){
						console.log(checked);
						self.hideElement(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.placeholder', function(checked){
						console.log(checked);
						self.addPlaceholder(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.clip', function(clip){
						console.log('clip', clip);
						self.setClip(clip, 'spot2');
					});

					/* scope listener */

					self.hideElement = function(checked, element){
						// var $logo = $('svg#' + element);
						var $logo = $('svg.g_' + element);
						if(checked) $logo.hide();
						else $logo.show();
					};
					self.addPlaceholder = function(checked, element){
						// var $svgEl = $('svg#' + element);
						var $svgEl = $('svg.g_' + element);
						if(checked) $('.placeholder', $svgEl).show();
						else $('.placeholder', $svgEl).hide();
					};
					self.setClip = function(type, element){
						// var $svgEl = $('svg#' + element);
						var $svgEl = $('svg.g_' + element);
						if(type == 'circle'){
							$svgEl
								.find('.placeholder')
									.attr('clip-path', 'url(#'+ element +'-clip-placeholder)')
								.next()
									.attr('clip-path', 'url(#'+ element +'-clip-image)');
						} else{
							$svgEl
								.find('.placeholder')
									.attr('clip-path', 'none')
								.next()
									.attr('clip-path', 'none');
						}
					};

					// simetris

					var currentYPos = {el:null, y:null};
					var currentXPos = {el:null, x:null};

					self.getX = function(el, x){
						var s1 = $scope.conversation[el];
						var w1 = s1.placeholder ? 80 : 70;
						return 403 - w1 - (x ? x : s1.position.x);
					};

					$scope.setAlignX = function(){
						var alignX = $scope.conversation.align.x;
						var x, cx;
						switch(alignX){
							case 'x1':
								x  = self.getX('spot1');
								cx = 'spot2';
								break;
							case 'x2':
								x  = self.getX('spot2');
								cx = 'spot1';
								break;
							default:
								x  = currentXPos.x;
								cx = currentXPos.el;
								break;
						}

						if(cx) {
							currentXPos.el = cx;
							currentXPos.x  = $scope.conversation[cx].position.x;
							$scope.conversation[cx].position.x = x;
						}
					};
					$scope.setAlignY = function(){
						var alignY = $scope.conversation.align.y;
						var y, cy;
						switch(alignY){
							case 'y1':
								y = $scope.conversation['spot1'].position.y;
								cy = 'spot2';
								break;
							case 'y2':
								y = $scope.conversation['spot2'].position.y;
								cy = 'spot1';
								break;
							default:
								y  = currentYPos.y;
								cy = currentYPos.el;
								break;
						}

						if(cy) {
							currentYPos.el = cy;
							currentYPos.y  = $scope.conversation[cy].position.y;
							$scope.conversation[cy].position.y = y;
						}
					};

					// generate
					// $('#editor a.nav-sidebar').addClass('btn-primary').click();

					$scope.generate = function(isContent){
						if( isContent ){
							// open sidebar
							$('#editor a.nav-sidebar').addClass('btn-primary').click();
							$('.tabbable a[href="#2"]').click();
						}
						$timeout(function(){
							self.doGenerate();
						}, 600);
					};

					self.doGenerate = function(){
						console.log('generate');
						// set wait
						$('ul.img-list > li').addClass('wait');
						$('ul.svg-list > li').addClass('wait');
						// set ID (unique name), timestamp
						// ID = new Date().getTime();

						console.info('start deferred multiple files...');

						$timeout(function() {
							self.deferredMultipleUpload(requests, sizes).done(function(response){
								console.log(response);
								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.zip.generate({type:"blob"}));
								// set anchor link
								var aZip = document.getElementById('downloadZip');
								aZip.download = 'conversation-'+ $scope.conversation.ID +'.zip';
								aZip.href     = link;
								// applying isGenerateDisabled to false
								$scope.$apply(function(scope){
									scope.isDownloadDisabled = false;
								});
								// update completed progress
								$('.progress').removeClass('progress-striped active').addClass('progress-success');
								$('.progress > .bar > span').html('<i class="icon-ok"></i> Completed');
							});
						}, 1000);
					};

					// $scope.createSSTemplate = function(){
					// 	var $svg = $('svg#svg-conversation');
					// 	self.generateImage($svg[0], true).done(function(imgDataURI){
					// 		// $('#panel-right .tpl-screenshot').html('<img src="'+ imgDataURI +'" />');
					// 		var blob = self.dataURItoBlob(imgDataURI);
					// 		console.log(blob);
					// 		self.uploadFile({
					// 			file  : blob,
					// 			name  : $scope.conversation.ID + '-conversation-tpl',
					// 			width : 'original',
					// 			height: 'original',
					// 			crop  : false
					// 		}).then(function(response){
					// 			console.log(response);
					// 			$scope.conversation.preview = response.url;
					// 			$('#panel-right .tpl-screenshot').html('<img src="'+ response.url +'" />');
					// 		});
					// 	});
					// };
					// $scope.save = function(){

					// 	var conversation = new ConversationService($scope.conversation);
					// 	console.log('conversation', $scope.conversation);

					// 	conversation.$save(function(response){
					// 		console.log('response', response);
					// 	});
					// };

					// handle single file (template image)
					self.handleSingleFile = function(file, name, callback){
						// validation file image selected
						self.imageValidation(file, true);
						// show loading
						$('#editor .template').block({
							overlayCSS: {
								backgroundColor: '#fff',
								opacity: 0.8
							},
							message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Uploading',
							css: {
								border: 'none',
								background: 'none',
								color: '#3685C6'
							}
						});
						// file reader
						var fileReader = new FileReader();
						fileReader.onload = (function(blob){
							return function(e){
								var type = name.replace(/\d/, '');
								var dimension = self.dimensions[type];
								self.uploadFile({
									file  : blob,
									name  : $scope.conversation.ID + '-' + name,
									width : dimension.w,
									height: dimension.h,
									crop  : false
								}).then(function(response){
									console.log(response);
									$('#editor .template').unblock();
									if(callback) callback(response);
								});
							};
						})(file);
						// read as data uri
						fileReader.readAsDataURL(file);
					};
					// handle multiple files (background images) /w Deferred
					self.handleDeferredMultipleFiles = function(files){
						var currentFile = self.taskList(files, 0);
						for (var i = 1; i < files.length; i++) {
							currentFile = currentFile.pipe(function(j) {
								return self.taskList(files, j);
							});
						}
						$.when(currentFile).done(function(res) {
							console.log("Finished add to list", res);
							$scope.$apply(function(scope){
								scope.conversation.images.empty = false;
								scope.conversation.images.count = res.length;
							});
							$timeout(function(){
								// $('.drop', self.sectionBg).removeClass('loading');
								$('.drop', self.sectionBg).unblock();
								// open sidebar
								$('#editor a.nav-sidebar').addClass('btn-primary').click();
								$('.tabbable a[href="#2"]').click();
							}, 1000);
						});
					};
					self.getImageDirection = function(imgUri){
						var image = new Image(); 
						image.src = imgUri;
						var ratio = parseInt(image.width)/parseInt(image.height);
						console.log('ratio', ratio);
						var direction;
						if ( ratio == 1 ) { 
							direction = 'fit';
						} else if( ratio > 1 ) {
							direction = 'landscape';
						} else {
							direction = 'portrait';
						}
						return direction;
					}
					self.taskList = function(files, _index){
						var defer = $.Deferred();
						// get file
						var file = files[_index];
						// validation file image selected
						self.imageValidation(file);
						// file reader
						var fileReader = new FileReader();
						fileReader.onload = (function(blob){
							return function(e){
								console.log(index, blob);

								var image = new Image();
								image.src = e.target.result;
								image.onload = function(){
									var img = this.src;
									var ratio = parseInt(this.width)/parseInt(this.height);
									console.log('ratio', ratio);
									var direction;
									if ( ratio == 1 ) { 
										direction = 'fit';
									} else if( ratio > 1 ) {
										direction = 'landscape';
									} else {
										direction = 'portrait';
									}
									// add queues
									sizes += blob.size;
									requests.push({
										image: img,
										blob: blob,
										size: sizes,
										index: index,
										direction:direction
									});
									// params
									var data = {
										id: index, 
										imguri: img,
										direction: direction
									};
									// add to list
									self.addImgList(data);
									self.addSVGList(data);

									index++;
									// resolve
									var next = _index + 1;
									var res  = files.length == next ? requests : next ;
									defer.resolve(res);
								};
							};
						})(file);
						// read as data uri
						fileReader.readAsDataURL(file);
						// return promise
						return defer.promise();
					};
					// image validation
					self.imageValidation = function(file, showAlert){
						// validation file image selected
						if (!(file.type && file.type.match('image.*'))) {
							if( showAlert ){
								// file type is not allowed 
								alert('File '+ file.name +' is not image. Only JPG, PNG or GIF files are allowed');
								throw new Error('Only JPG, PNG or GIF files are allowed');
							}
							return;
						}
						// max 10 mB
						else if (!(file.size && file.size < 10485760)) {
							if( showAlert ){
								// file size > 10MB
								alert('File '+ file.name +' is too big!!');
								throw new Error('File is too big!!');
							}
							return;
						}
					};
					// add to list
					self.addImgList = function(data){
						var $li  = '<li id="li-img-'+ data.id +'" class="span3 text-center">'+
										'<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>'+
										'<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>'+
										'<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>'+
										'<div class="success"><i class="icon-ok icon-4x"></i></div>'+
										'<img src="'+ data.imguri +'" />'+
									'</li>';
						$('#panel-right ul.img-list').append($li);
					};
					self.addSVGList = function(data){
						var $svg = self.getSVGCompiled(data);

						var $thumb = $('<div class="thumbnail border-none text-center"></div>').append($svg);

						var className = 'span6 text-center';
						switch(data.direction){
							case 'landscape':
								className = 'span12 prefix text-center';
								break;
							case 'portrait':
								className = 'span5 text-center';
								break;
						}

						var $li = $('<li id="li-svg-'+data.id+'" class="'+ className +'">');
						$li.append('<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>')
							.append('<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>')
							.append('<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>')
							.append('<div class="success"><i class="icon-ok icon-4x"></i></div>')
							.append($thumb);

						$('#panel-right ul.svg-list').append($li);
					};
					$scope.syncPosition = function(el, direction){
						var val;
						var tplDirection = ConversationTpl.directions[direction];
						if(direction == 'landscape'){
							var x = tplDirection.w;
							var p = parseInt($scope.conversation[el].position.x / 403 * 100);
							val = p / 100 * x;
						} else if(direction == 'portrait') {
							var y = tplDirection.h;
							var p = parseInt($scope.conversation[el].position.y / 403 * 100);
							val = p / 100 * y;
						}
						return val;
					}
					// compile SVG 
					self.getSVGCompiled = function(data){
						var $svg = $('svg#svg-conversation').clone();
						$svg.removeAttr('id');

						var bg    = $('#bg', $svg);
						var logo  = $('#logo', $svg);
						var spot1 = $('#spot1', $svg);
						var spot2 = $('#spot2', $svg);

						// get direction (fit/landscape/portrait)
						var direction = ConversationTpl.directions[data.direction];
						console.log('direction', direction)
						// set SVG dimesion by direction 
						$svg.attr({
							width: direction.w,
							height: direction.h
						});

						// poistions
						var tplDirection = ConversationTpl.directions[data.direction];
						console.log('tplDirection', tplDirection)
						// default (fit)
						var positions = {};
						switch(data.direction){
							case 'landscape':
								// var x = tplDirection.w;
								// var lp = parseInt($scope.conversation.logo.position.x / 403 * 100);
								// positions.logo.x = lp / 100 * x;
								// var s1p = parseInt($scope.conversation.spot1.position.x / 403 * 100);
								// positions.spot1.x = s1p / 100 * x;
								// var s2p = parseInt($scope.conversation.spot2.position.x / 403 * 100);
								// positions.spot2.x = s2p / 100 * x;
								positions = {
									logo: {
										x: "{{syncPosition('logo', 'landscape')}}",
										y: '{{conversation.logo.position.y}}'
									},
									spot1: {
										x: "{{syncPosition('spot1', 'landscape')}}",
										y: '{{conversation.spot1.position.y}}'
									},
									spot2: {
										x: "{{syncPosition('spot2', 'landscape')}}",
										y: '{{conversation.spot2.position.y}}'
									}
								};
								break;
							case 'portrait':
								// var y = tplDirection.h;
								// var lp = parseInt($scope.conversation.logo.position.y / 403 * 100);
								// positions.logo.y = lp / 100 * y;
								// var s1p = parseInt($scope.conversation.spot1.position.y / 403 * 100);
								// positions.spot1.y = s1p / 100 * y;
								// var s2p = parseInt($scope.conversation.spot2.position.y / 403 * 100);
								// positions.spot2.y = s2p / 100 * y;
								positions = {
									logo: {
										x: '{{conversation.logo.position.x}}',
										y: "{{syncPosition('logo', 'portrait')}}"
									},
									spot1: {
										x: '{{conversation.spot1.position.x}}',
										y: "{{syncPosition('spot1', 'portrait')}}"
									},
									spot2: {
										x: '{{conversation.spot2.position.x}}',
										y: "{{syncPosition('spot2', 'portrait')}}"
									}
								};
								break;
							default:
								positions = {
									logo: {
										x: '{{conversation.logo.position.x}}',
										y: '{{conversation.logo.position.y}}'
									},
									spot1: {
										x: '{{conversation.spot1.position.x}}',
										y: '{{conversation.spot1.position.y}}'
									},
									spot2: {
										x: '{{conversation.spot2.position.x}}',
										y: '{{conversation.spot2.position.y}}'
									}
								};
								break;
						}

						console.log('positions', positions);

						// background
						$('image.image', bg).attr('xlink:href', data.imguri).css('display', 'block');
						// $('image.tpl', bg).attr('xlink:href', '{{template}}');
						// $('image.tpl', bg).attr('xlink:href', tpl);
						$('image.tpl', bg).attr('xlink:href', '{{template.'+ data.direction +'}}');
						// logo
						logo.removeAttr('cursor')
							.attr({
								id: 'logo-'+ data.id,
								x: positions.logo.x,
								y: positions.logo.y
							})
							.find('image').attr('xlink:href', '{{conversation.logo.image}}');
						// spot 1 / element 1
						spot1.removeAttr('cursor')
							.attr({
								id:'spot1-'+ data.id,
								x: positions.spot1.x,
								y: positions.spot1.y
							})
							.find('image').attr('xlink:href', '{{conversation.spot1.image}}');
						// spot 2 / element 2
						spot2.removeAttr('cursor')
							.attr({
								id:'spot2-'+ data.id,
								x: positions.spot2.x,
								y: positions.spot2.y
							})
							.find('image').attr('xlink:href', '{{conversation.spot2.image}}');

						return $compile($svg)($scope);
					};

					// monitoring multiple uploads
					self.deferredMultipleUpload = function(requests, sizes){
						var deferred = $.Deferred();
						// get count requests
						var countRequest = requests.length;
						// looping upload
						var promises = requests.reduce(function(promise, request, _index){
							// get index
							var index = request.index;
							return promise.pipe(function(){
								// get elements
								var $liImg = $('#li-img-' + index);
								var $liSVG = $('#li-svg-' + index);
								var $svg   = $('.thumbnail > svg', $liSVG);

								console.log(index, $svg[0]);

								// change upload view
								$liImg.switchClass('wait', 'upload', 0);
								$liSVG.switchClass('wait', 'upload', 0);

								var direction = ConversationTpl.directions[request.direction];

								// upload to resize
								return self.uploadFile({
									file  : request.blob,
									name  : $scope.conversation.ID + '-conversation-bg-' + index,
									width : direction.w,
									height: direction.h,
									crop  : false
								}).pipe(function(response){
									console.log('response', index, response);
									console.log($('#bg > image.image', $svg)[0]);
									// change bg image
									$('img', $liImg).attr('src', response.dataURI);
									$('#bg > image.image', $svg).attr('xlink:href',response.dataURI);
									// change generate view
									$liImg.switchClass('upload', 'generate', 0);
									$liSVG.switchClass('upload', 'generate', 0);
									// generate image
									return self.generateImage($svg[0]).done(function(imgDataURI){
										// add to zip
										self.zip.file('image_'+index+'.jpg', imgDataURI, {base64: true});
										// applying finished images
										$scope.$apply(function(scope){
											scope.conversation.images.finished = index;
										});
										// change success view
										$liImg.switchClass('generate', 'success', 0);
										$liSVG.switchClass('generate', 'success', 0);
										// create percentage
										var percent = Math.round((request.size / sizes) * 100);
										// update progress bar
										$('.progress > .bar').css('width', percent + '%');
										// send completed
										if(index >= countRequest) return 'Completed';
									});
								});
							});
						}, deferred.promise());

						// starting deferreda
						deferred.resolve();

						// return final promise
						return promises;
					};
					// upload to resize image
					// using jQuery Ajax for pipeline in deferred
					self.uploadFile = function(data){
						console.log(data);
						// create form data
						var formData = new FormData();
						formData.append('file', data.file);
						formData.append('name', data.name);
						formData.append('width', data.width);
						formData.append('height', data.height);
						formData.append('crop', data.crop);
						// ajax upload
						return $.ajax({
							// processData and contentType must be false to prevent jQuery
							processData	: false,
							contentType	: false,
							type		: 'POST',
							url			: 'api/upload',
							data		: formData,
							dataType	: 'json'
						});
					};

					// SVG generate image
					self.generateImage = function(svg, isImage){
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
							var imgDataURI = canvas.toDataURL('image/jpg');
							// send response
							setTimeout(function() {
								if( isImage || isImage !== undefined )
									deferred.resolve(imgDataURI);
								else {
									var imgURI = imgDataURI.replace(/^data:image\/(png|jpg);base64,/, "");
									deferred.resolve(imgURI);
								}
							}, 2000);
						};
						img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

						return deferred.promise();
					};

					/**
					 * convert data URI to Blob
					 */
					self.dataURItoBlob = function(dataURI) {
						var byteString;
						if (dataURI.split(',')[0].indexOf('base64') >= 0)
							byteString = atob(dataURI.split(',')[1]);
						else
							byteString = unescape(dataURI.split(',')[1]);
						var array = [];
						for (var i = 0; i < byteString.length; i++) {
							array.push(byteString.charCodeAt(i));
						}

						var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
						return new Blob([new Uint8Array(array)], {
							type: mimeString
						});
					};
				},
				link: function($scope, iElm, iAttrs, controller) {

					/* handling collapse */

					var $editorTpl = $('#editor .template');
					$('.collapse').live('show', function() {
						// set collapse class open 
						var $link = $(this).parent().find('a');
						$(this).parent().find('a').addClass('open'); //add active state to button on open
						// get tpl  
						var index    = this.id.match(/\d/)[0] - 1;
						var template = controller.templates[index];
						// applying template
						$scope.$apply(function(scope){
							scope.template = template;
						});
						// change breadcumb active title
						var title = $link.data('title');
						$('nav > ul > li.active').text(title);
					});

					$('.collapse').live('hide', function() {
						$(this).parent().find('a').removeClass('open'); //remove active state to button on close
					});

					/* handling right sidebar */

					$('a.nav-sidebar').click(function() {
						var className = $(this).data('sidebar');
						$('input[name="' + className + '"]').click();
						var parent = $(this).parent();
						$timeout(function(){
							if(parent.hasClass('open'))
								parent.removeClass('open');
							else
								parent.addClass('open');
						}, 400);
					});

					/* Initialize event listener */

					// event listener button logo input file
					controller.btnLogo.live('click', function() {
						$(this).next()
							.bind('change', function(evt){
								var file = evt.target.files[0];
								controller.handleSingleFile(file, 'logo', function(response){
									console.log('response logo', response);
									$scope.$apply(function(scope){
										scope.conversation.logo.image = response.dataURI;
									});
								});
							}).click();
					});
					// event listener button spot1 input file
					controller.btnSpot1.live('click', function() {
						$(this).next()
							.bind('change', function(evt){
								var file = evt.target.files[0];
								controller.handleSingleFile(file, 'spot1', function(response){
									console.log('response spot1', response);
									$scope.$apply(function(scope){
										scope.conversation.spot1.image = response.dataURI;
									});
								});
							}).click();
					});
					// event listener button spot2 input file
					controller.btnSpot2.live('click', function() {
						$(this).next()
							.bind('change', function(evt){
								var file = evt.target.files[0];
								controller.handleSingleFile(file, 'spot2', function(response){
									console.log('response spot2', response);
									$scope.$apply(function(scope){
										scope.conversation.spot2.image = response.dataURI;
									});
								});
							}).click();
					});

					var $dropAreaBG = $('.drop', controller.sectionBg);

					// handling button add backgrounds
					controller.btnBg.click(function() {
						$(this).next().bind('change', function(evt){
							var tpl = $scope.template;
							$dropAreaBG.block({
								overlayCSS: {
									backgroundColor: '#fff',
									opacity: 0.8
								},
								message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Reading files',
								css: {
									border: 'none',
									background: 'none',
									color: '#3685C6'
								}
							});
							controller.handleDeferredMultipleFiles(evt.target.files);
						}).click();
					});

					// drag n drop events
					$dropAreaBG
						// event drop 
						.bind('drop', function(evt){
							evt.stopPropagation();
							evt.preventDefault();

							$dropAreaBG.removeClass('over');
							// $dropAreaBG.addClass('loading');

							$dropAreaBG.block({
								overlayCSS: {
									backgroundColor: '#fff',
									opacity: 0.8
								},
								message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Reading files',
								css: {
									border: 'none',
									background: 'none',
									color: '#3685C6'
								}
							});

							// get files
							var original = evt.originalEvent,
								files    = original.dataTransfer.files;

							console.log('drop file', files);

							// get template
							var tpl = $scope.template;

							controller.handleDeferredMultipleFiles(files);
						})
						// event drag over
						.bind('dragover', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();
						})
						// event drag enter
						.bind('dragenter', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();
							$dropAreaBG.addClass('over');
						})
						// event drag leave
						.bind('dragleave', function(evt) {
							evt.stopPropagation();
							evt.preventDefault();

							var target = evt.target;
							if ($(this).find(evt.target).length) {
								$dropAreaBG.removeClass('over');
							}
						});

					/* handling draggable SVG */

					// define bounds svg elements
					var bounds = {
						'logo': {x:228, y:348},
						'spot': {x:323, y:323}
					};

					// drag callback svg elements

					var startDragSVG = function(event, ui) {
						var id   = event.target.id;
						var type = id.replace(/\d/,'');
						var max  = bounds[type];
						var offset = $('#editor .template').offset();
						// set X
						var x    = ui.offset.left - offset.left;
						var xVal = (x >= max.x) ? max.x : x;
						event.target.setAttribute('x', xVal);
						// simetris X
						if(id == 'spot1' && $scope.conversation.align.x == 'x1'){
							var getX = controller.getX(id, xVal);
							document.getElementById('spot2').setAttribute('x', getX);
						} else if (id == 'spot2' && $scope.conversation.align.x == 'x2'){
							var getX = controller.getX(id, xVal);
							document.getElementById('spot1').setAttribute('x', getX);
						}
						// set Y
						var y    = ui.offset.top - offset.top;
						var yVal = (y >= max.y) ? max.y : y;
						event.target.setAttribute('y', yVal);
						// simetris Y
						if(id == 'spot1' && $scope.conversation.align.y == 'y1'){
							document.getElementById('spot2').setAttribute('y', yVal);
						} else if (id == 'spot2' && $scope.conversation.align.y == 'y2'){
							document.getElementById('spot1').setAttribute('y', yVal);
						}
					};
					var stopDragSVG = function(event, ui) {
						var id  = event.target.id;
						var offset = $('#editor .template').offset();
						var y = ui.offset.top - offset.top;
						var x = ui.offset.left - offset.left;
						$scope.conversation[id].position = {x:x, y:y};
						// simetris
						var align = $scope.conversation.align;
						if(id == 'spot1' && (align.x !== 'none' || align.y !== 'none')){
							var sId = document.getElementById('spot2');
							$scope.conversation['spot2'].position = {x:sId.getAttribute('x'), y:sId.getAttribute('y')};
						} else if (id == 'spot2' && (align.x !== 'none' || align.y !== 'none')){
							var sId = document.getElementById('spot1');
							$scope.conversation['spot1'].position = {x:sId.getAttribute('x'), y:sId.getAttribute('y')};
						}
					};

					// draggable
					$('#logo')
						.draggable({
							cursor: "move",
							containment: "#editor .template",
							drag: startDragSVG,
							stop: stopDragSVG
						});
					$('#spot1')
						.draggable({
							cursor: "move",
							containment: "#editor .template",
							drag: startDragSVG,
							stop: stopDragSVG
						});
					$('#spot2')
						.draggable({
							cursor: "move",
							containment: "#editor .template",
							drag: startDragSVG,
							stop: stopDragSVG
						});
				}
			};
		}
	]);
});