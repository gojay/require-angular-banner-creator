define([
	'controllers/controllers',
	'services/bannerService',
	'jquery',
	'jqueryui'
], function(controllers){
	controllers.controller('BannerController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$q', '$compile', 'imageReader', 'BannerImages', 'BannerConfig', 'BannerService', 'authResource', 'banners',
		function($rootScope, $scope, $route, $location, $timeout, $q, $compile, imageReader, BannerImages, BannerConfig, BannerService, authResource, banners){
			var self = this;
			// banner dimensions
			var dimensions = BannerConfig.dimensions;
			// define jsZip
			var ZIP = new JSZip();
			// define isNew, copy banner
			var isNew = $scope.isNew = true, 
				cBanner = false;

			console.group();
			console.log('banners', banners);

			self.onbeforeunloadNeeded = true;

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

			// model banner templates n recents
			$scope.fb        = banners.templates.fb;
			$scope.templates = banners.templates.tpl;
			$scope.banners   = banners.recents;

			// model banner
			if(banners.banner === null){
				$scope.banner 	 = angular.copy(BannerConfig.data);
				// $scope.banner.ID = new Date().getTime();
				$scope.banner.ID = banners.ID;
				$scope.allowDownloadable = false;
			} else {
				isNew = $scope.isNew = false;
				$scope.banner = banners.banner;
				$scope.allowDownloadable = true;
				if( $scope.banner.background.overlay === undefined ){
					$scope.banner.background['overlay'] = true;
				}
				// copy the banner, to use same updated banner images 
				// or check has changed / edited
				cBanner = angular.copy($scope.banner);
				// show the button right panel
				var $rPanel = $('a.handler-right');
				$rPanel.switchClass('invisible', 'visible', 0);
				// if this page from redirected page, click the right panel 
				var redirect = $location.search()['redirect'];
				console.log('redirect', redirect);
				if( redirect !== undefined && redirect ){
					console.log('click right panel')
					self.onbeforeunloadNeeded = false;
					$timeout(function(){ $rPanel.click(); }, 500);
				}
			}

			console.log('fb', $scope.fb);
			console.log('templates', $scope.templates);
			console.log('recents', $scope.banners);
			console.log('detail is new ?', isNew);
			console.log('banner', $scope.banner);
			console.groupEnd();

			$scope.banner['range'] = 0;

			/* ================ Handling Panel ================ */

			// set active left panel
			$('a.handler-left').switchClass('invisible', 'visible', 0);

			// set model (search form)
			console.log('panel.left.model', $rootScope.panel.left.model);
			// set root model (left panel), if is new
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
			$rootScope.panel.left.model.selected = $scope.banner.ID;
			// get banner left panel
			var $panelLeft = '<div ng-include src="\'app/views/banner-panel-left.html\'"></div>';
			// bind left panel (rootScope), compile inject scope
			$rootScope.panel.left.template = $compile($panelLeft)($scope);
			// listener left panel
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
				$location.path('/facebook/banner/'+ ID).search('redirect', null);

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
			// set equals height banner lists 
			$scope.setEqualHeight = function() {
				// check every time, until thumbnail lists rendered
				// var si = setInterval(function(){
				// 	var columns = $("#banner-panel-left .thumbnails > li")
				// 	if( columns.length ){
				// 		clearInterval(si);
				// 		var tallestcolumn = 0;
				// 		columns.each(
				// 			function() {
				// 				currentHeight = $(this).height();
				// 				if (currentHeight > tallestcolumn) {
				// 					tallestcolumn = currentHeight;
				// 				}
				// 			}
				// 		);
				// 		columns.find('.thumbnail').height(tallestcolumn);
				// 	} 
				// });

				$timeout(function(){
					var columns = $("#banner-panel-left .thumbnails > li")
					var tallestcolumn = 0;
					columns.each(
						function() {
							currentHeight = $(this).height();
							if (currentHeight > tallestcolumn) {
								tallestcolumn = currentHeight;
							}
						}
					);
					columns.find('.thumbnail').height(tallestcolumn);
				}, 1000);
			}

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

			// listener right panel
			$scope.createNew = function(){
				// close panel
				$('a.handler-right')
					.click()
					.switchClass('visible', 'invisible', 0);
				// redirect to new banner
				$location.path('/facebook/banner').search('redirect', null);
			};
			// get conversation right panel
			var $panelRight = '<div ng-include src="\'app/views/banner-panel-right.html\'"></div>';
			// bind right panel (rootScope), compile inject scope
			$rootScope.panel.right.template = $compile($panelRight)($scope);


			/* ================ settings ================ */

			// call this, when template banner settings has been loaded
			$scope.settingOnLoad = function(){
				console.log('callback settingOnLoad');
				// set tab selected
				$('#templates ul > li:eq('+ $scope.banner.selected +') > a').click();
				$('#set-overlay').bind('normalize',function(){
					$('.btn', this).each(function(){ 
						$(this).removeClass('active') 
					});
					$('.overlay-normal', this).addClass('active');
					$scope.safeApply(function(){ $scope.banner.background.overlay = true; });
				})
				if( !isNew ){
					// var loaded = setInterval(function(){
					// 	if($('#settings').length){
					// 		clearInterval(loaded);
					// 		$('#doSetting').click();
					// 		$rootScope.pageService.loaded = true;
					// 		// generate download popup tpl n ZIP
					// 		$timeout(function(){
					// 			self.generateTplZIP({
					// 				like  : $scope.banner.uploaded.like,
					// 				enter : $scope.banner.uploaded.enter
					// 			});
					// 		}, 1000);
					// 	}	
					// });
					$timeout(function(){
						// open the setting menu
						$('#doSetting').click();
						// send page loaded response
						$rootScope.pageService.loaded = true;
						// generate download popup tpl n ZIP
						$timeout(function(){
							self.generateTplZIP({
								like  : $scope.banner.uploaded.like,
								enter : $scope.banner.uploaded.enter
							});
						}, 1000);
					}, 400);
				}
			};
			
			// set text breadcrumb
			// apply logo n prize image
			$('a[data-toggle="tab"]').on('shown', function (e) {
				var selected = $(e.target).data('tpl').match(/\d/)[0];
				var type     = parseInt($(e.target).data('type')) - 1;
				var prize    = $(e.target).data('price').match(/\d/)[0];
				var en       = ['one', 'two', 'three'][prize - 1];

				var isSameasEdit = ((cBanner !== false) && (parseInt(cBanner.selected) == selected)) ? true : false ;
				console.log('choose template', 'selected', selected, 'isSameasEdit', isSameasEdit);

				// applying banner images
				$scope.safeApply(function(scope){
					$scope.banner.selected = selected;
					// apply bg image n type
					if( selected <= 1 ) {
						$scope.banner.background.type  = '1';
						if(isSameasEdit){
							var oldBackground = (cBanner.background.uploaded) ? cBanner.background.image : $scope.templates[1][cBanner.background.set];
							$scope.banner.background.image = oldBackground;
						} 
						else $scope.banner.background.image = BannerImages.bg[0];
					} 
					else if( selected == 3 ) {
						$scope.banner.background.type  = '3';
						if(isSameasEdit){
							var oldBackground = (cBanner.background.uploaded) ? cBanner.background.image : $scope.templates[3][cBanner.background.set];
							$scope.banner.background.image = oldBackground;
						} 
						else $scope.banner.background.image = BannerImages.bg[2];
					} 
					else {
						$scope.banner.background.type  = '2';
						if(isSameasEdit){
							var oldBackground = (cBanner.background.uploaded) ? cBanner.background.image : $scope.templates[3][cBanner.background.set];
							$scope.banner.background.image = oldBackground;
						} 
						else $scope.banner.background.image = BannerImages.bg[1];
					}

					// logo n prize image (has prize only)
					$scope.banner.logo.image = (isSameasEdit) ? cBanner.logo.image : BannerImages.logo[type];
					if( selected != 0 ){
						$scope.banner.prize.one.image   = (isSameasEdit) ? cBanner.prize.one.image : BannerImages.prize[en][type];
						$scope.banner.prize.two.image   = (isSameasEdit) ? cBanner.prize.two.image : BannerImages.prize[en][type];
						$scope.banner.prize.three.image = (isSameasEdit) ? cBanner.prize.three.image : BannerImages.prize[en][type];
					}
				});

				// set text breadcrumb
			  	var text = e.target.innerHTML;
			  	$('.breadcrumb > .active').text(text);
			});

			/* ================ scope watchers ================ */

			// max width banner fb 
			self.fbMax = $scope.banner.fb.dimension;

			$scope.getX = function(){
				var calc = 810 - $scope.banner.fb.dimension.w;
				return $scope.banner.background.type == 3 ? calc - 20 : calc ;
			}
			$scope.$watch('banner.fb.dimension.w', function(input){
				if(input > self.fbMax.w) {
					$scope.banner.fb.dimension.w = input = self.fbMax.w;
				}

				console.log('watch:fb', $scope.banner.fb.dimension.w, input);

				var ratio = [input / self.fbMax.w, 67 / self.fbMax.h];
				var aspectRatio = Math.min(ratio[0], ratio[1]);
				$scope.banner.fb.dimension.h = parseInt(self.fbMax.h * aspectRatio);
			});
			$scope.$watch('banner.logo.w', function(input) {
				// calculate image position (center)
				// calculate aspect ratio image height
				var tplType = 'tpl-' + $scope.banner.selected;
				var logoDimension = BannerConfig.dimensions[tplType].logo;
				var defaultDimension = {
					width  : ($scope.banner.logo.placeholder.w == 0) ? $scope.banner.logo.w : $scope.banner.logo.placeholder.w - 10,
					height : ($scope.banner.logo.placeholder.h == 0) ? $scope.banner.logo.h : $scope.banner.logo.placeholder.h - 10
				};

				if(parseInt(input) <= defaultDimension.width){
					// dimension
					var ratio = [input / defaultDimension.width, defaultDimension.height / defaultDimension.height];
					var aspectRatio = Math.min(ratio[0], ratio[1]);
					$scope.banner.logo.h = parseInt(defaultDimension.height * aspectRatio);
					// position
					var dx = (defaultDimension.width + 10) - parseInt(input);
					var dy = (defaultDimension.height + 10) - parseInt($scope.banner.logo.h);
					var x = (dx <= 0) ? logoDimension.pos.image.x : (dx / 2) + logoDimension.pos.placeholder.x;
					$scope.banner.logo.x = ($scope.banner.background.type == 3) ? x + 20 : x ;
					$scope.banner.logo.y = (dy <= 0) ? logoDimension.pos.image.y : (dy / 2) + logoDimension.pos.placeholder.y;
				}
				else {
					$scope.banner.logo.w = defaultDimension.width;
					$scope.banner.logo.h = defaultDimension.height;
				}
			});
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
			$scope.$watch('banner.prize.header.title', function(input){
				$scope.banner.prize.header.title = input;
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
			$scope.$watch('banner.logo.hide', function(checked){
				self.hideLogo(checked);
			});
			$scope.$watch('banner.logo.placeholder.show', function(checked){
				self.addWhitePlaceholder(checked);
			});
			
			self.hideLogo = function(checked){
				console.info('hide logo', checked);
				$('#svg-editor > svg').each(function(i,e){
					var $logo = $(e).find('#logo').eq(0);
					// console.log('SVG logo element', $logo);
					(checked) ? $logo.hide() : $logo.show();
				});
			};
			self.addWhitePlaceholder = function(checked){
				console.log('placeholder logo', checked);
				var $rect = $('#svg-editor > svg > #logo > rect');
				console.log('placeholder element', $rect[0]);
				(checked) ? $rect.attr('fill', 'white') : $rect.attr('fill', 'transparent');
			};

			// bind cancel template
			$('#templates').bind('cancelTemplate', function(e){
				if( !isNew && cBanner !== false ) {
					// $scope.banner.background = cBanner.background;
					var set = cBanner.background.set;
					if(set == 'upload')
						$scope.banner.background.image  = cBanner.background.image;
					else
						$scope.banner.background.image  = $scope.templates[cBanner.background.type][set];
					$scope.banner.selected  = cBanner.selected;
					$scope.banner.logo.image      = cBanner.logo.image;
					$scope.banner.prize.one.image   = cBanner.prize.one.image;
					$scope.banner.prize.two.image   = cBanner.prize.one.image;
					$scope.banner.prize.three.image = cBanner.prize.three.image;
					console.log('banner', $scope.banner)
				}
				$(this).fadeOut(400, function(){
					$(this).hide();
					$('.tab-content').hide();
					$('#doSetting').removeClass('overwrite').html('<i class="icon-list"></i> Choose Template');
					$('#cancelTpl').hide();
					$('#settings').show();
					$('#svg-editor').show();

					$('#set-overlay > .overlay-normal').click()
					// $('#set-overlay').trigger('normalize');
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
					$scope.banner.background.image  = ( !$scope.banner.background.uploaded ) ? 
														BannerImages.bg[tplType-1] :
														cBanner.background.image ;
					$scope.banner.background.enable = true;
				} else {
					$scope.banner.background.image  = $scope.templates[tplType][type];
					$scope.banner.background.enable = false;
				}

				$scope.banner.background.set = type;
			};
			$scope.setBG2 = function(type, evt){
				var $el  = $(evt.target),
					text = $el.text(),
					$parent = $el.parents('.btn-group');

				$('.text', $parent).text(text);
				
				var tplType = $scope.banner.background.type;
				console.log('tplType', tplType)
				if(type == 'upload') {
					$scope.banner.background.image  = ( !$scope.banner.background.uploaded ) ? 
														BannerImages.bg[tplType-1] :
														cBanner.background.image ;
					$scope.banner.background.enable = true;
				} else {
					$scope.banner.background.image  = $scope.templates[tplType][type];
					$scope.banner.background.enable = false;
				}

				$scope.banner.background.set = type;
			};
			$scope.setOverlay = function(overlay, evt){
				var $el     = $(evt.target),
					$parent = $el.parent();
				$('.btn', $parent).each(function(){ $(this).removeClass('active') });
				$el.addClass('active');

				$('#svg-editor > svg').each(function(i,e){
					var $wrapPrize = $(e).find('#wrap-prize'),
						wrapHeight = parseInt($wrapPrize.attr('height'));

					var selected = $scope.banner.selected;
					var SVGheight, wh, values = {};

					console.log('selected', $scope.banner.selected)

					if( selected == 3 ){
						values = ( overlay ) ? {svg:670 , wrap:165} : {svg:785 , wrap:330};
						var py = ( overlay ) ? 170 : 120 ;
						$(e).find('#prizes').attr('y', py);
					} else {
						SVGheight = BannerConfig.dimensions['tpl-' + $scope.banner.selected]['background']['height'];
						wh = 128 ;
						values = ( overlay ) ? {svg:SVGheight , wrap:wh} : {svg:SVGheight + wrapHeight + 5 , wrap:SVGheight + 15};
					}

					console.log(values);

					$(e).attr('height', values.svg);
					$wrapPrize.attr('y', values.wrap);
				});

				$scope.safeApply(function(scope){ $scope.banner.background.overlay = overlay; });
			};

			$scope.setFB = function($index){
				$scope.banner.fb.selected = $index + 1;
			};

			$scope.doSetting = function($event){

				if( self.onbeforeunloadNeeded ) window._onbeforeunload = false;

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

				$('#set-overlay').trigger('normalize');

				// alert overwrite
				if($btnTemplate.hasClass('overwrite')){
					$('#popup-overwrite').bind('overwrite', function(){
						$('.blockOverlay').click();
						self.bannerSetting(settings, true);
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
					// set default selected
					$('ul > li:eq('+ $scope.banner.selected +') > a', $templateField).click();
					$templateField.show('fast', function(){
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

				self.bannerSetting(settings, false);
			};
			$scope.overwriteTpl = function(evt, val){
				if( val ){
					$('#popup-overwrite').trigger('overwrite');
				} else {
					$('.blockOverlay').click();
					$('#templates').trigger('cancelTemplate');
				}
			};
			$scope.cancelTemplate = function($event){
				$('#templates').trigger('cancelTemplate');
			};

			self.bannerSetting = function( options, overwrite ){
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
					
					$timeout(function(){
						console.info('click bg-' + $scope.banner.background.set)
						$('#Background .bg-' + $scope.banner.background.set).click();
					}, 400);
				}

				// canvas dimensions
				var canvasDimensions    = dimensions[tplDimension];
				var logoDimension       = canvasDimensions['logo'];
				var backgroundDimension = canvasDimensions['background'];
				var priceDimension      = canvasDimensions['prize'];

				// compile SVG (inject scope)
				var tplIndex = tplDimension.match(/(\d)/)[0];
				var $svg  = self.getSVGCompiled($tplContent, 'like', tplIndex);
				var $svg2 = self.getSVGCompiled($tplContent, 'enter', tplIndex);
				$tpl.hide('fast', function(){
					$(this).hide();
					$tplContent.hide();
					$btnCancel.hide();
					$btnTemplate.html('<i class="icon-list"></i> Choose Template');

					$settingField.show('fast',function(){
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

						$('#input-fb-width').unbind('spinner')
							.spinner({
								min:0, max:self.fbMax.w,
								spin: function( event, ui ) {
									$scope.safeApply(function(scope){
										$scope.banner.fb.dimension.w = ui.value;
									});
								}
							});
						$('#input-logo-width').unbind('spinner')
							.spinner({
								min:0, max: ($scope.banner.logo.placeholder.w == 0) ? logoDimension.image.width : $scope.banner.logo.placeholder.w - 10 ,
								spin: function( event, ui ) {
									$scope.safeApply(function(scope){
										$scope.banner.logo.w = ui.value;
									});
								}
							});

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
												self.uploadFile({
													file  : blob,
													name  : 'background',
													width : backgroundDimension.width,
													height: backgroundDimension.height,
													auto  : 0
												}).success(function(response){
													console.log('response:upload background fit', response);
													$scope.safeApply(function(scope){
														$scope.banner.background.uploaded = true;
														$scope.banner.background.image = response.dataURI;
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

								// $.unblockUI();
								console.log('logoDimension', logoDimension, tplDimension);
								// return;

								// upload to resize
								self.uploadFile({
									file  : blob,
									name  : 'logo',
									width : logoDimension.image.width,
									height: logoDimension.image.height,
									auto  : 1
								}).success(function(response){
									console.log('response:upload logo', response);

									logoDimension.image.width  = parseInt(response.width);
									logoDimension.image.height = parseInt(response.height);
									
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

									$scope.safeApply(function(scope){
										$scope.banner.logo.uploaded = true;
										$scope.banner.logo.image = response.dataURI;
										$scope.banner.logo.placeholder.w = logoDimension.image.width + 10;
										$scope.banner.logo.placeholder.h = logoDimension.image.height + 10;
										$scope.banner.logo.w = logoDimension.image.width;
										$scope.banner.logo.h = logoDimension.image.height;
										$scope.banner.logo.x = logoDimension.pos.image.x;
										$scope.banner.logo.y = logoDimension.pos.image.y;
									});

									console.log($scope.banner.logo)

									$('#input-logo-width').unbind('spinner')
										.spinner({
											min:0, max: $scope.banner.logo.w ,
											spin: function( event, ui ) {
												$scope.safeApply(function(scope){
													$scope.banner.logo.w = ui.value;
												});
											}
										});

									$.unblockUI();

									// applying scope
									// $scope.safeApply(function(scope){
									// 	scope.banner.logo.w = logoDimension.image.width;
									// 	scope.banner.logo.h = logoDimension.image.height;
									// 	scope.banner.logo.x = logoDimension.pos.image.x;
									// 	scope.banner.logo.y = logoDimension.pos.image.y;
									// 	console.log('scope logo', scope);
										// calculate image position (center)
										// calculate aspect ratio image height
										// scope.$watch('banner.logo.w', function(input) {
										// 	if(parseInt(input) <= logoDimension.image.width){
										// 		// dimension
										// 		var ratio = [input / logoDimension.image.width, logoDimension.image.height / logoDimension.image.height];
										// 		var aspectRatio = Math.min(ratio[0], ratio[1]);
										// 		scope.banner.logo.h = parseInt(logoDimension.image.height * aspectRatio);
										// 		// position
										// 		var dx = (logoDimension.image.width + 10) - parseInt(input);
										// 		var dy = (logoDimension.image.height + 10) - parseInt(scope.banner.logo.h);
										// 		var x = (dx <= 0) ? scope.banner.logo.x : (dx / 2) + logoDimension.pos.placeholder.x;
										// 		scope.banner.logo.x = (tplIndex == 3) ? x + 20 : x ;
										// 		scope.banner.logo.y = (dy <= 0) ? scope.banner.logo.y : (dy / 2) + logoDimension.pos.placeholder.y;
										// 	}
										// 	else {
										// 		scope.banner.logo.w = logoDimension.image.width;
										// 		scope.banner.logo.h = logoDimension.image.height;
										// 	}
										// });
									// });
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
												$scope.safeApply(function(scope){
													// $scope.banner.prize[en].uploaded = true;
													$scope.banner.prize[en].image = image.src;
												});
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
											self.uploadFile({
												file  : blob,
												name  : 'prize-' + prizeIndex,
												width : priceDimension.width,
												height: priceDimension.height,
												auto  : 0
											}).success(function(response){
												console.log('response:upload prize fit', response);
												console.log('en', en);
												$scope.safeApply(function(scope){
													$scope.banner.prize[en].uploaded = true;
													$scope.banner.prize[en].image = response.dataURI;
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
			self.getSVGCompiled = function ($tplContent, type, tplIndex){
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
					// background
					if($(e).attr('fill') !== undefined) {
						$(e).attr('fill', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+type;
							});
						});
					}
					// logo FB
					else if(i == 1) {
						if(type == 'enter') {
							$(e).remove();
							return;
						}

						e.setAttribute('x', '{{getX()}}');
						e.setAttribute('xlink:href', '{{fb[banner.fb.selected]}}');
						e.setAttribute('width', '{{banner.fb.dimension.w}}');
						e.setAttribute('height', '{{banner.fb.dimension.h}}');
					}
				});
				$('#logo', $svg).children().map(function(i,e){
					if($(e).attr('id') !== undefined) { // image
						$(e).attr('id', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+type;
							});
						}).attr({
							'xlink:href': '{{banner.logo.image}}',
							// x:'{{banner.range}}',
						});
						// set logo position
						if( $scope.banner.logo.w != 0 && $scope.banner.logo.h != 0 && 
							$scope.banner.logo.x !== undefined && $scope.banner.logo.y !== undefined ){
							$(e).attr({
								width:'{{banner.logo.w}}',
								height:'{{banner.logo.h}}',
								x:'{{banner.logo.x}}',
								y:'{{banner.logo.y}}'
							});
						}
						// check logo is hidden
						if($scope.banner.logo.hide){ 
							$(e).hide(); 
						}
					} else if($(e).attr('filter') !== undefined) { // rect (placeholder)
						$(e).attr('filter', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor';
							});
						})
						.attr({
							width : '{{banner.logo.placeholder.w}}',
							height: '{{banner.logo.placeholder.h}}'
						})
						.attr('fill', function(){
							return $scope.banner.logo.placeholder.show ? 'white' : 'transparent';
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

						if(type == 'enter') {
							$('#price .prize-description', $svg).attr('ng-bind-html-unsafe', 'banner.prize.header.description.enter');
						}

						var bind = [
							'{{banner.prize.one.image}}',
							'{{banner.prize.two.image}}',
							'{{banner.prize.three.image}}'
						][_index-1];

						$(e).attr('id', function(index, id){
							return id.replace(/(\d+)/, function(fullMatch, n) {
								return 'editor-'+ type + '-' + _index;
							});
						}).find('image').attr('xlink:href', bind);

						_index++;
					});
				}

				console.log('BANNER', $scope.banner)

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

					// convert data URI to blob
					var blobLike = dataURItoBlob(imgDataURILike);

					console.log('blob banner like', blobLike);
					console.info('start uploading banner like screenshot..');
				
					$progress.text('Uploading banner like...');

					var imgNameLike = 'banner_like';
					var imgNameLike = isNew ? imgNameLike : 'g_banner_like';
					// do upload banner like
					self.uploadFile({
						file  : blobLike,
						name  : imgNameLike,
						width : 'original',
						height: 'original',
						auto: 1
					}).success(function(response){
						console.log('response upload banner like', response);

						// set image preview
						var imgPreview = response.url;
						
						$progress.text('Generating banner enter...');

						// create canvas banner enter
						svgToImage(svg_enter, function(imgEnter, imgDataURIEnter){
							
							/* upload banner enter */

							$progress.text('Uploading banner enter...');

							// convert data URI to blob
							var blobEnter = dataURItoBlob(imgDataURIEnter);

							console.log('blob banner enter', blobEnter);
							console.info('start uploading banner enter screenshot..');

							var imgNameEnter = 'banner_enter';
							var imgNameEnter = isNew ? imgNameEnter : 'g_banner_enter';
							// do upload banner enter
							self.uploadFile({
								file  : blobEnter,
								name  : imgNameEnter,
								width : 'original',
								height: 'original',
								auto  : 0
							}).success(function(response){
								console.log('response upload banner enter', response);
								
								// applying scope
								$scope.safeApply(function(scope){ 
									$scope.allowDownloadable = true;       // enable download
									$scope.banner.preview    = imgPreview; // set banner like as image preview
									// set title n same as meta title & description
									$scope.banner.title       = $scope.banner.mtitle.text;
									$scope.banner.description = $scope.banner.mdescription.text;
								});
							
								$progress.text('Adding banner images into ZIP...');

								/* add banner images to zip */

								// callback generate template n ZIP file
								var generateCallback = self.generateTplZIP({
									like  : imgDataURILike,
									enter : imgDataURIEnter
								}, isNew, function(){

									// set empty progress text
									$progress.text('');

									// generate template & ZIP finished

									console.info('call generate callback...');

									$timeout(function() {

										console.log('generateCallback', isNew, $scope.banner.uploaded == undefined,  $scope.banner.download == undefined);

										if( isNew ){
											// add scope banner uploaded
											$scope.banner['uploaded'] = {
												like : imgDataURILike,
												enter: imgDataURIEnter
											};
											// set updated
											$scope.isNew = isNew = false;

											if( isSaved ){
												// set empty progress text
												$progress.text('Please wait, you will be redirecting to this banner...');
												$timeout(function(){
													// hide loading screen
													$.unblockUI();
													$location.path('/facebook/banner/'+ $scope.banner.ID).search('redirect','true');
												}, 2000);
												return;
											}
										} else {
											// applying scope banner uploaded & download
											$scope.safeApply(function(scope){
												$scope.banner.uploaded.like       = imgDataURILike;
												$scope.banner.uploaded.enter      = imgDataURIEnter;
												$scope.banner.download.like.href  = 'images/upload/' + $scope.banner.ID + '/' + imgNameLike + '.jpg';
												$scope.banner.download.enter.href = 'images/upload/' + $scope.banner.ID + '/' + imgNameEnter + '.jpg';
											});
										}

										// hide loading screen
										$.unblockUI();

										// show button right panel
										if($('a.handler-right').hasClass('invisible')) $('a.handler-right').switchClass('invisible', 'visible', 0);
										// show the right panel
										$('a.handler-right').click();

									}, 1000);
								});

								if( isSaved ){
									console.info('do Save');
									$progress.text('Saving configuration...');
									self.doSave( generateCallback );
								} else {
									console.info('generate only');
									generateCallback;
								}
							});
						});
					});
				});
			};

			self.generateTplZIP = function( imgURI, isNew, callback ){
				
				// var downloadName = 'banner-'+ $scope.banner.ID +'.zip';
				var downloadName = 'banner_'+ self.slugify($scope.banner.title);

				var prefixName = 'banner';
				var prefixName = isNew ? prefixName : 'g_banner';

				// add scope banner download
				$scope.banner['download'] = {
					like: {
						title:'Download the Like Banner',
						href : 'images/upload/' + $scope.banner.ID + '/' + prefixName + '_like.jpg'
						// download:'banner-like_'+ downloadName +'.jpg'
					},
					enter: {
						title: 'Download the Enter Banner',
						href: 'images/upload/' + $scope.banner.ID + '/' + prefixName + '_enter.jpg'
						// download:'banner-enter_'+ downloadName +'.jpg'
					}
				};

				console.log('scope banner after generated', $scope.banner);
				
				// get base64 data URI
				var imgURILike  = imgURI.like.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
				var imgURIEnter = imgURI.enter.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
				// create folder n add image files into folder
				var imgFolder = ZIP.folder(downloadName);
				imgFolder.file('banner_like.jpg', imgURILike, {base64: true});
				imgFolder.file('banner_enter.jpg', imgURIEnter, {base64: true});
				// generate zip link
				var DOMURL = window.URL || window.mozURL;
				var downloadlink = DOMURL.createObjectURL(ZIP.generate({type:"blob"}));
				// var downloadlink = ZIP.generate();

				// set download attribute to download & zip elements
				var downloadEl      = document.getElementById('setting-download');
				downloadEl.download = downloadName +'.zip';
				downloadEl.href     = downloadlink;
				// var zipEl      = $generate.find('.download-zip')[0];
				var zipEl      = document.getElementById('downloadZip'); // download panel-right
				zipEl.download = downloadName +'.zip';
				zipEl.href     = downloadlink;

				console.info('finished adding the images into zip');

				if( callback ) callback();
			};

			self.slugify = function(Text) {
			    return Text
				        .toLowerCase()
				        .replace(/[^\w ]+/g,'')
				        .replace(/ +/g,'-');
			};

			self.uploadFile = function(data){
				console.log(data);
				// create form data
				var formData = new FormData();
				formData.append('file', data.file);
				formData.append('id', $scope.banner.ID);
				formData.append('name', data.name);
				formData.append('width', data.width);
				formData.append('height', data.height);
				formData.append('auto_width', data.auto);
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

			$scope.saveSubmit = function(e){
				var $form = $(e.target).parents('form');
				console.log('SAVE:form data', $scope.banner);
				$form.block({
					overlayCSS: {
						backgroundColor: '#fff',
						opacity: 0.8
					},
					message: '<i class="icon-spinner icon-spin icon-2x"></i> <br/> <span>Saving..</span>',
					css: {
						border: 'none',
						background: 'none',
						color: '#3685C6'
					}
				});
				self.doSave(function(){
					if( isNew ){
						// redirect message
						$('.blockMsg > span', $form).text('Please wait, you will be redirecting to this banner...');
						// close panel
						$('a.handler-right').click();
						$timeout(function(){
							// hide loading popup
							$form.unblock();
							// redirect to edit conversation
							$location.path('/facebook/banner/' + $scope.banner.ID);
						}, 3000);
					}
					else {
						$form.unblock();
					}
				});
			};

			self.doSave = function(callback){
				
				window._onbeforeunload = true;

				var banner = new BannerService($scope.banner);

				console.log('doSave:BannerService', banner);

				if( isNew ){

					/* 
					banner.$save(function(response){
						console.log('Save response', response);
						// update old/copy banner
						cBanner = angular.copy($scope.banner);
						$scope.banners.push($scope.banner);
						console.log('banners', $scope.banners);
						if(callback) callback();
					});
					*/

					authResource.authentifiedRequest('POST', 'api/banner', $scope.banner, function(response){
						console.log('response:afer insert', response);
						// update old/copy banner
						cBanner = angular.copy($scope.banner);
						$scope.banners.push($scope.banner);
						console.log('banners:afer insert', $scope.banners);
						if(callback) callback();
					});

				} else {
					var bannerId = ($route.current.params.bannerId) ? $route.current.params.bannerId : $scope.banner.ID ;
					
					/*
					banner.$update({id : bannerId}, function(response){
						console.log('Update response', response);
						// update old/copy banner
						cBanner = angular.copy($scope.banner);
						var index = self.getIndexSelectedBanner();
						var b     = $scope.banners[index];
						b.title       = cBanner.title;
						b.description = cBanner.description;
						b.preview     = cBanner.preview;
						if(callback) callback();
					});
					*/

					authResource.authentifiedRequest('PUT', 'api/banner/' + bannerId, $scope.banner, function(response){
						console.log('response:afer update', response);
						// update old/copy banner
						cBanner = angular.copy($scope.banner);
						$scope.banners.push($scope.banner);
						console.log('banners:afer update', $scope.banners);
						if(callback) callback();
					});
				}
			}

			// get index selected banner 
			// get list id left panel on thumbnail selected
			self.getIndexSelectedBanner = function(){
				var lID = $('#banner-panel-left .thumbnail.selected').parents('li').attr('id');
				if(!lID) return null;
				return lID.match(/\d/)[0];
			};
		}
	]);
});