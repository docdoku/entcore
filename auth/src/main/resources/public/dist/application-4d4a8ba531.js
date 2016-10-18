/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	var activationController_1 = __webpack_require__(2);
	var forgotController_1 = __webpack_require__(3);
	var resetController_1 = __webpack_require__(4);
	var loginController_1 = __webpack_require__(5);
	entcore_1.routes.define(function ($routeProvider) {
	    $routeProvider
	        .when('/id', {
	        action: 'actionId'
	    })
	        .when('/password', {
	        action: 'actionPassword'
	    })
	        .otherwise({
	        redirectTo: '/'
	    });
	});
	entcore_1.ng.controllers.push(activationController_1.activationController);
	entcore_1.ng.controllers.push(forgotController_1.forgotController);
	entcore_1.ng.controllers.push(resetController_1.resetController);
	entcore_1.ng.controllers.push(loginController_1.loginController);
	


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = entcore;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	exports.activationController = entcore_1.ng.controller('ActivationController', ['$scope', function ($scope) {
	        $scope.template = entcore_1.template;
	        $scope.lang = entcore_1.idiom;
	        $scope.template.open('main', 'activation-form');
	        $scope.user = {};
	        $scope.phonePattern = new RegExp("^(00|\\+)?(?:[0-9] ?-?\\.?){6,14}[0-9]$");
	        $scope.welcome = {};
	        entcore_1.http().get('/auth/configure/welcome').done(function (d) {
	            $scope.welcome.content = d.welcomeMessage;
	            if (!d.enabled) {
	                $scope.welcome.hideContent = true;
	            }
	            $scope.$apply();
	        })
	            .e404(function () {
	            $scope.welcome.hideContent = true;
	            $scope.$apply();
	        });
	        if (window.location.href.indexOf('?') !== -1) {
	            if (window.location.href.split('login=').length > 1) {
	                $scope.user.login = window.location.href.split('login=')[1].split('&')[0];
	            }
	            if (window.location.href.split('activationCode=').length > 1) {
	                $scope.user.activationCode = window.location.href.split('activationCode=')[1].split('&')[0];
	            }
	        }
	        entcore_1.http().get('/auth/context').done(function (data) {
	            $scope.callBack = data.callBack;
	            $scope.cgu = data.cgu;
	            $scope.passwordRegex = data.passwordRegex;
	            $scope.mandatory = data.mandatory;
	            $scope.$apply('cgu');
	        });
	        $scope.identicalRegex = function (str) {
	            if (!str)
	                return new RegExp("^$");
	            return new RegExp("^" + str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$");
	        };
	        $scope.refreshInput = function (form, inputName) {
	            form[inputName].$setViewValue(form[inputName].$viewValue);
	        };
	        $scope.passwordComplexity = function (password) {
	            if (!password)
	                return 0;
	            if (password.length < 6)
	                return password.length;
	            var score = password.length;
	            if (/[0-9]+/.test(password) && /[a-zA-Z]+/.test(password)) {
	                score += 5;
	            }
	            if (!/^[a-zA-Z0-9- ]+$/.test(password)) {
	                score += 5;
	            }
	            return score;
	        };
	        $scope.translateComplexity = function (password) {
	            var score = $scope.passwordComplexity(password);
	            if (score < 12) {
	                return entcore_1.idiom.translate("weak");
	            }
	            if (score < 20)
	                return entcore_1.idiom.translate("moderate");
	            return entcore_1.idiom.translate("strong");
	        };
	        $scope.activate = function () {
	            var emptyIfUndefined = function (item) {
	                return item ? item : "";
	            };
	            entcore_1.http().post('/auth/activation', entcore_1.http().serialize({
	                login: $scope.user.login,
	                password: $scope.user.password,
	                confirmPassword: $scope.user.confirmPassword,
	                acceptCGU: $scope.user.acceptCGU,
	                activationCode: $scope.user.activationCode,
	                callBack: $scope.callBack,
	                mail: emptyIfUndefined($scope.user.email),
	                phone: emptyIfUndefined($scope.user.phone)
	            }))
	                .done(function (data) {
	                if (typeof data !== 'object') {
	                    window.location.href = '/';
	                }
	                if (data.error) {
	                    $scope.error = data.error.message;
	                }
	                $scope.$apply('error');
	            });
	        };
	    }]);
	exports.cguController = entcore_1.ng.controller('CGUController', ['$scope', 'template', function ($scope, template) {
	        $scope.template = template;
	        $scope.template.open('main', 'cgu-content');
	    }]);
	


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	exports.forgotController = entcore_1.ng.controller('ForgotController', ['$scope', 'route', function ($scope, route) {
	        $scope.template = entcore_1.template;
	        $scope.template.open('main', 'forgot-form');
	        $scope.user = {};
	        $scope.welcome = {};
	        entcore_1.http().get('/auth/configure/welcome').done(function (d) {
	            $scope.welcome.content = d.welcomeMessage;
	            if (!d.enabled) {
	                $scope.welcome.hideContent = true;
	            }
	            $scope.$apply();
	        })
	            .e404(function () {
	            $scope.welcome.hideContent = true;
	            $scope.$apply();
	        });
	        if (window.location.href.indexOf('?') !== -1) {
	            if (window.location.href.split('login=').length > 1) {
	                $scope.login = window.location.href.split('login=')[1].split('&')[0];
	            }
	            if (window.location.href.split('activationCode=').length > 1) {
	                $scope.activationCode = window.location.href.split('activationCode=')[1].split('&')[0];
	            }
	        }
	        route({
	            actionId: function (params) {
	                $scope.user.mode = "id";
	            },
	            actionPassword: function (params) {
	                $scope.user.mode = "password";
	            }
	        });
	        $scope.initUser = function () {
	            $scope.user = {};
	        };
	        $scope.forgot = function () {
	            if ($scope.user.mode === 'password') {
	                $scope.forgotPassword($scope.user.login, 'mail');
	            }
	            else {
	                $scope.forgotId($scope.user.mail, 'mail');
	            }
	        };
	        $scope.passwordChannels = function (login) {
	            entcore_1.http().get('/auth/password-channels', { login: login })
	                .done(function (data) {
	                $scope.user.channels = {
	                    mail: data.mail,
	                    mobile: data.mobile
	                };
	                $scope.$apply();
	            })
	                .e400(function (data) {
	                $scope.error = 'auth.notify.' + JSON.parse(data.responseText).error + '.login';
	                $scope.$apply();
	            });
	        };
	        $scope.forgotPassword = function (login, service) {
	            entcore_1.http().postJson('/auth/forgot-password', { login: login, service: service })
	                .done(function (data) {
	                entcore_1.notify.info("auth.notify." + service + ".sent");
	                $scope.user.channels = {};
	                $scope.$apply();
	            })
	                .e400(function (data) {
	                $scope.error = 'auth.notify.' + JSON.parse(data.responseText).error + '.login';
	                $scope.$apply();
	            });
	        };
	        $scope.forgotId = function (mail, service) {
	            entcore_1.http().postJson('/auth/forgot-id', { mail: mail, service: service })
	                .done(function (data) {
	                entcore_1.notify.info("auth.notify." + service + ".sent");
	                if (data.mobile) {
	                    $scope.user.channels = {
	                        mobile: data.mobile
	                    };
	                }
	                else {
	                    $scope.user.channels = {};
	                }
	                $scope.$apply();
	            })
	                .e400(function (data) {
	                $scope.error = 'auth.notify.' + JSON.parse(data.responseText).error + '.mail';
	                $scope.$apply();
	            });
	        };
	    }]);
	


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var entcore_1 = __webpack_require__(1);
	exports.resetController = entcore_1.ng.controller('ResetController', ['$scope', function ($scope) {
	        $scope.template = entcore_1.template;
	        $scope.lang = entcore_1.idiom;
	        $scope.template.open('main', 'reset-form');
	        $scope.user = {};
	        $scope.welcome = {};
	        entcore_1.http().get('/auth/configure/welcome').done(function (d) {
	            $scope.welcome.content = d.welcomeMessage;
	            if (!d.enabled) {
	                $scope.welcome.hideContent = true;
	            }
	            $scope.$apply();
	        })
	            .e404(function () {
	            $scope.welcome.hideContent = true;
	            $scope.$apply();
	        });
	        if (window.location.href.indexOf('?') !== -1) {
	            if (window.location.href.split('login=').length > 1) {
	                $scope.login = window.location.href.split('login=')[1].split('&')[0];
	            }
	            if (window.location.href.split('activationCode=').length > 1) {
	                $scope.activationCode = window.location.href.split('activationCode=')[1].split('&')[0];
	            }
	        }
	        entcore_1.http().get('/auth/context').done(function (data) {
	            $scope.passwordRegex = data.passwordRegex;
	        });
	        $scope.identicalRegex = function (str) {
	            if (!str)
	                return new RegExp("^$");
	            return new RegExp("^" + str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$");
	        };
	        $scope.refreshInput = function (form, inputName) {
	            form[inputName].$setViewValue(form[inputName].$viewValue);
	        };
	        $scope.passwordComplexity = function (password) {
	            if (!password)
	                return 0;
	            if (password.length < 6)
	                return password.length;
	            var score = password.length;
	            if (/[0-9]+/.test(password) && /[a-zA-Z]+/.test(password)) {
	                score += 5;
	            }
	            if (!/^[a-zA-Z0-9- ]+$/.test(password)) {
	                score += 5;
	            }
	            return score;
	        };
	        $scope.translateComplexity = function (password) {
	            var score = $scope.passwordComplexity(password);
	            if (score < 12) {
	                return entcore_1.idiom.translate("weak");
	            }
	            if (score < 20)
	                return entcore_1.idiom.translate("moderate");
	            return entcore_1.idiom.translate("strong");
	        };
	        $scope.reset = function () {
	            entcore_1.http().post('/auth/reset', entcore_1.http().serialize({
	                login: $scope.user.login.trim(),
	                password: $scope.user.password,
	                confirmPassword: $scope.user.confirmPassword,
	                resetCode: resetCode
	            }))
	                .done(function (data) {
	                if (typeof data !== 'object') {
	                    window.location.href = '/';
	                }
	                if (data.error) {
	                    $scope.error = data.error.message;
	                }
	                $scope.$apply('error');
	            });
	        };
	    }]);
	


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright. Tous droits réservés. WebServices pour l’Education.
	"use strict";
	var entcore_1 = __webpack_require__(1);
	var jquery_1 = __webpack_require__(1);
	exports.loginController = entcore_1.ng.controller('LoginController', ['$scope', function ($scope) {
	        $scope.template = entcore_1.template;
	        $scope.template.open('main', 'login-form');
	        $scope.user = {};
	        $scope.welcome = {};
	        entcore_1.http().get('/auth/configure/welcome').done(function (d) {
	            $scope.welcome.content = d.welcomeMessage;
	            if (!d.enabled) {
	                $scope.welcome.hideContent = true;
	            }
	            $scope.$apply();
	        })
	            .e404(function () {
	            $scope.welcome.hideContent = true;
	            $scope.$apply();
	        });
	        var browser = function (userAgent) {
	            var version;
	            if (userAgent.indexOf('Chrome') !== -1) {
	                version = parseInt(userAgent.split('Chrome/')[1].split('.')[0]);
	                return {
	                    browser: 'Chrome',
	                    version: version,
	                    outdated: version < 39
	                };
	            }
	            else if (userAgent.indexOf('AppleWebKit') !== -1 && userAgent.indexOf('Chrome') === -1) {
	                version = parseInt(userAgent.split('Version/')[1].split('.')[0]);
	                return {
	                    browser: 'Safari',
	                    version: version,
	                    outdated: version < 7
	                };
	            }
	            else if (userAgent.indexOf('Firefox') !== -1) {
	                version = parseInt(userAgent.split('Firefox/')[1].split('.')[0]);
	                return {
	                    browser: 'Firefox',
	                    version: version,
	                    outdated: version < 34
	                };
	            }
	            else if (userAgent.indexOf('MSIE') !== -1) {
	                version = parseInt(userAgent.split('MSIE ')[1].split(';')[0]);
	                return {
	                    browser: 'MSIE',
	                    version: version,
	                    outdated: version < 10
	                };
	            }
	            else if (userAgent.indexOf('MSIE') === -1 && userAgent.indexOf('Trident') !== -1) {
	                version = parseInt(userAgent.split('rv:')[1].split('.')[0]);
	                return {
	                    browser: 'MSIE',
	                    version: version,
	                    outdated: version < 10
	                };
	            }
	        };
	        $scope.browser = browser(navigator.userAgent);
	        if (window.location.href.indexOf('?') !== -1) {
	            if (window.location.href.split('login=').length > 1) {
	                $scope.login = window.location.href.split('login=')[1].split('&')[0];
	            }
	            if (window.location.href.split('activationCode=').length > 1) {
	                $scope.activationCode = window.location.href.split('activationCode=')[1].split('&')[0];
	            }
	            if (window.location.href.split('callback=').length > 1) {
	                $scope.callBack = window.location.href.split('callback=')[1].split('&')[0];
	            }
	        }
	        entcore_1.http().get('/auth/context').done(function (data) {
	            //$scope.callBack = data.callBack;
	            $scope.cgu = data.cgu;
	            $scope.$apply('cgu');
	        });
	        $scope.connect = function () {
	            console.log('connect');
	            // picking up values manually because the browser autofill isn't registered by angular
	            entcore_1.http().post('/auth/login', entcore_1.http().serialize({
	                email: jquery_1.$('#email').val(),
	                password: jquery_1.$('#password').val(),
	                rememberMe: $scope.user.rememberMe,
	                callBack: $scope.callBack
	            }))
	                .done(function (data) {
	                if (typeof data !== 'object') {
	                    if (window.location.href.indexOf('callback=') !== -1) {
	                        window.location.href = unescape(window.location.href.split('callback=')[1]);
	                    }
	                    else {
	                        window.location.href = $scope.callBack;
	                    }
	                }
	                if (data.error) {
	                    $scope.error = data.error.message;
	                }
	                $scope.$apply('error');
	            });
	        };
	        for (var i = 0; i < 10; i++) {
	            if (history.pushState) {
	                history.pushState({}, '');
	            }
	        }
	    }]);
	


/***/ }
/******/ ]);
//# sourceMappingURL=application.js.map