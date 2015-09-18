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
  .controller('ScalrController', function ($scope, DataService, AlertMessageService, ngScalr, $filter, $modal, $location, LabelFilter, $timeout, Logger) {
    $scope.alerts = $scope.alerts || {};

    var watches = [];
    $scope.hehe = {};
    $scope.loaded = false;
    $scope.farms = [];


    $scope.launching = false;

    $scope.operating = {};

    var callDetail = function(farm) {
      $scope.operating[parseInt(farm['ID'])] = false;
      ngScalr.call('farm', 'get', {'FarmID': farm['ID']}).then(function(returnedFarm) {
        returnedFarm.ID = parseInt(returnedFarm.ID, 10);
        $scope.farms.push(returnedFarm);
      }).catch(errorMessage('get')).finally(function() {
        $scope.loaded = true;
      });
    };

    var errorMessage = function(method) {
      var errorMap = {
        'list': 'Error occurred while getting farms',
        'get': 'Error occurred while getting farm detail',
        'launch': 'Error occurred while launching farm',
        'terminate': 'Error occurred while terminating a farm',
        'clone': 'Error occurred while cloning this farm'
      };
      return function(error) {
        $scope.alerts['scalr'] = {
          type: "error",
          message: errorMap[method],
          details: $filter('getErrorDetails')(error)
        };
        Logger.error("Farms could not be fetched.", error);
      };
    };

    ngScalr.call('farm', 'list').then(function(res) {
      if (!res || res['FarmSet'].length === 0) {
        $scope.noFarms = true;
      }
      else {
        if (res['FarmSet']['Item'].constructor === Array) {
          res['FarmSet']['Item'].forEach(callDetail);
        }
        else {
          callDetail(res['FarmSet']['Item']);
        }
      }
    }).catch(errorMessage('list')).finally(function() {
      $scope.loaded = true;
    });

    // for cloning farms
    $scope.cloneFarm = function(farm) {
      $scope.operating[farm.ID] = true;
      ngScalr.call('farm', 'clone', {'FarmID': farm['ID']}).then(function(retFarm) {
        callDetail(retFarm);
      }).catch(errorMessage('clone')).finally(function() {
        $scope.operating[farm.ID] = false;
      });
    };

    // for terminating farms
    $scope.terminateFarm = function(farm) {
      $scope.operating[farm.ID] = true;
      ngScalr.call('farm', 'terminate', {
        'FarmID': farm['ID'],
        'KeepEBS': 1,
        'KeepEIP': 1,
        'KeepDNSZone': 1
      }).then(function() {
        $scope.farms.splice($scope.farms.indexOf(farm), 1);
        callDetail(farm);
      }).catch(errorMessage('terminate')).finally(function() {
        $scope.operating[farm.ID] = false;
      });
    };

    // for launching farms
    $scope.launchFarm = function(farm) {
      $scope.operating[farm.ID] = true;
      ngScalr.call('farm', 'launch', {'FarmID': farm['ID']}).then(function() {
        $scope.farms.splice($scope.farms.indexOf(farm), 1);
        callDetail(farm);
      }).catch(errorMessage('launch')).finally(function() {
        $scope.operating[farm.ID] = false;
      });
    };

    $scope.isArrayOrObjectOrEmpty = function(item) {
      if (item.length === 0) {
        return 'empty';
      }
      else {
        if (item['Item'].constructor === Array) {
          return 'array';
        }
        else if (item['Item'].constructor === Object) {
          return 'object';
        }
      }
    };

    $scope.testCall = function() {
      $scope.farms[0].Name = 'cock';
    };

    $scope.$on('$destroy', function(){
      DataService.unwatchAll(watches);
    });
  });
