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
  .service('SymPaas', function($http, $q, $log, API_CFG, AuthService) {
    function Paas() {

    }

    var token = AuthService.UserStore().getToken() || '';

    var baseURL = function() {
      var protocol = 'http';
      var hostPort = API_CFG.openshift.hostPort.slice(0, API_CFG.openshift.hostPort.length - 4) + '8080';
      return new URI({protocol: protocol, hostname: hostPort}).toString();
    };

    var methodsCheck = {
      'noParams': new Set(['regions']),
      'scalr': {
        'get': {
          'methods': new Set(['listFarms'])
        },
        'post': {
          'methods': {
            'launchFarm': new Set(['ID']),
            'cloneFarm': new Set(['ID']),
            'terminateFarm': new Set(['ID'])
          }
        }
      }
    };

    var sequences = {
      'scalr': {
        'launchFarm': ['ID'],
        'cloneFarm': ['ID'],
        'terminateFarm': ['ID'] 
      }
    };

    var buildUrl = function(type, action) {
      if (methodsCheck['noParams'].has(type)) {
        return baseURL() + '/' + type;
      }
      else {
        return baseURL() + '/' + type + '/' + action;
      }
    };

    var placeParams = function(url, type, action, params) {
      var updatedUrl = url;
      sequences[type][action].forEach(function(param) {
        updatedUrl += '/' + params[param];
      });
      return updatedUrl;
    };

    Paas.prototype.call = function(type, action, params) {
      var builtUrl = buildUrl(type, action);
      var deferred = $q.defer();
      if (typeof action !== 'undefined' && typeof methodsCheck[type]['post']['methods'][action] !== 'undefined') {
        $http.post(placeParams(builtUrl, type, action, params), {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).success(function(data, status, headerFunc, config, statusText) {
          deferred.resolve(data);
        }).error(function(data, status, headers, config) {
          deferred.reject({
            data: data,
            status: status,
            headers: headers,
            config: config
          });
        });
      }

      else {
        $http.get(builtUrl, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).success(function(data, status, headerFunc, config, statusText) {
          deferred.resolve(data);
        }).error(function(data, status, headers, config) {
          deferred.reject({
            data: data,
            status: status,
            headers: headers,
            config: config
          });      
        });
      }
      return deferred.promise;
    };

    return new Paas();
  })
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
