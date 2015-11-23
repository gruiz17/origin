'use strict';
angular.module("openshiftConsole")
  .service('SymPaas', function($http, $q, $log, API_CFG, AuthService) {
    // todo: put this into a separate file
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
        }).success(function(data) {
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
        }).success(function(data) {
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
  .directive("regions", function($http, SymPaas) {
    return {
      restrict: 'A',
      link: function(scope) {
        scope.regions = [];
        scope.loading = true;
        SymPaas.call('regions').then(function(data) {
          scope.showRegions = true;
          scope.regions = data['regions'];
        }, function(err) {
          console.log('error loading regions', err);
          scope.showRegions = false;
        }).finally(function() {
          scope.loading = false;
        });
      }
    };
  });