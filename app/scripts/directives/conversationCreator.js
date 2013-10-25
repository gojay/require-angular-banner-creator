define([
	'directives/directives',
	'directives/ngBooleanRadio',
	'services/conversationService',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('conversationCreator', ['$rootScope', '$route', '$location', '$compile', '$timeout', 'ConversationTpl', 'ConversationConfig', 'ConversationService', 'authResource', 'imageReader',
		function($rootScope, $route, $location, $compile, $timeout, ConversationTpl, ConversationConfig, ConversationService, authResource, imageReader){
			// Runs during compile
			return {
				scope : {
					data : '=ngModel'
				},
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/conversation-creator.html',
				// replace: true,
				controller: function($scope, $element, $attrs, $transclude) {

					var self = this;
					self.isNew = false;
					self.templates = $scope.data.templates;

					/* ================ model ================ */

					$scope.conversations = $scope.data.recents;
					$scope.conversation  = $scope.data.detail;

					self.oldConversation = angular.copy($scope.conversation);

					$scope.isNew = false;
					// if new, set default config conversation
					if( $scope.conversation === null ){
						$scope.isNew           = self.isNew = true;
						$scope.conversation    = angular.copy(ConversationConfig);
						// $scope.conversation.ID = new Date().getTime();
						$scope.conversation.ID = $scope.data.ID;
					}

					console.log('conversation', $scope.conversation);

					$scope.isDownloadDisabled = true;
					$scope.template = (self.isNew) ? self.templates[1] : self.templates[$scope.conversation.selected];

					$scope.bgColors = ConversationTpl.bgColors;

					/* ================ init variables ================ */

					var index    = 1,
						sizes    = 0,
						requests = [];

					// define elements
					self.navbarPanel = $('.navbar-container', $element);
					self.btnLogoDefault = $('#btn-input-logo-default', $element);
					self.btnLogo    = $('#btn-input-logo', $element);
					self.btnSpot1   = $('#btn-input-spot1', $element);
					self.btnSpot2   = $('#btn-input-spot2', $element);
					self.btnBg      = $('#btn-upload-backgrounds', $element);
					self.sectionBg  = $('#drop-backgrounds', $element);
					self.inputBgColor  = $('#input-bg-color', $element);
					// define dimensions
					self.dimensions = ConversationTpl.dimensions;
					// define jsZip
					self.ZIP = new JSZip();
					self.ZIPFolder = self.ZIP.folder('conversation-'+$scope.conversation.ID);
					// style blockUI
					self.blockUI = {
						overlayCSS: {
							backgroundColor: '#fff',
							opacity: 0.8
						},
						message: '<i class="icon-spinner icon-spin icon-2x"></i>',
						css: {
							border: 'none',
							background: 'none',
							color: '#3685C6'
						}
					};

					/* ================ scope watchers ================ */

					// logo
					$scope.$watch('conversation.logo.hide', function(checked){
						self.hideElement(checked, 'logo');
					});
					$scope.$watch('conversation.logo.placeholder', function(checked){
						self.addPlaceholder(checked, 'logo');
					});
					// spot1
					$scope.$watch('conversation.spot1.hide', function(checked){
						self.hideElement(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.placeholder', function(checked){
						self.addPlaceholder(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.clip', function(clip){
						self.setClip(clip, 'spot1');
					});
					// spot2
					$scope.$watch('conversation.spot2.hide', function(checked){
						self.hideElement(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.placeholder', function(checked){
						self.addPlaceholder(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.clip', function(clip){
						self.setClip(clip, 'spot2');
					});

					var selected = ['logo', 'spot1', 'spot2', 'selected'];
					self.mergeSelected = function( type ){
						var obj = (type == 'old') ? self.oldConversation : $scope.conversation ;
						var mObj = {};
						$.each(selected, function(key, val) {
							if(obj.hasOwnProperty(val)){
								mObj[val] = obj[val];
							}
						});
						return mObj;
					};
					self.isEdited = function(){
						if( self.oldConversation == null ) return false;
						var objOld = self.mergeSelected('old');
						var objNew = self.mergeSelected('new');
						var r = !angular.equals(objOld, objNew);
						return r;
					};
					

					/* ================ scope listener ================ */

					self.hideElement = function(checked, element){
						// var $logo = $('svg#' + element);
						var $logo = $('svg.g_' + element);
						if(checked) $logo.hide();
						else $logo.show();
					};
					self.addPlaceholder = function(checked, element){
						var $svgEl = $('svg.g_' + element);
						if(checked) $('.placeholder', $svgEl).show();
						else $('.placeholder', $svgEl).hide();
					};
					self.setClip = function(type, element){
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

					/* ================ simetris elements ================ */

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

					// sync position (logo, spot1, spot2), after svg compiled (added background files)
					$scope.syncPosition = function(el, direction){
						var val, tplDirection = ConversationTpl.directions[direction];
						if(direction == 'landscape'){
							// var x = tplDirection.w;
							// var p = parseInt($scope.conversation[el].position.x / 403 * 100);
							var diff = tplDirection.w - 403;
							val = parseInt(diff / 100 * $scope.conversation[el].position.x);
						} else if(direction == 'portrait') {
							// var y = tplDirection.h;
							// var p = parseInt($scope.conversation[el].position.y / 403 * 100);
							// val = p / 100 * y;
							var diff = tplDirection.h - 403;
							val = parseInt(diff / 100 * $scope.conversation[el].position.y);
						}
						return val;
					}

					/* 
					 * Generate Template
					 * POST & PUT
					 */
					$scope.generate = function( isContent ){
						var timeout = 0;
						if( isContent ){
							// open right panel
							$('a.handler-right', self.navbarPanel).click();
							// tab SVG selected
							$('.tabbable a[href="#tab-svg"]').click();
							timeout = 600;
						}
						$timeout(function(){
							self.doGenerate();
						}, timeout);
					};
					self.doGenerate = function(){
						console.log('generate');
						// set waiting views
						$('ul.img-list > li').addClass('wait');
						$('ul.svg-list > li').addClass('wait');

						console.info('start deferred multiple files...');

						$timeout(function() {
							self.deferredMultipleUpload(requests, sizes).done(function(response){

								// ganti text panel header "Generated"
								$('a[href="#tab-svg"]').text('Generated');
								
								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.ZIP.generate({type:"blob"}));
								// set anchor link
								var aZip = document.getElementById('downloadZip');
								aZip.download = 'conversation-'+ $scope.conversation.ID +'.zip';
								aZip.href     = link;
								// applying isGenerateDisabled to false
								$scope.isDownloadDisabled = false;
								$scope.$apply();
								// update completed progress
								$('.progress').removeClass('progress-striped active').addClass('progress-success');
								$('.progress > .bar > span').html('<i class="icon-ok"></i> Completed');
							});
						}, 1000);
					};

					/* 
					 * Save Template Configuration to the server
					 * POST & PUT
					 */
					self.save = function( callback ){
						var conversation = new ConversationService($scope.conversation);
						if( self.isNew ){

							// conversation.$save(function(response){
							// 	console.log('Insert response', response);
							// 	if(callback) callback(true);
							// });

							authResource.authentifiedRequest('POST', 'api/conversation', $scope.conversation, function(response){
								console.log('response:afer insert', response);
								if(callback) callback(true);
							});
						} else {

							// conversation.$update({id : $route.current.params.conversationId}, function(response){
							// 	console.log('Update response', response);
							// 	if(callback) callback(false);
							// });

							authResource.authentifiedRequest('PUT', 'api/conversation/' + $route.current.params.conversationId, $scope.banner, function(response){
								console.log('response:afer update', response);
								if(callback) callback(false);
							});
						}
					};

					self.slugify = function(Text) {
					    return Text
						        .toLowerCase()
						        .replace(/[^\w ]+/g,'')
						        .replace(/ +/g,'-');
					};

					// get index selected conversations 
					// get list id panel left on thumbnail selected
					self.getIndexSelectedConversations = function(){
						var lID = $('#conversation-panel-left .thumbnail.selected').parents('li').attr('id');
						if(!lID) return null;
						return lID.match(/\d/)[0];
					};
					/* 
					 * Generate preview template before save (form)
					 */
					self.generatePreviewTpl = function( callback ){
						var $svg = $('svg#svg-conversation');
						self.generateImage($svg[0], false).done(function(imgDataURI){
							var blob = self.dataURItoBlob(imgDataURI);
							console.log(blob);
							self.uploadFile({
								file  : blob,
								name  : 'conversation-tpl',
								width : 'original',
								height: 'original',
								auto  : 0
							}).then(function(response){
								console.log('generatePreviewTpl', response);
								// get selected conversations index
								var index = self.getIndexSelectedConversations();
								$scope.$apply(function(scope){
									scope.conversation.preview = response.url;
									$timeout(function(){
										if( index ){
											var img = response.url + '#' + new Date().getTime();
											scope.conversations[index].preview = img;
										}
									}, 1000);
								});
								console.log($scope.conversation);
								if(callback) callback();
							});
						});
					};
					// handle single file (template image)
					self.handleSingleFile = function(file, name, callback){
						// validation file image selected
						self.imageValidation(file, true);
						// show loading
						var blockUI = self.blockUI;
						blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Uploading..'
						$('#editor .template').block(blockUI);
						// file reader
						var fileReader = new FileReader();
						fileReader.onload = (function(blob){
							return function(e){
								var type = name.replace(/\d/, '');
								var dimension = self.dimensions[type];
								self.uploadFile({
									file  : blob,
									name  : name,
									width : dimension.w,
									height: dimension.h,
									auto  : 1
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

						window._onbeforeunload = false;

						var currentFile = self.taskList(files, 0);
						for (var i = 1; i < files.length; i++) {
							currentFile = currentFile.pipe(function(j) {
								return self.taskList(files, j);
							});
						}
						$.when(currentFile).done(function(res) {
							console.log("Finished add to list", res);
							$scope.conversation.queue.empty = false;
							$scope.conversation.queue.count = res.length;
							$scope.$apply();
							$timeout(function(){
								// $('.drop', self.sectionBg).removeClass('loading');
								$('.drop', self.sectionBg).unblock();
								// open right panel
								$('a.handler-right', self.navbarPanel).click();
								// tab SVG selected
								$('#panel-content a[href="#tab-svg"]').click();
							}, 1000);
						});
					};

					// add queue request n lists
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
								var name = blob.name;
								var filename = name.substr(0, name.lastIndexOf('.')) || name;
								var isSmall  = false;
								var resize   = {};

								var image = new Image();
								image.src = e.target.result;
								image.onload = function(){
									var img = this.src;

									// parse integer
									var width  = parseInt(this.width);
									var height = parseInt(this.height);

									// gambar terlalu kecil ? max width n height = 403
									if(width <= 403 && height <= 403) isSmall = true;

									var ratio = width/height;
									var direction = 'square';
									if( ratio > 1 ) {
										direction = 'landscape';
									} else {
										direction = 'portrait';
									}

									// elements
									var elements = {
										id: index, 
										imguri: img,
										direction: direction
									};
									// add attribute ratio & change resized dimension for default template
									if( $scope.conversation.selected == 0 ){
										var calcHeight = ( isSmall ) ? { w:width, h:height }
																	 : self.getHeightRatio(direction, width, height);
										elements['ratio'] = resize = calcHeight;
										// if(direction == 'landscape'){
										// 	resize.h = calcHeight.h - 80;
										// } else if(direction == 'portrait') {
										// 	resize.w = calcHeight.w - 40;
										// 	resize.h = calcHeight.h - 100;
										// }
										if( direction == 'square' ) {
											resize = ConversationTpl.directions[direction];
										} else {
											if( !isSmall ){
												resize = {
													w: calcHeight.w - 40,
													h: calcHeight.h - 100
												};
											}
										}  
									} else {
										// set default resize dimension
										resize = ConversationTpl.directions[direction];
									}

									// add queues
									sizes += blob.size;
									requests.push({
										blob  : blob,
										size  : sizes,
										index : index,
										name  : filename, 
										resize: resize,
										direction: direction
									});

									// add elements to lists
									self.addSVGList(elements, function(){

										index++;
										var next = _index + 1;
										var res  = files.length == next ? requests : next ;
										// resolve
										defer.resolve(res);
									});
								};
							};
						})(file);
						// read as data uri
						fileReader.readAsDataURL(file);
						// return promise
						return defer.promise();
					};
					self.getHeightRatio = function(direction, srcWidth, srcHeight) {
						var width = (direction == 'landscape') ? 550 : 403 ;
					    var ratio = width / srcWidth;
					    return {
							w: parseInt(srcWidth*ratio), 
				    		h: parseInt(srcHeight*ratio)
						};
					}
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
					// add img to list
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
					// add SVG to list
					self.addSVGList = function(data, callback){
						var $svg = self.getSVGCompiled(data);

						var $thumb = $('<div class="thumbnail border-none text-center"></div>').append($svg);

						var $li = $('<li id="li-svg-'+data.id+'" class="span6">');
						$li.append('<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>')
							.append('<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>')
							.append('<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>')
							.append('<div class="success"><i class="icon-ok icon-4x"></i></div>')
							.append($thumb);

						$('#panel-right ul.svg-list').append($li);

						if(callback) callback()
					};
					// compile SVG 
					self.getSVGCompiled = function(data){
						var $svg;
						// get direction (square/landscape/portrait)
						// console.log('ConversationTpl directions', ConversationTpl.directions)
						var dimension = ConversationTpl.directions[data.direction];
						if( $scope.conversation.selected == 0 ){
							$svg = $('svg#svg-conversation-default').clone();
							// console.log('ratio ', data.ratio)
							if(angular.isDefined(data.ratio))
							{
								// console.group();
								// console.log('ratio ', data.ratio)
								// console.log('change svg dimension ', dimension.w, data.ratio.h)
								// console.groupEnd();

								$svg.attr({
									width : data.ratio.w,
									height: data.ratio.h
								});
								// change svg figure
								var $figure = $('#figure', $svg).attr('fill', '{{conversation.templateColor}}');
								// if( data.direction == 'landscape' ){
								// 	$('image.image', $svg).attr({
								// 		x: 0,
								// 		y: 80,
								// 		width : data.ratio.w,
								// 		height: data.ratio.h - 80
								// 	});
								// 	$('#figure', $svg).attr('class','landscape');
								// } else if(data.direction == 'portrait') {
								// 	$('image.image', $svg).attr({
								// 		x: 20,
								// 		y: 80,
								// 		width: data.ratio.w - 40,
								// 		height: data.ratio.h - 100
								// 	});
								// 	$('#figure > .bottom', $svg).attr('y', data.ratio.h - 20);
								// }
								if( data.direction != 'square' ){
									$('image.image', $svg).attr({
										x: 20,
										y: 80,
										width : data.ratio.w - 40,
										height: data.ratio.h - 100
									});
									if( data.direction == 'landscape' ) $('#figure > .right', $svg).attr('x', data.ratio.w - 20);
									$('#figure > .bottom', $svg).attr('y', data.ratio.h - 20);
								}
							}
						} else {
							$svg = $('svg#svg-conversation').clone();
							// set SVG dimesion by direction 
							$svg.attr({
								width : dimension.w,
								height: dimension.h
							});
						}
						
						$svg.removeAttr('id');

						var bg    = $('#bg', $svg);
						var logo  = $('#logo', $svg);
						var spot1 = $('#spot1', $svg);
						var spot2 = $('#spot2', $svg);

						// poistions
						var tplDirection = ConversationTpl.directions[data.direction];
						// console.log('tplDirection', tplDirection)
						// default (square)
						var positions = {};
						switch(data.direction){
							case 'landscape':
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

						// console.log('positions', positions);

						// background
						$('image.image', bg).attr('xlink:href', data.imguri).css('display', 'block');
						// $('image.tpl', bg).attr('xlink:href', '{{template.square}}');
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
					// deferred multiple uploads
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
								// var $liImg = $('#li-img-' + index);
								var $liSVG = $('#li-svg-' + index);
								var $svg   = $('.thumbnail > svg', $liSVG);

								// change upload views
								// $liImg.switchClass('wait', 'upload', 0);
								$liSVG.switchClass('wait', 'upload', 0);

								console.log('upload file', request);

								// upload to resize
								return self.uploadFile({
									file  : request.blob,
									// name  : 'conversation-bg-' + index,
									name  : request.name,
									width : request.resize.w,
									height: request.resize.h,
									auto  : 0,
									direction : request.direction
								}).pipe(function(response){
									console.log('response', index, response);
									// sesuaikan attribute 'height' utk svg dan bg image, template default
									if( $scope.conversation.selected == 0 && response.direction != 'square' ){
										var h = parseInt(response.height);
										// var svgH = (response.direction == 'landscape') ? h +  80 : h +  100 ;
										var svgH = h + 100 ;
										$svg.attr('height', svgH)
											.find('#bg > image.image').attr({
												'xlink:href': response.dataURI,
												'width'     : response.width,
												'height'    : h
											});
										// ubah position y figure bottom untuk landscape direction
										if(response.direction == 'landscape') $svg.find('#figure > .bottom').attr('y', svgH - 20);
									}
									// change generate views
									// $liImg.switchClass('upload', 'generate', 0);
									$liSVG.switchClass('upload', 'generate', 0);
									// generate image
									return self.generateImage($svg[0]).done(function(imgDataURI){
										// add to zip
										self.ZIPFolder.file(response.image, imgDataURI, {base64: true});
										// applying finished images
										$scope.conversation.queue.finished = index;
										$scope.$apply();
										// change success views
										// $liImg.switchClass('generate', 'success', 0);
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
						// console.log(data);
						// create form data
						var formData = new FormData();
						formData.append('file', data.file);
						formData.append('id', $scope.conversation.ID);
						formData.append('name', data.name);
						formData.append('width', data.width);
						formData.append('height', data.height);
						formData.append('auto_width', data.auto);
						formData.append('direction', data.direction);
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
					self.generateImage = function(svg, isURI){
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
								if( isURI || isURI === undefined ) {
									var imgURI = imgDataURI.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
									deferred.resolve(imgURI);
								} else
									deferred.resolve(imgDataURI);
							}, 2000);
						};
						img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

						return deferred.promise();
					};

					/**
					 * convert data URI to Blob (file image)
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

					/* ================ handling setting collapse ================ */

					var el = angular.element(iElm);

					var $editorTpl = $('#editor .template');
					$('.collapse', el).live('show', function() {
						// set collapse class open 
						var $link = $(this).parent().find('a');
						$(this).parent().find('a').addClass('open'); //add active state to button on open
						// get tpl  
						// var index    = this.id.match(/\d/)[0] - 1;
						var index    = this.id.match(/\d/)[0];
						var template = controller.templates[index];
						// applying template
						$scope.conversation.selected = index;
						// $scope.template = (index < 4) ? template : template['blue'];
						if(index == 0){ // default template
							$scope.conversation.templateColor = '#AAAAAA';
							$scope.conversation.logo.dimension.h = 62;
							$scope.conversation.spot1.position.x = 285;
							$scope.conversation.spot1.position.y = 37;
						} else if(index > 0 && index < 4){
							$scope.template = template;
							$scope.conversation.templateColor = null;
							$scope.conversation.logo.dimension.h = 45;
							$scope.conversation.spot1.position.x = 65;
							$scope.conversation.spot1.position.y = 266;
						} else {
							var color = ($scope.conversation.templateColor) ? $scope.conversation.templateColor : 'blue' ;
							$scope.template = template[color];
							$scope.conversation.logo.dimension.h = 45;
							$scope.conversation.spot1.position.x = 65;
							$scope.conversation.spot1.position.y = 266;
						}
						$scope.$apply();
						// change breadcumb active title
						var title = $link.data('title');
						$('nav > ul > li.active').text(title);
					});
					$('.collapse', el).live('hide', function() {
						$(this).parent().find('a').removeClass('open'); //remove active state to button on close
					});
					// make clicked, set template selected
					$timeout(function() {
						// page service has been loaded
						// $rootScope.pageService.start  = false;
						$rootScope.pageService.loaded = true;
						$('a[href="#tpl-'+ $scope.conversation.selected +'"]').click();
						// use jPicker, firefox doesn't support input color
						$('#input-bg-color', el)
							.jPicker({
								window : {
									effects :  { type: 'fade' }
								},
								images : {
									clientPath : 'assets/css/jpicker/images/'
								}
							}, self.cbPickColor, self.cbPickColor);
					}, 1000);

					// callback jqpicker
					self.cbPickColor = function(color, context){
						var all = color.val('all');
						var hex = '#' + all.hex ;
						console.log('color', hex);
						$scope.conversation.templateColor = hex;
						$scope.$apply();
					};
					$scope.tplPickColor = function(color){
						$scope.conversation.templateColor = color;
						angular.forEach($scope.bgColors, function(value, key){
							$scope.bgColors[key]['selected'] = false;
						});
						$scope.bgColors[color]['selected'] = true;

						$scope.template = controller.templates[$scope.conversation.selected][color];
						console.log($scope.template);
					};

					/* ================ Handling Panel ================ */

					$('a.handler-left').switchClass('invisible', 'visible', 0);
					$('a.handler-right').switchClass('invisible', 'visible', 0);

					// set model (search form)
					console.log('panel.left.model', $rootScope.panel.left.model);
					// set root model (panel left), if is new
					if( $rootScope.panel.left.model === null ){
						$rootScope.panel.left.model = {
							showForm : false,
							isCaption: true,
							orderProp: 'ID',
							orderReserve : true,
							cols : 'cols3'
						};
					}
					// add model selected for edit view
					$rootScope.panel.left.model.selected = $scope.conversation.ID;

					// get conversation panel left
					var $panelLeft = '<div ng-include src="\'app/views/conversation-panel-left.html\'"></div>';
					// bind panel left (rootScope), compile inject scope
					$rootScope.panel.left.template = $compile($panelLeft)($scope);
					// get conversation panel right
					var $panelRight = '<div ng-include src="\'app/views/conversation-panel-right.html\'"></div>';
					// bind panel right (rootScope), compile inject scope
					$rootScope.panel.right.template = $compile($panelRight)($scope);

					// panel handler
					var targetPanel;
					// bind/unbind panel handler
					$('a', controller.navbarPanel)
						.unbind('click')
						.bind('click', function(e){
							targetPanel = $(e.currentTarget).data('target');

							var $panel = $('#panel-'+targetPanel);
							var openWrapper = 'open-wrapper-'+targetPanel;
							if($('#wrapper').hasClass(openWrapper)){
								$('#wrapper').removeClass(openWrapper);
								$panel.removeClass('open-panel panel-focused').removeAttr('style');
							} else {
								$('#wrapper').addClass(openWrapper);
								$panel.addClass('open-panel');
								// set focused panel for scrolling
								$timeout(function(){
									$panel.addClass('panel-focused');
								}, 500);
							}
						});

					// link panel left
					$scope.detailConversation = function(index){
						var ID = $scope.conversations[index].ID;
						var list = 'li#thumb-conversation-'+index;
						var blockUI = controller.blockUI;

						// return, if it's selected
						if( $('.thumbnail', list).hasClass('selected') ||
							ID == $scope.conversation.ID) return false;

						// show loading
						blockUI.overlayCSS.opacity = 0.7;
						blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Please wait..';
						$(list).block(blockUI);

						// set loaded to false
						if($rootScope.pageService.loaded) $rootScope.pageService.loaded = false;
						$location.path('/facebook/conversation/'+ ID);

						// unbind function that will kill the
						// $watch() listener when its called.
						var unbindWatch = $rootScope.$watch('pageService.loaded', function(loaded){
							console.log('$rootScope loaded', loaded);
							// call this, when pageService is loaded..
							if(loaded){
								// hide loading
								$(list).unblock();
								// set selected class
								$('ul.thumbnails')
									.each(function(){
										$('.selected', this).removeClass('selected');
									})
									.find(list).addClass('selected');
								// close panel
								$timeout(function(){
								 	$('a.handler-'+targetPanel, controller.navbarPanel).click();
								}, 500);
								// unbind/clear the $watch()
								unbindWatch();
							}
						});
					};

					// link panel right
					$scope.createNew = function(){
						// close panel
						$('a.handler-'+targetPanel, controller.navbarPanel).click();
						// redirect to new conversation
						$location.path('/facebook/conversation');
					};
					// save template
					$scope.saveSubmit = function(){
						var elPreview   = $('#save-conversation'); // form
						var blockUI     = controller.blockUI;
						var saveMsg     = 'Saving..';

						window._onbeforeunload = true;

						var isEdited = controller.isEdited();
						if( $scope.conversation.preview === null || controller.isNew || isEdited ){
							console.info('generate template then save POST');
							blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> <span>Generating template..</span>';
							elPreview.block(blockUI);
							// generate preview tpl / screenshot
							controller.generatePreviewTpl(function(){
								$('.blockMsg span', elPreview).text(saveMsg);
								doSave( elPreview, function(){
									// update old conversation
									controller.oldConversation = angular.copy($scope.conversation);
									if( isEdited ){
										// applying selected conversations
										var index = controller.getIndexSelectedConversations();
										var c = $scope.conversations[index];
										c.title       = controller.oldConversation.title;
										c.description = controller.oldConversation.description;
									}
								});
							});
						} else {
							console.info('save PUT');
							blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> <span>Saving..</span>';
							elPreview.block(blockUI);
							doSave( elPreview );
						}
					};
					// do save
					var doSave = function( elPreview, callback ){
						controller.save(function(redirected){
							if( redirected ){
								// redirect message
								$('.blockMsg > span', elPreview).text('Please wait, you will be redirecting to this conversation...');
								$timeout(function(){
									// hide loading popup
									elPreview.unblock();
									// close panel
									$('a.handler-'+targetPanel, controller.navbarPanel).click();
									// redirect to edit conversation
									$location.path('/facebook/conversation/' + $scope.conversation.ID);
									if(callback) callback();
								}, 3000);
							} else {
								// hide loading popup
								elPreview.unblock();
								if(callback) callback();
							}
						});
					};

					/* ================ Initialize event listener ================ */

					// note:unbind event live() with die()

					// event listener button logo input file
					controller.btnLogoDefault.die('click').live('click', function() {
						var handlerLogo = function(evt){
							var file = evt.target.files[0];
							controller.handleSingleFile(file, 'logo', function(response){
								console.log('response logo [default]', response);
								$scope.conversation.logo.uploaded = true;
								$scope.conversation.logo.image = response.dataURI;
								$scope.conversation.logo.dimension.w = response.width;
								$scope.conversation.logo.dimension.h = response.height;
								$scope.$apply();
							});
						};
						$(this).next()
							.unbind('change')
							.bind('change', handlerLogo)
							.click();
					});

					// event listener button logo input file
					controller.btnLogo.die('click').live('click', function() {
						var handlerLogo = function(evt){
							var file = evt.target.files[0];
							controller.handleSingleFile(file, 'logo', function(response){
								// console.log('response logo', response);
								$scope.conversation.logo.uploaded = true;
								$scope.conversation.logo.image = response.dataURI;
								$scope.conversation.logo.dimension.w = response.width;
								$scope.conversation.logo.dimension.h = response.height;
								$scope.$apply();
							});
						};
						$(this).next()
							.unbind('change')
							.bind('change', handlerLogo)
							.click();
					});
					// event listener button spot1 input file
					controller.btnSpot1.die('click').live('click', function() {
						var handlerSpot1 = function(evt){
							var file = evt.target.files[0];
							controller.handleSingleFile(file, 'spot1', function(response){
								// console.log('response spot1', response);
								$scope.conversation.spot1.uploaded = true;
								$scope.conversation.spot1.image = response.dataURI;
								$scope.$apply();
							});
						};
						$(this).next()
							.unbind('change')
							.bind('change', handlerSpot1)
							.click();
					});
					// event listener button spot2 input file
					controller.btnSpot2.die('click').live('click', function() {
						var handlerSpot2 = function(evt){
							var file = evt.target.files[0];
							controller.handleSingleFile(file, 'spot2', function(response){
								// console.log('response spot2', response);
								$scope.conversation.spot2.uploaded = true;
								$scope.conversation.spot2.image = response.dataURI;
								$scope.$apply();
							});
						};
						$(this).next()
							.unbind('change')
							.bind('change', handlerSpot2)
							.click();
					});

					var $dropAreaBG = $('.drop', controller.sectionBg);

					// handling button add backgrounds
					controller.btnBg.click(function() {
						var handler = function(evt){
							var tpl = $scope.template;
							controller.blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Reading files..'
							$dropAreaBG.block(controller.blockUI);
							controller.handleDeferredMultipleFiles(evt.target.files);
						};
						$(this).next()
							.unbind('change', handler)
							.bind('change', handler)
							.click();
					});

					// drag n drop events
					$dropAreaBG
						// event drop 
						.bind('drop', function(evt){
							evt.stopPropagation();
							evt.preventDefault();

							$dropAreaBG.removeClass('over');
							// $dropAreaBG.addClass('loading');

							controller.blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Reading files..'
							$dropAreaBG.block(controller.blockUI);

							// get files
							var original = evt.originalEvent,
								files    = original.dataTransfer.files;

							// console.log('drop file', files);

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

					/* ================ handling draggable SVG ================ */

					// define bounds elements
					var bounds = {
						'logo': {x:228, y:348},
						'spot': {x:323, y:323}
					};

					// drag callback svg elements

					var startDragSVG = function(event, ui) {
						var className = $(event.target).attr('class').replace('g_', '');
						var type = className.replace(/\d/,'');
						var max  = bounds[type];
						var offset = $('#editor .template').offset();
						// set X
						var x    = ui.offset.left - offset.left;
						var xVal = (x >= max.x) ? max.x : x;
						event.target.setAttribute('x', xVal);
						// simetris X
						if(className == 'spot1' && $scope.conversation.align.x == 'x1'){
							var getX = controller.getX(className, xVal);
							document.getElementById('spot2').setAttribute('x', getX);
						} else if (className == 'spot2' && $scope.conversation.align.x == 'x2'){
							var getX = controller.getX(className, xVal);
							document.getElementById('spot1').setAttribute('x', getX);
						}
						// set Y
						var y    = ui.offset.top - offset.top;
						var yVal = (y >= max.y) ? max.y : y;
						event.target.setAttribute('y', yVal);
						// simetris Y
						if(className == 'spot1' && $scope.conversation.align.y == 'y1'){
							document.getElementById('spot2').setAttribute('y', yVal);
						} else if (className == 'spot2' && $scope.conversation.align.y == 'y2'){
							document.getElementById('spot1').setAttribute('y', yVal);
						}
					};
					var stopDragSVG = function(event, ui) {
						var className = $(event.target).attr('class').replace('g_', '');
						var offset = $('#editor .template').offset();
						var y = ui.offset.top - offset.top;
						var x = ui.offset.left - offset.left;
						$scope.conversation[className].position = {x:x, y:y};
						// simetris
						var align = $scope.conversation.align;
						if(className == 'spot1' && (align.x !== 'none' || align.y !== 'none')){
							var sId = document.getElementById('spot2');
							$scope.conversation['spot2'].position = {x:sId.getAttribute('x'), y:sId.getAttribute('y')};
						} else if (className == 'spot2' && (align.x !== 'none' || align.y !== 'none')){
							var sId = document.getElementById('spot1');
							$scope.conversation['spot1'].position = {x:sId.getAttribute('x'), y:sId.getAttribute('y')};
						}
					};

					// draggable
					$('.g_logo, .g_spot1, .g_spot2')
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