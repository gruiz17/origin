'use strict';
angular.module("openshiftConsole")
  // miguel what url to use for ved's thing?
  .service('SymPaas', function($http, $q, $log, API_CFG, AuthService) {
    function Paas() {

    }

    var baseURL = function() {
      var protocol = 'http';
      var hostPort = API_CFG.openshift.hostPort.slice(0, API_CFG.openshift.hostPort.length - 4) + '8080';
      return new URI({protocol: protocol, hostname: hostPort}).toString();
    };

    Paas.prototype.call = function(action, params) {
      var deferred = $q.defer();
      var token = AuthService.UserStore().getToken() || '';

      var buildUrl = function(action) {
        return baseURL() + '/' + action;
      };

      $http.get(buildUrl(action), {
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