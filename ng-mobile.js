'use strict';

angular.module('ngMobile', ['ajoslin.mobile-navigate'])
.run(['$rootScope', '$route', '$http', '$templateCache', '$timeout', '$window', '$location', function($rootScope, $route, $http, $templateCache, $timeout, $window, $location) {
	$rootScope.scrollPos = [];

	// Cache all templates on App Start
	angular.forEach($route.routes, function(r) {
		if (r.templateUrl) {
			$http.get(r.templateUrl, {cache: $templateCache});
		}
	});

	// Generic solution to save/restore scroll position START
	$rootScope.scrollPos = {}; // scroll position of each view

	$window.addEventListener('scroll', function() {
		if ($rootScope.okSaveScroll) { // false between $routeChangeStart and $routeChangeSuccess
			$rootScope.scrollPos[escape($location.path())] = $window.scrollY;
		}
	});

	$rootScope.$on('$routeChangeStart', function(e, cur, prev) {
		if(prev !== undefined && prev.hasOwnProperty('scope') && prev.scope !== undefined) {
			prev.scope.$destroy();
		}
		$rootScope.okSaveScroll = false;
	});

	$rootScope.$on('$routeChangeSuccess', function() {
		// FIXME add fastclick as a dependency?
		//$timeout(function() {
		//	window.FastClick.attach(document.body);
		//	return;
		//},0);

		$timeout(function() { // wait for DOM, then restore scroll position
			$window.scrollTo(0, ($rootScope.scrollPos[escape($location.path())] !== undefined) ? $rootScope.scrollPos[escape($location.path())] : 0);
			$rootScope.okSaveScroll = true;
			return;
		},0);
	});
	// Generic solution for scroll position END
}]);

