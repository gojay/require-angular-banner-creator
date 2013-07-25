define([
	'directives/directives',
	'services/conversationService',
	'jquery',
	'jqueryui'
], function(directives){
	directives.directive('conversationCreator', ['$compile', '$timeout', 'ConversationTpl', 'imageReader',
		function($compile, $timeout, ConversationTpl, imageReader){
			// Runs during compile
			return {
				restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
				templateUrl: 'app/views/components/conversation-creator.html',
				// replace: true,
				controller: function($scope, $element, $attrs, $transclude) {

					var self = this;

					var ID = null;

					var index    = 1;
					var requests = [];
					var sizes    = 0;

					self.sectionBg = $('#drop-backgrounds');
					self.buttonBg  = $('#btn-upload-backgrounds');

					self.templates = ConversationTpl;

					self.zip = new JSZip();

					// model
					$scope.conversation = {
						logo : {
							hide: false,
							placeholder: true,
							position: {
								x: 18,
								y: 78
							}
						},
						spot1 : {
							hide: false,
							placeholder: true,
							clip: 'square',
							position: {
								x: 65,
								y: 266
							}
						},
						spot2 : {
							hide: false,
							placeholder: true,
							clip: 'square',
							position: {
								x: 266,
								y: 266
							}
						},
						align: {
							x: 'none',
							y: 'none'
						},
						images : {
							empty    : true,
							count    : 0,
							finished : 0
						},
						template : ConversationTpl[0],
						isDownloadDisabled : true
					};

					var hideElement = function(checked, element){
						var $logo = $('svg#' + element);
						if(checked) $logo.hide();
						else $logo.show();
					};
					var addPlaceholder = function(checked, element){
						var $svgEl = $('svg#' + element);
						if(checked) $('.placeholder', $svgEl).show();
						else $('.placeholder', $svgEl).hide();
					};
					var setClip = function(type, element){
						var $svgEl = $('svg#' + element);
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

					/* scope watchers */

					// logo
					$scope.$watch('conversation.logo.hide', function(checked){
						console.log(checked);
						hideElement(checked, 'logo');
					});
					$scope.$watch('conversation.logo.placeholder', function(checked){
						console.log(checked);
						addPlaceholder(checked, 'logo');
					});
					// spot1
					$scope.$watch('conversation.spot1.hide', function(checked){
						console.log(checked);
						hideElement(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.placeholder', function(checked){
						console.log(checked);
						addPlaceholder(checked, 'spot1');
					});
					$scope.$watch('conversation.spot1.clip', function(clip){
						console.log('clip', clip);
						setClip(clip, 'spot1');
					});
					// spot2
					$scope.$watch('conversation.spot2.hide', function(checked){
						console.log(checked);
						hideElement(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.placeholder', function(checked){
						console.log(checked);
						addPlaceholder(checked, 'spot2');
					});
					$scope.$watch('conversation.spot2.clip', function(clip){
						console.log('clip', clip);
						setClip(clip, 'spot2');
					});

					var currentYPos = {el:null, y:null};
					var currentXPos = {el:null, x:null};

					$scope.setAlignX = function(){
						console.log($scope.conversation.align);
						var alignX = $scope.conversation.align.x;
						var x, cx;
						switch(alignX){
							case 'x1':
								var s1 = $scope.conversation['spot2'];
								var w1 = s1.placeholder ? 80 : 70;
								x = 403 - s1.position.x - w1;
								cx = 'spot1';
								break;
							case 'x2':
								var s2 = $scope.conversation['spot1'];
								var w2 = s2.placeholder ? 80 : 70;
								x = 403 - s2.position.x - w2;
								cx = 'spot2';
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
							console.log($scope.conversation[cx]);
						}
					};

					$scope.setAlignY = function(){
						console.log($scope.conversation.align);
						var alignY = $scope.conversation.align.y;
						var y, cy;
						switch(alignY){
							case 'y1':
								y = $scope.conversation['spot2'].position.y;
								cy = 'spot1';
								break;
							case 'y2':
								y = $scope.conversation['spot1'].position.y;
								cy = 'spot2';
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
							console.log($scope.conversation[cy]);
						}
					};

					$scope.refresh = function(){
						var $svg = $('svg#svg-conversation').clone();
						$svg.attr('id', '');

						$('#sidebar-right ul.svg-list').html('');
						angular.forEach(requests, function(file,i){
							self.addSVGList($svg, null);
						});
					};

					$scope.generate = function(){
						console.log('generate');
						$('ul.img-list > li').addClass('wait');
						$('ul.svg-list > li').addClass('wait');

						ID = new Date().getTime();

						console.info('start chainedMultipleUpload...');

						setTimeout(function() {
							$scope.$apply(function(scope){
								scope.conversation.images.count = requests.length;
							});
							self.chainedMultipleUpload(requests, sizes).done(function(response){
								console.log(response);
								// generated zip 
								var DOMURL = window.URL || window.mozURL;
								var link   = DOMURL.createObjectURL(self.zip.generate({type:"blob"}));
								// set anchor link
								var aZip = document.getElementById('downloadZip');
								aZip.download = 'conversation-'+ID+'.zip';
								aZip.href     = link;
								// applying isGenerateDisabled to false
								$scope.$apply(function(scope){
									scope.conversation.isDownloadDisabled = false;
								});
								// update completed progress
								$('.progress').removeClass('progress-striped active').addClass('progress-success');
								$('.progress > .bar > span').html('<i class="icon-ok"></i> Completed');
							});
						}, 1000);
					};

					// handle multiple files (background images)
					self.handleMultipleFiles = function(files, tpl, callback){
						var countFiles = files.length;
						var $svg = $('svg#svg-conversation').clone();
						$svg.attr('id', '');
						// looping files
						angular.forEach(files, function(file,i){
							// validation file image selected
							self.imageValidation(file);
							// file reader
							var fileReader = new FileReader();
							fileReader.onload = (function(blob){
								return function(e){
									sizes += blob.size;
									requests.push({
										blob:blob,
										size:sizes,
										index:index
									});
									var callback = null;
									if(requests.length == countFiles)
									{
										callback = function(){
											console.log('requests', requests);
											$scope.$apply(function(scope){
												scope.conversation.images.empty = false;
												scope.conversation.images.count = requests.length;
											});
											$timeout(function(){
												$('.drop', self.sectionBg).removeClass('loading');
												// open sidebar
												$('#editor a.nav-sidebar').addClass('btn-primary').click();
											}, 1000);
										};
									}
									// add to list
									self.addImgList({id:'img-page-'+index, imguri:e.target.result}, callback);
									self.addSVGList($svg, callback);
									// increase index
									index++;
								};
							})(file);
							// read as data uri
							fileReader.readAsDataURL(file);
						});
					};
					// image validation
					self.imageValidation = function(file){
						// validation file image selected
						if (!(file.type && file.type.match('image.*'))) {
							// file type is not allowed 
							// alert('File '+ file.name +' is not image. Only JPG, PNG or GIF files are allowed');
							// throw new Error('Only JPG, PNG or GIF files are allowed');
							return;
						}
						// max 10 mB
						else if (!(file.size && file.size < 10485760)) {
							// file size > 1MB
							// alert('File '+ file.name +' is too big!!');
							// throw new Error('File is too big!!');
							return;
						}
					};

					// monitoring multiple uploads
					self.chainedMultipleUpload = function(requests, sizes){
						var deferred = $.Deferred();
						// get count requests
						var countRequest = requests.length;
						// looping upload
						var promises = requests.reduce(function(promise, request, _index){
							// get index
							var index = request.index;
							return promise.pipe(function(){
								// get elements
								var $imgIndex = $('#img-page-' + index);
								var $svgIndex = $('#svg-page-' + index);
								// get list element
								var $liImg = $imgIndex.parents('li');
								var $liSVG = $svgIndex.parents('li');
								// change upload view
								$liImg.switchClass('wait', 'upload', 0);
								$liSVG.switchClass('wait', 'upload', 0);
								// upload to resize
								return self.uploadFile({
									file  : request.blob,
									name  : 'bg-' + request.index,
									width : 403,
									height: 403,
									crop  : true
								}).pipe(function(response){
									console.log('response', index, response);
									// change bg image
									// $imgIndex.attr('src', response.dataURI);
									$svgIndex.find('image.background')[0].setAttribute('xlink:href',response.dataURI);
									// change generate view
									$liImg.switchClass('upload', 'generate', 0);
									$liSVG.switchClass('upload', 'generate', 0);
									// generate image
									return self.generateImage($svgIndex[0]).done(function(imgDataURI){
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

						// starting chain
						deferred.resolve();

						// return final promise
						return promises;
					};
					// upload to resize image
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
					self.generateImage = function(svg, el){
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
								var img = imgDataURI.replace(/^data:image\/(png|jpg);base64,/, "");
								deferred.resolve(img);
							}, 2000);
						};
						img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

						return deferred.promise();
					};
					// add to list
					self.addImgList = function(data){
						var $li  = '<li class="span3">'+
										'<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>'+
										'<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>'+
										'<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>'+
										'<div class="success"><i class="icon-ok icon-4x"></i></div>'+
										'<img id="'+ data.id +'" src="'+ data.imguri +'" />'+
									'</li>';
						$('#sidebar-right ul.img-list').append($li);
					};
					self.addSVGList = function($svg, callback){
						var $thumb = $('<div class="thumbnail border-none text-center"></div>').append($svg);
						var $li  = '<li class="span6">' +
										'<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>'+
										'<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>'+
										'<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>'+
										'<div class="success"><i class="icon-ok icon-4x"></i></div>'+
										$thumb.prop('outerHTML') +
									'</li>';
						$('#sidebar-right ul.svg-list').append($li);
						if(callback) callback();
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
							scope.conversation.template = template;
						});
						// change breadcumb active title
						var title = $link.data('title');
						$('nav > ul > li.active').text(title);
					});

					$('.collapse').live('hide', function() {
						$(this).parent().find('a').removeClass('open'); //remove active state to button on close
						// hide preview tpl
						// var imgTplClass = 'conversation-' + this.id;
						// var index = imgTplClass.match(/\d/)[0] - 1;
						// $('.' + imgTplClass, $editorTpl).removeClass('show');
						// $scope.conversation.template.list[index].show = false;
					});

					/* handler sidebar images */

					$('a.nav-sidebar').click(function() {
						var className = $(this).data('sidebar');
						$('input[name="' + className + '"]').click();
					});

					/* Initialize event listener */

					var $dropAreaBG = $('.drop', controller.sectionBg);

					// handling button add backgrounds
					controller.buttonBg.click(function() {
						$('#input-upload-backgrounds').click();
					});
					// event listener add backgrounds input file
					$('#input-upload-backgrounds').bind('change', function(evt){
						var selected   = $scope.conversation.template.selected;
						var tpl        = $scope.conversation.template.list[selected];
						console.log('selected', selected);
						$dropAreaBG.addClass('loading');
						controller.handleMultipleFiles(evt.target.files, tpl);
					});
					// drag n drop events
					$dropAreaBG
						// event drop 
						.bind('drop', function(evt){
							evt.stopPropagation();
							evt.preventDefault();

							$dropAreaBG.removeClass('over');
							$dropAreaBG.addClass('loading');

							// get files
							var original = evt.originalEvent,
								files    = original.dataTransfer.files;

							console.log('drop file', files);

							// get template
							var tpl = $scope.conversation.template;

							controller.handleMultipleFiles(files, tpl);
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

					/* Image reader */

					imageReader.init({
						inputFileEl   : '#input-logo',
						inputFileText : 'Select an image',
						section       : 'logo',
						compile       : function(buttonEl, changeEl, blob, image){

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
						var id = event.target.id.replace(/\d/,'');
						var max = bounds[id];
						var offset = $('#editor .template').offset();
						var y = ui.offset.top - offset.top;
						var x = ui.offset.left - offset.left;
						event.target.setAttribute('x', x >= max.x ? max.x : x);
						event.target.setAttribute('y', y >= max.y ? max.y : y);
					};
					var stopDragSVG = function(event, ui) {
						var id = event.target.id;
						var offset = $('#editor .template').offset();
						var y = ui.offset.top - offset.top;
						var x = ui.offset.left - offset.left;
						$scope.conversation[id].position = {x:x, y:y};
					};

					// event draggable
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