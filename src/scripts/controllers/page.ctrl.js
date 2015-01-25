(function (angular) {
    'use strict';

    angular.module('appSkeleton')
    .controller('PageController', ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.page = $stateParams.pageName;
    }]);
}(angular));
