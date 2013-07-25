define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives, $, ui){
	directives.directive('feedCreator', function(imageReader, $compile){
		// Runs during compile
		return {
			restrict: 'EAC', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'app/views/components/feed-creator.html',
			replace: true,
			controller: function($scope, $element, $attrs, $transclude) {

				/* section : template */

				this.sectionTpl = $('#add-template');
				this.sectionBg  = $('#add-background');
				this.buttonTpl  = $('#btn-upload-template');
				this.buttonBg   = $('#btn-upload-backgrounds');

				$scope.bg = {
					type  : 0,
					radius: 0,
					crop  : true
				};
				$scope.isHiddenTpl = false;
				// scope watchers
				$scope.$watch('bg.radius', function(radius){
					$scope.bg.radius = radius;
				});
				// http://api.jqueryui.com/spinner/#entry-examples
				$("#spinner").spinner({
					min:0, max: 100,
					spin: function( event, ui ) {
						$scope.$apply(function(scope){
							scope.bg.radius = ui.value;
						});
					}
				});
				$scope.$watch('isHiddenTpl', function(isHidden){
					var opacity = isHidden ? 0.2 : 1;
					$('#preview-tpl > svg > image').css('opacity', opacity);
				});

				$scope.doNextStep = function(){
					console.log($scope);
					self.sectionTpl.removeClass('active').find('.editor').hide();
					self.sectionBg.addClass('active');
				};

				/* section : background */

				$scope.disableInputBG      = true;
				$scope.isDownloadDisabled  = true;
				$scope.finishedImages = 0;
				$scope.countImages    = 0;

				$scope.createNew = function(){
					self.sectionBg
						.removeClass('active ready')
						.find('ul.thumbnails')
						.each(function(){
							$(this).html('');
						});
					self.sectionTpl.addClass('active');
				};

				var self  = this;
				var index = 1;

				this.zip = new JSZip();

				// handle single file (template image)
				this.handleTplFile = function(file){
					// validation file image selected
					self.imageValidation(file);
					// file reader
					var fileReader = new FileReader();
					fileReader.onload = function(e){
						self.imageTpl = e.target.result;
						// set image svg template
						$('#preview-tpl > svg > image')[0].setAttribute('xlink:href', e.target.result);
						// show editor
						$('.editor', self.sectionTpl).show(500);
						// edit button text
						var btn = self.buttonTpl[0];
						btn.innerHTML = btn.innerHTML.replace(/add/i, 'Edit');
					};
					// read as data uri
					fileReader.readAsDataURL(file);
				};
				// handle multiple files (background images)
				this.handleMultipleFiles = function(files){
					var countFiles = files.length;
					var requests   = [];
					var sizes      = 0;
					// check image tpl is exists
					if( self.imageTpl === undefined ) return;
					// preparing page
					$('#add-background').addClass('prepare');
					// looping files
					angular.forEach(files, function(file,i){
						// validation file image selected
						self.imageValidation(file);
						// file reader
						var fileReader = new FileReader();
						fileReader.onload = (function(blob){
							return function(e){
								var rx = $scope.bg.radius;
								var svg    = SVG('canvas').size(403, 403);
								var rect   = svg.rect(403, 403).attr('rx', rx);
								var imgBG  = svg.image(e.target.result, 403, 403);
								var imgTpl = svg.image(self.imageTpl, 403, 403);
								// add svg id
								svg.attr('id', 'svg-page-' + index);
								imgBG.clipWith(rect);
								imgBG.attr({
									x:5,
									y:5,
									class: 'background'
								});
								// imgTpl.maskWith(imgBG);
								sizes += blob.size;
								requests.push({
									blob:blob,
									size:sizes,
									index:index
								});
								// add to list
								var callback = null;
								// do uploads, if is the last
								if(requests.length == countFiles) {
									callback = function(){
										console.info('start chainedMultipleUpload...');
										setTimeout(function() {
											$('#add-background').removeClass('prepare').addClass('ready');
											$scope.$apply(function(scope){
												scope.countImages = countFiles;
											});
											self.chainedMultipleUpload(requests, sizes).done(function(response){
												console.log(response);
												// generated zip 
												var DOMURL = window.URL || window.mozURL;
												var link   = DOMURL.createObjectURL(self.zip.generate({type:"blob"}));
												// set anchor link
												var aZip = document.getElementById('downloadZip');
												aZip.download = "images.zip";
												aZip.href     = link;
												// applying isGenerateDisabled to false
												$scope.$apply(function(scope){
													scope.isDownloadDisabled = false;
												});
												// update completed progress
												$('.progress').removeClass('progress-striped active').addClass('progress-success');
												$('.progress > .bar > span').html('<i class="icon-ok"></i> Completed');
											});
										}, 3000);
									};
								}
								// add to list
								self.addImgList({id:'img-page-'+index, imguri:e.target.result}, callback);
								self.addSVGList(svg.node, callback);
								// increase index
								index++;
							};
						})(file);
						// read as data uri
						fileReader.readAsDataURL(file);
					});
				};
				// image validation
				this.imageValidation = function(file){
					// validation file image selected
					if (!(file.type && file.type.match('image.*'))) {
						// file type is not allowed 
						alert('File '+ file.name +' is not image. Only JPG, PNG or GIF files are allowed');
						throw new Error('Only JPG, PNG or GIF files are allowed');
					}
					// max 10 mB
					else if (!(file.size && file.size < 10485760)) {
						// file size > 1MB
						alert('File '+ file.name +' is too big!!');
						throw new Error('File is too big!!');
					}
				};
				// add to list
				this.addImgList = function(data){
					var $li  = '<li class="span3 wait">'+
									'<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>'+
									'<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>'+
									'<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>'+
									'<img id="'+ data.id +'" src="'+ data.imguri +'" />'+
								'</li>';
					$('#add-background ul.img-list').append($li);
				};
				this.addSVGList = function(svg, callback){
					var $thumb = $('<div class="thumbnail border-none text-center"></div>').append($(svg).attr('style',''));
					var $li  = '<li class="span6 wait">' +
									'<div class="wait"><i class="icon-spinner icon-spin icon-large"></i> Waiting...</div>'+
									'<div class="upload"><i class="icon-spinner icon-spin icon-4x"></i> <span>Uploading..</span></div>'+
									'<div class="generate"><i class="icon-spinner icon-spin icon-4x"></i> <span>Generating..</span></div>'+
									$thumb.prop('outerHTML') +
								'</li>';
					$('#add-background ul.svg-list').append($li);
					if(callback) callback();
				};

				// monitoring multiple uploads
				this.chainedMultipleUpload = function(requests, sizes){
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
								crop  : $scope.bg.crop
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
										scope.finishedImages = index;
									});
									// remove generated view
									$liImg.removeClass('generate');
									$liSVG.removeClass('generate');
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
				this.uploadFile = function(data){
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
				this.generateImage = function(svg){
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
			},
			link: function($scope, iElm, iAttrs, controller) {

				/* template event listener */

				// button file
				controller.buttonTpl.click(function() {
					$('#input-upload-template').click();
				});
				// input file
				$('#input-upload-template').bind('change', function(evt){
					controller.handleTplFile(evt.target.files[0]);
				});
				var $dropAreaTpl = $('.drop-element', controller.sectionTpl);
				// drag n drop events
				$dropAreaTpl
					// event drop 
					.bind('drop', function(evt){
						evt.stopPropagation();
						evt.preventDefault();

						$dropAreaTpl.removeClass('over');

						var original = evt.originalEvent,
							file     = original.dataTransfer.files[0];

						console.log('drop file', file);

						controller.handleTplFile(file);
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
						$dropAreaTpl.addClass('over');
					})
					// event drag leave
					.bind('dragleave', function(evt) {
						evt.stopPropagation();
						evt.preventDefault();

						var target = evt.target;
						if ($(this).find(evt.target).length) {
							$dropAreaTpl.removeClass('over');
						}
					});

				/* backgrounds event listener */

				// button file
				controller.buttonBg.click(function() {
					$('#input-upload-backgrounds').click();
				});
				$('#input-upload-backgrounds').bind('change', function(evt){
					controller.handleMultipleFiles(evt.target.files);
				});
				// drag n drop events
				var $dropAreaBG = $('.drop-element-2', controller.sectionBg);
				$dropAreaBG
					// event drop 
					.bind('drop', function(evt){
						evt.stopPropagation();
						evt.preventDefault();

						$dropAreaTpl.removeClass('over');

						var original = evt.originalEvent,
							files    = original.dataTransfer.files;

						console.log('drop file', files);

						controller.handleMultipleFiles(files);
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
						$dropAreaTpl.addClass('over');
					})
					// event drag leave
					.bind('dragleave', function(evt) {
						evt.stopPropagation();
						evt.preventDefault();

						var target = evt.target;
						if ($(this).find(evt.target).length) {
							$dropAreaTpl.removeClass('over');
						}
					});
			}
		};
	});
});