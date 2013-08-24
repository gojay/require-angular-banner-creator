define([
	'controllers/controllers',
	'services/bannerService'
], function(controllers){
	controllers.controller('BannerController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$q', '$compile', 'imageReader', 'BannerImages', 'BannerConfig', 'BannerService', 'banners',
		function($rootScope, $scope, $route, $location, $timeout, $q, $compile, imageReader, BannerImages, BannerConfig, BannerService, banners){

			// banner dimensions
			var dimensions = BannerConfig.dimensions;
			// define jsZip
			var ZIP = new JSZip();
			// define isNew, copy banner
			var isNew = true, cBanner = false;

			// model banner templates n recents
			$scope.templates = banners.templates;
			$scope.banners   = banners.recents;

			// model banner
			if(banners.banner === null){
				$scope.banner            = BannerConfig.data;
				$scope.allowDownloadable = false;
			} else {
				isNew = false;
				$scope.banner = banners.banner;
				$scope.allowDownloadable = true;
				// copy the banner, to use same updated banner images 
				// or check has changed / edited
				cBanner = angular.copy($scope.banner);
			}

			console.log('templates', $scope.templates)
			console.log('recents', $scope.banners)
			console.log('detail is new ?', isNew, $scope.banner)

			/* ================ Handling Panel ================ */

			// set active panel left
			$('a.handler-left').switchClass('invisible', 'visible', 0);

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
			$rootScope.panel.left.model.selected = $scope.banner.ID;

			// panel handler
			var targetPanel;
			// bind/unbind panel handler
			$('.navbar-container a')
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
			$scope.detailBanner = function(index){
				var ID = $scope.banners[index].ID;
				var list = 'li#thumb-banner-'+index;

				// return, if it's selected
				if( $('.thumbnail', list).hasClass('selected') || ID == $scope.banner.ID) return false;

				// show loading
				$(list).block({
					overlayCSS: {
						backgroundColor: '#fff',
						opacity: 0.7
					},
					message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> Please wait..',
					css: {
						border: 'none',
						background: 'none',
						color: '#3685C6'
					}
				});

				// set loaded to false
				if($rootScope.pageService.loaded) $rootScope.pageService.loaded = false;
				$location.path('/facebook/banner/'+ ID);

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
						 	$('a.handler-'+targetPanel).click();
						}, 500);
						// unbind/clear the $watch()
						unbindWatch();
					}
				});
			};

			// get banner panel left
			var $panelLeft = '<div ng-include src="\'app/views/banner-panel-left.html\'"></div>';
			// bind panel left (rootScope), compile inject scope
			$rootScope.panel.left.template = $compile($panelLeft)($scope);

			$rootScope.setEqualHeight = function() {
				var si = setInterval(function(){
					var columns = $(".thumbnails > li")
					if( $(".thumbnails > li").length ){
						clearInterval(si);
						var tallestcolumn = 0;
						columns.each(
							function() {
								currentHeight = $(this).height();
								if (currentHeight > tallestcolumn) {
									tallestcolumn = currentHeight;
								}
							}
						);
						columns.height(tallestcolumn);
					} 
				});
			}

			/* ================ setting tabbable ================ */

			// set tab selected
			$('.tabbable > ul > li:eq('+ $scope.banner.selected +') > a').click();
			if( !isNew ){
				$timeout(function(){
					$('#doSetting').click();
					$rootScope.pageService.loaded = true;
				}, 100);
			}
			// set text breadcrumb
			// apply logo n prize image
			$('a[data-toggle="tab"]').on('shown', function (e) {
				var selected = $(e.target).data('tpl').match(/\d/)[0];
				var type     = parseInt($(e.target).data('type')) - 1;
				var prize    = $(e.target).data('price').match(/\d/)[0];
				var en       = ['one', 'two', 'three'][prize - 1];

				// applying banner images
				$scope.$apply(function(scope){
					scope.banner.selected = selected;
					// apply bg image n type
					if( selected <= 1 ) {
						scope.banner.background.image = (cBanner.selected == selected) ? cBanner.background.image : BannerImages.bg[0] ;
						scope.banner.background.type  = '1';
					} else if( selected == 3 ) {
						scope.banner.background.image = (cBanner.selected == selected) ? cBanner.background.image : BannerImages.bg[3] ;
						scope.banner.background.type  = '3';
					} else {
						scope.banner.background.image = (cBanner.selected == selected) ? cBanner.background.image : BannerImages.bg[1] ;
						scope.banner.background.type  = '2';
					}
					// logo n prize image (has prize only)
					if( selected != 0 ){
						scope.banner.logo.image        = (cBanner.selected == selected) ? cBanner.logo.image : BannerImages.logo[type];
						scope.banner.prize.one.image   = (cBanner.selected == selected) ? cBanner.prize.one.image : BannerImages.prize[en][type];
						scope.banner.prize.two.image   = (cBanner.selected == selected) ? cBanner.prize.two.image : BannerImages.prize[en][type];
						scope.banner.prize.three.image = (cBanner.selected == selected) ? cBanner.prize.three.image : BannerImages.prize[en][type];
					}
				});

				// set text breadcrumb
			  	var text = e.target.innerHTML;
			  	$('.breadcrumb > .active').text(text);
			});

			/* ================ scope watchers ================ */

			$scope.$watch('banner.mtitle.text', function(input){
				$scope.banner.mtitle.limit = $scope.banner.mtitle.counter - input.length;
				if($scope.banner.mtitle.limit <= 0) {
					$scope.banner.mtitle.limit = 0;
					$scope.banner.mtitle.text = $scope.banner.mtitle.text.substring(0, $scope.banner.mtitle.text.counter);
				}
			});
			$scope.$watch('banner.mdescription.text', function(input){
				$scope.banner.mdescription.limit = $scope.banner.mdescription.counter - input.length;
				if($scope.banner.mdescription.limit <= 0) {
					$scope.banner.mdescription.limit = 0;
					$scope.banner.mdescription.text = $scope.banner.mdescription.text.substring(0, $scope.banner.mdescription.text.counter);
				}
			});
			$scope.$watch('banner.prize.title', function(input){
				$scope.banner.prize.title = input;
			});
			$scope.$watch('banner.prize.one.text', function(input){
				$scope.banner.prize.one.counter = $scope.banner.prize.one.limit - input.length;
				if($scope.banner.prize.one.counter <= 0) {
					$scope.banner.prize.one.counter = 0;
					$scope.banner.prize.one.text = $scope.banner.prize.one.text.substring(0, $scope.banner.prize.one.limit);
				}
			});
			$scope.$watch('banner.prize.two.text', function(input){
				$scope.banner.prize.two.counter = $scope.banner.prize.two.limit - input.length;
				if($scope.banner.prize.two.counter <= 0) {
					$scope.banner.prize.two.counter = 0;
					$scope.banner.prize.two.text = $scope.banner.prize.two.text.substring(0, $scope.banner.prize.two.limit);
				}
			});
			$scope.$watch('banner.prize.three.text', function(input){
				$scope.banner.prize.three.counter = $scope.banner.prize.three.limit - input.length;
				if($scope.banner.prize.three.counter <= 0) {
					$scope.banner.prize.three.counter = 0;
					$scope.banner.prize.three.text = $scope.banner.prize.three.text.substring(0, $scope.banner.prize.three.limit);
				}
			});

			// bind cancel template
			$('#templates').bind('cancelTemplate', function(e){
				$(this).fadeOut(400, function(){
					$(this).hide();
					$('.tab-content').hide();
					$('#doSetting').removeClass('overwrite').html('<i class="icon-list"></i> Choose Template');
					$('#cancelTpl').hide();
					$('#settings').show();
					$('#svg-editor').show();
				});
			});

			/* ================ scope listeners ================ */

			$scope.setBG = function(type, evt){
				var $el     = $(evt.target),
					$parent = $el.parent();
				$('.btn', $parent).each(function(){ $(this).removeClass('active') });
				$el.addClass('active');
				
				var tplType = $scope.banner.background.type;
				console.log('tplType', tplType)
				if(type == 'upload') {
					$scope.banner.background.image  = BannerImages.bg[tplType-1];
					$scope.banner.background.enable = true;
				} else {
					$scope.banner.background.image  = $scope.templates[tplType][type];
					$scope.banner.background.enable = false;
				}

				$scope.banner.background.set = type;
			};

			$scope.doSetting = function($event){
				var $btnTemplate     = $($event.currentTarget);
				var $btnCancel       = $btnTemplate.next();
				var $templateField   = $('#templates');
				var $settingField    = $('#settings');
				var $contentField    = $('#banner-editor .tab-content');
				var $displayTplField = $('#banner-editor #display-tpl');
				var $svgEditor       = $('#svg-editor');
				var $actEditor       = $('#action-editor');
				var $liActive        = $('ul > li.active > a', $templateField);
				var pricesInBottom   = $liActive.data('priceBottom');
				var tplDimension     = $liActive.data('tpl');
				var tplShowPrice     = $scope.tplShowPrice = $liActive.data('price').match(/(\d)/)[0];

				var settings = {
					field : {
						template   : $templateField,
						setting    : $settingField,
						displayTpl : $displayTplField,
						content    : $contentField
					},
					btn: {
						template : $btnTemplate,
						cancel   : $btnCancel
					},
					editor : {
						svg    : $svgEditor,
						action : $actEditor
					},
					attributes : {
						tplDimension    : tplDimension,
						pricesInBottom  : pricesInBottom,
						tplShowPrice    : tplShowPrice
					}
				};

				// alert overwrite
				if($btnTemplate.hasClass('overwrite')){
					$('#popup-overwrite').bind('overwrite', function(){
						var self = this;
						$('.blockOverlay').click();
						bannerSetting(settings, true);
					});
					// show message
					$.blockUI({
						message: $('#popup-overwrite'),
						css: {
							background : 'transparent',
							border     : 'none',
							top        : ($(window).height() - 479) / 2 + 'px',
							left       : ($(window).width() - 649) / 2 + 'px',
							width      : '649px'
						}
					});
					$('.blockOverlay').attr('title','Click to cancel').click($.unblockUI);

					return;
				}
				// return to the templates
				if($templateField.is(':hidden')){
					$templateField.show(400, function(){
						$btnCancel.show();
						$btnTemplate.addClass('overwrite').html('<i class="icon-cog"></i> Settings');
						$contentField.show();
						$settingField.hide();
						$displayTplField.hide();
						$svgEditor.hide();
						$actEditor.hide();
					});
					return;
				}

				$timeout(function(){
					console.info('click bg-' + $scope.banner.background.set)
					$('#Background .bg-' + $scope.banner.background.set).click();
				}, 400);

				bannerSetting(settings, false);
			};

			$scope.overwiriteTplYes = function(co){
				$('#popup-overwrite').trigger('overwrite');
			};
			$scope.overwiriteTplNo = function(evt){
				$('.blockOverlay').click();
				$('#templates').trigger('cancelTemplate');
			};

			$scope.cancelTemplate = function($event){
				$('#templates').trigger('cancelTemplate');
			};

			$scope.hideLogo = function(event){
				var $chHide = $(event.currentTarget);
				
				$scope.banner.logo.hide = !$scope.banner.logo.hide;

				$('#svg-editor > svg').each(function(i,e){
					var $logo = $(e).find('#logo').eq(0);
					console.log($logo);
					if($chHide.is(":checked")){
						$logo.hide();
						$chHide.parents('.accordion-inner').children().each(function(x,z){
							if(x > 0){
								$(z).hide('slow');
							}
						});
					} else {
						$logo.show();
						$chHide.parents('.accordion-inner').children().each(function(x,z){
							if(x > 0){
								$(z).show('slow');
							}
						});
					}
				});
			};

			$scope.addWhitePlaceholder = function(event){
				var $placeholder = $(event.currentTarget);
				var $rect = $('#svg-editor > svg > #logo > rect');
				if($placeholder.is(":checked")){
					$rect.attr('fill', 'white');
				} else {
					$rect.attr('fill', 'transparent');
				}
			};

			var bannerSetting = function( options, overwrite ){
				var $tpl          = options.field.template;
				var $settingField = options.field.setting;
				var $tplContent   = options.field.content;
				var $displayTpl   = options.field.displayTpl;
				var $btnTemplate  = options.btn.template;
				var $btnCancel    = options.btn.cancel;
				var $editorSVG    = options.editor.svg;
				var $editorAction = options.editor.action;
				var tplDimension  = options.attributes.tplDimension;
				var pricesInBottom = options.attributes.pricesInBottom;
				var tplShowPrice  = options.attributes.tplShowPrice;

				console.log('settings', options);
				// tooltip
				$('a').tooltip();

				if( overwrite ){
					// remove class overwrite
					$btnTemplate.removeClass('overwrite');
					// clear all setting input file
					$('input[type="file"]', $settingField).each(function(e,i){
						$(this).val('');
					});
				}

				// canvas dimensions
				var canvasDimensions    = dimensions[tplDimension];
				var logoDimension       = canvasDimensions['logo'];
				var backgroundDimension = canvasDimensions['background'];
				var priceDimension      = canvasDimensions['prize'];

				// compile SVG (inject scope)
				var tplIndex = tplDimension.match(/(\d)/)[0];
				var $svg = getSVGCompiled($tplContent, 'like', tplIndex);
				var $svg2 = getSVGCompiled($tplContent, 'enter', tplIndex);
				$tpl.hide(400, function(){
					$(this).hide();
					$tplContent.hide();
					$btnCancel.hide();
					$btnTemplate.html('<i class="icon-list"></i> Choose Template');

					$settingField.show(400,function(){
						$displayTpl.show();
						// clear editor
						$editorSVG.html('');
						// append svg
						$editorSVG.append($svg);
						$editorSVG.append($svg2);
						// create input hidden to set canvas dimensions
						// will be used to image conversion
						var inputCanvas = document.createElement("input");
						inputCanvas.setAttribute("type", "hidden");
						inputCanvas.setAttribute("name", "canvasDimensions");
						inputCanvas.setAttribute("value", JSON.stringify(backgroundDimension));
						// append canvas
						$editorSVG.append(inputCanvas);
						// set height drop background same as canvas dimension
						$('#drop-background').css('height', backgroundDimension.height + 'px');

						// show editor
						if($editorSVG.is(':hidden')) $editorSVG.show();
						/* initialize image reader */
						// background
						imageReader.init({
							buttonClass   : 'btn-success',
							dropArea      : '#drop-background',
							inputFileEl   : '#input-background',
							inputFileText : 'Select an image',
							section       : 'background',
							compile       : function(buttonEl, changeEl, blob, image){
								console.log('changeEl', changeEl);

								var labelEl = $(buttonEl).parent().siblings('label')[0];
								if((image.width <= backgroundDimension.width && image.height <= backgroundDimension.height) ){
									// change the button text to 'Edit'
									labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');
									// re-compile to injecting scope
									for(var i in changeEl){
										changeEl[i].setAttribute('xlink:href',image.src);
										changeEl[i].setAttribute('width', image.width);
										changeEl[i].setAttribute('height', image.height);
									}
									return;
								}

								// define crop selection
								var cropSelection = {};
								// create temporary image for cropping
								image.setAttribute('id', 'temp-crop-image hide');
								// append to body
								document.querySelector('body').appendChild(image);
								var $tempImg = $(image);
								// calculating crop center
								var x1 = parseInt((image.width - backgroundDimension.width) / 2);
								var y1 = parseInt((image.height - backgroundDimension.height) / 2);
								var pos = {
									x1 : x1,
									y1 : y1,
									x2 : parseInt(x1 + backgroundDimension.width),
									y2 : parseInt(y1 + backgroundDimension.height)
								};
								// show crop popup
								$.blockUI({
									message   : $tempImg,
									overlayCSS:{
										cursor : 'default'
									},
									css: {
										cursor : 'default',
										border : 'none',
										top    : ($(window).height() - image.height) / 2 + 'px',
										left   : ($(window).width() - image.width) / 2 + 'px',
										width  : image.width + 'px'
									},
									onBlock: function(){
										$tempImg.imgAreaSelect({
											x1 : pos.x1,
											y1 : pos.y1,
											x2 : pos.x2,
											y2 : pos.y2,
											resizable : false,
											handles   : true,
											fadeSpeed : 200,
											onInit    : function(img, selection){
												console.log('imgAreaSelect init', 'x', -selection.x1, 'y', -selection.y1);
												// set cropSelection
												cropSelection = selection;
												var $handle = $('.imgareaselect-handle').parent();
												$handle.parent().append($compile('<div id="crop-wrapper"><button class="btn" ng-click="cropHandle(\'crop\')"><i class="icon-crop"></i> Crop</button><button class="btn btn-primary" ng-click="cropHandle(\'ratio\')"><i class="icon-resize-full"></i> Aspect Ratio</button><button class="btn btn-success" ng-click="cropHandle(\'fit\')"><i class="icon-fullscreen"></i> Auto Fit</button><button class="btn btn-danger" ng-click="cropHandle(\'cancel\')">Cancel</button></div>')($scope));
											},
											onSelectStart : function(){
												console.log('imgAreaSelect start');
											},
											onSelectChange : function(img, selection){
												if(!selection.width || !selection.height) return;
												console.log('imgAreaSelect change', 'x', -selection.x1, 'y', -selection.y1);
											},
											onSelectEnd : function(img, selection){
												console.log('imgAreaSelect end');
												// set cropSelection
												cropSelection = selection;
											}
										});
									}
								});
								$scope.cropHandle = function(act){
									// remove imgAreaSelect
									$tempImg.imgAreaSelect({remove:true});
									$.unblockUI({
										onUnblock: function() {
											$tempImg.remove();
											$('#crop-wrapper').remove();
											// change the button text to 'Edit'
											labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');
											// crop
											if(act == 'crop'){
												// change image src, dimension n position
												for(var i in changeEl){
													changeEl[i].setAttribute('xlink:href',image.src);
													changeEl[i].setAttribute('width', image.width);
													changeEl[i].setAttribute('height', image.height);
													changeEl[i].setAttribute('x', -Math.abs(cropSelection.x1));
													changeEl[i].setAttribute('y', -Math.abs(cropSelection.y1));
												}
												// background reposition
												$editorAction.show();
												$('body').trigger('bgReposition', {
													svg            : $svg,
													imageBG        : changeEl,
													pricesInBottom : pricesInBottom,
													dimension      : backgroundDimension
												});
											}
											// aspect ratio
											else if(act == 'ratio'){
												// change image src only
												for(var i in changeEl){
													changeEl[i].setAttribute('xlink:href',image.src);
												}
											}
											// auto fit
											else if(act == 'fit'){
												$.blockUI({ 
													message: '<i class="icon-spinner icon-spin icon-large"></i> Please wait...',
													css: {
														border: '1px solid #007dbc'
													}
												});
												// do upload
												uploadFile({
													file  : blob,
													name  : 'background',
													width : backgroundDimension.width,
													height: backgroundDimension.height,
													crop  : false
												}).success(function(response){
													console.log('response:upload background fit', response);
													$scope.$apply(function(scope){
														scope.banner.background.uploaded = true;
														scope.banner.background.image = response.dataURI;
													});
													// console.log('changeEl', changeEl);
													// for(var i in changeEl){
													// 	changeEl[i].setAttribute('xlink:href',response.dataURI);
													// }
													$.unblockUI();
												});
											}
										}
									});
								};
							}
						});
						// logo
						imageReader.init({
							buttonClass   : 'btn-success',
							dropArea      : '#drop-logo',
							inputFileEl   : '#input-logo',
							inputFileText : 'Select an image',
							section       : 'logo',
							compile       : function(buttonEl, changeEl, blob, image){
								// change text label input file
								var labelEl = $(buttonEl).parent().siblings('label')[0];
								// change the button text to 'Edit'
								labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');

								$.blockUI({
									message: '<i class="icon-spinner icon-spin icon-large"></i> Please wait...',
									css: {
										border: '1px solid #007dbc'
									}
								});
								// upload to resize
								uploadFile({
									file  : blob,
									name  : 'logo',
									width : logoDimension.image.width,
									height: logoDimension.image.height,
									crop  : false
								}).success(function(response){
									console.log('response:upload logo', response);
									// change image src only
									angular.forEach(changeEl, function(e,i){
										var logo = {
											parent : $(e).parent(),
											holder : $(e).prev()[0],
											image  : e
										};
										// inject logo holder (padding 20)
										// logo.holder.setAttribute('width','{{getWH()}}');
										// logo.holder.setAttribute('height','{{getHH()}}');
										// inject logo image
										// logo.image.setAttribute('xlink:href',response.dataURI);
										$scope.$apply(function(scope){
											scope.banner.logo.uploaded = true;
											scope.banner.logo.image = response.dataURI;
										});
										logo.image.setAttribute('width','{{banner.logo.w}}');
										logo.image.setAttribute('height','{{banner.logo.h}}');
										logo.image.setAttribute('x','{{banner.logo.x}}');
										logo.image.setAttribute('y','{{banner.logo.y}}');
										// remove old logo image n holder
										logo.parent.html('');
										// append new logo image n holder with inject scope
										// logo.parent.append($compile(logo.holder)($scope));
										logo.parent.append(logo.holder);
										logo.parent.append($compile(logo.image)($scope));
									});

									// applying scope
									$scope.$apply(function(scope){
										scope.banner.logo.w = logoDimension.image.width;
										scope.banner.logo.h = logoDimension.image.height;
										scope.banner.logo.x = logoDimension.pos.image.x;
										scope.banner.logo.y = logoDimension.pos.image.y;
										console.log('scope', scope);
										// calculate image position (center)
										// calculate aspect ratio image height
										scope.$watch('banner.logo.w', function(input) {
											if(parseInt(input) <= logoDimension.image.width){
												// dimension
												var ratio = [input / logoDimension.image.width, logoDimension.image.height / logoDimension.image.height];
												var aspectRatio = Math.min(ratio[0], ratio[1]);
												scope.banner.logo.h = parseInt(logoDimension.image.height * aspectRatio);
												// position
												var dx = (logoDimension.image.width + 10) - parseInt(input);
												var dy = (logoDimension.image.height + 10) - parseInt(scope.banner.logo.h);
												var x = (dx <= 0) ? scope.banner.logo.x : (dx / 2) + logoDimension.pos.placeholder.x;
												scope.banner.logo.x = (tplIndex == 3) ? x + 20 : x ;
												scope.banner.logo.y = (dy <= 0) ? scope.banner.logo.y : (dy / 2) + logoDimension.pos.placeholder.y;
											}
											else {
												scope.banner.logo.w = logoDimension.image.width;
												scope.banner.logo.h = logoDimension.image.height;
											}
										});
									});
									$.unblockUI();
								});
							}
						});

						// empty prize
						if(priceDimension === undefined) return;

						// callback price compile
						var priceCompile = function(buttonEl, changeEl, blob, image, index){
							var labelEl = $(buttonEl).parent().siblings('label')[0];
							// auto strecth, if image dimension less than background dimension
							if(image.width <= backgroundDimension.width && image.height <= backgroundDimension.height)
							{
								// change label text
								labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');
								// re-compile to injecting scope
								angular.forEach(changeEl, function(e,i){
									e.setAttribute('xlink:href',image.src);
								});
								return;
							}
							// define crop selection
							var cropSelection = {};
							// create temporary image for cropping
							image.setAttribute('id', 'temp-crop-image');
							// append to body
							document.querySelector('body').appendChild(image);
							var $tempImg = $(image);
							// calculating crop center
							var x1 = parseInt((image.width - priceDimension.width) / 2);
							var y1 = parseInt((image.height - priceDimension.height) / 2);
							var pos = {
								x1 : x1,
								y1 : y1,
								x2 : parseInt(x1 + priceDimension.width),
								y2 : parseInt(y1 + priceDimension.height)
							};
							// show crop popup
							$.blockUI({
								message   : $tempImg,
								overlayCSS:{
									cursor : 'default'
								},
								css: {
									cursor : 'default',
									border : 'none',
									top    : ($(window).height() - image.height) / 2 + 'px',
									left   : ($(window).width() - image.width) / 2 + 'px',
									width  : image.width + 'px'
								},
								onBlock: function(){
									$tempImg.imgAreaSelect({
										x1 : pos.x1,
										y1 : pos.y1,
										x2 : pos.x2,
										y2 : pos.y2,
										resizable : false,
										handles   : true,
										fadeSpeed : 200,
										onInit    : function(img, selection){
											console.log('imgAreaSelect init', 'x', -selection.x1, 'y', -selection.y1);
											// set cropSelection
											cropSelection = selection;
											var $handle = $('.imgareaselect-handle').parent();
											$handle.parent().append($compile('<div id="crop-wrapper"><button class="btn" ng-click="cropHandle(\'crop\')"><i class="icon-crop"></i> Crop</button><button class="btn btn-primary" ng-click="cropHandle(\'ratio\')"><i class="icon-resize-full"></i> Aspect Ratio</button><button class="btn btn-success" ng-click="cropHandle(\'fit\')"><i class="icon-fullscreen"></i> Auto Fit</button><button class="btn btn-danger" ng-click="cropHandle(\'cancel\')">Cancel</button></div>')($scope));
										},
										onSelectStart : function(){
											console.log('imgAreaSelect start');
										},
										onSelectChange : function(img, selection){
											if(!selection.width || !selection.height) return;
											console.log('imgAreaSelect change', 'x', -selection.x1, 'y', -selection.y1);
										},
										onSelectEnd : function(img, selection){
											console.log('imgAreaSelect end');
											// set cropSelection
											cropSelection = selection;
										}
									});
								}
							});
							$scope.cropHandle = function(act){
								$tempImg.imgAreaSelect({remove:true});
								$.unblockUI({
									onUnblock: function() {
										$tempImg.remove();
										$('#crop-wrapper').remove();
										// change the button text to 'Edit'
										labelEl.innerHTML = labelEl.innerHTML.replace(/upload/i, 'Edit');
										// crop
										if(act == 'crop'){
											// change image src, dimension n position
											for(var i in changeEl){
												changeEl[i].setAttribute('xlink:href',image.src);
												changeEl[i].setAttribute('width', image.width);
												changeEl[i].setAttribute('height', image.height);
												changeEl[i].setAttribute('x', -Math.abs(cropSelection.x1));
												changeEl[i].setAttribute('y', -Math.abs(cropSelection.y1));
											}
										}
										// ascpect ratio
										else if(act == 'ratio'){
											// change image src only
											for(var j in changeEl){
												changeEl[j].setAttribute('xlink:href',image.src);
											}
										}
										// auto fit
										else if(act == 'fit'){
											$.blockUI({
												message: '<i class="icon-spinner icon-spin icon-large"></i> Please wait...',
												css: {
													border: '1px solid #007dbc'
												}
											});
											// get prize index, for image name
											var prizeIndex = parseInt(index[0]);
											var en = ['one', 'two', 'three'][prizeIndex-1];
											// upload
											uploadFile({
												file  : blob,
												name  : 'prize-' + prizeIndex,
												width : priceDimension.width,
												height: priceDimension.height,
												crop  : false
											}).success(function(response){
												console.log('response:upload prize fit', response);
												console.log('en', en);
												$scope.$apply(function(scope){
													scope.banner.prize[en].uploaded = true;
													scope.banner.prize[en].image = response.dataURI;
												});
												// for(var j in changeEl){
												// 	changeEl[j].setAttribute('xlink:href',response.dataURI);
												// }
												$.unblockUI();
											});
										}
									}
								});
							};
						};
						// prizes
						imageReader.init({
							buttonClass   : 'btn-success',
							dropArea      : '#drop-price-1',
							inputFileEl   : '#input-price-1',
							inputFileText : 'Select an image',
							section       : 'price-1',
							compile       : priceCompile
						});
						imageReader.init({
							buttonClass   : 'btn-success',
							dropArea      : '#drop-area',
							inputFileEl   : '#input-price-2',
							inputFileText : 'Select an image',
							section       : 'price-2',
							compile       : priceCompile
						});
						imageReader.init({
							buttonClass   : 'btn-success',
							dropArea      : '#drop-area',
							inputFileEl   : '#input-price-3',
							inputFileText : 'Select an image',
							section       : 'price-3',
							compile       : priceCompile
						});
					});
				});
			};

			var getSVGCompiled = function ($tplContent, type, tplIndex){
				var $svg = $('.active > svg', $tplContent).clone();
				$svg.attr('id', 'svg-editor-'+type);
				$('#pattern', $svg).children().map(function(i,e){
					$(e).attr('id', function(index, id){
						return id.replace(/(\d+)/, function(fullMatch, n) {
							return 'editor-'+type;
						});
					});
				});
				$('#pattern image', $svg).attr('xlink:href', '{{banner.background.image}}');

				$('#shadow', $svg).children().map(function(i,e){
					$(e).attr('id', function(index, id){
						return id.replace(/(\d+)/, function(fullMatch, n) {
							return 'editor';
						});
					});
				});
				$('#background', $svg).children().map(function(i,e){
					if($(e).attr('fill') !== undefined) {
						$(e).attr('fill', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+type;
							});
						});
					}
					else if(i == 1) {
						if(type == 'enter') {
							$(e).remove();
							return;
						}

						e.setAttribute('width', '{{banner.fb.w}}');
						e.setAttribute('height', '{{banner.fb.h}}');
						e.setAttribute('x', '{{getX()}}');
						// compile banner fb 
						$scope.banner.fb = {
							w:283,
							h:67
						};
						$scope.$watch('banner.fb.w', function(input){
							var ratio = [input / 283, 67 / 67];
							var aspectRatio = Math.min(ratio[0], ratio[1]);
							$scope.banner.fb.h = parseInt(67 * aspectRatio);
						});
						$scope.getX = function(){
							var calc = 810 - $scope.banner.fb.w;
							return tplIndex == 3 ? calc - 20 : calc ;
						}
					}
				});
				$('#logo', $svg).children().map(function(i,e){
					if($(e).attr('id') !== undefined) {
						$(e).attr('id', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+type;
							});
						}).attr('xlink:href', '{{banner.logo.image}}');
					} else if($(e).attr('filter') !== undefined) {
						$(e).attr('filter', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor';
							});
						});
					}
					else return;
				});

				// has prize
				if( $('#price', $svg).length )
				{
					var _index = 1;
					$('#price', $svg).children().map(function(i,e){
						if($(e).attr('id') === undefined) return;
						/* 
						var x = [586,542,345,96,168,198];
						if(type == 'enter') {
							var x = [586,542,345,96,168,198];
							$('#price > text > tspan', $svg).text('Enter to Win!');
							$('#price > text > tspan', $svg).attr('x', x[tplIndex-1]);
						}
						*/
						if(type == 'enter') {
							$('#price .prize-description', $svg).text('Enter to Win!');
						}

						var en = ['one', 'two', 'three'][_index];
						$(e).attr('id', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+ type + '-' + _index;
							});
						});

						_index++;
					});

					// prize images
					if($('svg:eq(0)', $svg).length) $('svg:eq(0) > image', $svg).attr('xlink:href', '{{banner.prize.one.image}}').attr('data-en', 'one');
					if($('svg:eq(1)', $svg).length) $('svg:eq(1) > image', $svg).attr('xlink:href', '{{banner.prize.two.image}}').attr('data-en', 'two');
					if($('svg:eq(2)', $svg).length) $('svg:eq(2) > image', $svg).attr('xlink:href', '{{banner.prize.three.image}}').attr('data-en', 'three');
				}

				return $compile($svg)($scope);
			};

			/**
			 * convert SVG to Image
			 * there are some issues, and only work on firefox
			 */
			var svgToImage = function(svg, callback){
				var svg_xml = (new XMLSerializer()).serializeToString(svg);
				var canvas  = document.createElement('canvas');
				// get canvas context
				var ctx = canvas.getContext("2d");
				var img = new Image();
				img.onload = function(){
					canvas.width  = img.width;
					canvas.height = img.height;
					ctx.drawImage(img, 0, 0);
					var imgDataURI = canvas.toDataURL('image/jpeg');
					callback(img, imgDataURI);
				};
				img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent( svg_xml )));
			};

			/**
			 * convert data URI to Blob
			 */
			var dataURItoBlob = function(dataURI) {
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

			/**
			 * converting SVG's then add into Zip
			 * and also upload the screenshot (SVG LIKE)
			 */
			$scope.generate = function( isSaved ){
				// open loading popup
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

				var $progress = $('#popup-loading-img > .generate-progress');

				// define SVG
				$('#svg-editor > svg').each(function(){ $(this).show(); });
				var svg_like  = $('#svg-editor > svg').eq(0)[0];
				var svg_enter = $('#svg-editor > svg').eq(1)[0];

				$progress.text('Generating banner like...');
				// convert image svg like, then upload the screenshot
				svgToImage(svg_like, function(imgLike, imgDataURILike){

					/* upload banner like */

					// convert data URI to blob (banner like as screenshot/preview)
					var blobLike = dataURItoBlob(imgDataURILike);

					console.log('blob banner like', blobLike);
					console.info('start uploading banner like screenshot..');
				
					$progress.text('Uploading banner like...');

					// do upload banner like
					uploadFile({
						file  : blobLike,
						name  : 'banner-like',
						width : 'original',
						height: 'original',
						crop  : false
					}).success(function(response){
						var imgPreview = response.url;
						
						$progress.text('Generating banner enter...');

						// create canvas banner enter
						svgToImage(svg_enter, function(imgEnter, imgDataURIEnter){
							
							/* upload banner enter */

							// convert data URI to blob
							var blobEnter = dataURItoBlob(imgDataURIEnter);

							console.log('blob banner enter', blobEnter);
							console.info('start uploading banner enter screenshot..');

							$progress.text('Uploading banner enter...');

							// do upload banner enter
							uploadFile({
								file  : blobEnter,
								name  : 'banner-enter',
								width : 'original',
								height: 'original',
								crop  : false
							}).success(function(response){
								console.log('response banner enter', response);
								
								// applying scope
								$scope.$apply(function(scope){ 
									scope.allowDownloadable = true;       // enable download
									scope.banner.preview    = imgPreview; // set banner like as image preview
									// set title n same as meta title & description
									scope.banner.title       = $scope.banner.mtitle.text;
									scope.banner.description = $scope.banner.mdescription.text;
								});
							
								$progress.text('Adding banner images into ZIP...');

								/* add banner images to zip */

								// get base64 data URI
								var imgURILike  = imgDataURILike.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
								var imgURIEnter = imgDataURIEnter.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
								// create folder n add image files into folder
								var imgFolder = ZIP.folder('banner-'+$scope.banner.ID);
								imgFolder.file('banner_like.jpg', imgURILike, {base64: true});
								imgFolder.file('banner_enter.jpg', imgURIEnter, {base64: true});

								// generate template modal n show
								// generate ZIP file
								var generateCallback = showModalNgenerateZIP({
									el : {
										like  : imgLike,
										enter : imgEnter
									},
									uri : {
										like  : imgDataURILike,
										enter : imgURIEnter
									}
								}, function(){
									// close loading popup
									$timeout(function() {
										$progress.text('');
										$.unblockUI({
											onUnblock: function() {
												// show generated popup without backdrop (bootstrap)
												$('#popup-result-generate-image-modal')
													.modal({
														backdrop: false,
														show: true
													});
											}
										});
									}, 1000);
								});

								if( isSaved ){
									console.info('do Save');
									$progress.text('Saving configuration...');
									doSave( generateCallback );
								} else {
									console.info('generate only');
									generateCallback;
								}
								
							});
						});
						
					});
				});
			};

			var showModalNgenerateZIP = function( data, callback ){
				// create anchor banner like download 
				var downloadLinkLike       = document.createElement('a');
				downloadLinkLike.title     = 'Download Banner Like';
				downloadLinkLike.href      = data.uri.like;
				downloadLinkLike.target    = '_blank';
				downloadLinkLike.className = 'btn btn-success';
				downloadLinkLike.innerHTML = '<i class="icon-download-alt"></i> Download Banner Like';
				downloadLinkLike.download  = 'banner-like-'+ $scope.banner.ID +'.jpg';
				// create anchor banner enter download
				var downloadLinkEnter       = document.createElement('a');
				downloadLinkEnter.title     = 'Download Banner Enter';
				downloadLinkEnter.href      = data.uri.enter;
				downloadLinkEnter.target    = '_blank';
				downloadLinkEnter.className = 'btn btn-success';
				downloadLinkEnter.innerHTML = '<i class="icon-download-alt"></i> Download Banner Enter';
				downloadLinkEnter.download  = 'banner-enter-'+ $scope.banner.ID +'.jpg';

				// set image class
				var el = data.el;
				el.like.className  = 'span12';
				el.enter.className = 'span12';
				// define generate element
				var $generate     = $('#popup-result-generate-image-modal');
				var $generateBody = $generate.find('.modal-body');
				// create template banner list
				var tplImages = '<li class="span6 banner-like">' +
									'<div class="thumbnail">' + el.like.outerHTML +
										'<div class="caption">' +
											'<h3>Banner Like</h3>' +
											'<p>This is banner like description</p>'+
											'<p>'+ downloadLinkLike.outerHTML +'</p>' +
										'</div>' +
									'</div>' +
								'</li>'+
								'<li class="span6 banner-like">' +
									'<div class="thumbnail">' + el.enter.outerHTML +
										'<div class="caption">' +
											'<h3>Banner Enter</h3>' +
											'<p>This is banner enter description</p>'+
											'<p>'+ downloadLinkEnter.outerHTML +'</p>' +
										'</div>' +
									'</div>' +
								'</li>';
				// append banner images
				$('#preview > ul', $generateBody)
					.html('')
					.append(tplImages);
				// generate zip link
				var DOMURL = window.URL || window.mozURL;
				var downloadlink = DOMURL.createObjectURL(ZIP.generate({type:"blob"}));

				// var content = ZIP.generate();

				// get zipe selement n set attribute
				var zipEl      = $generate.find('.download-zip')[0];
				zipEl.download = 'banner-'+ $scope.banner.ID +'.zip';
				// zipEl.href     = "data:application/zip;base64," + content;
				zipEl.href     = downloadlink;

				console.info('finished adding the images into zip');

				if( callback ) callback();
			};

			var uploadFile = function(data){
				console.log(data);
				// create form data
				var formData = new FormData();
				formData.append('file', data.file);
				formData.append('id', $scope.banner.ID);
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

			$scope.save = function(e){
				var $form = $(e.target).parents('form');
				console.log('SAVE:form data', $scope.banner);
				doSave();
			};

			var doSave = function(callback){
				var banner = new BannerService($scope.banner);
				if( isNew ){
					banner.$save(function(response){
						console.log('Save response', response);
						isNew = false;
						if(callback) callback(true);
					});
				} else {
					var bannerId = ($route.current.params.bannerId) ? $route.current.params.bannerId : $scope.banner.ID ;
					banner.$update({id : bannerId}, function(response){
						console.log('Update response', response);
						if(callback) callback(false);
					});
				}
			}
		}
	]);
});