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
                },300);

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
                        container.css('visibility','visible')
                    },600);
                }

                // stop transition
                setTimeout(function() {
                    //container.fadeIn(200);
                    container.show();
                },300)
            }
            else {
                container.show();
            }


            return response;
        }, function (response) {
            // stop transition
            container.show();
            return $q.reject(response);
        });
    };
});

/**
 *ngMobile Module
 */
var ngMobile = angular.module('ngMobile', ['SharedServices']).config(function($routeProvider, $locationProvider) {
    // configure your routes to load the partials / views
    $routeProvider.when('/start', { template: 'partials/default.html', controller: DefaultCntl });
    $routeProvider.when('/demo', { template: 'partials/demo.html', controller: DemoCntl });
    $routeProvider.when('/form', { template: 'partials/form.html', controller: FormCntl });
    $routeProvider.when('/list', { template: 'partials/list.html', controller: ListCntl });
    $routeProvider.otherwise({ template: 'partials/default.html', controller: DefaultCntl });

    $locationProvider.html5Mode(false).hashPrefix('');
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
function MainCntl($scope, $location) {
    $scope.txtHeader = 'Default Header';
    $scope.header = 'partials/default_header.html';
    $scope.footer= 'partials/default_footer.html';
}

/**
 * Default Controller for the start page
 */
function DefaultCntl($scope, $location) {
    // Set partials for Header and Footer in MainCntl
    $scope.$parent.txtHeader = 'Start';
    $scope.$parent.header = 'partials/default_header.html';
    $scope.$parent.footer= 'partials/default_footer.html';
}

function DemoCntl($scope) {
    $scope.txtHeader = 'Custom Header';
}

function FormCntl($scope) {
    $scope.$parent.txtHeader = 'Form Demo';
}

function ListCntl($scope) {
    $scope.txtHeader = 'A List Demo';
    $scope.listData = [{
        'title':'Title #1'
        ,'text':'This ist the Text #1'
    },{
        'title':'Title #2'
        ,'text':'This ist the Text #2'
    },{
        'title':'Title #3'
        ,'text':'This ist the Text #3'
    },{
        'title':'Title #4'
        ,'text':'This ist the Text #4'
    },{
        'title':'Title #5'
        ,'text':'This ist the Text #5'
    }];
}
