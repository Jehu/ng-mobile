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
            $('footer, #footer, nav, #nav').find('li > a').each(function(index, val) {
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
                // hide global nav, if any in partial
                if($(cntlElem).find('div#nav').length) {
                    $('nav').hide();
                }
                else {
                    $('nav').show();
                }

                // refresh Navifgation
                setTimeout(function() {
                    refreshNavigation()
                },10);

                // initialize jScrollPane if needed
                if($(response.data).find('#wrapper').length) {
                    $window.initScroller = function(timeout) {
                        var timeout = timeout || 300;
                        setTimeout(function() {
                            $window.ngMobileScroll = jQuery('#wrapper').jScrollPane({
                                showArrows: false
                                ,verticalDragMinHeight: 0
                                ,verticalDragMaxHeight: 15
                                ,animateScroll: true
                                ,animateEase: 'swing'
                                ,animateDuration: 500
                                ,clickOnTrack: false
                                ,autoReinitialise: true
                                ,autoReinitialiseDelay: 300
                            });
                        },timeout);
                    }
                    $window.initScroller();
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
 * Action dialog to list a group of buttons that can trigger some further actions
 * Dialog is shown as an overlay
 *
 * You have to add the following directive to your view/partial:
 *     <ngm-dialog-action></ngm-dialog-action>
 *
 * Directive can be used in view:
 *     <button ng-click="dialogAction.show([{
 *         text: 'Edit'
 *         ,callback: 'myEditItemCallback({{item}})'
 *     },{
 *         text: 'Delete'
 *         ,callback: 'myDeleteItemCallback({{item}})'
 *     }])">Show Actino Dialog</button>
 *
 * ...or in controller:
 *     $scope.dialogAction.show([{
 *         text: 'Edit'
 *         ,callback: 'myEditItemCallback($scope.item)'
 *     },{
 *         text: 'Delete'
 *         ,callback: 'myDeleteItemCallback($scope.item)'
 *     }]);
 *
 */
ngMobile.directive('ngmDialogAction', function factory() {
    return {
        priority: 0,
        replace: true,
        transclude: false,
        controller: function($scope, $element, $attrs) {
            // hide dialog
            $element.hide();

            // implement some methods to scope, can be used in controller and view
            $scope.dialogAction = {
                // show dialog
                show: function(customActions) {
                    if(customActions) {
                        // if there are actions in show() call
                        this.actions = customActions;
                    }
                    else {
                        // else take the actions from directive param
                        this.actions = eval($attrs.actions);
                    }
                    // add a cancel button at the end of the button list
                    this.actions.push({text: 'Cancel', callback:'cancel'})
                    $element.show();
                }
                // hide dialog
                ,hide: function() {
                    $element.hide();
                }
                ,actions: {}
                // execute callback
                ,exec: function(cb, scope) {
                    if(cb == 'cancel') {
                        // cancel ation and close dialog
                        $element.hide();
                        return;
                    }
                    // do callback and close dialog
                    if(_.isObject(scope)) {
                        cb = new Function(cb);
                        cb();
                    }
                    else {
                       // callback with braces
                       if(cb.match(/\(.*?\)/)) {
                           eval("$scope."+cb);
                       }
                       else {
                           $scope[cb]();
                       }
                    }
                    $element.hide();
                }
            }

        },
        restrict: 'E',
        template: '<div class="dialog action"><div class="wrapper">'
            + '<ul>'
            + '    <li ng-repeat="item in dialogAction.actions">'
            + '        <button ng-click="dialogAction.exec(item.callback, item.scope)">{{item.text}}</button>'
            + '    </li>'
            + '</ul></div></div>'
    }
});

/**
 *
 * Confirm dialog to 'yes' or 'no' as an answer.
 * Dialog is shown as an overlay.
 *
 * You have to add the following directive to your view/partial:
 * <ngm-dialog-confirm></ngm-dialog-confirm>
 *
 * Directive can be used in view:
 *     <button ng-click="dialogConfirm.show('Really delete this item?', 'myConfirmDialogCallback')">Delete</button>
 *
 * ...or in controller:
 *     $scope.dialogConfirm.show('Really delete this item?', 'myConfirmDialogCallback');
 *
 * The callback (placed in controller) could look like this:
 *     $scope.myConfirmDialogCallback = function(answer) {
 *         if(answer == 'yes') {
 *             // do some stuff here
 *         }
 *     };
 *
 */
ngMobile.directive('ngmDialogConfirm', function factory() {
    return {
        priority: 0,
        replace: true,
        transclude: false,
        controller: function($scope, $element, $attrs) {
            // hide dialog
            $element.hide();

            // callback to call by default, can be overridden by dialogConfirm.show('text', 'myCallback')
            var cb = $attrs.callback;

            // implement some methods to scope, can be used in controller and view
            $scope.dialogConfirm = {
                // default message
                message: '[no message given]'
                /**
                 * dialogConfirm.show('text', 'myCallback') allows to open a dialog with custom text and callback
                 * overrides values from directive attributes
                 */
                ,show: function(msg, callback) {
                    if(msg) {
                        $scope.dialogConfirm.message = msg;
                    }
                    if(callback) {
                        cb = callback;
                    }
                    $element.show();
                }
                // dialog can be hidden
                ,hide: function() {
                    $element.hide();
                }
                // callback for answer
                ,answer: function(answer) {
                    // callback with params, they will be deleted and replaced by the users answer, sorry...
                    if(cb.match(/\(.*?\)/)) {
                        cb = cb.replace(/\(.*?\)/, '(answer)');
                        eval("$scope."+cb);
                    }
                    // callback without params
                    else {
                        $scope[cb](answer);
                    }
                    //$scope[cb](answer);
                    $element.hide();
                }
            }

        },
        restrict: 'E',
        template: '<div class="dialog yesno">'
            + '<div class="wrapper">'
            + '    <p>{{dialogConfirm.message}}</p>'
            + '    <button class="btn btn-red" ng-click="dialogConfirm.answer(\'yes\')">Yes</button> '
            + '    <button class="btn" ng-click="dialogConfirm.answer(\'no\')">No</button>'
            + '</div></div>',
        compile: function compile(tElement, tAttrs, transclude) {
            return function postLink(scope, iElement, iAttrs) {
                scope.dialogConfirm.message = iAttrs.message || scope.dialogConfirm.message;
            }
        }
    }
});

/**
 * Main Controller, provide some methods to use in all other child controllers
 */
function MainCntl($scope, $location) {
    // default header Text
    $scope.txtHeader = undefined

    // default navigation, footer and header partials
    $scope.navigation = 'partials/default_navigation.html';
    $scope.header = 'partials/default_header.html';
    $scope.footer = 'partials/default_navigation.html';

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

