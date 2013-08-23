define([
	'directives/directives',
	'directives/ngBooleanRadio',
	'services/conversationService',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('conversationCreator', ['$rootScope', '$route', '$location', '$compile', '$timeout', 'ConversationTpl', 'ConversationConfig', 'ConversationService', 'imageReader',
		function($rootScope, $route, $location, $compile, $timeout, ConversationTpl, ConversationConfig, ConversationService, imageReader){
			// Runs during compile
			return {
				scope : {
					conversations : '=',
					conversation  : '=ngModel'
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
					self.navbarPanel = $('.navbar-container');
					self.btnLogo    = $('#btn-input-logo');
					self.btnSpot1   = $('#btn-input-spot1');
					self.btnSpot2   = $('#btn-input-spot2');
					self.btnBg      = $('#btn-upload-backgrounds');
					self.sectionBg  = $('#drop-backgrounds');
					// define templates
					self.templates  = ConversationTpl.templates;
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
						message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Reading files..',
						css: {
							border: 'none',
							background: 'none',
							color: '#3685C6'
						}
					};

					self.isNew = false;

					/* model */

					self.oldConversation = angular.copy($scope.conversation);

					console.log('recents', $scope.conversations);

					$scope.isNew = false;
					// if new, set ID conversation
					if( $scope.conversation.ID === null ){
						self.isNew = true;
						$scope.isNew = true;
						$scope.conversation.ID = new Date().getTime();
					}
					$scope.isDownloadDisabled = true;
					$scope.template = (self.isNew) ? self.templates[0] : self.templates[$scope.conversation.selected];

					/* scope watchers */

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
						var objOld = self.mergeSelected('old');
						var objNew = self.mergeSelected('new');
						var r = !angular.equals(objOld, objNew);
						return r;
					};
					

					/* scope listener */

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

					/* simetris elements */

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
								console.log(response);
								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.ZIP.generate({type:"blob"}));
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

					/* 
					 * Save Template Configuration to the server
					 * POST & PUT
					 */
					self.save = function( callback ){
						var conversation = new ConversationService($scope.conversation);
						console.log('conversation', $scope.conversation);

						if( self.isNew ){
							conversation.$save(function(response){
								console.log('Save response', response);
								if(callback) callback(true);
							});
						} else {
							conversation.$update({id : $route.current.params.conversationId}, function(response){
								console.log('Update response', response);
								if(callback) callback(false);
							});
						}
					};

					// get selected conversations index
					// get list id panel left on thumbnail selected
					self.getSelectedConversationsIndex = function(){
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
								crop  : false
							}).then(function(response){
								console.log(response);
								// get selected conversations index
								var index = self.getSelectedConversationsIndex();
								$scope.$apply(function(scope){
									$timeout(function(){
										var img = response.url + '#' + new Date().getTime();
										scope.conversation.preview = img;
										scope.conversations[index].preview = img;
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
									crop  : true
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
							// console.log("Finished add to list", res);
							$scope.$apply(function(scope){
								scope.conversation.queue.empty = false;
								scope.conversation.queue.count = res.length;
							});
							$timeout(function(){
								// $('.drop', self.sectionBg).removeClass('loading');
								$('.drop', self.sectionBg).unblock();
								// open right panel
								$('a.handler-right', self.navbarPanel).click();
								// tab SVG selected
								$('.tabbable a[href="#tab-svg"]').click();
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
								console.log(index, blob);

								var image = new Image();
								image.src = e.target.result;
								image.onload = function(){
									var img = this.src;
									var ratio = parseInt(this.width)/parseInt(this.height);
									console.log('ratio', ratio);
									var direction;
									if ( ratio == 1 ) { 
										direction = 'square';
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
					self.addSVGList = function(data){
						var $svg = self.getSVGCompiled(data);

						var $thumb = $('<div class="thumbnail border-none text-center"></div>').append($svg);

						var $li = $('<li id="li-svg-'+data.id+'" class="span6">');
						$li.append('<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>')
							.append('<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>')
							.append('<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>')
							.append('<div class="success"><i class="icon-ok icon-4x"></i></div>')
							.append($thumb);

						$('#panel-right ul.svg-list').append($li);
					};
					// compile SVG 
					self.getSVGCompiled = function(data){
						var $svg = $('svg#svg-conversation').clone();
						$svg.removeAttr('id');

						var bg    = $('#bg', $svg);
						var logo  = $('#logo', $svg);
						var spot1 = $('#spot1', $svg);
						var spot2 = $('#spot2', $svg);

						// get direction (square/landscape/portrait)
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
						// default (square)
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
								var $liImg = $('#li-img-' + index);
								var $liSVG = $('#li-svg-' + index);
								var $svg   = $('.thumbnail > svg', $liSVG);

								console.log(index, $svg[0]);

								// change upload views
								$liImg.switchClass('wait', 'upload', 0);
								$liSVG.switchClass('wait', 'upload', 0);

								// get image direction
								var direction = ConversationTpl.directions[request.direction];

								// upload to resize
								return self.uploadFile({
									file  : request.blob,
									name  : 'conversation-bg-' + index,
									width : direction.w,
									height: direction.h,
									crop  : true
								}).pipe(function(response){
									console.log('response', index, response);
									console.log($('#bg > image.image', $svg)[0]);
									// change bg image
									$('img', $liImg).attr('src', response.dataURI);
									$('#bg > image.image', $svg).attr('xlink:href',response.dataURI);
									// change generate views
									$liImg.switchClass('upload', 'generate', 0);
									$liSVG.switchClass('upload', 'generate', 0);
									// generate image
									return self.generateImage($svg[0]).done(function(imgDataURI){
										// add to zip
										self.ZIPFolder.file('conversation_'+index+'.jpg', imgDataURI, {base64: true});
										// applying finished images
										$scope.$apply(function(scope){
											scope.conversation.queue.finished = index;
										});
										// change success views
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
						formData.append('id', $scope.conversation.ID);
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
							var imgDataURI = canvas.toDataURL('image/jpg');
							// send response
							setTimeout(function() {
								if( isURI || isURI === undefined ) {
									var imgURI = imgDataURI.replace(/^data:image\/(png|jpg);base64,/, "");
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

					$('a.handler-left').switchClass('invisible', 'visible', 0);
					$('a.handler-right').switchClass('invisible', 'visible', 0);

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
							scope.conversation.selected = index;
						});
						// change breadcumb active title
						var title = $link.data('title');
						$('nav > ul > li.active').text(title);
					});
					$('.collapse').live('hide', function() {
						$(this).parent().find('a').removeClass('open'); //remove active state to button on close
					});
					// make clicked, set template selected
					$timeout(function() {
						var link = parseInt($scope.conversation.selected) + 1;
						$('a[href="#tpl-'+ link +'"]').click();
						$rootScope.pageService.loaded = true;
					}, 1000);

					/* Handling Panel */

					// set model (search form)
					console.log('panel.left.model', $rootScope.panel.left.model);
					// set root model (panel left), if is new
					if( $rootScope.panel.left.model === null ){
						$rootScope.panel.left.model = {
							showForm : true,
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

						if( $scope.conversation.preview === null || controller.isNew || controller.isEdited() ){
							console.info('generate template then save POST');
							blockUI.message = '<i class="icon-spinner icon-spin icon-2x"></i> <br/> <span>Generating template..</span>';
							elPreview.block(blockUI);
							// generate preview tpl / screenshot
							controller.generatePreviewTpl(function(){
								$('.blockMsg span', elPreview).text(saveMsg);
								doSave( elPreview, function(){
									// reset old conversation
									controller.oldConversation = angular.copy($scope.conversation);
									// applying selected conversations
									var index = controller.getSelectedConversationsIndex();
									var c = $scope.conversations[index];
									c.title       = controller.oldConversation.title;
									c.description = controller.oldConversation.description;
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
								// close panel
								$('a.handler-'+targetPanel, controller.navbarPanel).click();
								$timeout(function(){
									// hide loading popup
									elPreview.unblock();
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

					/* Initialize event listener */

					// event listener button logo input file
					controller.btnLogo.live('click', function() {
						$(this).next()
							.bind('change', function(evt){
								var file = evt.target.files[0];
								controller.handleSingleFile(file, 'logo', function(response){
									console.log('response logo', response);
									$scope.$apply(function(scope){
										scope.conversation.logo.uploaded = true;
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
										scope.conversation.spot1.uploaded = true;
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
										scope.conversation.spot2.uploaded = true;
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
							$dropAreaBG.block(controller.blockUI);
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

							$dropAreaBG.block(controller.blockUI);

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

					// define bounds elements
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