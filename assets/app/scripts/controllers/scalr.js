'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftConsole.controller:ScalrController
 * @description
 * # ProjectController
 * Controller of the openshiftConsole
 */

// NOT KUBERNETES COMPONENT

angular.module('openshiftConsole')
  .controller('ScalrController', function ($scope, SymPaas, DataService, AlertMessageService, $filter, $modal, $location, LabelFilter, $timeout, $window, Logger) {
    $scope.alerts = $scope.alerts || {};

    var watches = [];

    $scope.farms = [];
    $scope.loading = true;
    $scope.loaded = false;

    $scope.operating = {};

    var listFarms = function() {
      SymPaas.call('scalr', 'listFarms').then(function(farms) {
        $scope.farms = farms.map(function(farm) {
          var tmpFarm = farm;
          tmpFarm.ID = $window.parseInt(tmpFarm.ID, 10);
          return tmpFarm;
        });
      }).catch(function(err) {
        errorMessage('list');
      }).finally(function() {
        $scope.loading = false;
        $scope.loaded = true;
      });
    };

    listFarms();

    $scope.operateOnFarm = function(id, action) {
      $scope.operating[id] = true;
      SymPaas.call('scalr', action, {ID: id}).then(function() {
        listFarms();
      }).catch(function(err) {
        errorMessage(action);
      }).finally(function() {
        $scope.operating[id] = false;
      });
    };

    function errorMessage(method) {
      var errorMap = {
        'listFarms': 'Error occurred while getting farms',
        'launchFarm': 'Error occurred while launching this farm',
        'terminateFarm': 'Error occurred while terminating this farm',
        'cloneFarm': 'Error occurred while cloning this farm'
      };
      return function(error) {
        $scope.alerts['scalr'] = {
          type: "error",
          message: errorMap[method],
          details: $filter('getErrorDetails')(error)
        };
        Logger.error("Farms could not be fetched.", error);
      };
    }
 
    $scope.$on('$destroy', function(){
      DataService.unwatchAll(watches);
    });
  });
