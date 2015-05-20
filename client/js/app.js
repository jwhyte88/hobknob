var featureToggleFrontend = angular.module('featureToggleFrontend', ['ngResource', 'ngRoute', 'ui.bootstrap', 'config', 'toggle-switch', 'xeditable']);

featureToggleFrontend.config(function($routeProvider, $locationProvider, $httpProvider) {
    'use strict';

	$locationProvider.hashPrefix('!');
  	$routeProvider.
        when('/', {
            controller: 'DashboardController',
            templateUrl: 'partials/dashboard'
        }).
        when('/applications/:applicationName', {
            controller: 'ApplicationViewController',
            templateUrl: 'partials/application'
        }).
        when('/applications/:applicationName/:featureName', {
            controller: 'ApplicationViewController',
            templateUrl: 'partials/feature'
        });

    $httpProvider.defaults.headers.put = { "Content-Type": "application/json" };
    $httpProvider.defaults.headers.post = { "Content-Type": "application/json" };
});

featureToggleFrontend.run(function(editableOptions){
    editableOptions.theme = 'bs3';
});