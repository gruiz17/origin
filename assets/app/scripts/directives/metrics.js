'use strict';
angular.module("openshiftConsole")
  .directive("metrics", function($http) {
    return {
      restrict: 'E',
      scope: {
        // just keeping the pod retained
        pod: "=pod",
      },
      templateUrl: 'views/directives/metrics.html',
      link: function(scope) {
        /*
          the thing that contains all the data points
        */
        scope.dataPoints = [];

        /*
          options to format chart
        */
        scope.chartOptions = {
          pointDot: false,
          showTooltips: false
        };

        /*
          loading value
        */
        scope.loading = true;

        /* 
          name map for human names and influxDB names
          TODO: put this in filter
        */
        var nameMap = {
          'uptime': {
            'queryName': 'uptime_ms_cumulative',
            'humanName': 'Cumulative Uptime',
            'order': 3
          },
          'memoryUse': {
            'queryName': 'memory/usage_bytes_gauge',
            'humanName': 'Memory Usage (Megabytes)',
            'order': 1
          },
          'events': {
            'queryName': 'log/events',
            'humanName': 'Events'
          },
          'fsUse': {
            'queryName': 'filesystem/usage_bytes_gauge',
            'humanName': 'File System Usage'
          },
          'cpuUse': {
            'queryName': 'cpu/usage_ns_cumulative',
            'humanName': 'CPU usage',
            'order': 2
          },
          'nrb': {
            'queryName': 'network/rx_bytes_cumulative',
            'humanName': 'Cumulative Megabytes Received',
            'order': 6
          },
          'nre': {
            'queryName': 'network/rx_errors_cumulative',
            'humanName': 'Cumulative Errors while Receiving',
            'order': 7
          },
          'ntb': {
            'queryName': 'network/tx_bytes_cumulative',
            'humanName': 'Cumulative Megabytes Sent',
            'order': 4
          },
          'nte': {
            'queryName': 'network/tx_errors_cumulative',
            'humanName': 'Cumulative Errors While Sending',
            'order': 5
          }
        };

        var names = ['uptime', 'memoryUse', 'cpuUse', 'nrb', 'nre', 'ntb', 'nte'];

        /*
          input: the thing you want to query, how much of it you want
          output: URL formatted query
        */
        var buildQuery = function(thing, quantity) {
          // swap to this line pod.uid instead of igor's rails thing,
          // i'm only using the currently uncommented line for testing
          // var query = 'select * from "' + nameMap[thing].queryName + '" where pod_id = \'' + scope.pod.uid + '\' limit ' + quantity.toString();
          var query = 'select * from "' + nameMap[thing].queryName + '" where pod_id = \'a34015de-4d2c-11e5-8cd5-02522412fa28\' limit ' + quantity.toString();
          return encodeURIComponent(query);
        };

        /*
          input: array index of time column, array index of value column
          output: Array[2], with moment-formatted string value of timestamp
        */
        var getVals = function(timeIndex, valueIndex) {
          return function(dataArray) {
            return [moment(dataArray[timeIndex].toString(), 'x').format('h:mm:ss a'), dataArray[valueIndex]];
          };
        };

        /* 
           input: multivariable array of things
           out: Array[2]
           function to go from [[x,y], [x,y], [x,y], [x,y]]
           to [[x, '', '', ''], [[y, y, y, y]]] 
        */
        var flipArray = function(arr) {
          var x = [];
          var y = [];
          var i = 0;
          arr.forEach(function(oldArr) {
            if (i % 10 === 0) {
              x.unshift(oldArr[0]);
            }
            else {
              x.unshift('');
            }
            y.unshift(oldArr[1]);
            i += 1;
          });
          return [x, [y]];
        };

        // keeping track of all the queries loaded to show if completely loaded
        var loadedQueries = 0;

        // god function/massive side effecting function
        names.forEach(function(name) {
          // data object to retain the time labels and data points
          var dataObj = {
            'name': nameMap[name].humanName
          };

          // url to query
          // change [ourkubernetesurl] to our kubernetes url
          // note: change 'insertuser' to actual user and 'insertpass' to actual password
          var url = 'http://[ourkubernetesurl]/db/k8s/series?u=[user]&p=[user]&pretty=true&q=' + buildQuery(name, 100);
          
          // querying the url
          $http.get(url).then(function(res) {
            /* 
              getting the vals from the response
              and passing them to the data object
            */
            var timeIndex = res.data[0]['columns'].indexOf('time');
            var valIndex = res.data[0]['columns'].indexOf('value');
            var points = flipArray(res.data[0]['points'].map(getVals(timeIndex, valIndex)));


            // convert bytes to mb
            if (['ntb', 'nrb', 'fsUse', 'memoryUse'].indexOf(name) > -1) {
              points[1][0] = points[1][0].map(function(bytes) {
                return (Math.floor(bytes / 100000) / 10);
              });
            }

            // nanoseconds to miliseconds
            if (name === 'cpuUse') {
              points [1][0] = points[1][0].map(function(ns) {
                return Math.floor(ns / 1000000);
              });
            }

            // pushing to data object
            dataObj.labels = points[0];
            dataObj.data = points[1];
            dataObj.order = nameMap[name].order;
          }, function(err) {
            dataObj.error = true;
            dataObj.status = err.status;
            if (err.data === null && err.status === 0) {
              dataObj.reason = 'Could not resolve hostname.';
            }
            else {
              dataObj.reason = err.data;
            }
          }).finally(function() {
            // checking if loaded or not
            loadedQueries += 1;
            scope.dataPoints.push(dataObj);
            if (loadedQueries === 7) {
              // sorting based on order i specified
              scope.dataPoints.sort(function(a, b) {
                if (a.order < b.order) {
                  return -1;
                }
                if (a.order > b.order) {
                  return 1;
                }
                return 0;
              });
              // load all the things
              scope.loading = false;
              console.log(scope.loading);
            }
          });
        });
      }
    };
  });