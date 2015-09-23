'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftConsole.controller:RoutesController
 * @description
 * # ProjectController
 * Controller of the openshiftConsole
 */
angular.module('openshiftConsole')
  .controller('RoutesController', function ($scope, DataService, AlertMessageService, $filter, $modal, $location, LabelFilter, $timeout, Logger) {
    $scope.routes = {};
    $scope.alerts = $scope.alerts || {};

    var watches = [];

    watches.push(DataService.watch("routes", $scope, function(routes) {
      $scope.routes = routes.by("metadata.name");
      Logger.log("routes (subscribe)", $scope.routes);
    }));

    $scope.$on('$destroy', function(){
      DataService.unwatchAll(watches);
    });
  });
