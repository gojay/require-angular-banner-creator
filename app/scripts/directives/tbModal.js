define([
	'directives/directives',
	'jquery',
	'jqueryui'
], function(directives, $, ui){
	directives
		.directive('tbModal', function($timeout, $log) {
			// Runs during compile
			return {
				restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
				replace: true,
				transclude: true,
				scope: {
					modalId    : '@',
					modalTitle : '@',
					modalBtnOk : '@',
					class : '@'

				}, // {} = isolate, true = child, false/undefined = no change
				templateUrl: 'app/views/components/tbmodal.html',
				controller: function($scope, $element) {
					$scope.index = null;
					this.element = $element;
				},
				link: function($scope, element, attrs, ctrl, transclude) {

					$log.log('modal', $scope);

					var escapeEvent = function(e) {
						if (e.which == 27) {
							closeModal();
						}
					};

					var openModal = function(e, hasBackdrop, hasEscapeExit, index) {

						$scope.index = index;
						$scope.$apply();

						console.log('openmodal', $scope)

						$log.log('hasEscapeExit', hasEscapeExit);

						// get modal element
						var modal = $('#' + attrs.modalId);

						// set backdrop
						if (hasBackdrop === true) {
							// buat modal backdrop jika tidak ada
							if (!document.getElementById('modal-backdrop')) {
								$('body').append('<div id="modal-backdrop" class="modal-backdrop"></div>');
							}

							// set display block dan bind modal backdrop untuk close modal
							$('#modal-backdrop')
								.css('display', 'block')
								.bind('click', closeModal);
						}

						// bind body escape event
						if (hasEscapeExit === true) {
							$('body').bind('keyup', escapeEvent);
						}
						// add class modal-open pd body
						$('body').addClass('modal-open');
						modal.css('display', 'block');

						// bind .close close modal
						$('.close', modal).bind('click', closeModal);
						$('.btn-close', modal).bind('click', closeModal);

						// show modal
					};

					var closeModal = function() {
						// set 'modal-backdrop' unbind event click & display none
						$('#modal-backdrop')
							.unbind('click', closeModal)
							.css('display', 'none');

						// set 'body' unbind escape event & hapus class modal-open
						$('body')
							.unbind('keyup', escapeEvent)
							.removeClass('modal-open');

						// set 'bootstrap modal' display none
						$('#' + attrs.modalId).css('display', 'none');
					};

					//Bind modalOpen and modalClose events, so outsiders can trigger it
					//We have to wait until the template has been fully put in to do this,
					//so we will wait 100ms
					$timeout(function() {
						$('#' + attrs.modalId)
							.bind('modalOpen', openModal)
							.bind('modalClose', closeModal);
					}, 100);
				}
			};
		})

		/*
		 * Bootstrap Modal Open
		 * Restrict Attribute
		 */

		.directive('tbModalOpen', function() {
			// Runs during compile
			return {
				restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
				link: function($scope, element, attrs) {
					// define backdrop & escape Key
					var hasBackdrop = attrs.backdrop === undefined ? true : attrs.backdrop;
					var hasEscapeExit = attrs.escapeExit === undefined ? true : attrs.escapeExit;

					// define event type
					var eventType = attrs.modalEvent === undefined ? 'click' : attrs.modalEvent;

					// set element bind event type
					// panggil trigger modalOpen
					$(element).bind(eventType, function() {
						console.log('click', attrs.tbModalOpen);
						$('#' + attrs.tbModalOpen)
							.trigger('modalOpen', [hasBackdrop, hasEscapeExit, 1]);
					});
				}
			};
		});
});