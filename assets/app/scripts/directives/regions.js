'use strict';
angular.module("openshiftConsole")
  .directive("regions", function(SymPaas) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/regions.html",
      link: function(scope) {
        scope.regions = [];
        scope.regionsLoading = true;
        scope.showRegions = false;
        console.log(SymPaas);
        SymPaas.call('regions').then(function(data) {
          scope.showRegions = true;
          scope.regions = data['regions'];
        }, function(err) {
          console.log('error loading regions', err);
          scope.showRegions = false;
        }).finally(function() {
          scope.regionsLoading = false;
        });
      }
    };
  });