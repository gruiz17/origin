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
    $scope.quotas = {};
    $scope.alerts = $scope.alerts || {};

    var watches = [];

    $scope.$on('$destroy', function(){
      DataService.unwatchAll(watches);
    });
  });
