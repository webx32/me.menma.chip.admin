/*
 * angular-socket-io v0.3.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 *
 * 修改： 何军
 * 时间：2014-09-25
 * 
 */

'use strict';

angular.module('btford.socket-io', []).
    provider('socketFactory', function () {

        // when forwarding events, prefix the event name
        var defaultPrefix = 'socket:',
            ioSocket,
            __handlers = [];

        // expose to provider
        this.$get = function ($rootScope, $timeout,  localStorageService) {

            var asyncAngularify = function (socket, callback) {
                return callback ? function () {
                    var args = arguments;
                    $timeout(function () {
                        callback.apply(socket, args);
                    }, 0);
                } : angular.noop;
            };


            return function socketFactory(options) {
                options = options || {};
                var socket = options.ioSocket || io.connect();
                var prefix = options.prefix || defaultPrefix;
                var defaultScope = options.scope || $rootScope;
                socket.on('connection', function (socket) {
                    console.log("服务器 " + socket.id + " 连接成功.");
                });
                socket.on('disconnect', function () {
                    console.log("服务器 " + socket.id + " 断开连接.");
                    // location.hash = "#/admin/login";
                    if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.show();
                        });
                    };
                    angular.element("#sockettips,[role='progressbar']").show();
                    angular.element("#topLoginBoxButton").addClass('hide');
                    angular.element("#sockettips").html("正在尝试连接服务器，请等待...");
                    //lockscreen("服务器断开连接");
                });
                socket.on('reconnect_failed', function () {
                    console.log("服务器 " + socket.id + " 连接失败.");
                    if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.show();
                        });
                    };
                    angular.element("#sockettips,[role='progressbar']").show();
                    angular.element("#topLoginBoxButton").addClass('hide');
                    angular.element("#sockettips").html("正在尝试连接服务器，请等待...");
                });
                socket.on('connect_error', function () {
//                    memaAlert("", "服务器连接错误,请等待" , 1,"error");


                    if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.show();
                        });
                    };
                    angular.element("#sockettips,[role='progressbar']").show();
                    angular.element("#topLoginBoxButton").addClass('hide');
                    angular.element("#sockettips").html("正在尝试连接服务器，请等待...");
                    // location.hash = "#/admin/login";
                    console.log("服务器 " + socket.id + " 连接错误.");

                });
                socket.on('reconnect', function () {
                    angular.element("#sockettips").html("尝试恢复中...");
                    var data = {
                        api: 'session.restore',
                        data: {
                            token: localStorageService.get("loginToken")
                        }
                    }
                    // socket.emit(data);
                    socket.emit("request", data);
                });
                socket.on('connect_timeout', function () {
                    console.log("服务器 " + socket.id + " 连接超时.");
                    if (!angular.element('body').hasClass('modal-open')&&location.hash != "#/admin/login") {
                        $rootScope.topLoginBox.$promise.then(function () {
                            $rootScope.topLoginBox.show();
                        });
                    };
                    angular.element("#sockettips,[role='progressbar']").show();
                    angular.element("#topLoginBoxButton").addClass('hide');
                    angular.element("#sockettips").html("正在尝试连接服务器，请等待...");
//                    memaAlert("", "服务器连接超时,请等待", 1, "error");
                });

                socket.on("response", function (data) {
                    console.table(data);
                    data = $.type(data) == "object" ? data : $.parseJSON(data);
                    data.error = data.error || null;
                    data.err = data.err || null;
                    var api = data.api;
                    var handler = __handlers[(!data.err && !data.error) ? api : api + "_err"];
                    handler ? handler(data) : null;
                    if (data.error)console.log(data.error);
                    if (data.err)console.log(data.err);
                });
                socket.on("push", function (data) {
                    console.table(data);
                    data = $.type(data) == "object" ? data : $.parseJSON(data);
                    data.error = data.error || null;
                    data.err = data.err || null;
                    var api = data.api;
                    var handler = __handlers[(!data.err && !data.error) ? api+"_pushdata" : api + "_pushdata_err"];
                    handler ? handler(data) : null;
                    if (data.error)console.log(data.error);
                    if (data.err)console.log(data.err);
                });
                var addListener = function (eventName, callback) {
                    socket.on(eventName, asyncAngularify(socket, callback));
                };

                var wrappedSocket = {
                    on: addListener,
                    addListener: addListener,

                    bind: function (eventName, callback) {

                        if ("success" in callback)__handlers[eventName] = asyncAngularify(socket, callback.success);
                        if ("err" in callback)__handlers[eventName + "_err"] = asyncAngularify(socket, callback.err);
                    },
                    bindpush: function (eventName, callback) {

                        if ("success" in callback)__handlers[eventName+"_pushdata"] = asyncAngularify(socket, callback.success);
                        if ("err" in callback)__handlers[eventName + "_pushdata_err"] = asyncAngularify(socket, callback.err);
                    },
                    err: function (eventName, callback) {
                        __handlers[eventName+ "_err"] = asyncAngularify(socket, callback);
                    },

                    emit: function (data, callback) {
                        console.table(data);
                        return socket.emit("request", data, asyncAngularify(socket, callback));
                    },
                    pushemit: function (data, callback) {
                        console.table(data);
                        return socket.emit("onpush", data, asyncAngularify(socket, callback));
                    },

                    removeListener: function () {
                        return socket.removeListener.apply(socket, arguments);
                    },

                    // when socket.on('someEvent', fn (data) { ... }),
                    // call scope.$broadcast('someEvent', data)
                    forward: function (events, scope) {
                        if (events instanceof Array === false) {
                            events = [events];
                        }
                        if (!scope) {
                            scope = defaultScope;
                        }
                        events.forEach(function (eventName) {
                            var prefixedEvent = prefix + eventName;
                            var forwardBroadcast = asyncAngularify(socket, function (data) {
                                scope.$broadcast(prefixedEvent, data);
                            });
                            scope.$on('$destroy', function () {
                                socket.removeListener(eventName, forwardBroadcast);
                            });
                            socket.on(eventName, forwardBroadcast);
                        });
                    }
                };

                return wrappedSocket;
            };
        };
    });
