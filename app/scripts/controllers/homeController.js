define([
    'controllers/controllers'
], function(controllers) {
    controllers.controller('HomeController', ['$scope', '$modal', '$log',
        function($scope, $modal, $log) {
            $('a.handler-left').switchClass('visible', 'invisible', 0);
            $('a.handler-right').switchClass('visible', 'invisible', 0);

            $scope.alerts = [{
                type: 'danger',
                msg: 'Oh snap! Change a few things up and try submitting again.'
            }, {
                type: 'success',
                msg: 'Well done! You successfully read this important alert message.'
            }];

            $scope.addAlert = function() {
                $scope.alerts.push({
                    msg: 'Another alert!'
                });
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };


            $scope.items = ['item1', 'item2', 'item3'];

            $scope.open = function(size) {

                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: function($scope, $modalInstance, items) {

                        $scope.items = items;
                        $scope.selected = {
                            item: $scope.items[0]
                        };

                        $scope.ok = function() {
                            $modalInstance.close($scope.selected.item);
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    size: size,
                    resolve: {
                        items: function() {
                            return $scope.items;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    $scope.selected = selectedItem;
                }, function() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };
        }
    ]);
});