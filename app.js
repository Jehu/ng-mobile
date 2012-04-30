/**
 * for each partial load do some transition and other stuff
 * credits for this solution goes to 'zadam', see https://groups.google.com/d/msg/angular/OroP1DBE6AA/AfpLQP-8V1MJ
 */
angular.module('SharedServices', []).config(function ($httpProvider) {
    $httpProvider.responseInterceptors.push('ngMobileHttpInterceptor');
    var spinnerFunction = function (data, headersGetter) {
        // start transition
        $('#content').hide();
        return data;
    };
    $httpProvider.defaults.transformRequest.push(spinnerFunction);
})
// register the interceptor as a service, intercepts ALL angular ajax http calls
.factory('ngMobileHttpInterceptor', function ($q, $window) {
    return function (promise) {
        var container = $('#content');
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

                // initialize iScroll if needed
                if($(response.data).find('div#scroller').length) {
                    setTimeout(function() {
                        $window.ngMobileScroll = new iScroll('wrapper', { 
                            hScrollbar: false, 
                            vScrollbar: false,
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
            }

            // stop transition
            container.show();

            setTimeout(function() {
                // set menulink in footer active
                $('footer, #footer').find('li > a').removeClass('active');
                $('footer, #footer').find('li > a').each(function(index, val) { 
                    var regExp = /(\/?#\/?)/;
                    //console.log($(val).attr('href').replace(regExp,''), location.hash.replace(regExp,''));
                    if($(val).attr('href').replace(regExp,'') === location.hash.replace(regExp,"")) {
                        $(val).addClass('active');
                    }
                    else {
                        $(val).removeClass('active');
                    }
                });
            },0);

            return response;
        }, function (response) {
            // stop transition
            container.fadeIn();
            return $q.reject(response);
        });
    };
});

/**
 *ngMobile Module
 */
var ngMobile = angular.module('ngMobile', ['SharedServices']).config(function($routeProvider, $locationProvider) {
    // configure your routes to load the partials / views
    $routeProvider.when('', { template: 'partials/default.html', controller: DefaultCntl });
    $routeProvider.when('/', { template: 'partials/default.html', controller: DefaultCntl });
    $routeProvider.when('/start', { template: 'partials/default.html', controller: DefaultCntl });
    $routeProvider.when('/demo', { template: 'partials/demo.html', controller: DemoCntl });
    $routeProvider.when('/form', { template: 'partials/form.html', controller: FormCntl });
    //$routeProvider.otherwise({redirectTo: '/'});
    $routeProvider.otherwise({ template: 'partials/default.html', controller: DefaultCntl });

    $locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('');
});

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
 * Main Controller, shares his scope with all other controllers
 */
function MainCntl($scope,$location) {
    $scope.txtHeader = 'Default Header';
    $scope.header = 'partials/default_header.html';
    $scope.footer= 'partials/default_footer.html';

    // set active tab in footer
    //$scope.$on('$afterRouteChange', function() {
    //});
    //$scope.$on('$beforeRouteChange', function() {
    //});
}

/**
 * Default Controller for the start page
 */
function DefaultCntl($scope) {
    // Set partials for Header and Footer in MainCntl
    $scope.$parent.txtHeader = 'Start';
    $scope.$parent.header = 'partials/default_header.html';
    $scope.$parent.footer= 'partials/default_footer.html';
}

function DemoCntl($scope) {
    $scope.txtHeader = 'Dies ist ein Test';
}

function FormCntl($scope) {
    $scope.$parent.txtHeader = 'Form Demo';
}
