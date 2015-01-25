(function (angular) {
    'use strict';

    angular.module('appSkeleton', [
        'ui.router'
    ])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider
            .otherwise('/');

            $stateProvider
            .state("home", {
                url: "/",
                controller: 'HomeController',
                templateUrl: 'views/home.html'
            })
            .state("page", {
                url: "/page/{pageName}",
                controller: 'PageController',
                templateUrl: 'views/page.html'
            })
        }
    ]);
}(angular));
