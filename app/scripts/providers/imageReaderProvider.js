define(['providers/providers'], function(providers){
	providers.provider('imageReader', function(){
		this.$get = function(){
			return {
				init: function(options){
					var self = this;

					var $svg_like  = $('#svg-editor > svg').eq(0);
					var $svg_enter = $('#svg-editor > svg').eq(1);
					switch(options.section){
						case 'logo':
							options.changeEl = {
								like  : $svg_like.find('image#logo-image-editor-like')[0],
								enter : $svg_enter.find('image#logo-image-editor-enter')[0]
							};
							break;
						case 'background':
							options.changeEl = {
								like  : $svg_like.find('#banner-background-editor-like > image')[0],
								enter : $svg_enter.find('#banner-background-editor-enter > image')[0]
							};
							break;
						case 'price-1':
							options.changeEl = {
								like  : $svg_like.find('#price-image-editor-like-1 > image')[0],
								enter : $svg_enter.find('#price-image-editor-enter-1 > image')[0]
							};
							break;
						case 'price-2':
							options.changeEl = {
								like  : $svg_like.find('#price-image-editor-like-2 > image')[0],
								enter : $svg_enter.find('#price-image-editor-enter-2 > image')[0]
							};
							break;
						case 'price-3':
							options.changeEl = {
								like  : $svg_like.find('#price-image-editor-like-3 > image')[0],
								enter : $svg_enter.find('#price-image-editor-enter-3 > image')[0]
							};
							break;
						case 'splash':
							options.changeEl = (options.changeEl) ? options.changeEl : $('#svg-custom > svg > #logo > image').eq(0)[0];
							break;
					}

					var defaults = {
						buttonClass   : null,
						inputFileEl   : '#input-file',
						inputFileText : 'Upload File',
						section       : 'background',
						changeEl      : null,
						compile       : null
					};

					/* auto merging default options */

					var config = self.config = $.extend({}, defaults, options);

					/* create better input file with the button element */

					// create the button input file ID
					var buttonFileId = config.inputFileEl + '-button';
					// check the button input file
					if($(buttonFileId).length) {
						$(buttonFileId).remove();
						var $parent = $(config.inputFileEl).parent();
						$(config.inputFileEl).remove();
						var inputFile = document.createElement('input');
						inputFile.setAttribute('type', 'file');
						inputFile.setAttribute('id', config.inputFileEl.replace(/\#/, ''));
						inputFile.setAttribute('class', 'hide');
						$parent.append(inputFile.outerHTML);
					}
					if($(config.inputFileEl).is(':visible')) $(config.inputFileEl).addClass('hide');
					// create the button input file
					var buttonField = document.createElement('button');
					buttonField.setAttribute('id', buttonFileId.replace(/\#/, ''));
					var btnClass = (config.buttonClass !== null) ? 'btn ' + config.buttonClass : 'btn';
					buttonField.setAttribute('class', btnClass);
					buttonField.innerHTML = config.inputFileText;
					// append child
					$(config.inputFileEl).parent().prepend(buttonField);
					// the button file event
					$(buttonFileId).click(function() {
						$(config.inputFileEl).click();
					});
					self.config['buttonEl'] = buttonField;

					/* input file event */

					$(config.inputFileEl)
						.unbind('change')
						.bind('change', {config : config}, function(evt){
							var file   = evt.target.files[0];
							var config = evt.data.config;
							self.handleReadImage(file, config);
						});
				},

				handleReadImage: function(file, config){
					var self = this;

					// validation file image selected
					if (!(file.type && file.type.match('image.*'))) {
						// file type is not allowed 
						alert('Only JPG, PNG or GIF files are allowed');
						throw new Error('Only JPG, PNG or GIF files are allowed');
					}
					// max 10 mB
					else if (!(file.size && file.size < 10485760)) {
						// file size > 1MB
						alert('File is too big!!');
						throw new Error('File is too big!!');
					}

					console.log('file', file);

					var buttonEl = config.buttonEl;
					var changeEl = config.changeEl;
					var fr    = new FileReader();
					fr.onload = (function(file){
						return function(e){
							console.log('onload target', file);
							var image = new Image();
							image.onload = function(){
								console.log(image.width, image.height);
								var index = config.section.match(/\d/);
								if( config.compile ) config.compile(buttonEl, changeEl, file, image, index);
							};
							image.src = e.target.result;
						}
					})(file);

					// read as data url
					fr.readAsDataURL(file);
				},

				uploadFile: function(data, callback) {

					var self = this;

					console.log('formData', data);

					// object XMLHttpRequest
					var xhr = new XMLHttpRequest();

					// xhr response
					xhr.onload = function() {

						console.log('XHR load', this);

						// OK
						if (this.status == 200) {
							// parse JSON response
							var response = JSON.parse(this.response);

							console.log('response', response);

							if( callback ) callback( response );

						}
						else
							alert('Error! An error occurred processing image');
					};

					// xhr open
					xhr.open('POST', 'api/upload', true);

					// buat form data
					var formData = new FormData();
					formData.append('file', data.file);
					formData.append('name', data.name);
					if( data.multi !== undefined && data.multi ){
						var s = [];
						$.each(data.size, function(i,e){
							formData.append('size['+i+'][w]', e.width);
							formData.append('size['+i+'][h]', e.height);
						});
					} else {
						formData.append('width', data.size.width);
						formData.append('height', data.size.height);
					}


					// xhr send request
					xhr.send(formData);
				}
			};
		};
	});
});