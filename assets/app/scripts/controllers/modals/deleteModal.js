'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftConsole.controller:DeleteModalController
 * @description
 * # DeleteModalController
 * Controller of the openshiftConsole
 */
angular.module('openshiftConsole')
  .controller('DeleteModalController', function ($scope, $modalInstance) {
    $scope.delete = function() {
      $modalInstance.close('delete');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  });
