/**
 * for each partial load do some transition and other stuff
 * credits for this solution goes to 'zadam', see https://groups.google.com/d/msg/angular/OroP1DBE6AA/AfpLQP-8V1MJ
 */
angular.module('SharedServices', []).config(function ($httpProvider) {
    $httpProvider.responseInterceptors.push('ngMobileHttpInterceptor');
    var spinnerFunction = function (data, headersGetter) {
        // start transition
        $('#loader').show();

        return data;
    };
    $httpProvider.defaults.transformRequest.push(spinnerFunction);
})
// register the interceptor as a service, intercepts ALL angular ajax http calls
.factory('ngMobileHttpInterceptor', function ($q, $window) {
    return function (promise) {
        // remove loading animation after partial was loaded
        var removeLoader = function() {
            setTimeout(function() {
                $('#loader').fadeOut();
            },100);
        }

        var refreshNavigation = function() {
            // set menulink in footer active
            $('footer, #footer').find('li > a').each(function(index, val) { 
                var regExp = /(\/?#?\/?)/;
                if($(val).attr('href').replace(regExp,'') === location.hash.replace(regExp,"")) {
                    $(val).addClass('active');
                }
                else {
                    $(val).removeClass('active');
                }
            });
        };

        return promise.then(function (response) {
            // only if loaded partial is an controller do some things...
            if($(response.data).attr('ng-controller')) {
                var cntlElem = $(response.data);

                // hide global header, if any in partial
                if($(cntlElem).find('div#header').length) {
                    $('header').hide();
                }
                else {
                    $('header').show();
                }
                // hide global footer, if any in partial
                if($(cntlElem).find('div#footer').length) {
                    $('footer').hide();
                }
                else {
                    $('footer').show();
                }

                // refresh Navifgation
                setTimeout(function() {
                    refreshNavigation()
                },10);

                // initialize iScroll if needed
                if($(response.data).find('div#scroller').length) {
                    setTimeout(function() {
                        $window.ngMobileScroll = new iScroll('wrapper', { 
                            hScrollbar: false, 
                            vScrollbar: true,
                            momentum: false,
                            onBeforeScrollStart: function (e) {
                                var target = e.target;
                                while (target.nodeType != 1) target = target.parentNode;
                                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
                                    e.preventDefault();
                                }
                            }
                        });
                    },300);
                }

                // stop transition
                removeLoader();
            }
            else {
                // stop transition
                removeLoader();
            }


            return response;
        }, function (response) {
            // stop transition
            removeLoader();

            return $q.reject(response);
        });
    };
});

/**
 *ngMobile Module
 */
var ngMobile = angular.module('ngMobile', ['SharedServices']);

/*
ngMobile.factory('ngmService', function() {
    return {
        // setter to load another partial for regions (header or footer)
        // here we must provide the scope. so we will let it in MainCntrl as a method
        setPartial: function(scope, region, filename) {
            scope.$parent[region] = filename;
        }
    }
});
*/

/**
 * Remove preloading animation after a timeout
 */
ngMobile.directive('ngmRemovePreloader', function () {
    return function (scope, element, attrs) {
        setTimeout(function() {
            element.fadeOut();
        },1000);
    };
});

/**
 * Main Controller, provide some methods to use in all other child controllers
 */
function MainCntl($scope, $location) {
    // default header Text
    $scope.txtHeader = undefined 

    // default footer and header partials
    $scope.header = 'partials/default_header.html';
    $scope.footer = 'partials/default_footer.html';

    // setter to load another partial for regions (header or footer)
    $scope.setPartial = function(region, filename) {
        $scope[region] = filename;
    }

    // setter for header text
    $scope.setHeaderText = function(string) {
        $scope.txtHeader = string;
    }

    // make history back possible
    $scope.previousPage = {
        txtHeader: ''
        ,hash: ''
        ,path: ''
    }

    $scope.$on('$beforeRouteChange', function() {
        $scope.previousPage.txtHeader = $scope.txtHeader;
        $scope.previousPage.hash = $scope.previousPage.path.replace(/\/?#?\/?/,'#');
    });

    $scope.$on('$afterRouteChange', function() {
        $scope.previousPage.path = $location.path();
    });

    // history back method to use it in a view or controller
    $scope.historyBack = function() {
        $location.path($scope.previousPage.path);
    }
}

