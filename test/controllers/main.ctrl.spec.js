describe('MainController', function() {
    beforeEach(module('appSkeleton'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('$scope.username', function() {
        it('verify if username is World', function() {
            var $scope = {};
            var controller = $controller('MainController', { $scope: $scope });
            expect($scope.username).toEqual('World');
        });
    });
});
