# ng-mobile

**Note:** ``ng-mobile`` is completely new with Version 0.3.3.

This is a starting point for my mobile websites or mobile applications (e.g. with phonegap/cordova). [Read what's the motivation](../wiki/motivation).
`ng-mobile` is a AngularJS module that makes some ground work for you. 

It is based on

  * [AngularJS](http://www.angularjs.org)
  * [angular-mobile-nav](https://github.com/ajoslin/angular-mobile-nav)

All honor and thanks goes to the skilled people working on that great mentioned open source projects.

## Features

  * Module for AngularJS with all it's great features
  * prefetch and cache template files from routes
  * save and restore scroll position per route
  * installs Angular 1.1.5 to use $animation and other great enhancements
  * installs `angular-mobile-nav`
  * let you use the [design and styling you want to](wiki/Themes-you-could-use-for-your-next-mobile-application)

## Requirements

  * [bower](http://bower.io/)

## Install
Installation is very easy...

    bower install ng-mobile

All dependencies will be resolved automatically (AngularJS 1.1.5, angular-mobile-nav).

## Usage

### Include needed components to your index.html

	<script src="components/angular/angular.min.js"></script>
	<!-- optional START -->
	<script src="components/angular/angular-resource.min.js"></script>
	<script src="components/angular/angular-sanitize.min.js"></script>
	<script src="components/angular/angular-cookies.min.js"></script>
	<!-- optional END -->
	<script src="components/angular-mobile-nav/mobile-nav.js"></script>
	<script src="components/ng-mobile/ng-mobile.js"></script>
	<!-- Your application -->
	<script src="myApp.js"></script>


### Declare `ng-mobile` as a dependency to your application.

    angular.module("myApp",["ngMobile"]);

## TODO
* write wiki pages 
* Create a demo application (use `fries` theme)
* add helpfull directives for mobile purposes
